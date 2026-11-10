import { NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { PROMO } from '@/config/promo';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const bodySchema = z.object({
  email: z.string().trim().toLowerCase().email('Email chưa hợp lệ').max(254),
});

export async function POST(request: Request) {
  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ message: 'Dữ liệu gửi lên không hợp lệ' }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { message: parsed.error.issues[0]?.message ?? 'Email chưa hợp lệ' },
      { status: 400 }
    );
  }

  const { email } = parsed.data;
  const code = PROMO.firstOrderVoucher.code;

  try {
    const existing = await prisma.newsletterSubscriber.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({
        success: true,
        alreadySubscribed: true,
        code,
        message: `Email này đã đăng ký trước đó. Mã của bạn vẫn là ${code}.`,
      });
    }

    await prisma.newsletterSubscriber.create({ data: { email, source: 'HOME' } });
    return NextResponse.json({
      success: true,
      code,
      message: `Đăng ký thành công! Dùng mã ${code} ở bước thanh toán để giảm đơn hàng đầu tiên.`,
    });
  } catch (error) {
    console.error('Newsletter subscribe error:', error);
    return NextResponse.json({ message: 'Không thể đăng ký lúc này. Vui lòng thử lại sau.' }, { status: 500 });
  }
}
