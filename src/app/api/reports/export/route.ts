import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { checkAuthFromRequest } from '@/lib/auth';
import { logAuditAction } from '@/lib/audit';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const authSession = await checkAuthFromRequest(request);
    if (!authSession || (authSession.role !== 'ADMIN' && authSession.role !== 'STAFF')) {
      return NextResponse.json({ message: 'Không có quyền xuất báo cáo' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'orders'; // 'orders' or 'inventory'

    if (type === 'orders') {
      const orders = await prisma.order.findMany({
        include: { items: true },
        orderBy: { createdAt: 'desc' },
      });

      const rows = [
        ['Mã Đơn Hàng', 'Khách Hàng', 'Số Điện Thoại', 'Tổng Tiền (VND)', 'Phương Thức', 'Thanh Toán', 'Trạng Thái', 'Ngày Tạo'],
        ...orders.map((o) => [
          o.orderNumber,
          `"${o.customerName}"`,
          `"${o.customerPhone}"`,
          o.totalAmount,
          o.paymentMethod,
          o.paymentStatus,
          o.orderStatus,
          new Date(o.createdAt).toISOString(),
        ]),
      ];

      const csvContent = '\uFEFF' + rows.map((e) => e.join(',')).join('\n');

      await logAuditAction({
        userId: authSession.userId,
        userEmail: authSession.email,
        userRole: authSession.role,
        action: 'EXPORT',
        entity: 'ORDER',
        details: 'Exported orders CSV report',
      });

      return new NextResponse(csvContent, {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename=vitacore-orders-${Date.now()}.csv`,
        },
      });
    } else {
      const inventory = await prisma.inventory.findMany({
        include: { product: true, variant: true },
        orderBy: { updatedAt: 'desc' },
      });

      const rows = [
        ['Tên Sản Phẩm', 'Mã SKU', 'Biến Thể', 'Tồn Kho Thực Tế', 'Có Thể Bán', 'Cảnh Báo Tối Thiểu', 'Kho Lưu Trữ'],
        ...inventory.map((i) => [
          `"${i.product.name}"`,
          i.variant?.sku || i.product.sku,
          `"${i.variant?.title || 'Tiêu chuẩn'}"`,
          i.quantityOnHand,
          i.quantityAvailable,
          i.minStockAlert,
          `"${i.warehouseLocation}"`,
        ]),
      ];

      const csvContent = '\uFEFF' + rows.map((e) => e.join(',')).join('\n');

      await logAuditAction({
        userId: authSession.userId,
        userEmail: authSession.email,
        userRole: authSession.role,
        action: 'EXPORT',
        entity: 'INVENTORY',
        details: 'Exported inventory CSV report',
      });

      return new NextResponse(csvContent, {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename=vitacore-inventory-${Date.now()}.csv`,
        },
      });
    }
  } catch (error) {
    console.error('Export report error:', error);
    return NextResponse.json({ message: 'Lỗi xuất báo cáo' }, { status: 500 });
  }
}
