import { NextResponse } from 'next/server';
import crypto from 'crypto';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const { orderId } = await request.json();

    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      return NextResponse.json({ message: 'Không tìm thấy đơn hàng' }, { status: 404 });
    }

    const partnerCode = process.env.MOMO_PARTNER_CODE || 'MOMOBKUN20180529';
    const accessKey = process.env.MOMO_ACCESS_KEY || 'klm05TvNBzhg7h7j';
    const secretKey = process.env.MOMO_SECRET_KEY || 'at67qH6mk8w5Y1nAyMoYKMWACiEi2Aca';
    const endpoint = process.env.MOMO_ENDPOINT || 'https://test-payment.momo.vn/v2/gateway/api/create';

    const redirectUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/payments/momo/callback`;
    const ipnUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/payments/momo/callback`;
    const requestId = `${order.orderNumber}-${Date.now()}`;
    const amount = Math.round(order.totalAmount).toString();
    const orderInfo = `Thanh toan don hang ${order.orderNumber} tai Vitacore Supplements`;
    const requestType = 'captureWallet';
    const extraData = '';

    const rawSignature = `accessKey=${accessKey}&amount=${amount}&extraData=${extraData}&ipnUrl=${ipnUrl}&orderId=${order.orderNumber}&orderInfo=${orderInfo}&partnerCode=${partnerCode}&redirectUrl=${redirectUrl}&requestId=${requestId}&requestType=${requestType}`;
    const signature = crypto.createHmac('sha256', secretKey).update(rawSignature).digest('hex');

    // Create Payment Record in Pending status
    await prisma.payment.create({
      data: {
        orderId: order.id,
        paymentMethod: 'MOMO',
        transactionId: requestId,
        amount: order.totalAmount,
        status: 'PENDING',
        payloadJson: JSON.stringify({ requestId, rawSignature }),
      },
    });

    // In sandbox test without external network, provide direct sandbox checkout confirmation
    const payUrl = `${redirectUrl}?partnerCode=${partnerCode}&orderId=${order.orderNumber}&requestId=${requestId}&amount=${amount}&orderInfo=${encodeURIComponent(orderInfo)}&orderType=momo_wallet&transId=MOMO_TEST_${Date.now()}&resultCode=0&message=Giao%20dich%20thanh%20cong&payType=qr&responseTime=${Date.now()}&extraData=&signature=${signature}`;

    return NextResponse.json({
      success: true,
      payUrl,
      mode: 'SANDBOX',
      message: 'Khởi tạo giao dịch MoMo Sandbox thành công',
    });
  } catch (error) {
    console.error('MoMo payment init error:', error);
    return NextResponse.json({ message: 'Lỗi khởi tạo cổng thanh toán MoMo' }, { status: 500 });
  }
}

