import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { checkAuthFromRequest } from '@/lib/auth';
import { logAuditAction } from '@/lib/audit';
import { slugify } from '@/lib/utils';

export async function GET() {
  try {
    const brands = await prisma.brand.findMany({
      where: { isActive: true },
      include: {
        _count: {
          select: { products: { where: { deletedAt: null, isActive: true } } },
        },
      },
      orderBy: { name: 'asc' },
    });

    return NextResponse.json({ success: true, brands });
  } catch (error) {
    console.error('Fetch brands error:', error);
    return NextResponse.json({ message: 'Lỗi tải danh sách thương hiệu' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const authSession = await checkAuthFromRequest(request);
    if (!authSession || authSession.role !== 'ADMIN') {
      return NextResponse.json({ message: 'Chỉ Admin mới có quyền tạo thương hiệu' }, { status: 403 });
    }

    const { name, originCountry, description, logoUrl, website, isFeatured } = await request.json();
    if (!name) {
      return NextResponse.json({ message: 'Tên thương hiệu không được để trống' }, { status: 400 });
    }

    const slug = slugify(name);
    const brand = await prisma.brand.create({
      data: {
        name,
        slug,
        originCountry: originCountry || null,
        description: description || null,
        logoUrl: logoUrl || null,
        website: website || null,
        isFeatured: Boolean(isFeatured),
      },
    });

    await logAuditAction({
      userId: authSession.userId,
      userEmail: authSession.email,
      userRole: authSession.role,
      action: 'CREATE',
      entity: 'BRAND',
      entityId: brand.id,
      details: { name: brand.name, slug: brand.slug },
    });

    return NextResponse.json({ success: true, brand });
  } catch (error) {
    console.error('Create brand error:', error);
    return NextResponse.json({ message: 'Lỗi tạo thương hiệu' }, { status: 500 });
  }
}

