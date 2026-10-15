import { NextResponse } from 'next/server';
import crypto from 'crypto';
import prisma from '@/lib/prisma';
import { logAuditAction } from '@/lib/audit';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get('orderId');
    const resultCode = searchParams.get('resultCode');
    const transId = searchParams.get('transId');
    const signature = searchParams.get('signature');

    if (!orderId) {
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/cart`);
    }

    const order = await prisma.order.findUnique({
      where: { orderNumber: orderId },
      include: { payments: true },
    });

    if (!order) {
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/cart`);
    }

    // Idempotency: if already paid, just redirect
    if (order.paymentStatus === 'PAID') {
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/orders/${order.id}?paid=true`);
    }

    // Check transaction result
    if (resultCode === '0') {
      await prisma.$transaction([
        prisma.order.update({
          where: { id: order.id },
          data: { paymentStatus: 'PAID', orderStatus: 'PROCESSING' },
        }),
        prisma.payment.updateMany({
          where: { orderId: order.id, paymentMethod: 'MOMO' },
          data: { status: 'SUCCESS', transactionId: transId || `MOMO_${Date.now()}` },
        }),
        prisma.orderStatusHistory.create({
          data: {
            orderId: order.id,
            previousStatus: order.orderStatus,
            newStatus: 'PROCESSING',
            note: `Thanh toán thành công qua MoMo (Mã GD: ${transId})`,
            changedBy: 'GATEWAY_MOMO',
          },
        }),
      ]);

      await logAuditAction({
        action: 'UPDATE',
        entity: 'ORDER',
        entityId: order.id,
        details: `Order ${order.orderNumber} paid via MoMo Sandbox (transId: ${transId})`,
      });

      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/orders/${order.id}?paid=true`);
    } else {
      await prisma.order.update({
        where: { id: order.id },
        data: { paymentStatus: 'FAILED' },
      });

      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/orders/${order.id}?paid=false`);
    }
  } catch (error) {
    console.error('MoMo callback error:', error);
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/cart`);
  }
}
