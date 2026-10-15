import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { checkAuthFromRequest } from '@/lib/auth';
import { logAuditAction } from '@/lib/audit';

export async function GET(request: Request) {
  try {
    const authSession = await checkAuthFromRequest(request);
    if (!authSession || authSession.role !== 'ADMIN') {
      return NextResponse.json({ message: 'Không có quyền truy cập khuyến mãi' }, { status: 403 });
    }

    const coupons = await prisma.coupon.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: { select: { redemptions: true } },
      },
    });

    return NextResponse.json({ success: true, coupons });
  } catch (error) {
    console.error('Fetch coupons error:', error);
    return NextResponse.json({ message: 'Lỗi tải danh sách mã giảm giá' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const authSession = await checkAuthFromRequest(request);
    if (!authSession || authSession.role !== 'ADMIN') {
      return NextResponse.json({ message: 'Không có quyền tạo mã giảm giá' }, { status: 403 });
    }

    const {
      code,
      description,
      discountType = 'PERCENTAGE',
      discountValue,
      minOrderValue = 0,
      maxDiscountValue,
      usageLimit = 100,
    } = await request.json();

    if (!code || !discountValue) {
      return NextResponse.json({ message: 'Vui lòng nhập mã và giá trị giảm giá' }, { status: 400 });
    }

    const newCoupon = await prisma.coupon.create({
      data: {
        code: code.trim().toUpperCase(),
        description: description || null,
        discountType,
        discountValue: parseFloat(discountValue),
        minOrderValue: parseFloat(minOrderValue),
        maxDiscountValue: maxDiscountValue ? parseFloat(maxDiscountValue) : null,
        usageLimit: parseInt(usageLimit),
        isActive: true,
      },
    });

    await logAuditAction({
      userId: authSession.userId,
      userEmail: authSession.email,
      userRole: authSession.role,
      action: 'CREATE',
      entity: 'COUPON',
      entityId: newCoupon.id,
      details: { code: newCoupon.code, discountValue: newCoupon.discountValue },
    });

    return NextResponse.json({ success: true, coupon: newCoupon });
  } catch (error) {
    console.error('Create coupon error:', error);
    return NextResponse.json({ message: 'Lỗi tạo mã giảm giá' }, { status: 500 });
  }
}

