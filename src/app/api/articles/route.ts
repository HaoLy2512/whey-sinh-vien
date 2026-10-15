import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { checkAuthFromRequest } from '@/lib/auth';
import { logAuditAction } from '@/lib/audit';
import { slugify } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';
    const isPublished = searchParams.get('isPublished');

    const where: any = {};
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { excerpt: { contains: search } },
      ];
    }
    if (category) {
      where.category = category;
    }
    if (isPublished !== null && isPublished !== undefined && isPublished !== '') {
      where.isPublished = isPublished === 'true';
    }

    const articles = await prisma.article.findMany({
      where,
      orderBy: { publishedAt: 'desc' },
    });

    return NextResponse.json({ success: true, articles });
  } catch (error) {
    console.error('Fetch articles error:', error);
    return NextResponse.json({ message: 'Lỗi tải danh sách bài viết' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const authSession = await checkAuthFromRequest(request);
    if (!authSession || (authSession.role !== 'ADMIN' && authSession.role !== 'STAFF')) {
      return NextResponse.json({ message: 'Không có quyền tạo bài viết' }, { status: 403 });
    }

    const data = await request.json();
    const {
      title,
      excerpt,
      content,
      coverImage,
      authorName,
      category,
      isPublished,
      metaTitle,
      metaDescription,
    } = data;

    if (!title || !excerpt || !content) {
      return NextResponse.json(
        { message: 'Vui lòng điền tiêu đề, tóm tắt và nội dung bài viết' },
        { status: 400 }
      );
    }

    const slug = slugify(title) + '-' + Math.random().toString(36).substring(2, 6);

    const article = await prisma.article.create({
      data: {
        title,
        slug,
        excerpt,
        content,
        coverImage: coverImage || null,
        authorName: authorName || 'Chuyên gia Dinh dưỡng Vitacore',
        category: category || 'Nutrition',
        isPublished: isPublished !== undefined ? Boolean(isPublished) : true,
        metaTitle: metaTitle || null,
        metaDescription: metaDescription || null,
      },
    });

    await logAuditAction({
      userId: authSession.userId,
      userEmail: authSession.email,
      userRole: authSession.role,
      action: 'CREATE',
      entity: 'ARTICLE',
      entityId: article.id,
      details: { title: article.title, slug: article.slug },
    });

    return NextResponse.json({ success: true, article });
  } catch (error) {
    console.error('Create article error:', error);
    return NextResponse.json({ message: 'Lỗi khi tạo bài viết mới' }, { status: 500 });
  }
}

