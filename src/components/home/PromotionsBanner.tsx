'use client';

import React, { useState } from 'react';
import { Tag, Copy, Check, TicketPercent } from 'lucide-react';

export default function PromotionsBanner() {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <section className="py-16 bg-gradient-to-r from-charcoal-deep via-charcoal-card to-charcoal-deep border-b border-charcoal-border/50 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[300px] bg-gold/10 blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 lg:px-8 relative z-10">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-1.5 text-gold text-xs font-bold uppercase tracking-widest mb-1">
            <TicketPercent className="w-4 h-4" />
            <span>Ưu Đãi Đặc Quyền Tháng 10</span>
          </div>
          <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-ivory">
            MÃ GIẢM GIÁ & COMBO TIẾT KIỆM
          </h2>
          <p className="text-xs text-slate-subtle mt-2">
            Sao chép mã voucher và nhập tại bước thanh toán để nhận ngay chiết khấu trực tiếp
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {/* Coupon 1 */}
          <div className="card-luxury p-6 border-gold/40 flex flex-col sm:flex-row items-center justify-between gap-6 relative">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-gold to-gold-dark text-charcoal flex items-center justify-center font-black text-xl flex-shrink-0 shadow-glow">
                10%
              </div>
              <div>
                <span className="text-xs font-bold text-gold-light uppercase tracking-wider">Đơn từ 1.000.000₫</span>
                <h3 className="font-display font-bold text-base text-ivory">GIẢM 10% TỐI ĐA 150.000₫</h3>
                <p className="text-xs text-slate-DEFAULT mt-0.5">Áp dụng cho tất cả dòng Whey Protein & Mass</p>
              </div>
            </div>

            <button
              onClick={() => handleCopy('VITACORE10')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-charcoal-deep border border-gold/40 hover:border-gold text-gold font-mono font-bold text-sm transition hover:bg-gold hover:text-charcoal flex-shrink-0 w-full sm:w-auto justify-center"
            >
              {copiedCode === 'VITACORE10' ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span className="text-emerald-400">Đã sao chép</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>VITACORE10</span>
                </>
              )}
            </button>
          </div>

          {/* Coupon 2 */}
          <div className="card-luxury p-6 border-emerald-500/40 flex flex-col sm:flex-row items-center justify-between gap-6 relative">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 text-white flex items-center justify-center font-black text-lg flex-shrink-0">
                50K
              </div>
              <div>
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Đơn từ 500.000₫</span>
                <h3 className="font-display font-bold text-base text-ivory">GIẢM NGAY 50.000₫</h3>
                <p className="text-xs text-slate-DEFAULT mt-0.5">Áp dụng cho Creatine, Pre-workout, Vitamin</p>
              </div>
            </div>

            <button
              onClick={() => handleCopy('SUPP50K')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-charcoal-deep border border-emerald-500/40 hover:border-emerald-500 text-emerald-400 font-mono font-bold text-sm transition hover:bg-emerald-500 hover:text-white flex-shrink-0 w-full sm:w-auto justify-center"
            >
              {copiedCode === 'SUPP50K' ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Đã sao chép</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>SUPP50K</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

