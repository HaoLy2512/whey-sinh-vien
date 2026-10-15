import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { checkAuthFromRequest } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const authSession = await checkAuthFromRequest(request);
    if (!authSession || (authSession.role !== 'STAFF' && authSession.role !== 'ADMIN')) {
      return NextResponse.json({ message: 'Không có quyền truy cập dữ liệu vận hành' }, { status: 403 });
    }

    const [ordersToProcess, shippingOrders, inventoryAlerts, openTickets] = await Promise.all([
      prisma.order.count({
        where: { orderStatus: { in: ['CONFIRMED', 'PROCESSING'] } },
      }),
      prisma.order.count({
        where: { orderStatus: 'SHIPPING' },
      }),
      prisma.inventory.count({
        where: { quantityOnHand: { lte: 5 } },
      }),
      prisma.supportTicket.count({
        where: { status: { in: ['OPEN', 'IN_PROGRESS'] } },
      }),
    ]);

    return NextResponse.json({
      success: true,
      metrics: {
        ordersToProcess,
        shippingOrders,
        inventoryAlerts,
        openTickets,
      },
    });
  } catch (error) {
    console.error('Staff metrics error:', error);
    return NextResponse.json({ message: 'Lỗi tải chỉ số vận hành' }, { status: 500 });
  }
}
