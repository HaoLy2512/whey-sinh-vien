import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { checkAuthFromRequest } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const authSession = await checkAuthFromRequest(request);
    const isStaffOrAdmin = authSession?.role === 'ADMIN' || authSession?.role === 'STAFF';

    const where: any = {};
    if (!isStaffOrAdmin) {
      if (!authSession) {
        return NextResponse.json({ message: 'Vui lòng đăng nhập' }, { status: 401 });
      }
      where.userId = authSession.userId;
    }

    const tickets = await prisma.supportTicket.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, tickets });
  } catch (error) {
    console.error('Fetch tickets error:', error);
    return NextResponse.json({ message: 'Lỗi tải danh sách yêu cầu hỗ trợ' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const authSession = await checkAuthFromRequest(request);
    const { name, email, phone, subject, message, priority = 'MEDIUM' } = await request.json();

    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { message: 'Vui lòng điền họ tên, email, tiêu đề và nội dung cần hỗ trợ' },
        { status: 400 }
      );
    }

    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const ticketNumber = `TK-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${randomNum}`;

    const ticket = await prisma.supportTicket.create({
      data: {
        ticketNumber,
        userId: authSession?.userId || null,
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone ? phone.trim() : null,
        subject: subject.trim(),
        message: message.trim(),
        priority,
        status: 'OPEN',
      },
    });

    return NextResponse.json({ success: true, ticket });
  } catch (error) {
    console.error('Create ticket error:', error);
    return NextResponse.json({ message: 'Lỗi khi gửi yêu cầu hỗ trợ' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const authSession = await checkAuthFromRequest(request);
    if (!authSession || (authSession.role !== 'ADMIN' && authSession.role !== 'STAFF')) {
      return NextResponse.json({ message: 'Chỉ nhân viên mới có quyền phản hồi hỗ trợ' }, { status: 403 });
    }

    const { ticketId, staffReply, status } = await request.json();

    const updated = await prisma.supportTicket.update({
      where: { id: ticketId },
      data: {
        staffReply: staffReply || undefined,
        status: status || undefined,
        assignedTo: authSession.fullName || authSession.role,
      },
    });

    return NextResponse.json({ success: true, ticket: updated });
  } catch (error) {
    console.error('Update ticket error:', error);
    return NextResponse.json({ message: 'Lỗi phản hồi yêu cầu hỗ trợ' }, { status: 500 });
  }
}

