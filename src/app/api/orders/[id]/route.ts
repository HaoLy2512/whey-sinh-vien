import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { checkAuthFromRequest } from '@/lib/auth';
import { logAuditAction } from '@/lib/audit';

// 1. LẤY CHI TIẾT ĐƠN HÀNG (Dành cho cả Khách Guest, User và Admin)
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const authSession = await checkAuthFromRequest(request);
    const orderId = params.id;

    const isStaffOrAdmin = authSession?.role === 'ADMIN' || authSession?.role === 'STAFF';

    // Tìm đơn hàng theo id (UUID/String) hoặc orderNumber (VC-20261110-xxxx)
    const order = await prisma.order.findFirst({
      where: {
        OR: [
          { id: orderId },
          { orderNumber: orderId }
        ]
      },
      include: {
        items: true,
        shipments: true,
        payments: true,
        statusHistory: { orderBy: { createdAt: 'desc' } }
      }
    });

    if (!order) {
      return NextResponse.json({ message: 'Không tìm thấy đơn hàng' }, { status: 404 });
    }

    // Nếu không phải Staff/Admin và đơn thuộc sở hữu của User khác thì từ chối
    if (!isStaffOrAdmin && order.userId && order.userId !== authSession?.userId) {
      return NextResponse.json({ message: 'Bạn không có quyền xem đơn hàng này' }, { status: 403 });
    }

    // Redact costPrice nếu không phải Staff/Admin
    const items = order.items.map((item) => {
      if (!isStaffOrAdmin) {
        const { costPrice, ...rest } = item;
        return rest;
      }
      return item;
    });

    return NextResponse.json({
      success: true,
      order: { ...order, items }
    });
  } catch (error) {
    console.error('Fetch order detail error:', error);
    return NextResponse.json({ message: 'Lỗi lấy thông tin đơn hàng' }, { status: 500 });
  }
}

// 2. CẬP NHẬT TRẠNG THÁI ĐƠN HÀNG (Dành cho Admin/Staff)
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const authSession = await checkAuthFromRequest(request);
    if (!authSession || (authSession.role !== 'ADMIN' && authSession.role !== 'STAFF')) {
      return NextResponse.json({ message: 'Không có quyền cập nhật trạng thái đơn hàng' }, { status: 403 });
    }

    const { orderStatus, paymentStatus, note, trackingNumber } = await request.json();

    const order = await prisma.order.findFirst({
      where: {
        OR: [
          { id: params.id },
          { orderNumber: params.id }
        ]
      },
    });

    if (!order) {
      return NextResponse.json({ message: 'Không tìm thấy đơn hàng' }, { status: 404 });
    }

    const updateData: any = {};
    if (orderStatus) updateData.orderStatus = orderStatus;
    if (paymentStatus) updateData.paymentStatus = paymentStatus;
    if (trackingNumber) updateData.trackingNumber = trackingNumber;

    const updatedOrder = await prisma.$transaction(async (tx) => {
      const ord = await tx.order.update({
        where: { id: order.id },
        data: updateData,
      });

      if (orderStatus && orderStatus !== order.orderStatus) {
        await tx.orderStatusHistory.create({
          data: {
            orderId: ord.id,
            previousStatus: order.orderStatus,
            newStatus: orderStatus,
            note: note || `Cập nhật trạng thái sang ${orderStatus}`,
            changedBy: authSession.role,
          },
        });

        // If delivered, mark shipment as delivered
        if (orderStatus === 'DELIVERED') {
          await tx.shipment.updateMany({
            where: { orderId: ord.id },
            data: { status: 'DELIVERED', deliveredAt: new Date() },
          });
        }
      }

      return ord;
    });

    await logAuditAction({
      userId: authSession.userId,
      userEmail: authSession.email,
      userRole: authSession.role,
      action: 'STATUS_CHANGE',
      entity: 'ORDER',
      entityId: order.id,
      details: {
        orderNumber: order.orderNumber,
        fromStatus: order.orderStatus,
        toStatus: orderStatus,
        paymentStatus,
        note,
      },
    });

    return NextResponse.json({ success: true, order: updatedOrder });
  } catch (error) {
    console.error('Order status update error:', error);
    return NextResponse.json({ message: 'Lỗi cập nhật trạng thái đơn hàng' }, { status: 500 });
  }
}