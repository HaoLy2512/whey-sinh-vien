import { NextResponse } from 'next/server';
import type { Prisma } from '@prisma/client';
import prisma from '@/lib/prisma';
import { checkAuthFromRequest } from '@/lib/auth';
import { logAuditAction } from '@/lib/audit';
import { slugify } from '@/lib/utils';
import { compareBySales, getSoldByProduct } from '@/lib/sales';

const PRODUCT_INCLUDE = {
  brand: { select: { id: true, name: true, slug: true, logoUrl: true } },
  category: { select: { id: true, name: true, slug: true } },
  images: { orderBy: { displayOrder: 'asc' } },
  variants: { where: { isActive: true } },
} satisfies Prisma.ProductInclude;

/** Số dòng tối đa khi phải xếp hạng / loại trùng trong bộ nhớ (catalog nhỏ). */
const IN_MEMORY_CAP = 500;

function parseNumber(value: string | null): number | undefined {
  if (value === null || value === '') return undefined;
  const n = parseFloat(value);
  return Number.isFinite(n) ? n : undefined;
}

/**
 * Hỗ trợ thêm cho trang chủ:
 *  - maxPrice/minPrice lọc theo GIÁ HIỆN BÁN (salePrice nếu có, ngược lại price)
 *  - sort=bestseller xếp theo SỐ LƯỢNG ĐÃ BÁN
 *  - excludeIds=a,b,c loại sản phẩm đã xuất hiện ở section khác;
 *    backfill=true thì nếu thiếu hàng sẽ bù lại từ chính các sản phẩm bị loại
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const categorySlug = searchParams.get('category');
    const brandSlug = searchParams.get('brand');
    const goal = searchParams.get('goal');
    const minPrice = parseNumber(searchParams.get('minPrice'));
    const maxPrice = parseNumber(searchParams.get('maxPrice'));
    const featured = searchParams.get('featured') === 'true';
    const sort = searchParams.get('sort') || 'latest';
    const excludeIds = (searchParams.get('excludeIds') || '')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    const backfill = searchParams.get('backfill') === 'true';
    const page = Math.max(1, parseInt(searchParams.get('page') || '1') || 1);
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '12') || 12));
    const skip = (page - 1) * limit;

    // Check auth for showing costPrice (COGS)
    const authSession = await checkAuthFromRequest(request);
    const isStaffOrAdmin = authSession?.role === 'ADMIN' || authSession?.role === 'STAFF';

    const and: Prisma.ProductWhereInput[] = [];
    const where: Prisma.ProductWhereInput = { deletedAt: null, AND: and };

    // Storefront only shows active products unless admin/staff
    if (!isStaffOrAdmin) where.isActive = true;

    if (search) {
      and.push({
        OR: [
          { name: { contains: search } },
          { sku: { contains: search } },
          { shortDescription: { contains: search } },
          { brand: { name: { contains: search } } },
        ],
      });
    }
    if (categorySlug) where.category = { slug: categorySlug };
    if (brandSlug) where.brand = { slug: brandSlug };
    if (goal) where.goal = goal;
    if (featured) where.isFeatured = true;

    if (minPrice !== undefined || maxPrice !== undefined) {
      const range: Prisma.FloatFilter = {};
      if (minPrice !== undefined) range.gte = minPrice;
      if (maxPrice !== undefined) range.lte = maxPrice;
      // giá hiện bán = salePrice nếu có, ngược lại price
      and.push({
        OR: [{ salePrice: { not: null, ...range } }, { salePrice: null, price: range }],
      });
    }

    let orderBy: Prisma.ProductOrderByWithRelationInput = { createdAt: 'desc' };
    if (sort === 'price_asc') orderBy = { price: 'asc' };
    if (sort === 'price_desc') orderBy = { price: 'desc' };
    if (sort === 'rating') orderBy = { ratingAvg: 'desc' };

    const needsInMemory = sort === 'bestseller' || excludeIds.length > 0;

    let products;
    let total: number;

    if (!needsInMemory) {
      const [count, rows] = await Promise.all([
        prisma.product.count({ where }),
        prisma.product.findMany({ where, include: PRODUCT_INCLUDE, orderBy, skip, take: limit }),
      ]);
      total = count;
      products = rows;
    } else {
      const rows = await prisma.product.findMany({
        where,
        include: PRODUCT_INCLUDE,
        orderBy: sort === 'bestseller' ? { createdAt: 'desc' } : orderBy,
        take: IN_MEMORY_CAP,
      });
      if (sort === 'bestseller') {
        const sold = await getSoldByProduct();
        rows.sort(compareBySales(sold));
      }
      const excluded = new Set(excludeIds);
      const preferred = rows.filter((r) => !excluded.has(r.id));
      const rest = rows.filter((r) => excluded.has(r.id));
      const list = backfill ? [...preferred, ...rest] : preferred;
      total = list.length;
      products = list.slice(skip, skip + limit);
    }

    // Sanitize data: remove costPrice for general public/users
    const sanitizedProducts = products.map((product) => {
      const variants = product.variants.map((v) => {
        if (!isStaffOrAdmin) {
          const { costPrice, ...rest } = v;
          void costPrice;
          return rest;
        }
        return v;
      });

      if (!isStaffOrAdmin) {
        const { costPrice, ...rest } = product;
        void costPrice;
        return { ...rest, variants };
      }
      return { ...product, variants };
    });

    return NextResponse.json({
      success: true,
      products: sanitizedProducts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Products fetch error:', error);
    return NextResponse.json({ message: 'Lỗi tải danh sách sản phẩm' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const authSession = await checkAuthFromRequest(request);
    if (!authSession || (authSession.role !== 'ADMIN' && authSession.role !== 'STAFF')) {
      return NextResponse.json({ message: 'Không có quyền thực hiện thao tác này' }, { status: 403 });
    }

    const data = await request.json();
    const {
      name,
      sku,
      barcode,
      brandId,
      categoryId,
      goal,
      price,
      salePrice,
      costPrice,
      shortDescription,
      description,
      nutritionFacts,
      usageGuide,
      warnings,
      allergens,
      manufacturer,
      originCountry,
      images,
      variants,
      isFeatured,
    } = data;

    if (!name || !sku || !price) {
      return NextResponse.json(
        { message: 'Vui lòng điền tên sản phẩm, mã SKU và giá bán' },
        { status: 400 }
      );
    }

    const slug = slugify(name) + '-' + Math.random().toString(36).substring(2, 6);

    const newProduct = await prisma.product.create({
      data: {
        name,
        slug,
        sku: sku.trim().toUpperCase(),
        barcode: barcode || null,
        brandId: brandId || null,
        categoryId: categoryId || null,
        goal: goal || 'Muscle Building',
        price: parseFloat(price),
        salePrice: salePrice ? parseFloat(salePrice) : null,
        costPrice: costPrice ? parseFloat(costPrice) : 0,
        shortDescription: shortDescription || null,
        description: description || '',
        nutritionFacts: typeof nutritionFacts === 'object' ? JSON.stringify(nutritionFacts) : nutritionFacts || null,
        usageGuide: usageGuide || null,
        warnings: warnings || null,
        allergens: allergens || null,
        manufacturer: manufacturer || null,
        originCountry: originCountry || null,
        isFeatured: Boolean(isFeatured),
        images: {
          create: (images || []).map((img: { url: string; alt?: string; isThumbnail?: boolean }, idx: number) => ({
            url: img.url,
            alt: img.alt || name,
            isThumbnail: img.isThumbnail ?? idx === 0,
            displayOrder: idx,
          })),
        },
      },
    });

    // Create variants if provided, or default variant
    if (variants && Array.isArray(variants) && variants.length > 0) {
      for (const v of variants) {
        const variant = await prisma.productVariant.create({
          data: {
            productId: newProduct.id,
            sku: v.sku.trim().toUpperCase(),
            title: v.title,
            weight: v.weight || null,
            flavor: v.flavor || null,
            packaging: v.packaging || null,
            price: parseFloat(v.price),
            salePrice: v.salePrice ? parseFloat(v.salePrice) : null,
            costPrice: v.costPrice ? parseFloat(v.costPrice) : 0,
            inStock: parseInt(v.inStock || '0'),
          },
        });

        // Create inventory record
        await prisma.inventory.create({
          data: {
            productId: newProduct.id,
            variantId: variant.id,
            quantityOnHand: parseInt(v.inStock || '0'),
            quantityAvailable: parseInt(v.inStock || '0'),
          },
        });
      }
    } else {
      // Default single variant
      const defaultVariant = await prisma.productVariant.create({
        data: {
          productId: newProduct.id,
          sku: `${newProduct.sku}-DEF`,
          title: 'Tiêu chuẩn',
          price: parseFloat(price),
          salePrice: salePrice ? parseFloat(salePrice) : null,
          costPrice: costPrice ? parseFloat(costPrice) : 0,
          inStock: 10,
        },
      });

      await prisma.inventory.create({
        data: {
          productId: newProduct.id,
          variantId: defaultVariant.id,
          quantityOnHand: 10,
          quantityAvailable: 10,
        },
      });
    }

    await logAuditAction({
      userId: authSession.userId,
      userEmail: authSession.email,
      userRole: authSession.role,
      action: 'CREATE',
      entity: 'PRODUCT',
      entityId: newProduct.id,
      details: { name: newProduct.name, sku: newProduct.sku, price: newProduct.price },
    });

    return NextResponse.json({ success: true, product: newProduct });
  } catch (error) {
    console.error('Product create error:', error);
    return NextResponse.json({ message: 'Lỗi tạo sản phẩm mới' }, { status: 500 });
  }
}

