import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { checkAuthFromRequest } from '@/lib/auth';
import { logAuditAction } from '@/lib/audit';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const authSession = await checkAuthFromRequest(request);
    const isStaffOrAdmin = authSession?.role === 'ADMIN' || authSession?.role === 'STAFF';

    const identifier = params.id;

    const product = await prisma.product.findFirst({
      where: {
        OR: [{ id: identifier }, { slug: identifier }],
        deletedAt: null,
      },
      include: {
        brand: true,
        category: true,
        images: { orderBy: { displayOrder: 'asc' } },
        variants: { where: { isActive: true } },
        reviews: {
          where: { status: 'APPROVED' },
          include: {
            user: { select: { fullName: true, avatarUrl: true } },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!product) {
      return NextResponse.json({ message: 'Không tìm thấy sản phẩm' }, { status: 404 });
    }

    if (!isStaffOrAdmin && !product.isActive) {
      return NextResponse.json({ message: 'Sản phẩm hiện đang tạm ẩn' }, { status: 404 });
    }

    // Redact costPrice if not staff/admin
    const sanitizedVariants = product.variants.map((v) => {
      if (!isStaffOrAdmin) {
        const { costPrice, ...rest } = v;
        return rest;
      }
      return v;
    });

    if (!isStaffOrAdmin) {
      const { costPrice, ...rest } = product;
      return NextResponse.json({ product: { ...rest, variants: sanitizedVariants } });
    }

    return NextResponse.json({ product: { ...product, variants: sanitizedVariants } });
  } catch (error) {
    console.error('Fetch product detail error:', error);
    return NextResponse.json({ message: 'Lỗi tải chi tiết sản phẩm' }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const authSession = await checkAuthFromRequest(request);
    if (!authSession || (authSession.role !== 'ADMIN' && authSession.role !== 'STAFF')) {
      return NextResponse.json({ message: 'Không có quyền thực hiện thao tác này' }, { status: 403 });
    }

    const data = await request.json();
    const product = await prisma.product.findUnique({
      where: { id: params.id },
    });

    if (!product) {
      return NextResponse.json({ message: 'Không tìm thấy sản phẩm' }, { status: 404 });
    }

    // Staff cannot change selling prices without permission
    if (authSession.role === 'STAFF' && data.price && parseFloat(data.price) !== product.price) {
      return NextResponse.json({ message: 'Nhân viên không có quyền thay đổi giá bán sản phẩm' }, { status: 403 });
    }

    const updated = await prisma.product.update({
      where: { id: params.id },
      data: {
        name: data.name ?? product.name,
        sku: data.sku !== undefined ? data.sku.trim().toUpperCase() : product.sku,
        barcode: data.barcode !== undefined ? data.barcode : product.barcode,
        brandId: data.brandId !== undefined ? (data.brandId || null) : product.brandId,
        categoryId: data.categoryId !== undefined ? (data.categoryId || null) : product.categoryId,
        goal: data.goal !== undefined ? data.goal : product.goal,
        price: data.price !== undefined ? parseFloat(data.price) : product.price,
        salePrice: data.salePrice !== undefined ? (data.salePrice ? parseFloat(data.salePrice) : null) : product.salePrice,
        costPrice: (authSession.role === 'ADMIN' && data.costPrice !== undefined) ? (data.costPrice ? parseFloat(data.costPrice) : 0) : product.costPrice,
        originCountry: data.originCountry !== undefined ? data.originCountry : product.originCountry,
        manufacturer: data.manufacturer !== undefined ? data.manufacturer : product.manufacturer,
        isActive: data.isActive !== undefined ? Boolean(data.isActive) : product.isActive,
        isFeatured: data.isFeatured !== undefined ? Boolean(data.isFeatured) : product.isFeatured,
        shortDescription: data.shortDescription !== undefined ? data.shortDescription : product.shortDescription,
        description: data.description !== undefined ? data.description : product.description,
        nutritionFacts: data.nutritionFacts !== undefined ? (typeof data.nutritionFacts === 'object' ? JSON.stringify(data.nutritionFacts) : data.nutritionFacts) : product.nutritionFacts,
        warnings: data.warnings !== undefined ? data.warnings : product.warnings,
        allergens: data.allergens !== undefined ? data.allergens : product.allergens,
        usageGuide: data.usageGuide !== undefined ? data.usageGuide : product.usageGuide,
      },
    });

    // Update images if provided
    if (data.images && Array.isArray(data.images) && data.images.length > 0) {
      await prisma.productImage.deleteMany({
        where: { productId: params.id },
      });

      for (let i = 0; i < data.images.length; i++) {
        const img = data.images[i];
        if (img.url) {
          await prisma.productImage.create({
            data: {
              productId: params.id,
              url: img.url,
              alt: img.alt || updated.name,
              isThumbnail: img.isThumbnail ?? i === 0,
              displayOrder: i,
            },
          });
        }
      }
    }

    // Update or create variants if provided
    if (data.variants && Array.isArray(data.variants)) {
      for (const v of data.variants) {
        if (v.id) {
          await prisma.productVariant.update({
            where: { id: v.id },
            data: {
              title: v.title,
              sku: v.sku ? v.sku.trim().toUpperCase() : undefined,
              flavor: v.flavor !== undefined ? v.flavor : undefined,
              weight: v.weight !== undefined ? v.weight : undefined,
              price: v.price ? parseFloat(v.price) : undefined,
              salePrice: v.salePrice !== undefined ? (v.salePrice ? parseFloat(v.salePrice) : null) : undefined,
              costPrice: (authSession.role === 'ADMIN' && v.costPrice !== undefined) ? parseFloat(v.costPrice) : undefined,
              inStock: v.inStock !== undefined ? parseInt(v.inStock) : undefined,
            },
          });

          if (v.inStock !== undefined) {
            await prisma.inventory.updateMany({
              where: { variantId: v.id },
              data: {
                quantityOnHand: parseInt(v.inStock),
                quantityAvailable: parseInt(v.inStock),
              },
            });
          }
        } else if (v.title && v.price) {
          // New variant added in edit form
          const newVar = await prisma.productVariant.create({
            data: {
              productId: params.id,
              sku: v.sku ? v.sku.trim().toUpperCase() : `${updated.sku}-${Math.random().toString(36).substring(2, 5).toUpperCase()}`,
              title: v.title,
              flavor: v.flavor || null,
              weight: v.weight || null,
              packaging: v.packaging || null,
              price: parseFloat(v.price),
              salePrice: v.salePrice ? parseFloat(v.salePrice) : null,
              costPrice: (authSession.role === 'ADMIN' && v.costPrice) ? parseFloat(v.costPrice) : 0,
              inStock: parseInt(v.inStock || '10'),
            },
          });

          await prisma.inventory.create({
            data: {
              productId: params.id,
              variantId: newVar.id,
              quantityOnHand: parseInt(v.inStock || '10'),
              quantityAvailable: parseInt(v.inStock || '10'),
            },
          });
        }
      }
    }

    await logAuditAction({
      userId: authSession.userId,
      userEmail: authSession.email,
      userRole: authSession.role,
      action: 'UPDATE',
      entity: 'PRODUCT',
      entityId: product.id,
      details: { previous: product, updated },
    });

    return NextResponse.json({ success: true, product: updated });
  } catch (error) {
    console.error('Update product error:', error);
    return NextResponse.json({ message: 'Lỗi cập nhật sản phẩm' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const authSession = await checkAuthFromRequest(request);
    if (!authSession || authSession.role !== 'ADMIN') {
      return NextResponse.json({ message: 'Chỉ Admin mới có quyền xóa sản phẩm' }, { status: 403 });
    }

    // Soft delete
    const product = await prisma.product.update({
      where: { id: params.id },
      data: {
        deletedAt: new Date(),
        isActive: false,
      },
    });

    await logAuditAction({
      userId: authSession.userId,
      userEmail: authSession.email,
      userRole: authSession.role,
      action: 'DELETE',
      entity: 'PRODUCT',
      entityId: product.id,
      details: { name: product.name, sku: product.sku },
    });

    return NextResponse.json({ success: true, message: 'Đã xóa mềm sản phẩm' });
  } catch (error) {
    console.error('Delete product error:', error);
    return NextResponse.json({ message: 'Lỗi khi xóa sản phẩm' }, { status: 500 });
  }
}

