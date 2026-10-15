import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { checkAuthFromRequest } from '@/lib/auth';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const authSession = await checkAuthFromRequest(request);
    const orderId = params.id;

    const order = await prisma.order.findFirst({
      where: {
        OR: [{ id: orderId }, { orderNumber: orderId }],
      },
      include: {
        items: true,
        statusHistory: { orderBy: { createdAt: 'desc' } },
        shipments: true,
        payments: true,
      },
    });

    if (!order) {
      return NextResponse.json({ message: 'Không tìm thấy đơn hàng' }, { status: 404 });
    }

    const isStaffOrAdmin = authSession?.role === 'ADMIN' || authSession?.role === 'STAFF';

    // Strict access control: if not staff/admin, must be the owner of the order
    if (!isStaffOrAdmin) {
      if (!authSession || (order.userId && order.userId !== authSession.userId)) {
        return NextResponse.json({ message: 'Bạn không có quyền xem đơn hàng này' }, { status: 403 });
      }
    }

    // Redact costPrice for users
    const sanitizedItems = order.items.map((item) => {
      if (!isStaffOrAdmin) {
        const { costPrice, ...rest } = item;
        return rest;
      }
      return item;
    });

    return NextResponse.json({
      success: true,
      order: {
        ...order,
        items: sanitizedItems,
      },
    });
  } catch (error) {
    console.error('Fetch order detail error:', error);
    return NextResponse.json({ message: 'Lỗi tải chi tiết đơn hàng' }, { status: 500 });
  }
}

