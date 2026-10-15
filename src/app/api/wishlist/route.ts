import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { checkAuthFromRequest } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const authSession = await checkAuthFromRequest(request);
    if (!authSession) {
      return NextResponse.json({ items: [] });
    }

    const wishlist = await prisma.wishlist.findFirst({
      where: { userId: authSession.userId },
      include: {
        items: {
          include: {
            product: {
              include: {
                images: { take: 1 },
                brand: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      items: wishlist?.items || [],
    });
  } catch (error) {
    console.error('Fetch wishlist error:', error);
    return NextResponse.json({ message: 'Lỗi tải danh sách yêu thích' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const authSession = await checkAuthFromRequest(request);
    if (!authSession) {
      return NextResponse.json({ message: 'Vui lòng đăng nhập để lưu vào yêu thích' }, { status: 401 });
    }

    const { productId } = await request.json();

    let wishlist = await prisma.wishlist.findFirst({
      where: { userId: authSession.userId },
    });

    if (!wishlist) {
      wishlist = await prisma.wishlist.create({
        data: { userId: authSession.userId },
      });
    }

    const existing = await prisma.wishlistItem.findUnique({
      where: {
        wishlistId_productId: {
          wishlistId: wishlist.id,
          productId,
        },
      },
    });

    if (existing) {
      await prisma.wishlistItem.delete({
        where: { id: existing.id },
      });
      return NextResponse.json({ success: true, isFavorited: false, message: 'Đã xóa khỏi danh sách yêu thích' });
    } else {
      await prisma.wishlistItem.create({
        data: {
          wishlistId: wishlist.id,
          productId,
        },
      });
      return NextResponse.json({ success: true, isFavorited: true, message: 'Đã thêm vào danh sách yêu thích' });
    }
  } catch (error) {
    console.error('Toggle wishlist error:', error);
    return NextResponse.json({ message: 'Lỗi cập nhật danh sách yêu thích' }, { status: 500 });
  }
}

