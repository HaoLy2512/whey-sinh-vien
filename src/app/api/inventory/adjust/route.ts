import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { checkAuthFromRequest } from '@/lib/auth';
import { logAuditAction } from '@/lib/audit';

export async function POST(request: Request) {
  try {
    const authSession = await checkAuthFromRequest(request);
    if (!authSession || (authSession.role !== 'ADMIN' && authSession.role !== 'STAFF')) {
      return NextResponse.json({ message: 'Không có quyền điều chỉnh tồn kho' }, { status: 403 });
    }

    const {
      productId,
      variantId,
      movementType, // 'IMPORT', 'ADJUSTMENT', 'EXPORT'
      quantity,
      note,
      lotNumber,
      expiryDate,
    } = await request.json();

    if (!productId || !movementType || quantity === undefined || !note) {
      return NextResponse.json(
        { message: 'Vui lòng cung cấp đầy đủ: sản phẩm, loại điều chỉnh, số lượng và lý do bắt buộc' },
        { status: 400 }
      );
    }

    const qty = parseInt(quantity);
    if (isNaN(qty) || qty === 0) {
      return NextResponse.json({ message: 'Số lượng điều chỉnh không hợp lệ' }, { status: 400 });
    }

    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: { variants: true },
    });

    if (!product) {
      return NextResponse.json({ message: 'Không tìm thấy sản phẩm' }, { status: 404 });
    }

    let lotId: string | null = null;

    await prisma.$transaction(async (tx) => {
      // 1. If IMPORT and lot info provided, create or update lot
      if (movementType === 'IMPORT' && lotNumber && expiryDate) {
        const lot = await tx.inventoryLot.create({
          data: {
            productId,
            variantId: variantId || null,
            lotNumber: lotNumber.trim().toUpperCase(),
            expiryDate: new Date(expiryDate),
            quantityInitial: qty,
            quantityRemaining: qty,
            status: 'ACTIVE',
          },
        });
        lotId = lot.id;
      }

      // 2. Adjust variant or product inStock
      const delta = movementType === 'EXPORT' ? -Math.abs(qty) : movementType === 'IMPORT' ? Math.abs(qty) : qty;

      if (variantId) {
        await tx.productVariant.update({
          where: { id: variantId },
          data: { inStock: { increment: delta } },
        });

        await tx.inventory.updateMany({
          where: { productId, variantId },
          data: {
            quantityOnHand: { increment: delta },
            quantityAvailable: { increment: delta },
          },
        });
      }

      // 3. Record mandatory Inventory Movement
      await tx.inventoryMovement.create({
        data: {
          productId,
          variantId: variantId || null,
          lotId,
          movementType,
          quantity: Math.abs(qty),
          referenceType: 'MANUAL',
          referenceId: `ADJ-${Date.now()}`,
          note: note.trim(),
          performedBy: `${authSession.role}: ${authSession.email}`,
        },
      });
    });

    await logAuditAction({
      userId: authSession.userId,
      userEmail: authSession.email,
      userRole: authSession.role,
      action: 'ADJUST_STOCK',
      entity: 'INVENTORY',
      entityId: productId,
      details: {
        productName: product.name,
        variantId,
        movementType,
        quantity: qty,
        note,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Điều chỉnh tồn kho và ghi nhật ký xuất nhập thành công',
    });
  } catch (error) {
    console.error('Inventory adjustment error:', error);
    return NextResponse.json({ message: 'Lỗi thực hiện điều chỉnh tồn kho' }, { status: 500 });
  }
}

