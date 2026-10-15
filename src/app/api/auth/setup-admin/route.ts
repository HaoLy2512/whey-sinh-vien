import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { hashPassword } from '@/lib/auth';
import { logAuditAction } from '@/lib/audit';

export async function POST(request: Request) {
  try {
    const { setupSecret, email, password, fullName, phone } = await request.json();

    const expectedSecret = process.env.ADMIN_SETUP_SECRET;
    if (!expectedSecret || setupSecret !== expectedSecret) {
      return NextResponse.json(
        { message: 'Mã bí mật thiết lập không hợp lệ hoặc chưa được cấu hình' },
        { status: 403 }
      );
    }

    if (!email || !password || !fullName) {
      return NextResponse.json(
        { message: 'Vui lòng cung cấp đầy đủ email, mật khẩu và họ tên' },
        { status: 400 }
      );
    }

    const cleanEmail = email.toLowerCase().trim();
    const passwordHash = await hashPassword(password);

    const adminUser = await prisma.user.upsert({
      where: { email: cleanEmail },
      update: {
        passwordHash,
        role: 'ADMIN',
        status: 'ACTIVE',
        emailVerified: true,
        fullName,
        phone: phone || null,
      },
      create: {
        email: cleanEmail,
        passwordHash,
        fullName,
        phone: phone || null,
        role: 'ADMIN',
        status: 'ACTIVE',
        emailVerified: true,
      },
    });

    await logAuditAction({
      userId: adminUser.id,
      userEmail: adminUser.email,
      userRole: 'ADMIN',
      action: 'CREATE',
      entity: 'USER',
      entityId: adminUser.id,
      details: 'Admin user bootstrapped securely via setup API',
    });

    return NextResponse.json({
      success: true,
      message: 'Khởi tạo tài khoản Administrator thành công',
      user: {
        id: adminUser.id,
        email: adminUser.email,
        fullName: adminUser.fullName,
        role: adminUser.role,
      },
    });
  } catch (error) {
    console.error('Setup admin error:', error);
    return NextResponse.json({ message: 'Lỗi khởi tạo tài khoản quản trị' }, { status: 500 });
  }
}

