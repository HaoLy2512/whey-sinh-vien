import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { checkAuthFromRequest } from '@/lib/auth';
import { logAuditAction } from '@/lib/audit';

export async function GET(request: Request) {
  try {
    const authSession = await checkAuthFromRequest(request);
    if (!authSession || (authSession.role !== 'ADMIN' && authSession.role !== 'STAFF')) {
      return NextResponse.json({ message: 'Không có quyền truy cập dữ liệu khách hàng' }, { status: 403 });
    }

    const customers = await prisma.user.findMany({
      where: { role: 'USER' },
      select: {
        id: true,
        email: true,
        fullName: true,
        phone: true,
        status: true,
        createdAt: true,
        _count: {
          select: { orders: true, reviews: true },
        },
        orders: {
          select: { totalAmount: true, paymentStatus: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const formattedCustomers = customers.map((c) => {
      const totalSpent = c.orders
        .filter((o) => o.paymentStatus === 'PAID')
        .reduce((sum, o) => sum + o.totalAmount, 0);

      const { orders, ...rest } = c;
      return {
        ...rest,
        ordersCount: c._count.orders,
        totalSpent,
      };
    });

    return NextResponse.json({ success: true, customers: formattedCustomers });
  } catch (error) {
    console.error('Fetch customers error:', error);
    return NextResponse.json({ message: 'Lỗi tải danh sách khách hàng' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const authSession = await checkAuthFromRequest(request);
    if (!authSession || authSession.role !== 'ADMIN') {
      return NextResponse.json({ message: 'Chỉ Admin mới có quyền khóa/mở tài khoản khách hàng' }, { status: 403 });
    }

    const { customerId, status } = await request.json();

    const customer = await prisma.user.update({
      where: { id: customerId, role: 'USER' },
      data: { status },
      select: { id: true, email: true, status: true },
    });

    await logAuditAction({
      userId: authSession.userId,
      userEmail: authSession.email,
      userRole: authSession.role,
      action: 'UPDATE',
      entity: 'USER',
      entityId: customer.id,
      details: { action: 'TOGGLE_CUSTOMER_STATUS', newStatus: status, email: customer.email },
    });

    return NextResponse.json({ success: true, customer });
  } catch (error) {
    console.error('Update customer status error:', error);
    return NextResponse.json({ message: 'Lỗi khi cập nhật trạng thái khách hàng' }, { status: 500 });
  }
}

