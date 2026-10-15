import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { logAuditAction } from '@/lib/audit';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const txnRef = searchParams.get('vnp_TxnRef');
    const responseCode = searchParams.get('vnp_ResponseCode');
    const transactionNo = searchParams.get('vnp_TransactionNo');

    if (!txnRef) {
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/cart`);
    }

    const order = await prisma.order.findUnique({
      where: { orderNumber: txnRef },
    });

    if (!order) {
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/cart`);
    }

    // Idempotency: if already paid
    if (order.paymentStatus === 'PAID') {
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/orders/${order.id}?paid=true`);
    }

    if (responseCode === '00') {
      await prisma.$transaction([
        prisma.order.update({
          where: { id: order.id },
          data: { paymentStatus: 'PAID', orderStatus: 'PROCESSING' },
        }),
        prisma.payment.updateMany({
          where: { orderId: order.id, paymentMethod: 'VNPAY' },
          data: { status: 'SUCCESS', transactionId: transactionNo || `VNPAY_${Date.now()}` },
        }),
        prisma.orderStatusHistory.create({
          data: {
            orderId: order.id,
            previousStatus: order.orderStatus,
            newStatus: 'PROCESSING',
            note: `Thanh toán thành công qua VNPay (Mã GD: ${transactionNo})`,
            changedBy: 'GATEWAY_VNPAY',
          },
        }),
      ]);

      await logAuditAction({
        action: 'UPDATE',
        entity: 'ORDER',
        entityId: order.id,
        details: `Order ${order.orderNumber} paid via VNPay Sandbox (transNo: ${transactionNo})`,
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
    console.error('VNPay callback error:', error);
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/cart`);
  }
}
