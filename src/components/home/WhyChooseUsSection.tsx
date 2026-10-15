import React from 'react';
import { ShieldCheck, Truck, Microscope, Award, FileText, CheckCircle2 } from 'lucide-react';

const REASONS = [
  {
    icon: ShieldCheck,
    title: '100% Nhập Khẩu Chính Hãng',
    description: 'Tất cả sản phẩm đều có tem chống giả, tem phụ tiếng Việt và hóa đơn VAT theo quy định pháp luật.',
  },
  {
    icon: Microscope,
    title: 'Minh Bạch Bảng Thành Phần',
    description: 'Cam kết chuẩn hàm lượng theo nhãn công bố. Không độn amino giả (Amino Spiking), không chất cấm WADA.',
  },
  {
    icon: FileText,
    title: 'Kiểm Soát Lô Hàng & Hạn Sử Dụng',
    description: 'Hệ thống quản lý số lô (Lot Number) và ngày sản xuất minh bạch, cam kết date xa từ 1.5 - 3 năm.',
  },
  {
    icon: Truck,
    title: 'Giao Hỏa Tốc & Bảo Quản Chuẩn Kho',
    description: 'Kho lạnh đạt chuẩn GSP giữ nhiệt độ dưới 25°C, đảm bảo bột whey và dầu cá không bị biến tính hay ẩm mốc.',
  },
];

export default function WhyChooseUsSection() {
  return (
    <section className="py-16 bg-charcoal border-b border-charcoal-border/50">
      <div className="max-w-7xl mx-auto px-4 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-gold font-bold text-xs uppercase tracking-widest">Tiêu Chuẩn Khắt Khe</span>
          <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-ivory mt-1">
            VÌ SAO VẬN ĐỘNG VIÊN CHỌN VITACORE?
          </h2>
          <p className="text-xs text-slate-subtle mt-2">
            Chúng tôi đặt sự an toàn cho sức khỏe và hiệu suất thể chất của khách hàng lên vị trí ưu tiên số 1
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {REASONS.map((r, idx) => {
            const Icon = r.icon;
            return (
              <div key={idx} className="card-luxury p-6 flex flex-col items-start border-charcoal-border/80 hover:border-gold/40 transition">
                <div className="w-12 h-12 rounded-xl bg-gold/10 text-gold flex items-center justify-center border border-gold/30 mb-4">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="font-display font-bold text-base text-ivory mb-2">
                  {r.title}
                </h3>
                <p className="text-xs text-slate-subtle leading-relaxed">
                  {r.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

