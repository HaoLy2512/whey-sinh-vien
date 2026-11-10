import React from 'react';
import Link from 'next/link';
import BrandLogo from '@/components/ui/BrandLogo';

const BRANDS = [
  { name: 'Optimum Nutrition', slug: 'optimum-nutrition' },
  { name: 'Dymatize', slug: 'dymatize' },
  { name: 'Rule 1 Proteins', slug: 'rule-1-proteins' },
  { name: 'MuscleTech', slug: 'muscletech' },
  { name: 'Applied Nutrition', slug: 'applied-nutrition' },
  { name: 'Cellucor', slug: 'cellucor' },
];

export default function BrandsMarquee() {
  return (
    <section className="border-b border-charcoal-border/50 bg-charcoal-deep py-12 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <p className="mb-8 text-center text-sm font-bold uppercase tracking-widest text-slate-subtle">
          Thương hiệu dinh dưỡng thể thao phân phối tại cửa hàng
        </p>

        <ul className="grid grid-cols-2 items-center gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {BRANDS.map((b) => (
            <li key={b.slug}>
              <Link
                href={`/products?brand=${b.slug}`}
                title={b.name}
                className="flex min-h-[64px] items-center justify-center rounded-xl border border-charcoal-border/60 bg-charcoal-card/40 px-3 py-3 text-slate-subtle/80 transition hover:border-gold/50 hover:text-ivory focus:outline-none focus-visible:ring-2 focus-visible:ring-gold"
              >
                <BrandLogo name={b.name} slug={b.slug} />
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
