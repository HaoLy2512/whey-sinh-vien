import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { checkAuthFromRequest } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const authSession = await checkAuthFromRequest(request);
    if (!authSession || authSession.role !== 'ADMIN') {
      return NextResponse.json({ message: 'Chỉ Admin mới có quyền truy cập số liệu tài chính' }, { status: 403 });
    }

    const [
      orders,
      paidOrders,
      productsCount,
      customersCount,
      inventoryRecords,
      recentAuditLogs,
      topOrderItems,
    ] = await Promise.all([
      prisma.order.findMany({
        select: {
          id: true,
          totalAmount: true,
          orderStatus: true,
          paymentStatus: true,
          createdAt: true,
        },
      }),
      prisma.order.findMany({
        where: { paymentStatus: 'PAID' },
        select: { totalAmount: true },
      }),
      prisma.product.count({ where: { deletedAt: null } }),
      prisma.user.count({ where: { role: 'USER' } }),
      prisma.inventory.findMany({
        select: { quantityOnHand: true, minStockAlert: true },
      }),
      prisma.auditLog.findMany({
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),
      prisma.orderItem.groupBy({
        by: ['productId', 'productName'],
        _sum: { quantity: true, total: true },
        orderBy: { _sum: { quantity: 'desc' } },
        take: 5,
      }),
    ]);

    const totalRevenue = paidOrders.reduce((sum, o) => sum + o.totalAmount, 0);
    const pendingOrdersCount = orders.filter((o) => o.orderStatus === 'PENDING' || o.orderStatus === 'CONFIRMED').length;
    const completedOrdersCount = orders.filter((o) => o.orderStatus === 'DELIVERED').length;
    const cancelledOrdersCount = orders.filter((o) => o.orderStatus === 'CANCELLED').length;
    const lowStockCount = inventoryRecords.filter((i) => i.quantityOnHand <= i.minStockAlert).length;

    // Monthly revenue distribution (last 6 months)
    const monthlyStats: Record<string, number> = {};
    const months = ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12'];
    orders.forEach((o) => {
      if (o.paymentStatus === 'PAID') {
        const monthKey = months[new Date(o.createdAt).getMonth()];
        monthlyStats[monthKey] = (monthlyStats[monthKey] || 0) + o.totalAmount;
      }
    });

    return NextResponse.json({
      success: true,
      metrics: {
        totalRevenue,
        totalOrders: orders.length,
        pendingOrdersCount,
        completedOrdersCount,
        cancelledOrdersCount,
        productsCount,
        customersCount,
        lowStockCount,
        monthlyStats,
        topProducts: topOrderItems.map((item) => ({
          name: item.productName,
          quantitySold: item._sum.quantity || 0,
          revenue: item._sum.total || 0,
        })),
        recentAuditLogs,
      },
    });
  } catch (error) {
    console.error('Admin metrics error:', error);
    return NextResponse.json({ message: 'Lỗi tải số liệu báo cáo' }, { status: 500 });
  }
}
