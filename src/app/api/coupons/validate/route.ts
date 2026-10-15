import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const { code, subtotal } = await request.json();

    if (!code) {
      return NextResponse.json({ message: 'Vui lòng nhập mã giảm giá' }, { status: 400 });
    }

    const orderSubtotal = parseFloat(subtotal || '0');

    const coupon = await prisma.coupon.findUnique({
      where: { code: code.toUpperCase().trim() },
    });

    if (!coupon) {
      return NextResponse.json({ message: 'Mã giảm giá không tồn tại' }, { status: 404 });
    }

    if (!coupon.isActive) {
      return NextResponse.json({ message: 'Mã giảm giá đã tạm ngưng áp dụng' }, { status: 400 });
    }

    const now = new Date();
    if (coupon.startDate && new Date(coupon.startDate) > now) {
      return NextResponse.json({ message: 'Mã giảm giá chưa đến ngày áp dụng' }, { status: 400 });
    }

    if (coupon.endDate && new Date(coupon.endDate) < now) {
      return NextResponse.json({ message: 'Mã giảm giá đã hết hạn sử dụng' }, { status: 400 });
    }

    if (coupon.usageLimit > 0 && coupon.usageCount >= coupon.usageLimit) {
      return NextResponse.json({ message: 'Mã giảm giá đã hết lượt sử dụng' }, { status: 400 });
    }

    if (orderSubtotal < coupon.minOrderValue) {
      return NextResponse.json(
        {
          message: `Đơn hàng tối thiểu để áp dụng mã này là ${new Intl.NumberFormat('vi-VN').format(coupon.minOrderValue)} ₫`,
        },
        { status: 400 }
      );
    }

    let discountAmount = 0;
    if (coupon.discountType === 'PERCENTAGE') {
      discountAmount = Math.round((orderSubtotal * coupon.discountValue) / 100);
      if (coupon.maxDiscountValue && discountAmount > coupon.maxDiscountValue) {
        discountAmount = coupon.maxDiscountValue;
      }
    } else {
      discountAmount = coupon.discountValue;
    }

    discountAmount = Math.min(discountAmount, orderSubtotal);

    return NextResponse.json({
      success: true,
      coupon: {
        id: coupon.id,
        code: coupon.code,
        description: coupon.description,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
      },
      discountAmount,
    });
  } catch (error) {
    console.error('Coupon validate error:', error);
    return NextResponse.json({ message: 'Lỗi kiểm tra mã giảm giá' }, { status: 500 });
  }
}

