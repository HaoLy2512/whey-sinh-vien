'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, Sparkles } from 'lucide-react';
import ProductCard, { ProductCardProps } from '@/components/products/ProductCard';

export default function BestSellersSection() {
  const [products, setProducts] = useState<ProductCardProps[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/products?featured=true&limit=4')
      .then((res) => res.json())
      .then((data) => {
        if (data.products) setProducts(data.products);
      })
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="py-16 bg-charcoal-deep border-b border-charcoal-border/50">
      <div className="max-w-7xl mx-auto px-4 lg:px-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-10">
          <div>
            <div className="inline-flex items-center gap-1.5 text-gold text-xs font-bold uppercase tracking-widest mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Được Bình Chọn Nhiều Nhất</span>
            </div>
            <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-ivory">
              SẢN PHẨM BÁN CHẠY NHẤT
            </h2>
          </div>
          <Link
            href="/products?sort=bestseller"
            className="text-xs font-bold text-gold-light hover:text-gold flex items-center gap-1.5 transition"
          >
            <span>Xem tất cả Best Sellers</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-96 rounded-xl bg-charcoal-card animate-pulse border border-charcoal-border/50" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((p) => (
              <ProductCard key={p.id} {...p} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

