import React from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  Truck,
  RotateCcw,
  Headphones,
  MapPin,
  Phone,
  Mail,
  Award,
} from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-charcoal-deep border-t border-charcoal-border/80 text-slate-subtle text-sm pt-14 pb-8 print:hidden">
      {/* 4 Guarantees Banner */}
      <div className="max-w-7xl mx-auto px-4 lg:px-8 pb-12 mb-12 border-b border-charcoal-border/60">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="flex items-start gap-4 p-4 rounded-xl bg-charcoal-card/40 border border-charcoal-border/40">
            <div className="w-10 h-10 rounded-lg bg-gold/10 text-gold flex items-center justify-center flex-shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-ivory font-semibold text-sm">100% Chính Hãng</h4>
              <p className="text-xs text-slate-DEFAULT mt-1">Đầy đủ tem cào chống hàng giả, xuất hóa đơn VAT theo yêu cầu.</p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-4 rounded-xl bg-charcoal-card/40 border border-charcoal-border/40">
            <div className="w-10 h-10 rounded-lg bg-gold/10 text-gold flex items-center justify-center flex-shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-ivory font-semibold text-sm">Giao Hàng Siêu Tốc</h4>
              <p className="text-xs text-slate-DEFAULT mt-1">Giao hỏa tốc 2H nội thành HN/HCM. Miễn phí vận chuyển từ 1.000.000đ.</p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-4 rounded-xl bg-charcoal-card/40 border border-charcoal-border/40">
            <div className="w-10 h-10 rounded-lg bg-gold/10 text-gold flex items-center justify-center flex-shrink-0">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-ivory font-semibold text-sm">Đổi Trả 7 Ngày</h4>
              <p className="text-xs text-slate-DEFAULT mt-1">Cam kết hoàn tiền 200% nếu phát hiện sản phẩm không chuẩn nguồn gốc.</p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-4 rounded-xl bg-charcoal-card/40 border border-charcoal-border/40">
            <div className="w-10 h-10 rounded-lg bg-gold/10 text-gold flex items-center justify-center flex-shrink-0">
              <Headphones className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-ivory font-semibold text-sm">Tư Vấn Chuyên Sâu</h4>
              <p className="text-xs text-slate-DEFAULT mt-1">Đội ngũ huấn luyện viên & chuyên viên dinh dưỡng hỗ trợ 24/7.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 lg:px-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
        {/* Brand Info */}
        <div className="lg:col-span-2">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-gold to-charcoal-deep p-0.5">
              <div className="w-full h-full bg-charcoal rounded-[7px] flex items-center justify-center">
                <span className="font-display font-black text-gold text-base">V</span>
              </div>
            </div>
            <span className="font-display font-extrabold tracking-wider text-lg text-ivory">
              VITACORE SUPPLEMENTS
            </span>
          </div>
          <p className="text-xs text-slate-DEFAULT leading-relaxed mb-4 pr-4">
            Hệ thống phân phối thực phẩm bổ sung, dinh dưỡng thể thao cao cấp và phụ kiện tập gym hàng đầu Việt Nam. Tự hào đồng hành cùng vận động viên và gymer trên hành trình nâng tầm thể chất đỉnh cao.
          </p>
          <div className="flex flex-col gap-2 text-xs">
            <div className="flex items-start gap-2">
              <MapPin className="w-3.5 h-3.5 text-gold flex-shrink-0 mt-0.5" />
              <span>123 Võ Văn Tần, Phường 6, Quận 3, TP. Hồ Chí Minh</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="w-3.5 h-3.5 text-gold flex-shrink-0" />
              <span>Hotline: 1900 8899 - 0901 889 901</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="w-3.5 h-3.5 text-gold flex-shrink-0" />
              <span>Email: contact@vitacore.vn</span>
            </div>
          </div>
        </div>

        {/* Categories */}
        <div>
          <h4 className="text-ivory font-bold text-xs uppercase tracking-wider mb-4 border-l-2 border-gold pl-2">
            Danh Mục Nổi Bật
          </h4>
          <ul className="flex flex-col gap-2.5 text-xs">
            <li><Link href="/products?category=whey-protein" className="hover:text-gold transition">Whey Protein Tinh Khiết</Link></li>
            <li><Link href="/products?category=mass-gainer" className="hover:text-gold transition">Sữa Tăng Cân Nhanh Mass</Link></li>
            <li><Link href="/products?category=creatine" className="hover:text-gold transition">Creatine Tăng Sức Mạnh</Link></li>
            <li><Link href="/products?category=pre-workout" className="hover:text-gold transition">Pre-Workout Năng Lượng</Link></li>
            <li><Link href="/products?category=bcaa-amino-acids" className="hover:text-gold transition">BCAA & Phục Hồi Cơ</Link></li>
            <li><Link href="/products?category=omega-3" className="hover:text-gold transition">Dầu Cá Omega-3 Cao Cấp</Link></li>
          </ul>
        </div>

        {/* Customer Support */}
        <div>
          <h4 className="text-ivory font-bold text-xs uppercase tracking-wider mb-4 border-l-2 border-gold pl-2">
            Hỗ Trợ Khách Hàng
          </h4>
          <ul className="flex flex-col gap-2.5 text-xs">
            <li><Link href="/account/orders" className="hover:text-gold transition">Tra Cứu Đơn Hàng</Link></li>
            <li><Link href="/policies" className="hover:text-gold transition">Chính Sách Đổi Trả & Hoàn Tiền</Link></li>
            <li><Link href="/policies" className="hover:text-gold transition">Chính Sách Giao Hàng & Phí Ship</Link></li>
            <li><Link href="/policies" className="hover:text-gold transition">Bảo Mật Thông Tin Khách Hàng</Link></li>
            <li><Link href="/support" className="hover:text-gold transition">Gửi Yêu Cầu Hỗ Trợ 24/7</Link></li>
            <li><Link href="/blog" className="hover:text-gold transition">Cẩm Nang Dinh Dưỡng Thể Hình</Link></li>
          </ul>
        </div>

        {/* Payment Methods */}
        <div>
          <h4 className="text-ivory font-bold text-xs uppercase tracking-wider mb-4 border-l-2 border-gold pl-2">
            Phương Thức Thanh Toán
          </h4>
          <p className="text-xs text-slate-DEFAULT mb-3">
            Hỗ trợ đa dạng phương thức thanh toán an toàn, bảo mật cao:
          </p>
          <div className="grid grid-cols-2 gap-2 text-xs font-semibold text-ivory">
            <div className="p-2 bg-charcoal-card border border-charcoal-border rounded text-center">
              COD Tiền Mặt
            </div>
            <div className="p-2 bg-charcoal-card border border-charcoal-border rounded text-center text-gold-light">
              VietQR 24/7
            </div>
            <div className="p-2 bg-charcoal-card border border-charcoal-border rounded text-center text-pink-400">
              Ví MoMo
            </div>
            <div className="p-2 bg-charcoal-card border border-charcoal-border rounded text-center text-blue-400">
              VNPay QR
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-charcoal-border/50 flex items-center gap-2 text-emerald-400 text-xs">
            <Award className="w-4 h-4 text-emerald-400" />
            <span>Đã chứng nhận An toàn giao dịch</span>
          </div>
        </div>
      </div>

      {/* Bottom Copyright */}
      <div className="max-w-7xl mx-auto px-4 lg:px-8 pt-6 border-t border-charcoal-border/40 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-DEFAULT">
        <p>© 2026 VITACORE SUPPLEMENTS VIETNAM. Bản quyền thuộc về Công ty TNHH Dinh Dưỡng Thể Thao Vitacore.</p>
        <p>Giấy phép ĐKKD số: 0315889988 do Sở KH&ĐT TP.HCM cấp.</p>
      </div>
    </footer>
  );
}

