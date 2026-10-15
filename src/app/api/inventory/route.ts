import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { checkAuthFromRequest } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const authSession = await checkAuthFromRequest(request);
    if (!authSession || (authSession.role !== 'ADMIN' && authSession.role !== 'STAFF')) {
      return NextResponse.json({ message: 'Không có quyền truy cập dữ liệu kho hàng' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const lowStock = searchParams.get('lowStock') === 'true';
    const expiringSoon = searchParams.get('expiringSoon') === 'true';

    const [inventory, lots, recentMovements] = await Promise.all([
      prisma.inventory.findMany({
        include: {
          product: { select: { id: true, name: true, sku: true, images: { take: 1 } } },
          variant: true,
        },
        orderBy: { updatedAt: 'desc' },
      }),
      prisma.inventoryLot.findMany({
        include: {
          product: { select: { name: true, sku: true } },
          variant: { select: { title: true, sku: true } },
        },
        orderBy: { expiryDate: 'asc' },
      }),
      prisma.inventoryMovement.findMany({
        include: {
          product: { select: { name: true, sku: true } },
          variant: { select: { title: true, sku: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: 20,
      }),
    ]);

    // Check alerts
    const now = new Date();
    const threeMonthsFromNow = new Date();
    threeMonthsFromNow.setMonth(threeMonthsFromNow.getMonth() + 3);

    const alerts = {
      lowStockCount: inventory.filter((i) => i.quantityOnHand <= i.minStockAlert).length,
      expiringCount: lots.filter((l) => new Date(l.expiryDate) <= threeMonthsFromNow && l.quantityRemaining > 0).length,
    };

    let filteredInventory = inventory;
    if (lowStock) {
      filteredInventory = inventory.filter((i) => i.quantityOnHand <= i.minStockAlert);
    }

    let filteredLots = lots;
    if (expiringSoon) {
      filteredLots = lots.filter((l) => new Date(l.expiryDate) <= threeMonthsFromNow && l.quantityRemaining > 0);
    }

    return NextResponse.json({
      success: true,
      inventory: filteredInventory,
      lots: filteredLots,
      movements: recentMovements,
      alerts,
    });
  } catch (error) {
    console.error('Inventory fetch error:', error);
    return NextResponse.json({ message: 'Lỗi tải thông tin tồn kho' }, { status: 500 });
  }
}
