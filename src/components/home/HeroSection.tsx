import React from 'react';
import Link from 'next/link';
import { ShieldCheck, ArrowRight, Flame } from 'lucide-react';
import ProductImage from '@/components/products/ProductImage';
import type { HeroProduct } from '@/lib/home-products';
import { PROMO, formatMoneyShort } from '@/config/promo';

export default function HeroSection({ hero }: { hero: HeroProduct | null }) {
  return (
    <section className="relative overflow-hidden border-b border-charcoal-border/50 bg-gradient-to-b from-charcoal-deep via-charcoal to-charcoal-deep py-12 sm:py-16 lg:py-24">
      <div className="pointer-events-none absolute left-1/2 top-1/4 h-[350px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gold/10 blur-[130px]" />
      <div className="pointer-events-none absolute right-10 top-10 h-72 w-72 rounded-full bg-emerald-500/10 blur-[100px]" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12">
          <div className="flex flex-col items-start lg:col-span-7">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/10 px-3.5 py-1.5 text-sm font-bold uppercase tracking-wide text-gold-light backdrop-blur-sm">
              <Flame className="h-4 w-4 fill-current text-gold" />
              <span>Dinh dưỡng thể thao chính hãng</span>
            </div>

            <h1 className="mb-6 font-display text-3xl font-black leading-tight tracking-tight text-ivory sm:text-5xl lg:text-6xl">
              BỨT PHÁ GIỚI HẠN <br />
              <span className="gold-gradient-text">THỂ CHẤT ĐỈNH CAO</span>
            </h1>

            <p className="mb-8 max-w-2xl text-base leading-relaxed text-slate-subtle sm:text-lg">
              Thực phẩm bổ sung chuẩn quốc tế cho người tập gym. Sản phẩm nhập khẩu chính hãng, có tem chống giả,
              hóa đơn VAT và bảng thành phần minh bạch.
            </p>

            <div className="mb-10 flex w-full flex-col items-stretch gap-4 sm:w-auto sm:flex-row sm:items-center">
              <Link
                href="/products"
                className="flex min-h-[48px] items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-gold to-gold-dark px-8 py-4 font-display text-sm font-extrabold uppercase tracking-wider text-charcoal shadow-glow transition hover:brightness-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-charcoal"
              >
                <span>Khám phá sản phẩm</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/products?sort=bestseller"
                className="flex min-h-[48px] items-center justify-center gap-2 rounded-xl border border-gold/40 bg-charcoal-card px-8 py-4 font-display text-sm font-bold uppercase tracking-wider text-ivory transition hover:border-gold hover:text-gold focus:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-charcoal"
              >
                <span>Top bán chạy</span>
              </Link>
            </div>

            <div className="grid w-full max-w-lg grid-cols-3 gap-4 border-t border-charcoal-border/80 pt-6 sm:gap-6">
              <div>
                <span className="font-display text-2xl font-black text-gold sm:text-3xl">100%</span>
                <p className="mt-1 text-sm text-slate-subtle">Chính hãng nhập khẩu</p>
              </div>
              <div>
                <span className="font-display text-2xl font-black text-ivory sm:text-3xl">
                  {PROMO.freeShip.threshold / 1_000_000}TR
                </span>
                <p className="mt-1 text-sm text-slate-subtle">Freeship từ {formatMoneyShort(PROMO.freeShip.threshold)}</p>
              </div>
              <div>
                <span className="font-display text-2xl font-black text-emerald-400 sm:text-3xl">
                  {PROMO.delivery.expressTime.replace(' giờ', 'H')}
                </span>
                <p className="mt-1 text-sm text-slate-subtle">Giao nhanh {PROMO.delivery.expressAreas}</p>
              </div>
            </div>
          </div>

          <div className="relative flex items-center justify-center lg:col-span-5">
            <div className="relative flex aspect-square w-full max-w-md flex-col justify-between overflow-hidden rounded-3xl border border-gold/30 bg-gradient-to-br from-charcoal-card via-charcoal-hover to-charcoal-deep p-5 shadow-2xl sm:p-6">
              <div className="pointer-events-none absolute right-0 top-0 h-40 w-40 bg-gold/15 blur-3xl" />

              <div className="z-10 flex items-center justify-between gap-2">
                <span className="flex items-center gap-1.5 rounded-full border border-emerald-500/40 bg-emerald-500/20 px-3 py-1 text-sm font-bold text-emerald-400">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  Chính hãng
                </span>
                <span className="rounded-full border border-gold/20 bg-gold/10 px-2.5 py-1 text-sm font-semibold text-gold-light">
                  Nổi bật
                </span>
              </div>

              <div className="relative z-10 mx-auto my-3 w-full max-w-[16rem] flex-1">
                <ProductImage
                  src={hero?.imageUrl}
                  alt={hero?.name ?? 'Sản phẩm nổi bật'}
                  brandName={hero?.brandName}
                  loading="eager"
                  className="h-full rounded-2xl bg-transparent"
                  imgClassName="drop-shadow-[0_20px_30px_rgba(0,0,0,0.8)]"
                />
              </div>

              <div className="z-10 flex items-center justify-between gap-3 rounded-2xl border border-charcoal-border/80 bg-charcoal-deep/80 p-4 backdrop-blur-md">
                <div className="min-w-0">
                  {hero?.brandName && (
                    <p className="truncate text-sm font-bold uppercase tracking-wider text-gold">{hero.brandName}</p>
                  )}
                  <p className="truncate text-sm font-bold text-ivory">{hero?.name ?? 'Whey Protein chính hãng'}</p>
                  {hero?.detail && <p className="truncate text-sm text-slate-subtle">{hero.detail}</p>}
                </div>
                <Link
                  href={hero ? `/products/${hero.slug}` : '/products'}
                  className="flex min-h-[44px] shrink-0 items-center rounded-lg bg-gold px-4 text-sm font-bold text-charcoal shadow-glow transition hover:bg-gold-light focus:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-charcoal-deep"
                >
                  Xem ngay
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
