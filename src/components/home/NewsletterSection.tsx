'use client';

import React, { useState } from 'react';
import { Mail, Check, Sparkles } from 'lucide-react';

export default function NewsletterSection() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubmitted(true);
      setTimeout(() => {
        setEmail('');
        setSubmitted(false);
      }, 4000);
    }
  };

  return (
    <section className="py-16 bg-charcoal border-b border-charcoal-border/50 relative overflow-hidden">
      <div className="max-w-4xl mx-auto px-4 lg:px-8 text-center relative z-10">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gold/10 border border-gold/30 text-gold-light text-xs font-bold uppercase tracking-wider mb-4">
          <Sparkles className="w-3.5 h-3.5 text-gold" />
          <span>VITACORE VIP ATHLETE CLUB</span>
        </div>

        <h2 className="font-display font-black text-2xl sm:text-4xl text-ivory mb-3">
          NHẬN VOUCHER <span className="gold-gradient-text">100.000₫</span> CHO ĐƠN HÀNG ĐẦU TIÊN
        </h2>

        <p className="text-slate-subtle text-xs sm:text-sm max-w-xl mx-auto mb-8">
          Đăng ký để nhận sớm các chương trình Flash Sale, mã giảm giá độc quyền và bài phân tích dinh dưỡng chuyên sâu từ chuyên gia.
        </p>

        {submitted ? (
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-semibold text-sm inline-flex items-center gap-2 max-w-md mx-auto">
            <Check className="w-5 h-5" />
            <span>Cảm ơn bạn! Mã voucher 100K đã được gửi đến email của bạn.</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row items-center gap-3 max-w-md mx-auto">
            <div className="relative w-full">
              <input
                type="email"
                required
                placeholder="Nhập địa chỉ email của bạn..."
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-charcoal-card border border-charcoal-border rounded-xl py-3.5 pl-4 pr-10 text-sm text-ivory placeholder-slate-DEFAULT focus:outline-none focus:border-gold"
              />
              <Mail className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-DEFAULT" />
            </div>

            <button
              type="submit"
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl font-display font-extrabold text-xs uppercase tracking-wider bg-gold hover:bg-gold-light text-charcoal transition shadow-glow flex-shrink-0"
            >
              Đăng ký ngay
            </button>
          </form>
        )}

        <p className="text-[11px] text-slate-DEFAULT mt-3">
          Cam kết bảo mật thông tin. Bạn có thể hủy nhận tin bất kỳ lúc nào chỉ với 1 cú click.
        </p>
      </div>
    </section>
  );
}

