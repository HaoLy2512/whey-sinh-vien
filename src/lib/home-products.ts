import type { Prisma } from '@prisma/client';
import prisma from '@/lib/prisma';
import { compareBySales, getSoldByProduct } from '@/lib/sales';
import type { ProductCardProps } from '@/components/products/ProductCard';

export interface HeroProduct {
  id: string;
  name: string;
  slug: string;
  brandName: string;
  imageUrl: string;
  detail: string;
}

export interface HomeData {
  hero: HeroProduct | null;
  bestSellers: ProductCardProps[];
  /** id đã dùng ở Hero + Best Sellers, các section sau phải loại ra */
  usedIds: string[];
}

const CARD_INCLUDE = {
  brand: { select: { name: true, slug: true } },
  images: { orderBy: { displayOrder: 'asc' } },
  variants: { where: { isActive: true } },
} satisfies Prisma.ProductInclude;

type CardRow = Prisma.ProductGetPayload<{ include: typeof CARD_INCLUDE }>;

function toCardProps(p: CardRow): ProductCardProps {
  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    price: p.price,
    salePrice: p.salePrice,
    ratingAvg: p.ratingAvg,
    reviewCount: p.reviewCount,
    goal: p.goal,
    brand: p.brand ? { name: p.brand.name, slug: p.brand.slug } : null,
    images: p.images.map((i) => ({ url: i.url, alt: i.alt ?? undefined, isThumbnail: i.isThumbnail })),
    variants: p.variants.map((v) => ({
      id: v.id,
      title: v.title,
      price: v.price,
      salePrice: v.salePrice,
      inStock: v.inStock,
      flavor: v.flavor,
      weight: v.weight,
      packaging: v.packaging,
    })),
  };
}

export function buildHeroDetail(nutritionFacts: string | null, shortDescription: string | null): string {
  let detail = '';
  if (nutritionFacts) {
    try {
      const nf = JSON.parse(nutritionFacts) as { protein?: string; bcaa?: string };
      if (nf.protein && nf.bcaa) detail = `${nf.protein} Protein • ${nf.bcaa} BCAA`;
      else if (nf.protein) detail = `${nf.protein} Protein`;
    } catch {
      // nutritionFacts không phải JSON hợp lệ, bỏ qua
    }
  }
  if (!detail && shortDescription) {
    detail = shortDescription.length > 60 ? shortDescription.slice(0, 57) + '...' : shortDescription;
  }
  return detail;
}

function toHero(p: CardRow): HeroProduct {
  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    brandName: p.brand?.name ?? '',
    imageUrl: p.images.find((i) => i.isThumbnail)?.url ?? p.images[0]?.url ?? '',
    detail: buildHeroDetail(p.nutritionFacts, p.shortDescription),
  };
}

/**
 * Chọn dữ liệu cho Hero + Best Sellers một lần ở server để không trùng nhau.
 *  - Hero: sản phẩm admin đã ghim (isHero); nếu chưa ghim thì lấy sản phẩm bán chạy nhất.
 *  - Best Sellers: 4 sản phẩm bán nhiều nhất, loại sản phẩm ở Hero.
 */
export async function getHomeData(bestSellerLimit = 4): Promise<HomeData> {
  const rows = await prisma.product.findMany({
    where: { isActive: true, deletedAt: null },
    include: CARD_INCLUDE,
    orderBy: { createdAt: 'desc' },
    take: 500,
  });
  if (rows.length === 0) return { hero: null, bestSellers: [], usedIds: [] };

  const sold = await getSoldByProduct();
  const ranked = [...rows].sort(compareBySales(sold));

  const pinned = rows
    .filter((r) => r.isHero)
    .sort((a, b) => (b.pinnedAt?.getTime() ?? 0) - (a.pinnedAt?.getTime() ?? 0))[0];
  const heroRow = pinned ?? ranked[0];

  const bestRows = ranked.filter((r) => r.id !== heroRow.id).slice(0, bestSellerLimit);

  return {
    hero: toHero(heroRow),
    bestSellers: bestRows.map(toCardProps),
    usedIds: [heroRow.id, ...bestRows.map((r) => r.id)],
  };
}
