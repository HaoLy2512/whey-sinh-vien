import React from 'react';
import Link from 'next/link';

const BRANDS = [
  { name: 'Optimum Nutrition', slug: 'optimum-nutrition', origin: 'USA' },
  { name: 'Dymatize', slug: 'dymatize', origin: 'USA' },
  { name: 'Rule 1 Proteins', slug: 'rule-1-proteins', origin: 'USA' },
  { name: 'MuscleTech', slug: 'muscletech', origin: 'USA' },
  { name: 'Applied Nutrition', slug: 'applied-nutrition', origin: 'UK' },
  { name: 'Cellucor', slug: 'cellucor', origin: 'USA' },
];

export default function BrandsMarquee() {
  return (
    <section className="py-12 bg-charcoal-deep border-b border-charcoal-border/50">
      <div className="max-w-7xl mx-auto px-4 lg:px-8">
        <p className="text-center text-xs font-bold text-slate-DEFAULT uppercase tracking-widest mb-6">
          Đối tác phân phối chiến lược từ các thương hiệu dinh dưỡng toàn cầu
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 items-center">
          {BRANDS.map((b) => (
            <Link
              key={b.slug}
              href={`/products?brand=${b.slug}`}
              className="p-4 rounded-xl bg-charcoal-card/40 border border-charcoal-border/60 hover:border-gold/50 flex flex-col items-center justify-center text-center transition group"
            >
              <span className="font-display font-extrabold text-sm text-ivory group-hover:text-gold transition">
                {b.name}
              </span>
              <span className="text-[10px] text-gold-light mt-0.5 tracking-wider uppercase font-semibold">
                Xuất xứ: {b.origin}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

