'use client';

import React, { useEffect, useState } from 'react';
import ProductCard, { ProductCardProps } from '@/components/products/ProductCard';
import { Target, Dumbbell, ShieldAlert, Zap, HeartPulse } from 'lucide-react';
import { GOAL_LABELS } from '@/config/home';
import { useHomeDedupe } from '@/components/home/HomeDedupeContext';

const GOALS = [
  { id: 'Muscle Building', icon: Dumbbell, desc: 'Tối ưu tổng hợp protein cơ bắp' },
  { id: 'Performance', icon: Zap, desc: 'Tăng sức mạnh nâng tạ & năng lượng' },
  { id: 'Recovery', icon: ShieldAlert, desc: 'Giảm đau mỏi, hỗ trợ phục hồi' },
  { id: 'General Nutrition', icon: HeartPulse, desc: 'Bổ sung dinh dưỡng hằng ngày' },
];

/** Tiêu chí: từng tab mục tiêu (Product.goal). Loại sản phẩm đã có ở Hero + Best Sellers. */
export default function GoalCollectionsSection() {
  const { baseExcludeIds, setGoalIds } = useHomeDedupe();
  const [selectedGoal, setSelectedGoal] = useState(GOALS[0].id);
  const [products, setProducts] = useState<ProductCardProps[]>([]);
  const [loading, setLoading] = useState(true);

  const excludeKey = baseExcludeIds.join(',');

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setGoalIds(null);

    const params = new URLSearchParams({ goal: selectedGoal, limit: '4', backfill: 'true' });
    if (excludeKey) params.set('excludeIds', excludeKey);

    fetch(`/api/products?${params.toString()}`, { signal: controller.signal })
      .then((res) => res.json())
      .then((data: { products?: ProductCardProps[] }) => {
        const list = data.products ?? [];
        setProducts(list);
        setGoalIds(list.map((p) => p.id));
      })
      .catch((e: unknown) => {
        if ((e as { name?: string })?.name === 'AbortError') return;
        setProducts([]);
        setGoalIds([]);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [selectedGoal, excludeKey, setGoalIds]);

  const current = GOALS.find((g) => g.id === selectedGoal) ?? GOALS[0];

  return (
    <section className="border-b border-charcoal-border/50 bg-charcoal py-12 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <div className="mx-auto mb-10 max-w-2xl text-center">
          <div className="mb-1 inline-flex items-center gap-1.5 text-sm font-bold uppercase tracking-widest text-gold">
            <Target className="h-3.5 w-3.5" />
            <span>Theo mục tiêu</span>
          </div>
          <h2 className="font-display text-2xl font-extrabold text-ivory sm:text-3xl">
            CHỌN THEO MỤC TIÊU TẬP LUYỆN
          </h2>
          <p className="mt-2 text-sm text-slate-subtle">{current.desc}</p>
        </div>

        <div role="tablist" aria-label="Mục tiêu tập luyện" className="mb-10 flex flex-wrap items-center justify-center gap-2 sm:gap-3">
          {GOALS.map((g) => {
            const Icon = g.icon;
            const isSelected = selectedGoal === g.id;
            return (
              <button
                key={g.id}
                type="button"
                role="tab"
                aria-selected={isSelected}
                onClick={() => setSelectedGoal(g.id)}
                className={`flex min-h-[44px] items-center gap-2 rounded-xl px-5 py-3 text-sm font-bold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-charcoal ${
                  isSelected
                    ? 'bg-gradient-to-r from-gold to-gold-dark text-charcoal shadow-glow'
                    : 'border border-charcoal-border bg-charcoal-card text-slate-subtle hover:border-gold/40 hover:text-ivory'
                }`}
              >
                <Icon className={`h-4 w-4 ${isSelected ? 'text-charcoal' : 'text-gold'}`} />
                <span>{GOAL_LABELS[g.id]}</span>
              </button>
            );
          })}
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
          <div className="py-12 text-center text-sm text-slate-subtle">Hiện chưa có sản phẩm cho mục tiêu này.</div>
        )}
      </div>
    </section>
  );
}
