import prisma from '@/lib/prisma';

/**
 * Tổng số lượng đã bán theo productId (bỏ qua đơn hủy / hoàn).
 * Không cần đổi schema: tính trực tiếp từ OrderItem.
 */
export async function getSoldByProduct(): Promise<Map<string, number>> {
  const rows = await prisma.orderItem.groupBy({
    by: ['productId'],
    where: { order: { orderStatus: { notIn: ['CANCELLED', 'RETURNED'] } } },
    _sum: { quantity: true },
  });
  const map = new Map<string, number>();
  for (const r of rows) map.set(r.productId, r._sum.quantity ?? 0);
  return map;
}

interface Rankable {
  id: string;
  reviewCount: number;
  createdAt: Date;
}

/** Bán nhiều nhất trước; hòa thì theo số đánh giá, rồi mới nhất. */
export function compareBySales(sold: Map<string, number>) {
  return (a: Rankable, b: Rankable): number =>
    (sold.get(b.id) ?? 0) - (sold.get(a.id) ?? 0) ||
    b.reviewCount - a.reviewCount ||
    b.createdAt.getTime() - a.createdAt.getTime();
}
