import React from 'react';
import { ShieldCheck, Truck, Microscope, Headphones } from 'lucide-react';
import { PROMO, formatMoneyShort } from '@/config/promo';

/** Gộp "Vì sao nên mua ở đây" và dải 4 cam kết (trước đây nằm ở footer) thành MỘT section. */
const REASONS = [
  {
    icon: ShieldCheck,
    title: '100% chính hãng',
    description: 'Có tem chống giả, tem phụ tiếng Việt và hóa đơn VAT theo yêu cầu.',
  },
  {
    icon: Microscope,
    title: 'Minh bạch thành phần & hạn dùng',
    description: 'Hàm lượng theo nhãn công bố, kiểm soát số lô và ngày sản xuất, ưu tiên date xa.',
  },
  {
    icon: Truck,
    title: 'Giao nhanh, miễn phí từ ' + formatMoneyShort(PROMO.freeShip.threshold),
    description: `Giao ${PROMO.delivery.expressTime} ${PROMO.delivery.expressAreas}; tỉnh khác ${PROMO.delivery.standardTime}.`,
  },
  {
    icon: Headphones,
    title: `Đổi trả ${PROMO.returnDays} ngày & tư vấn`,
    description: 'Đổi hoặc hoàn tiền nếu sản phẩm sai mô tả. Có hỗ trợ chọn sản phẩm theo mục tiêu.',
  },
];

export default function WhyChooseUsSection() {
  return (
    <section className="border-b border-charcoal-border/50 bg-charcoal-deep py-12 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <div className="mx-auto mb-10 max-w-2xl text-center">
          <span className="text-sm font-bold uppercase tracking-widest text-gold">Cam kết của chúng tôi</span>
          <h2 className="mt-1 font-display text-2xl font-extrabold text-ivory sm:text-3xl">VÌ SAO NÊN MUA Ở ĐÂY?</h2>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {REASONS.map((r) => {
            const Icon = r.icon;
            return (
              <div
                key={r.title}
                className="card-luxury flex flex-col items-start border-charcoal-border/80 p-6 transition hover:border-gold/40"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl border border-gold/30 bg-gold/10 text-gold">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="mb-2 font-display text-base font-bold text-ivory">{r.title}</h3>
                <p className="text-sm leading-relaxed text-slate-subtle">{r.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
