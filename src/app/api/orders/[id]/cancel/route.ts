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
    const { reason } = await request.json();

    const order = await prisma.order.findUnique({
      where: { id: params.id },
      include: { items: true },
    });

    if (!order) {
      return NextResponse.json({ message: 'Không tìm thấy đơn hàng' }, { status: 404 });
    }

    const isStaffOrAdmin = authSession?.role === 'ADMIN' || authSession?.role === 'STAFF';
    const isOwner = authSession && order.userId === authSession.userId;

    if (!isStaffOrAdmin && !isOwner) {
      return NextResponse.json({ message: 'Bạn không có quyền hủy đơn hàng này' }, { status: 403 });
    }

    // Users can only cancel if order has not shipped yet
    if (!isStaffOrAdmin && order.orderStatus !== 'PENDING' && order.orderStatus !== 'CONFIRMED') {
      return NextResponse.json(
        { message: 'Không thể hủy đơn hàng đã bắt đầu đóng gói hoặc đang vận chuyển. Vui lòng liên hệ hỗ trợ.' },
        { status: 400 }
      );
    }

    if (order.orderStatus === 'CANCELLED') {
      return NextResponse.json({ message: 'Đơn hàng này đã được hủy trước đó' }, { status: 400 });
    }

    await prisma.$transaction(async (tx) => {
      // 1. Mark order as CANCELLED
      await tx.order.update({
        where: { id: order.id },
        data: {
          orderStatus: 'CANCELLED',
          cancelReason: reason || 'Khách hàng yêu cầu hủy đơn',
        },
      });

      // 2. Return inventory stock
      for (const item of order.items) {
        if (item.variantId) {
          await tx.productVariant.update({
            where: { id: item.variantId },
            data: { inStock: { increment: item.quantity } },
          });

          await tx.inventory.updateMany({
            where: { productId: item.productId, variantId: item.variantId },
            data: {
              quantityOnHand: { increment: item.quantity },
              quantityAvailable: { increment: item.quantity },
            },
          });
        }

        await tx.inventoryMovement.create({
          data: {
            productId: item.productId,
            variantId: item.variantId,
            movementType: 'RETURN',
            quantity: item.quantity,
            referenceType: 'ORDER',
            referenceId: order.id,
            note: `Returned to stock upon order cancellation. Reason: ${reason || 'Customer cancelled'}`,
            performedBy: authSession?.role || 'SYSTEM',
          },
        });
      }

      // 3. Status history
      await tx.orderStatusHistory.create({
        data: {
          orderId: order.id,
          previousStatus: order.orderStatus,
          newStatus: 'CANCELLED',
          note: reason ? `Đã hủy: ${reason}` : 'Hủy đơn hàng',
          changedBy: authSession?.role || 'CUSTOMER',
        },
      });
    });

    await logAuditAction({
      userId: authSession?.userId,
      userEmail: authSession?.email,
      userRole: authSession?.role,
      action: 'STATUS_CHANGE',
      entity: 'ORDER',
      entityId: order.id,
      details: { action: 'CANCEL', reason },
    });

    return NextResponse.json({ success: true, message: 'Đơn hàng đã được hủy và tồn kho đã được hoàn lại thành công' });
  } catch (error) {
    console.error('Order cancel error:', error);
    return NextResponse.json({ message: 'Lỗi khi xử lý hủy đơn hàng' }, { status: 500 });
  }
}

