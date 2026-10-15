import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { checkAuthFromRequest } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const authSession = await checkAuthFromRequest(request);
    if (!authSession) {
      return NextResponse.json({ message: 'Vui lòng đăng nhập' }, { status: 401 });
    }

    const addresses = await prisma.userAddress.findMany({
      where: { userId: authSession.userId },
      orderBy: { isDefault: 'desc' },
    });

    return NextResponse.json({ success: true, addresses });
  } catch (error) {
    console.error('Fetch addresses error:', error);
    return NextResponse.json({ message: 'Lỗi tải địa chỉ nhận hàng' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const authSession = await checkAuthFromRequest(request);
    if (!authSession) {
      return NextResponse.json({ message: 'Vui lòng đăng nhập' }, { status: 401 });
    }

    const { receiverName, phone, province, district, ward, streetAddress, isDefault } = await request.json();

    if (!receiverName || !phone || !province || !streetAddress) {
      return NextResponse.json(
        { message: 'Vui lòng cung cấp đầy đủ tên người nhận, số điện thoại, tỉnh/thành và địa chỉ chi tiết' },
        { status: 400 }
      );
    }

    if (isDefault) {
      // Clear other defaults
      await prisma.userAddress.updateMany({
        where: { userId: authSession.userId },
        data: { isDefault: false },
      });
    }

    const newAddress = await prisma.userAddress.create({
      data: {
        userId: authSession.userId,
        receiverName: receiverName.trim(),
        phone: phone.trim(),
        province: province.trim(),
        district: (district || '').trim(),
        ward: (ward || '').trim(),
        streetAddress: streetAddress.trim(),
        isDefault: Boolean(isDefault),
      },
    });

    return NextResponse.json({ success: true, address: newAddress });
  } catch (error) {
    console.error('Create address error:', error);
    return NextResponse.json({ message: 'Lỗi khi lưu địa chỉ' }, { status: 500 });
  }
}

