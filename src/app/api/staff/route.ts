import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { checkAuthFromRequest, hashPassword } from '@/lib/auth';
import { logAuditAction } from '@/lib/audit';

export async function GET(request: Request) {
  try {
    const authSession = await checkAuthFromRequest(request);
    if (!authSession || authSession.role !== 'ADMIN') {
      return NextResponse.json({ message: 'Chỉ Admin mới có quyền quản lý nhân viên' }, { status: 403 });
    }

    const staffMembers = await prisma.user.findMany({
      where: {
        role: { in: ['STAFF', 'ADMIN'] },
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        status: true,
        phone: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, staff: staffMembers });
  } catch (error) {
    console.error('Fetch staff error:', error);
    return NextResponse.json({ message: 'Lỗi tải danh sách nhân viên' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const authSession = await checkAuthFromRequest(request);
    if (!authSession || authSession.role !== 'ADMIN') {
      return NextResponse.json({ message: 'Chỉ Admin mới có quyền tạo tài khoản nhân viên' }, { status: 403 });
    }

    const { email, password, fullName, phone, role = 'STAFF' } = await request.json();

    if (!email || !password || !fullName) {
      return NextResponse.json({ message: 'Vui lòng điền đầy đủ email, mật khẩu và họ tên' }, { status: 400 });
    }

    // Security check: Only Admin can create another staff or admin
    if (role !== 'STAFF' && role !== 'ADMIN') {
      return NextResponse.json({ message: 'Vai trò không hợp lệ' }, { status: 400 });
    }

    const cleanEmail = email.toLowerCase().trim();
    const existing = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (existing) {
      return NextResponse.json({ message: 'Email đã tồn tại trên hệ thống' }, { status: 409 });
    }

    const passwordHash = await hashPassword(password);

    const newStaff = await prisma.user.create({
      data: {
        email: cleanEmail,
        passwordHash,
        fullName: fullName.trim(),
        phone: phone ? phone.trim() : null,
        role,
        status: 'ACTIVE',
        emailVerified: true,
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        status: true,
      },
    });

    await logAuditAction({
      userId: authSession.userId,
      userEmail: authSession.email,
      userRole: authSession.role,
      action: 'CREATE',
      entity: 'USER',
      entityId: newStaff.id,
      details: { email: newStaff.email, role: newStaff.role },
    });

    return NextResponse.json({ success: true, staff: newStaff });
  } catch (error) {
    console.error('Create staff error:', error);
    return NextResponse.json({ message: 'Lỗi khi tạo tài khoản nhân viên' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const authSession = await checkAuthFromRequest(request);
    if (!authSession || authSession.role !== 'ADMIN') {
      return NextResponse.json({ message: 'Chỉ Admin mới có quyền thay đổi trạng thái nhân viên' }, { status: 403 });
    }

    const { staffId, status } = await request.json();

    if (!staffId || !status) {
      return NextResponse.json({ message: 'Thiếu thông tin' }, { status: 400 });
    }

    // Cannot lock self
    if (staffId === authSession.userId) {
      return NextResponse.json({ message: 'Không thể tự khóa tài khoản của chính mình' }, { status: 400 });
    }

    const updated = await prisma.user.update({
      where: { id: staffId },
      data: { status },
      select: { id: true, email: true, status: true, role: true },
    });

    await logAuditAction({
      userId: authSession.userId,
      userEmail: authSession.email,
      userRole: authSession.role,
      action: 'UPDATE',
      entity: 'USER',
      entityId: staffId,
      details: { newStatus: status, targetEmail: updated.email },
    });

    return NextResponse.json({ success: true, staff: updated });
  } catch (error) {
    console.error('Update staff status error:', error);
    return NextResponse.json({ message: 'Lỗi cập nhật trạng thái nhân viên' }, { status: 500 });
  }
}

