import React from 'react';
import Link from 'next/link';
import { ArrowRight, Sparkles } from 'lucide-react';
import ProductCard, { ProductCardProps } from '@/components/products/ProductCard';

/** Tiêu chí: SỐ LƯỢNG ĐÃ BÁN (server chọn, đã loại sản phẩm ở Hero). */
export default function BestSellersSection({ products }: { products: ProductCardProps[] }) {
  if (products.length === 0) return null;

  return (
    <section className="border-b border-charcoal-border/50 bg-charcoal-deep py-12 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <div className="mb-10 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <div className="mb-1 inline-flex items-center gap-1.5 text-sm font-bold uppercase tracking-widest text-gold">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Mua nhiều nhất</span>
            </div>
            <h2 className="font-display text-2xl font-extrabold text-ivory sm:text-3xl">SẢN PHẨM BÁN CHẠY NHẤT</h2>
          </div>
          <Link
            href="/products?sort=bestseller"
            className="flex min-h-[44px] items-center gap-1.5 text-sm font-bold text-gold-light transition hover:text-gold focus:outline-none focus-visible:underline"
          >
            <span>Xem tất cả bán chạy</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((p) => (
            <ProductCard key={p.id} {...p} />
          ))}
        </div>
      </div>
    </section>
  );
}
