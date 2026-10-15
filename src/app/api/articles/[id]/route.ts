import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { checkAuthFromRequest } from '@/lib/auth';
import { logAuditAction } from '@/lib/audit';
import { slugify } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const article = await prisma.article.findFirst({
      where: {
        OR: [{ id: params.id }, { slug: params.id }],
      },
    });

    if (!article) {
      return NextResponse.json({ message: 'Không tìm thấy bài viết' }, { status: 404 });
    }

    return NextResponse.json({ success: true, article });
  } catch (error) {
    console.error('Fetch article error:', error);
    return NextResponse.json({ message: 'Lỗi tải bài viết' }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const authSession = await checkAuthFromRequest(request);
    if (!authSession || (authSession.role !== 'ADMIN' && authSession.role !== 'STAFF')) {
      return NextResponse.json({ message: 'Không có quyền chỉnh sửa bài viết' }, { status: 403 });
    }

    const data = await request.json();
    const existing = await prisma.article.findUnique({
      where: { id: params.id },
    });

    if (!existing) {
      return NextResponse.json({ message: 'Không tìm thấy bài viết' }, { status: 404 });
    }

    const updated = await prisma.article.update({
      where: { id: params.id },
      data: {
        title: data.title ?? existing.title,
        slug: data.slug ? slugify(data.slug) : existing.slug,
        excerpt: data.excerpt ?? existing.excerpt,
        content: data.content ?? existing.content,
        coverImage: data.coverImage !== undefined ? data.coverImage : existing.coverImage,
        authorName: data.authorName ?? existing.authorName,
        category: data.category ?? existing.category,
        isPublished: data.isPublished !== undefined ? Boolean(data.isPublished) : existing.isPublished,
        metaTitle: data.metaTitle !== undefined ? data.metaTitle : existing.metaTitle,
        metaDescription: data.metaDescription !== undefined ? data.metaDescription : existing.metaDescription,
      },
    });

    await logAuditAction({
      userId: authSession.userId,
      userEmail: authSession.email,
      userRole: authSession.role,
      action: 'UPDATE',
      entity: 'ARTICLE',
      entityId: existing.id,
      details: { previous: existing, updated },
    });

    return NextResponse.json({ success: true, article: updated });
  } catch (error) {
    console.error('Update article error:', error);
    return NextResponse.json({ message: 'Lỗi khi cập nhật bài viết' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const authSession = await checkAuthFromRequest(request);
    if (!authSession || authSession.role !== 'ADMIN') {
      return NextResponse.json({ message: 'Chỉ Admin mới có quyền xóa bài viết' }, { status: 403 });
    }

    const existing = await prisma.article.findUnique({
      where: { id: params.id },
    });

    if (!existing) {
      return NextResponse.json({ message: 'Không tìm thấy bài viết' }, { status: 404 });
    }

    await prisma.article.delete({
      where: { id: params.id },
    });

    await logAuditAction({
      userId: authSession.userId,
      userEmail: authSession.email,
      userRole: authSession.role,
      action: 'DELETE',
      entity: 'ARTICLE',
      entityId: params.id,
      details: { title: existing.title },
    });

    return NextResponse.json({ success: true, message: 'Đã xóa bài viết thành công' });
  } catch (error) {
    console.error('Delete article error:', error);
    return NextResponse.json({ message: 'Lỗi khi xóa bài viết' }, { status: 500 });
  }
}

