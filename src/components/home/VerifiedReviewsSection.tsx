'use client';

import React, { useEffect, useState } from 'react';
import { Star, CheckCircle, Quote } from 'lucide-react';

interface ReviewItem {
  id: string;
  rating: number;
  title: string | null;
  comment: string;
  verifiedPurchase: boolean;
  createdAt: string;
  user: { fullName: string };
  product: { name: string; slug: string };
}

export default function VerifiedReviewsSection() {
  const [reviews, setReviews] = useState<ReviewItem[]>([]);

  useEffect(() => {
    fetch('/api/reviews')
      .then((res) => res.json())
      .then((data) => {
        if (data.reviews) setReviews(data.reviews.slice(0, 3));
      })
      .catch(() => {});
  }, []);

  if (reviews.length === 0) return null;

  return (
    <section className="py-16 bg-charcoal border-b border-charcoal-border/50">
      <div className="max-w-7xl mx-auto px-4 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-gold font-bold text-xs uppercase tracking-widest">Đánh Giá Thực Tế</span>
          <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-ivory mt-1">
            TRẢI NGHIỆM TỪ KHÁCH HÀNG THỰC TẾ
          </h2>
          <p className="text-xs text-slate-subtle mt-2">
            100% đánh giá được gửi từ khách hàng đã mua và xác thực đơn hàng thành công
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {reviews.map((rev) => (
            <div key={rev.id} className="card-luxury p-6 flex flex-col justify-between border-charcoal-border/80 relative">
              <Quote className="absolute top-4 right-4 w-8 h-8 text-charcoal-border/40 pointer-events-none" />

              <div>
                {/* Rating stars */}
                <div className="flex items-center gap-1 text-amber-400 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${i < rev.rating ? 'fill-current' : 'text-zinc-700'}`}
                    />
                  ))}
                </div>

                {rev.title && (
                  <h4 className="font-bold text-sm text-ivory mb-2">
                    {rev.title}
                  </h4>
                )}

                <p className="text-xs text-slate-subtle leading-relaxed italic">
                  "{rev.comment}"
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-charcoal-border/60 flex items-center justify-between">
                <div>
                  <p className="font-bold text-xs text-ivory">{rev.user.fullName}</p>
                  <p className="text-[10px] text-gold-light truncate max-w-[180px]">{rev.product.name}</p>
                </div>

                {rev.verifiedPurchase && (
                  <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/30">
                    <CheckCircle className="w-3 h-3" />
                    Đã mua hàng
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

