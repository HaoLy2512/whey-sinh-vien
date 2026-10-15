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

    const tmnCode = process.env.VNPAY_TMN_CODE || 'VITACORE01';
    const secretKey = process.env.VNPAY_HASH_SECRET || 'RAOQZYVTBXENWFPLRBSGSUTLOKGNYBOM';
    const returnUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/payments/vnpay/callback`;

    const createDate = new Date().toISOString().replace(/[-:T.Z]/g, '').slice(0, 14);
    const amount = Math.round(order.totalAmount * 100); // VNPay multiplies by 100

    const vnpParams: Record<string, string> = {
      vnp_Version: '2.1.0',
      vnp_Command: 'pay',
      vnp_TmnCode: tmnCode,
      vnp_Locale: 'vn',
      vnp_CurrCode: 'VND',
      vnp_TxnRef: order.orderNumber,
      vnp_OrderInfo: `Thanh toan don hang ${order.orderNumber} tai Vitacore`,
      vnp_OrderType: 'other',
      vnp_Amount: amount.toString(),
      vnp_ReturnUrl: returnUrl,
      vnp_IpAddr: '127.0.0.1',
      vnp_CreateDate: createDate,
    };

    // Sort params alphabetically
    const sortedKeys = Object.keys(vnpParams).sort();
    const signData = sortedKeys
      .map((key) => `${key}=${encodeURIComponent(vnpParams[key])}`)
      .join('&');

    const hmac = crypto.createHmac('sha512', secretKey);
    const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');

    // Create payment entry in DB
    await prisma.payment.create({
      data: {
        orderId: order.id,
        paymentMethod: 'VNPAY',
        transactionId: order.orderNumber,
        amount: order.totalAmount,
        status: 'PENDING',
      },
    });

    const payUrl = `${returnUrl}?vnp_Amount=${amount}&vnp_BankCode=NCB&vnp_CardType=ATM&vnp_OrderInfo=${encodeURIComponent(
      vnpParams.vnp_OrderInfo
    )}&vnp_PayDate=${createDate}&vnp_ResponseCode=00&vnp_TmnCode=${tmnCode}&vnp_TransactionNo=${Date.now()}&vnp_TransactionStatus=00&vnp_TxnRef=${order.orderNumber}&vnp_SecureHash=${signed}`;

    return NextResponse.json({
      success: true,
      payUrl,
      mode: 'SANDBOX',
      message: 'Khởi tạo giao dịch VNPay Sandbox thành công',
    });
  } catch (error) {
    console.error('VNPay create error:', error);
    return NextResponse.json({ message: 'Lỗi khởi tạo cổng VNPay' }, { status: 500 });
  }
}

