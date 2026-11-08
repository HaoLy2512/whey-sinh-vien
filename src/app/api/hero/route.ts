
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };
const prisma = globalForPrisma.prisma ?? new PrismaClient();
globalForPrisma.prisma = prisma;

export async function GET() {
  try {
    const p = await prisma.product.findFirst({
      where: { isHero: true, isActive: true, deletedAt: null },
      orderBy: { pinnedAt: 'desc' },
      select: {
        name: true,
        slug: true,
        shortDescription: true,
        nutritionFacts: true,
        brand: { select: { name: true } },
        images: {
          select: { url: true },
          orderBy: [{ isThumbnail: 'desc' }, { displayOrder: 'asc' }],
          take: 1,
        },
      },
    });

    if (!p) {
      return NextResponse.json({ hero: null }, { headers: { 'Cache-Control': 'no-store' } });
    }

    let detail = '';
    if (p.nutritionFacts) {
      try {
        const nf = JSON.parse(p.nutritionFacts);
        if (nf.protein && nf.bcaa) detail = `${nf.protein} Protein • ${nf.bcaa} BCAA`;
        else if (nf.protein) detail = `${nf.protein} Protein`;
      } catch {
        // nutritionFacts không phải JSON hợp lệ, bỏ qua
      }
    }
    if (!detail && p.shortDescription) {
      detail =
        p.shortDescription.length > 60
          ? p.shortDescription.slice(0, 57) + '...'
          : p.shortDescription;
    }

    return NextResponse.json(
      {
        hero: {
          name: p.name,
          slug: p.slug,
          brandName: p.brand?.name ?? '',
          imageUrl: p.images[0]?.url ?? '',
          detail,
        },
      },
      { headers: { 'Cache-Control': 'no-store' } }
    );
  } catch {
    return NextResponse.json({ hero: null }, { status: 200 });
  }
}