import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { checkAuthFromRequest } from '@/lib/auth';
import { logAuditAction } from '@/lib/audit';
import { sendOrderConfirmationEmail } from '@/lib/mail';

export async function GET(request: Request) {
  try {
    const authSession = await checkAuthFromRequest(request);
    const { searchParams } = new URL(request.url);
    const orderStatus = searchParams.get('status');
    const paymentStatus = searchParams.get('paymentStatus');
    const search = searchParams.get('search');
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '15')));
    const skip = (page - 1) * limit;

    const isStaffOrAdmin = authSession?.role === 'ADMIN' || authSession?.role === 'STAFF';

    // Build query filter
    const where: any = {};

    if (!isStaffOrAdmin) {
      // Must be authenticated to view orders, and only their own
      if (!authSession) {
        return NextResponse.json({ message: 'Vui lòng đăng nhập để xem lịch sử đơn hàng' }, { status: 401 });
      }
      where.userId = authSession.userId;
    } else {
      // Admin/Staff filters
      if (search) {
        where.OR = [
          { orderNumber: { contains: search } },
          { customerName: { contains: search } },
          { customerPhone: { contains: search } },
          { customerEmail: { contains: search } },
        ];
      }
      if (orderStatus && orderStatus !== 'ALL') {
        where.orderStatus = orderStatus;
      }
      if (paymentStatus && paymentStatus !== 'ALL') {
        where.paymentStatus = paymentStatus;
      }
    }

    const [total, orders] = await Promise.all([
      prisma.order.count({ where }),
      prisma.order.findMany({
        where,
        include: {
          items: true,
          statusHistory: { orderBy: { createdAt: 'desc' } },
          shipments: true,
          payments: true,
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
    ]);

    // Redact costPrice on items if not staff/admin
    const sanitizedOrders = orders.map((order) => {
      const items = order.items.map((item) => {
        if (!isStaffOrAdmin) {
          const { costPrice, ...rest } = item;
          return rest;
        }
        return item;
      });
      return { ...order, items };
    });

    return NextResponse.json({
      success: true,
      orders: sanitizedOrders,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Fetch orders error:', error);
    return NextResponse.json({ message: 'Lỗi tải danh sách đơn hàng' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const authSession = await checkAuthFromRequest(request);
    const body = await request.json();

    const {
      customerName,
      customerEmail,
      customerPhone,
      shippingAddress,
      province,
      paymentMethod = 'COD',
      couponCode,
      items,
      customerNotes,
    } = body;

    if (!customerName || !customerPhone || !shippingAddress || !items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { message: 'Vui lòng điền đầy đủ họ tên, số điện thoại, địa chỉ nhận hàng và sản phẩm' },
        { status: 400 }
      );
    }

    // Load store settings for shipping threshold
    const storeSettings = await prisma.storeSettings.findUnique({
      where: { id: 'default' },
    });
    const freeShippingThreshold = storeSettings?.freeShippingThreshold ?? 1000000;
    const defaultShippingFee = storeSettings?.defaultShippingFee ?? 30000;

    // Verify all products, variants, and stock from DATABASE (never trust client prices)
    const verifiedOrderItems: Array<{
      productId: string;
      variantId: string | null;
      productName: string;
      productSku: string;
      variantTitle: string | null;
      price: number;
      costPrice: number;
      quantity: number;
      total: number;
    }> = [];

    let calculatedSubtotal = 0;

    for (const item of items) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId, deletedAt: null, isActive: true },
      });

      if (!product) {
        return NextResponse.json(
          { message: `Sản phẩm ID ${item.productId} không tồn tại hoặc đã ngừng kinh doanh` },
          { status: 400 }
        );
      }

      let price = product.salePrice || product.price;
      let costPrice = product.costPrice;
      let sku = product.sku;
      let variantTitle = null;

      if (item.variantId) {
        const variant = await prisma.productVariant.findUnique({
          where: { id: item.variantId, productId: product.id, isActive: true },
        });

        if (!variant) {
          return NextResponse.json(
            { message: `Biến thể sản phẩm của "${product.name}" không tồn tại` },
            { status: 400 }
          );
        }

        if (variant.inStock < item.quantity) {
          return NextResponse.json(
            {
              message: `Sản phẩm "${product.name} - ${variant.title}" chỉ còn ${variant.inStock} sản phẩm trong kho`,
            },
            { status: 400 }
          );
        }

        price = variant.salePrice || variant.price;
        costPrice = variant.costPrice;
        sku = variant.sku;
        variantTitle = variant.title;
      }

      const itemTotal = price * item.quantity;
      calculatedSubtotal += itemTotal;

      verifiedOrderItems.push({
        productId: product.id,
        variantId: item.variantId || null,
        productName: product.name,
        productSku: sku,
        variantTitle,
        price,
        costPrice,
        quantity: item.quantity,
        total: itemTotal,
      });
    }

    // Verify Coupon if applied
    let discountAmount = 0;
    let validCouponId: string | null = null;
    if (couponCode) {
      const coupon = await prisma.coupon.findUnique({
        where: { code: couponCode.toUpperCase().trim() },
      });

      if (coupon && coupon.isActive) {
        const now = new Date();
        const isValidDate = (!coupon.startDate || coupon.startDate <= now) && (!coupon.endDate || coupon.endDate >= now);
        const hasUsageLeft = coupon.usageLimit === 0 || coupon.usageCount < coupon.usageLimit;
        const meetsMinOrder = calculatedSubtotal >= coupon.minOrderValue;

        if (isValidDate && hasUsageLeft && meetsMinOrder) {
          validCouponId = coupon.id;
          if (coupon.discountType === 'PERCENTAGE') {
            discountAmount = Math.round((calculatedSubtotal * coupon.discountValue) / 100);
            if (coupon.maxDiscountValue && discountAmount > coupon.maxDiscountValue) {
              discountAmount = coupon.maxDiscountValue;
            }
          } else {
            discountAmount = coupon.discountValue;
          }
          discountAmount = Math.min(discountAmount, calculatedSubtotal);
        }
      }
    }

    // Calculate shipping fee
    const shippingFee = calculatedSubtotal >= freeShippingThreshold ? 0 : defaultShippingFee;
    const totalAmount = Math.max(0, calculatedSubtotal - discountAmount + shippingFee);

    // Generate unique order number
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const orderNumber = `VC-${dateStr}-${randomSuffix}`;

    // Execute atomic transaction for Order creation and inventory updates
    const order = await prisma.$transaction(async (tx) => {
      // 1. Create order
      const newOrder = await tx.order.create({
        data: {
          orderNumber,
          userId: authSession?.userId || null,
          customerName: customerName.trim(),
          customerEmail: (customerEmail || authSession?.email || 'guest@vitacore.vn').trim(),
          customerPhone: customerPhone.trim(),
          shippingAddress: shippingAddress.trim(),
          province: province || null,
          subtotal: calculatedSubtotal,
          discountAmount,
          shippingFee,
          taxAmount: 0,
          totalAmount,
          paymentMethod,
          paymentStatus: paymentMethod === 'COD' ? 'PENDING' : 'PENDING',
          orderStatus: 'CONFIRMED',
          couponCode: couponCode ? couponCode.toUpperCase().trim() : null,
          internalNotes: customerNotes ? `Ghi chú khách: ${customerNotes}` : null,
          trackingNumber: `VC-SHIP-${randomSuffix}`,
          items: {
            create: verifiedOrderItems.map((item) => ({
              productId: item.productId,
              variantId: item.variantId,
              productName: item.productName,
              productSku: item.productSku,
              variantTitle: item.variantTitle,
              price: item.price,
              costPrice: item.costPrice,
              quantity: item.quantity,
              total: item.total,
            })),
          },
        },
        include: {
          items: true,
        },
      });

      // 2. Decrement inventory stock & create movements
      for (const item of verifiedOrderItems) {
        if (item.variantId) {
          await tx.productVariant.update({
            where: { id: item.variantId },
            data: { inStock: { decrement: item.quantity } },
          });

          await tx.inventory.updateMany({
            where: { productId: item.productId, variantId: item.variantId },
            data: {
              quantityOnHand: { decrement: item.quantity },
              quantityAvailable: { decrement: item.quantity },
            },
          });
        }

        await tx.inventoryMovement.create({
          data: {
            productId: item.productId,
            variantId: item.variantId,
            movementType: 'EXPORT',
            quantity: item.quantity,
            referenceType: 'ORDER',
            referenceId: newOrder.id,
            note: `Exported for Order ${newOrder.orderNumber}`,
            performedBy: authSession?.userId || 'SYSTEM',
          },
        });
      }

      // 3. Create initial status history
      await tx.orderStatusHistory.create({
        data: {
          orderId: newOrder.id,
          previousStatus: 'PENDING',
          newStatus: 'CONFIRMED',
          note: 'Đơn hàng được đặt thành công qua hệ thống',
          changedBy: authSession?.userId ? 'CUSTOMER' : 'GUEST',
        },
      });

      // 4. Create shipment record
      await tx.shipment.create({
        data: {
          orderId: newOrder.id,
          carrier: 'Standard Express',
          trackingCode: newOrder.trackingNumber,
          status: 'READY_TO_SHIP',
          shippingFee,
        },
      });

      // 5. If coupon used, record redemption & increment count
      if (validCouponId) {
        await tx.couponRedemption.create({
          data: {
            couponId: validCouponId,
            orderId: newOrder.id,
            userId: authSession?.userId || null,
            discountApplied: discountAmount,
          },
        });

        await tx.coupon.update({
          where: { id: validCouponId },
          data: { usageCount: { increment: 1 } },
        });
      }

      return newOrder;
    });

    await logAuditAction({
      userId: authSession?.userId || null,
      userEmail: customerEmail || authSession?.email,
      userRole: authSession?.role || 'GUEST',
      action: 'CREATE',
      entity: 'ORDER',
      entityId: order.id,
      details: {
        orderNumber: order.orderNumber,
        totalAmount: order.totalAmount,
        paymentMethod: order.paymentMethod,
      },
    });

    // Send Order Confirmation Email to customer (async non-blocking)
    sendOrderConfirmationEmail({
      orderId: order.id,
      orderNumber: order.orderNumber,
      createdAt: order.createdAt,
      customerName: order.customerName,
      customerEmail: order.customerEmail,
      customerPhone: order.customerPhone,
      shippingAddress: order.shippingAddress,
      province: order.province,
      paymentMethod: order.paymentMethod,
      paymentStatus: order.paymentStatus,
      subtotal: order.subtotal,
      discountAmount: order.discountAmount,
      shippingFee: order.shippingFee,
      totalAmount: order.totalAmount,
      customerNotes: customerNotes || null,
      items: verifiedOrderItems.map((item) => ({
        productName: item.productName,
        variantTitle: item.variantTitle,
        productSku: item.productSku,
        price: item.price,
        quantity: item.quantity,
        total: item.total,
      })),
    }).catch((mailErr) => {
      console.error('[EMAIL DISPATCH ERROR]:', mailErr);
    });

    return NextResponse.json({
      success: true,
      order: {
        id: order.id,
        orderNumber: order.orderNumber,
        totalAmount: order.totalAmount,
        paymentMethod: order.paymentMethod,
        paymentStatus: order.paymentStatus,
        orderStatus: order.orderStatus,
        shippingAddress: order.shippingAddress,
      },
    });
  } catch (error) {
    console.error('Order creation error:', error);
    return NextResponse.json({ message: 'Lỗi trong quá trình tạo đơn hàng' }, { status: 500 });
  }
}

