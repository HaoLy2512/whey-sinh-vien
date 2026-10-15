'use client';

import React, { useState, useEffect } from 'react';
import ProductCard, { ProductCardProps } from '@/components/products/ProductCard';
import { Target, Dumbbell, ShieldAlert, Zap, HeartPulse } from 'lucide-react';

const GOALS = [
  { id: 'Muscle Building', label: 'Tăng Cơ Bắp', icon: Dumbbell, desc: 'Tối ưu hóa tổng hợp protein cơ bắp' },
  { id: 'Performance', label: 'Sức Mạnh & Bùng Nổ', icon: Zap, desc: 'Gia tăng sức mạnh nâng tạ & năng lượng' },
  { id: 'Recovery', label: 'Phục Hồi Sâu', icon: ShieldAlert, desc: 'Giảm đau mỏi và ngăn ngừa dị hóa cơ' },
  { id: 'General Nutrition', label: 'Sức Khỏe Khớp & Tim', icon: HeartPulse, desc: 'Bảo vệ tim mạch, khớp xương bền bỉ' },
];

export default function GoalCollectionsSection() {
  const [selectedGoal, setSelectedGoal] = useState('Muscle Building');
  const [products, setProducts] = useState<ProductCardProps[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/products?goal=${encodeURIComponent(selectedGoal)}&limit=4`)
      .then((res) => res.json())
      .then((data) => {
        if (data.products) setProducts(data.products);
      })
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  }, [selectedGoal]);

  return (
    <section className="py-16 bg-charcoal border-b border-charcoal-border/50">
      <div className="max-w-7xl mx-auto px-4 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-1.5 text-gold text-xs font-bold uppercase tracking-widest mb-1">
            <Target className="w-3.5 h-3.5" />
            <span>Định Hướng Mục Tiêu</span>
          </div>
          <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-ivory">
            BỘ SƯU TẬP THEO MỤC TIÊU TẬP LUYỆN
          </h2>
          <p className="text-xs text-slate-subtle mt-2">
            Chọn mục tiêu thể hình của bạn để tìm combo dinh dưỡng bổ sung chính xác và hiệu quả nhất
          </p>
        </div>

        {/* Goal Tabs */}
        <div className="flex items-center justify-center gap-2 sm:gap-3 flex-wrap mb-10">
          {GOALS.map((g) => {
            const Icon = g.icon;
            const isSelected = selectedGoal === g.id;
            return (
              <button
                key={g.id}
                onClick={() => setSelectedGoal(g.id)}
                className={`flex items-center gap-2 px-5 py-3 rounded-xl text-xs sm:text-sm font-bold transition ${
                  isSelected
                    ? 'bg-gradient-to-r from-gold to-gold-dark text-charcoal shadow-glow'
                    : 'bg-charcoal-card border border-charcoal-border text-slate-subtle hover:text-ivory hover:border-gold/40'
                }`}
              >
                <Icon className={`w-4 h-4 ${isSelected ? 'text-charcoal' : 'text-gold'}`} />
                <span>{g.label}</span>
              </button>
            );
          })}
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-96 rounded-xl bg-charcoal-card animate-pulse border border-charcoal-border/50" />
            ))}
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((p) => (
              <ProductCard key={p.id} {...p} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-slate-DEFAULT text-sm">
            Hiện chưa có sản phẩm nào cho mục tiêu này.
          </div>
        )}
      </div>
    </section>
  );
}

