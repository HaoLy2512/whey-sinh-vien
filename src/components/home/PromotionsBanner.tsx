import React from 'react';
import { TicketPercent } from 'lucide-react';
import CopyCodeButton from '@/components/ui/CopyCodeButton';
import { PROMO, formatMoneyShort, getPromoTitle } from '@/config/promo';

export default function PromotionsBanner() {
  const { percentVoucher, firstOrderVoucher, freeShip } = PROMO;

  return (
    <section className="relative overflow-hidden border-b border-charcoal-border/50 bg-gradient-to-r from-charcoal-deep via-charcoal-card to-charcoal-deep py-12 sm:py-16">
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[300px] w-[800px] max-w-full -translate-x-1/2 -translate-y-1/2 bg-gold/10 blur-[140px]" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 lg:px-8">
        <div className="mx-auto mb-10 max-w-2xl text-center">
          <div className="mb-1 inline-flex items-center gap-1.5 text-sm font-bold uppercase tracking-widest text-gold">
            <TicketPercent className="h-4 w-4" />
            {/* Tháng lấy theo ngày hiện tại (giờ Việt Nam), không hardcode */}
            <span>{getPromoTitle()}</span>
          </div>
          <h2 className="font-display text-2xl font-extrabold text-ivory sm:text-3xl">MÃ GIẢM GIÁ DÀNH CHO BẠN</h2>
          <p className="mt-2 text-sm text-slate-subtle">
            Sao chép mã và nhập ở bước thanh toán. Miễn phí vận chuyển cho đơn từ {formatMoneyShort(freeShip.threshold)}.
          </p>
        </div>

        <div className="mx-auto grid max-w-4xl grid-cols-1 gap-6 md:grid-cols-2">
          <div className="card-luxury relative flex flex-col items-center justify-between gap-5 border-gold/40 p-6 sm:flex-row">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-gold to-gold-dark text-xl font-black text-charcoal shadow-glow">
                {percentVoucher.percent}%
              </div>
              <div>
                <span className="text-sm font-bold uppercase tracking-wider text-gold-light">
                  Đơn từ {formatMoneyShort(percentVoucher.minOrder)}
                </span>
                <h3 className="font-display text-base font-bold text-ivory">
                  GIẢM {percentVoucher.percent}% TỐI ĐA {formatMoneyShort(percentVoucher.maxDiscount)}
                </h3>
              </div>
            </div>
            <CopyCodeButton code={percentVoucher.code} />
          </div>

          <div className="card-luxury relative flex flex-col items-center justify-between gap-5 border-gold/40 p-6 sm:flex-row">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-gold to-gold-dark text-lg font-black text-charcoal shadow-glow">
                {firstOrderVoucher.amount / 1000}K
              </div>
              <div>
                <span className="text-sm font-bold uppercase tracking-wider text-gold-light">Đơn hàng đầu tiên</span>
                <h3 className="font-display text-base font-bold text-ivory">
                  GIẢM NGAY {formatMoneyShort(firstOrderVoucher.amount)}
                </h3>
              </div>
            </div>
            <CopyCodeButton code={firstOrderVoucher.code} />
          </div>
        </div>
      </div>
    </section>
  );
}
