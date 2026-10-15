import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { checkAuthFromRequest } from '@/lib/auth';
import { logAuditAction } from '@/lib/audit';
import { slugify } from '@/lib/utils';

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      where: { isActive: true },
      include: {
        _count: {
          select: { products: { where: { deletedAt: null, isActive: true } } },
        },
      },
      orderBy: { displayOrder: 'asc' },
    });

    return NextResponse.json({ success: true, categories });
  } catch (error) {
    console.error('Fetch categories error:', error);
    return NextResponse.json({ message: 'Lỗi tải danh mục' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const authSession = await checkAuthFromRequest(request);
    if (!authSession || authSession.role !== 'ADMIN') {
      return NextResponse.json({ message: 'Chỉ Admin mới có quyền tạo danh mục' }, { status: 403 });
    }

    const { name, description, imageUrl, displayOrder } = await request.json();
    if (!name) {
      return NextResponse.json({ message: 'Tên danh mục không được để trống' }, { status: 400 });
    }

    const slug = slugify(name);
    const category = await prisma.category.create({
      data: {
        name,
        slug,
        description: description || null,
        imageUrl: imageUrl || null,
        displayOrder: displayOrder ? parseInt(displayOrder) : 0,
      },
    });

    await logAuditAction({
      userId: authSession.userId,
      userEmail: authSession.email,
      userRole: authSession.role,
      action: 'CREATE',
      entity: 'CATEGORY',
      entityId: category.id,
      details: { name: category.name, slug: category.slug },
    });

    return NextResponse.json({ success: true, category });
  } catch (error) {
    console.error('Create category error:', error);
    return NextResponse.json({ message: 'Lỗi tạo danh mục' }, { status: 500 });
  }
}

