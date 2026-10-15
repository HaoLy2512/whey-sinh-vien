import React from 'react';
import Link from 'next/link';
import { Dumbbell, Flame, Zap, Shield, HeartPulse, Sparkles, ArrowRight } from 'lucide-react';

interface CategoryItem {
  name: string;
  slug: string;
  description: string;
  count: string;
  icon: any;
}

const CATEGORIES: CategoryItem[] = [
  {
    name: 'Whey Protein',
    slug: 'whey-protein',
    description: 'Whey Isolate & Hydrolyzed siêu tinh khiết phát triển cơ bắp',
    count: '24+ dòng',
    icon: Dumbbell,
  },
  {
    name: 'Mass Gainer',
    slug: 'mass-gainer',
    description: 'Sữa tăng cân nhanh giàu calories cho tạng người gầy khó lên cân',
    count: '15+ dòng',
    icon: Flame,
  },
  {
    name: 'Creatine Monohydrate',
    slug: 'creatine',
    description: 'Bùng nổ sức mạnh, tăng thể tích tế bào cơ và phục hồi ATP',
    count: '10+ dòng',
    icon: Zap,
  },
  {
    name: 'Pre-Workout',
    slug: 'pre-workout',
    description: 'Tăng tỉnh táo tối đa, pump cơ căng tròn và tập trung cao độ',
    count: '18+ dòng',
    icon: Sparkles,
  },
  {
    name: 'BCAA & Amino Acids',
    slug: 'bcaa-amino-acids',
    description: 'Chống dị hóa cơ bắp trong buổi tập và giảm đau mỏi thần tốc',
    count: '12+ dòng',
    icon: Shield,
  },
  {
    name: 'Omega-3 & Vitamin',
    slug: 'omega-3',
    description: 'Vi chất thiết yếu bôi trơn khớp xương và bảo vệ hệ tim mạch',
    count: '20+ dòng',
    icon: HeartPulse,
  },
];

export default function FeaturedCategories() {
  return (
    <section className="py-16 bg-charcoal border-b border-charcoal-border/50">
      <div className="max-w-7xl mx-auto px-4 lg:px-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-10">
          <div>
            <span className="text-gold font-bold text-xs uppercase tracking-widest">Danh Mục Chuyên Biệt</span>
            <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-ivory mt-1">
              HỆ SINH THÁI SẢN PHẨM TOÀN DIỆN
            </h2>
          </div>
          <Link
            href="/products"
            className="text-xs font-bold text-gold-light hover:text-gold flex items-center gap-1.5 transition"
          >
            <span>Xem tất cả danh mục</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            return (
              <Link
                key={cat.slug}
                href={`/products?category=${cat.slug}`}
                className="group card-luxury p-6 flex flex-col justify-between hover:border-gold/50 transition relative overflow-hidden"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-gold/10 text-gold flex items-center justify-center border border-gold/20 group-hover:bg-gold group-hover:text-charcoal transition-colors duration-300">
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-semibold text-slate-DEFAULT bg-charcoal-deep px-2.5 py-1 rounded-full border border-charcoal-border/60">
                    {cat.count}
                  </span>
                </div>

                <div>
                  <h3 className="font-display font-bold text-lg text-ivory group-hover:text-gold transition">
                    {cat.name}
                  </h3>
                  <p className="text-xs text-slate-subtle mt-1.5 leading-relaxed">
                    {cat.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-charcoal-border/40 flex items-center text-xs font-bold text-gold-light group-hover:text-gold gap-1">
                  <span>Khám phá ngay</span>
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}

