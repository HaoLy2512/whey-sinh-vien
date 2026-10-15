import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { checkAuthFromRequest } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const authSession = await checkAuthFromRequest(request);
    const isStaffOrAdmin = authSession?.role === 'ADMIN' || authSession?.role === 'STAFF';

    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');

    const where: any = {};
    if (productId) where.productId = productId;
    if (!isStaffOrAdmin) {
      where.status = 'APPROVED';
    }

    const reviews = await prisma.productReview.findMany({
      where,
      include: {
        user: { select: { fullName: true, avatarUrl: true } },
        product: { select: { name: true, slug: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, reviews });
  } catch (error) {
    console.error('Fetch reviews error:', error);
    return NextResponse.json({ message: 'Lỗi tải đánh giá sản phẩm' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const authSession = await checkAuthFromRequest(request);
    if (!authSession) {
      return NextResponse.json({ message: 'Vui lòng đăng nhập để gửi đánh giá' }, { status: 401 });
    }

    const { productId, rating, comment, title } = await request.json();

    if (!productId || !rating || !comment) {
      return NextResponse.json({ message: 'Vui lòng cung cấp số sao đánh giá và nội dung nhận xét' }, { status: 400 });
    }

    // Check if user has purchased this product
    const purchasedOrder = await prisma.order.findFirst({
      where: {
        userId: authSession.userId,
        orderStatus: 'DELIVERED',
        items: {
          some: { productId },
        },
      },
    });

    const verifiedPurchase = Boolean(purchasedOrder);

    const review = await prisma.productReview.create({
      data: {
        productId,
        userId: authSession.userId,
        rating: Math.min(5, Math.max(1, parseInt(rating))),
        title: title || null,
        comment: comment.trim(),
        verifiedPurchase,
        status: 'APPROVED', // Default to approved or pending based on store policy
      },
    });

    // Update product average rating
    const allReviews = await prisma.productReview.findMany({
      where: { productId, status: 'APPROVED' },
      select: { rating: true },
    });

    const avg = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;

    await prisma.product.update({
      where: { id: productId },
      data: {
        ratingAvg: parseFloat(avg.toFixed(1)),
        reviewCount: allReviews.length,
      },
    });

    return NextResponse.json({ success: true, review });
  } catch (error) {
    console.error('Create review error:', error);
    return NextResponse.json({ message: 'Lỗi khi gửi đánh giá' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const authSession = await checkAuthFromRequest(request);
    if (!authSession || (authSession.role !== 'ADMIN' && authSession.role !== 'STAFF')) {
      return NextResponse.json({ message: 'Không có quyền kiểm duyệt đánh giá' }, { status: 403 });
    }

    const { reviewId, status } = await request.json();

    const updated = await prisma.productReview.update({
      where: { id: reviewId },
      data: { status },
    });

    return NextResponse.json({ success: true, review: updated });
  } catch (error) {
    console.error('Moderate review error:', error);
    return NextResponse.json({ message: 'Lỗi kiểm duyệt đánh giá' }, { status: 500 });
  }
}

