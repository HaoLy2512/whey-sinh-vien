import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { checkAuthFromRequest } from '@/lib/auth';
import { logAuditAction } from '@/lib/audit';

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

    const order = await prisma.order.findUnique({
      where: { id: params.id },
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
        where: { id: params.id },
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

