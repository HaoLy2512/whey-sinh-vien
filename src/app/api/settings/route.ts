import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { checkAuthFromRequest } from '@/lib/auth';
import { logAuditAction } from '@/lib/audit';

export async function GET() {
  try {
    let settings = await prisma.storeSettings.findUnique({
      where: { id: 'default' },
    });

    if (!settings) {
      settings = await prisma.storeSettings.create({
        data: {
          id: 'default',
          storeName: 'VITACORE SUPPLEMENTS',
          legalName: 'Công Ty TNHH Dinh Dưỡng Thể Thao Vitacore Việt Nam',
          hotline: '1900 8899',
          email: 'support@vitacore.vn',
          address: '123 Võ Văn Tần, Phường 6, Quận 3, TP. Hồ Chí Minh',
          primaryColor: '#101318',
          accentColor: '#C8A96A',
          freeShippingThreshold: 1000000,
          defaultShippingFee: 30000,
        },
      });
    }

    return NextResponse.json({ success: true, settings });
  } catch (error) {
    console.error('Fetch settings error:', error);
    return NextResponse.json({ message: 'Lỗi tải thông tin cài đặt cửa hàng' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const authSession = await checkAuthFromRequest(request);
    if (!authSession || authSession.role !== 'ADMIN') {
      return NextResponse.json({ message: 'Chỉ Admin mới có quyền thay đổi thông tin cửa hàng' }, { status: 403 });
    }

    const data = await request.json();

    const updated = await prisma.storeSettings.upsert({
      where: { id: 'default' },
      update: {
        storeName: data.storeName,
        legalName: data.legalName,
        hotline: data.hotline,
        email: data.email,
        address: data.address,
        logoUrl: data.logoUrl,
        primaryColor: data.primaryColor,
        accentColor: data.accentColor,
        freeShippingThreshold: data.freeShippingThreshold !== undefined ? parseFloat(data.freeShippingThreshold) : undefined,
        defaultShippingFee: data.defaultShippingFee !== undefined ? parseFloat(data.defaultShippingFee) : undefined,
        bankAccountInfo: typeof data.bankAccountInfo === 'object' ? JSON.stringify(data.bankAccountInfo) : data.bankAccountInfo,
        paymentSettingsJson: typeof data.paymentSettingsJson === 'object' ? JSON.stringify(data.paymentSettingsJson) : data.paymentSettingsJson,
        socialLinksJson: typeof data.socialLinksJson === 'object' ? JSON.stringify(data.socialLinksJson) : data.socialLinksJson,
      },
      create: {
        id: 'default',
        storeName: data.storeName || 'VITACORE SUPPLEMENTS',
        legalName: data.legalName || 'Vitacore Vietnam',
        hotline: data.hotline || '1900 8899',
        email: data.email || 'support@vitacore.vn',
        address: data.address || 'TP. Hồ Chí Minh',
        freeShippingThreshold: data.freeShippingThreshold ? parseFloat(data.freeShippingThreshold) : 1000000,
        defaultShippingFee: data.defaultShippingFee ? parseFloat(data.defaultShippingFee) : 30000,
      },
    });

    await logAuditAction({
      userId: authSession.userId,
      userEmail: authSession.email,
      userRole: authSession.role,
      action: 'UPDATE',
      entity: 'SETTINGS',
      entityId: 'default',
      details: { storeName: updated.storeName, hotline: updated.hotline },
    });

    return NextResponse.json({ success: true, settings: updated });
  } catch (error) {
    console.error('Update settings error:', error);
    return NextResponse.json({ message: 'Lỗi cập nhật cấu hình cửa hàng' }, { status: 500 });
  }
}

