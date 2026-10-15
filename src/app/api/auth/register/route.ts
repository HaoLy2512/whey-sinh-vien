import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { hashPassword, signToken } from '@/lib/auth';
import { logAuditAction } from '@/lib/audit';

export async function POST(request: Request) {
  try {
    const { email, password, fullName, phone } = await request.json();

    if (!email || !password || !fullName) {
      return NextResponse.json(
        { message: 'Vui lòng điền đầy đủ họ tên, email và mật khẩu' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { message: 'Mật khẩu phải có độ dài tối thiểu 6 ký tự' },
        { status: 400 }
      );
    }

    const cleanEmail = email.toLowerCase().trim();

    const existingUser = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (existingUser) {
      return NextResponse.json(
        { message: 'Email này đã được sử dụng. Vui lòng đăng nhập hoặc dùng email khác.' },
        { status: 409 }
      );
    }

    const passwordHash = await hashPassword(password);

    const newUser = await prisma.user.create({
      data: {
        email: cleanEmail,
        passwordHash,
        fullName: fullName.trim(),
        phone: phone ? phone.trim() : null,
        role: 'USER', // Default registration is strictly USER
        status: 'ACTIVE',
      },
    });

    const token = signToken({
      userId: newUser.id,
      email: newUser.email,
      role: 'USER',
      fullName: newUser.fullName,
    });

    await logAuditAction({
      userId: newUser.id,
      userEmail: newUser.email,
      userRole: 'USER',
      action: 'CREATE',
      entity: 'USER',
      entityId: newUser.id,
      details: 'New customer registered account',
    });

    const response = NextResponse.json({
      success: true,
      user: {
        id: newUser.id,
        email: newUser.email,
        fullName: newUser.fullName,
        role: newUser.role,
        phone: newUser.phone,
      },
    });

    response.cookies.set({
      name: 'vitacore_token',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60,
    });

    return response;
  } catch (error) {
    console.error('Register error:', error);
    return NextResponse.json({ message: 'Lỗi hệ thống khi đăng ký' }, { status: 500 });
  }
}

