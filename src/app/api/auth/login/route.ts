import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { comparePassword, signToken } from '@/lib/auth';
import { logAuditAction } from '@/lib/audit';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { message: 'Vui lòng cung cấp email và mật khẩu' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (!user) {
      return NextResponse.json(
        { message: 'Email hoặc mật khẩu không chính xác' },
        { status: 401 }
      );
    }

    if (user.status === 'LOCKED') {
      return NextResponse.json(
        { message: 'Tài khoản đã bị tạm khóa. Vui lòng liên hệ bộ phận chăm sóc khách hàng.' },
        { status: 403 }
      );
    }

    const isMatch = await comparePassword(password, user.passwordHash);
    if (!isMatch) {
      return NextResponse.json(
        { message: 'Email hoặc mật khẩu không chính xác' },
        { status: 401 }
      );
    }

    // Role type check
    const role = (user.role as 'USER' | 'STAFF' | 'ADMIN') || 'USER';

    const token = signToken({
      userId: user.id,
      email: user.email,
      role,
      fullName: user.fullName,
    });

    // Record audit log
    await logAuditAction({
      userId: user.id,
      userEmail: user.email,
      userRole: role,
      action: 'LOGIN',
      entity: 'USER',
      entityId: user.id,
      details: 'User logged in successfully',
    });

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        avatarUrl: user.avatarUrl,
        phone: user.phone,
      },
    });

    // Set secure HTTP-only cookie
    response.cookies.set({
      name: 'vitacore_token',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ message: 'Lỗi hệ thống khi đăng nhập' }, { status: 500 });
  }
}

