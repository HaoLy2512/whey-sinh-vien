import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { checkAuthFromRequest } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const authSession = await checkAuthFromRequest(request);
    if (!authSession || (authSession.role !== 'ADMIN' && authSession.role !== 'STAFF')) {
      return NextResponse.json({ message: 'Không có quyền truy cập' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const range = searchParams.get('range') || '30d'; // Mặc định 30 ngày gần nhất

    // 1. TÍNH TỔNG DOANH THU THỰC TẾ
    // Lấy các đơn hàng đã thanh toán (PAID) HOẶC đã giao thành công (DELIVERED/COMPLETED)
    const revenueAggregate = await prisma.order.aggregate({
      _sum: {
        totalAmount: true,
      },
      where: {
        OR: [
          { paymentStatus: 'PAID' },
          { orderStatus: 'DELIVERED' },
          { orderStatus: 'COMPLETED' },
        ],
      },
    });

    const totalRevenue = revenueAggregate._sum.totalAmount || 0;

    // 2. TỔNG SỐ ĐƠN HÀNG THÀNH CÔNG
    const totalOrders = await prisma.order.count({
      where: {
        OR: [
          { paymentStatus: 'PAID' },
          { orderStatus: 'DELIVERED' },
          { orderStatus: 'COMPLETED' },
        ],
      },
    });

    // 3. TỔNG SỐ KHÁCH HÀNG
    const totalCustomers = await prisma.user.count({
      where: { role: 'CUSTOMER' },
    });

    // 4. LẤY DOANH THU THEO THỜI GIAN (Dùng cho biểu đồ)
    const orders = await prisma.order.findMany({
      where: {
        OR: [
          { paymentStatus: 'PAID' },
          { orderStatus: 'DELIVERED' },
          { orderStatus: 'COMPLETED' },
        ],
      },
      select: {
        createdAt: true,
        totalAmount: true,
      },
      orderBy: { createdAt: 'asc' },
    });

    return NextResponse.json({
      success: true,
      stats: {
        totalRevenue,
        totalOrders,
        totalCustomers,
      },
      orders,
    });
  } catch (error) {
    console.error('Fetch report stats error:', error);
    return NextResponse.json({ message: 'Lỗi tải thống kê doanh thu' }, { status: 500 });
  }
}