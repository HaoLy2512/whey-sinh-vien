'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Wallet } from 'lucide-react';
import ProductCard, { ProductCardProps } from '@/components/products/ProductCard';
import { BUDGET_SLIDER } from '@/config/home';
import { formatMoneyShort } from '@/config/promo';
import { useHomeDedupe } from '@/components/home/HomeDedupeContext';

/**
 * Tiêu chí: giá hiện bán <= giá trên thanh trượt (lọc thật ở API, có debounce).
 * Loại sản phẩm đã có ở Hero, Best Sellers và section Theo mục tiêu.
 */
export default function BudgetSection() {
  const { baseExcludeIds, goalIds } = useHomeDedupe();
  const [budget, setBudget] = useState<number>(BUDGET_SLIDER.default);
  const [debouncedBudget, setDebouncedBudget] = useState<number>(BUDGET_SLIDER.default);
  const [products, setProducts] = useState<ProductCardProps[]>([]);
  const [total, setTotal] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  // Debounce: chỉ gọi API sau khi người dùng ngừng kéo
  useEffect(() => {
    const t = setTimeout(() => setDebouncedBudget(budget), BUDGET_SLIDER.debounceMs);
    return () => clearTimeout(t);
  }, [budget]);

  const goalReady = goalIds !== null;
  const excludeKey = [...baseExcludeIds, ...(goalIds ?? [])].join(',');

  useEffect(() => {
    if (!goalReady) return; // chờ section Theo mục tiêu tải xong để loại trùng
    const controller = new AbortController();
    setLoading(true);

    const params = new URLSearchParams({
      maxPrice: String(debouncedBudget),
      sort: 'price_desc',
      limit: '4',
      backfill: 'true',
    });
    if (excludeKey) params.set('excludeIds', excludeKey);

    fetch(`/api/products?${params.toString()}`, { signal: controller.signal })
      .then((res) => res.json())
      .then((data: { products?: ProductCardProps[]; pagination?: { total?: number } }) => {
        setProducts(data.products ?? []);
        setTotal(data.pagination?.total ?? null);
      })
      .catch((e: unknown) => {
        if ((e as { name?: string })?.name === 'AbortError') return;
        setProducts([]);
        setTotal(null);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [debouncedBudget, excludeKey, goalReady]);

  const percent = ((budget - BUDGET_SLIDER.min) / (BUDGET_SLIDER.max - BUDGET_SLIDER.min)) * 100;

  return (
    <section className="border-b border-charcoal-border/50 bg-charcoal-deep py-12 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <div className="mx-auto mb-8 max-w-2xl text-center">
          <div className="mb-1 inline-flex items-center gap-1.5 text-sm font-bold uppercase tracking-widest text-gold">
            <Wallet className="h-3.5 w-3.5" />
            <span>Theo ngân sách</span>
          </div>
          <h2 className="font-display text-2xl font-extrabold text-ivory sm:text-3xl">
            Ngân sách của bạn là bao nhiêu?
          </h2>
          <p className="mt-2 text-sm text-slate-subtle">Kéo thanh trượt để xem sản phẩm phù hợp tầm giá.</p>
        </div>

        <div className="mx-auto mb-10 max-w-2xl rounded-2xl border border-charcoal-border bg-charcoal-card p-5 sm:p-6">
          <div className="mb-3 flex items-baseline justify-between gap-3">
            <label htmlFor="budget-range" className="text-sm font-semibold text-ivory-muted">
              Tôi muốn chi tối đa
            </label>
            <output htmlFor="budget-range" className="font-display text-2xl font-extrabold text-gold">
              {formatMoneyShort(budget)}
            </output>
          </div>

          <input
            id="budget-range"
            type="range"
            min={BUDGET_SLIDER.min}
            max={BUDGET_SLIDER.max}
            step={BUDGET_SLIDER.step}
            value={budget}
            onChange={(e) => setBudget(Number(e.target.value))}
            aria-valuetext={`Tối đa ${formatMoneyShort(budget)}`}
            className="h-11 w-full cursor-pointer appearance-none rounded-full bg-transparent accent-gold focus:outline-none focus-visible:ring-2 focus-visible:ring-gold"
            style={{
              background: `linear-gradient(to right, #C8A96A ${percent}%, #252B36 ${percent}%) center / 100% 6px no-repeat`,
            }}
          />
          <div className="mt-1 flex justify-between text-sm text-slate-subtle">
            <span>{formatMoneyShort(BUDGET_SLIDER.min)}</span>
            <span>{formatMoneyShort(BUDGET_SLIDER.max)}</span>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-96 animate-pulse rounded-xl border border-charcoal-border/50 bg-charcoal-card" />
            ))}
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {products.map((p) => (
              <ProductCard key={p.id} {...p} />
            ))}
          </div>
        ) : (
          <div className="py-10 text-center text-sm text-slate-subtle">
            Chưa có sản phẩm nào dưới {formatMoneyShort(debouncedBudget)}. Hãy thử kéo thanh trượt lên cao hơn.
          </div>
        )}

        <div className="mt-8 flex flex-col items-center gap-2">
          {!loading && total !== null && (
            <p className="text-sm text-slate-subtle" aria-live="polite">
              Có {total} sản phẩm dưới {formatMoneyShort(debouncedBudget)}
            </p>
          )}
          <Link
            href={`/products?maxPrice=${budget}&sort=price_desc`}
            className="inline-flex min-h-[44px] items-center gap-2 rounded-xl border border-gold/40 bg-charcoal-card px-6 py-3 text-sm font-bold text-gold-light transition hover:border-gold hover:text-gold focus:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-charcoal-deep"
          >
            <span>Xem tất cả sản phẩm dưới {formatMoneyShort(budget)}</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
