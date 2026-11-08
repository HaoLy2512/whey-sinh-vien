'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ShieldCheck, ArrowRight, Flame } from 'lucide-react';

type HeroProduct = {
  name: string;
  slug: string;
  brandName: string;
  imageUrl: string;
  detail: string;
};

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1579722821273-0f6c7d44362f?auto=format&fit=crop&w=800&q=80';

const DEFAULT_HERO: HeroProduct = {
  name: 'Gold Standard 100% Whey',
  slug: 'on-gold-standard-100-whey',
  brandName: 'Optimum Nutrition',
  imageUrl: FALLBACK_IMAGE,
  detail: '24g Protein • 5.5g BCAA',
};

export default function HeroSection() {
  const [hero, setHero] = useState<HeroProduct>(DEFAULT_HERO);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    fetch('/api/hero', { cache: 'no-store' })
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return;
        if (data?.hero) {
          setHero({
            name: data.hero.name || DEFAULT_HERO.name,
            slug: data.hero.slug || DEFAULT_HERO.slug,
            brandName: data.hero.brandName || '',
            imageUrl: data.hero.imageUrl || FALLBACK_IMAGE,
            detail: data.hero.detail || '',
          });
        }
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setReady(true);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-charcoal-deep via-charcoal to-charcoal-deep py-16 lg:py-24 border-b border-charcoal-border/50">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gold/10 blur-[130px] rounded-full pointer-events-none" />
      <div className="absolute top-10 right-10 w-72 h-72 bg-emerald-500/10 blur-[100px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 flex flex-col items-start">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gold/10 border border-gold/30 text-gold-light text-xs font-bold tracking-wide uppercase mb-6 backdrop-blur-sm">
              <Flame className="w-4 h-4 text-gold fill-current animate-pulse" />
              <span>Tiêu chuẩn dinh dưỡng thể thao đỉnh cao 2026</span>
            </div>

            <h1 className="font-display font-black text-3xl sm:text-5xl lg:text-6xl text-ivory leading-tight tracking-tight mb-6">
              BỨT PHÁ GIỚI HẠN <br />
              <span className="gold-gradient-text">THỂ CHẤT ĐỈNH CAO</span>
            </h1>

            <p className="text-slate-subtle text-base sm:text-lg leading-relaxed max-w-2xl mb-8">
              Hệ sinh thái thực phẩm bổ sung chuẩn quốc tế dành riêng cho vận động viên và gymer chuyên nghiệp. Cam kết 100% nhập khẩu chính hãng từ Hoa Kỳ & Châu Âu, đầy đủ tem chống giả và kiểm định chất lượng nghiêm ngặt.
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full sm:w-auto mb-10">
              <Link
                href="/products"
                className="px-8 py-4 rounded-xl font-display font-extrabold text-sm uppercase tracking-wider bg-gradient-to-r from-gold to-gold-dark text-charcoal hover:brightness-110 shadow-glow flex items-center justify-center gap-2 transition"
              >
                <span>Khám phá sản phẩm</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/products?featured=true"
                className="px-8 py-4 rounded-xl font-display font-bold text-sm uppercase tracking-wider bg-charcoal-card border border-gold/40 text-ivory hover:text-gold hover:border-gold transition flex items-center justify-center gap-2"
              >
                <span>Top bán chạy</span>
              </Link>
            </div>

            <div className="grid grid-cols-3 gap-6 pt-6 border-t border-charcoal-border/80 w-full max-w-lg">
              <div>
                <span className="font-display font-black text-2xl sm:text-3xl text-gold">100%</span>
                <p className="text-xs text-slate-DEFAULT mt-1">Chính hãng nhập khẩu</p>
              </div>
              <div>
                <span className="font-display font-black text-2xl sm:text-3xl text-ivory">50K+</span>
                <p className="text-xs text-slate-DEFAULT mt-1">Gymer tin dùng</p>
              </div>
              <div>
                <span className="font-display font-black text-2xl sm:text-3xl text-emerald-400">2H</span>
                <p className="text-xs text-slate-DEFAULT mt-1">Giao hỏa tốc nội thành</p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 relative flex items-center justify-center">
            <div className="relative w-full max-w-md aspect-square rounded-3xl bg-gradient-to-br from-charcoal-card via-charcoal-hover to-charcoal-deep p-6 border border-gold/30 shadow-2xl flex flex-col justify-between overflow-hidden">
              <div className="absolute top-0 right-0 w-40 h-40 bg-gold/15 blur-3xl pointer-events-none" />

              <div className="flex items-center justify-between z-10">
                <span className="px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Authentic 100%
                </span>
                <span className="text-xs font-semibold text-gold-light bg-gold/10 px-2.5 py-1 rounded-full border border-gold/20">
                  Best Seller
                </span>
              </div>

              <div
                className={`relative my-4 flex items-center justify-center group transition-opacity duration-500 ${
                  ready ? 'opacity-100' : 'opacity-0'
                }`}
              >
                <img
                  src={hero.imageUrl}
                  alt={hero.name}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = FALLBACK_IMAGE;
                  }}
                  className="w-64 h-64 object-contain filter drop-shadow-[0_20px_30px_rgba(0,0,0,0.8)] transform group-hover:scale-105 group-hover:rotate-1 transition-all duration-700 ease-out"
                />
              </div>

              <div
                className={`bg-charcoal-deep/80 backdrop-blur-md p-4 rounded-2xl border border-charcoal-border/80 z-10 flex items-center justify-between gap-3 transition-opacity duration-500 ${
                  ready ? 'opacity-100' : 'opacity-0'
                }`}
              >
                <div className="min-w-0">
                  {hero.brandName && (
                    <p className="text-xs text-gold font-bold uppercase tracking-wider truncate">
                      {hero.brandName}
                    </p>
                  )}
                  <p className="text-sm font-bold text-ivory truncate">{hero.name}</p>
                  {hero.detail && <p className="text-xs text-slate-DEFAULT truncate">{hero.detail}</p>}
                </div>
                <Link
                  href={`/products/${hero.slug}`}
                  className="px-3.5 py-2 rounded-lg bg-gold text-charcoal font-bold text-xs hover:bg-gold-light transition shadow-glow shrink-0"
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