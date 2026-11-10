import React from 'react';
import { Star, Quote } from 'lucide-react';
import { testimonials, TESTIMONIALS_ARE_ILLUSTRATIVE } from '@/data/testimonials';

export default function VerifiedReviewsSection() {
  return (
    <section className="border-b border-charcoal-border/50 bg-charcoal py-12 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <div className="mx-auto mb-10 max-w-2xl text-center">
          <span className="text-sm font-bold uppercase tracking-widest text-gold">Khách hàng nói gì</span>
          <h2 className="mt-1 font-display text-2xl font-extrabold text-ivory sm:text-3xl">TRẢI NGHIỆM TỪ NGƯỜI DÙNG</h2>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {testimonials.map((t) => (
            <figure key={t.id} className="card-luxury relative flex flex-col justify-between border-charcoal-border/80 p-6">
              <Quote className="pointer-events-none absolute right-4 top-4 h-8 w-8 text-charcoal-border/60" />

              <div>
                <div className="mb-3 flex items-center gap-1 text-amber-400" aria-label={`${t.rating} trên 5 sao`}>
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`h-4 w-4 ${i < t.rating ? 'fill-current' : 'text-zinc-700'}`} />
                  ))}
                </div>
                <blockquote className="text-sm leading-relaxed text-ivory-muted">“{t.quote}”</blockquote>
              </div>

              <figcaption className="mt-6 border-t border-charcoal-border/60 pt-4">
                <p className="text-sm font-bold text-ivory">
                  {t.name} <span className="font-normal text-slate-subtle">· {t.city}</span>
                </p>
                <p className="truncate text-sm text-gold-light">{t.product}</p>
              </figcaption>
            </figure>
          ))}
        </div>

        {TESTIMONIALS_ARE_ILLUSTRATIVE && (
          <p className="mt-6 text-center text-sm text-slate-subtle">Đánh giá minh họa</p>
        )}
      </div>
    </section>
  );
}
