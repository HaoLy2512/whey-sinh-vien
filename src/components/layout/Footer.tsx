import React from 'react';
import Link from 'next/link';
import { MapPin, Phone, Mail } from 'lucide-react';
import { siteConfig } from '@/config/site';

export default function Footer() {
  return (
    <footer className="bg-charcoal-deep border-t border-charcoal-border/80 text-slate-subtle text-sm pt-12 pb-8 print:hidden">
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
              {siteConfig.name}
            </span>
          </div>
          <p className="text-sm text-slate-DEFAULT leading-relaxed mb-4 pr-4">
            Cửa hàng thực phẩm bổ sung và dinh dưỡng thể thao cho người tập gym: whey protein, creatine, pre-workout, BCAA và nhiều hơn nữa.
          </p>
          <div className="flex flex-col gap-2 text-sm">
            {siteConfig.contact.address && (
              <div className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-gold" />
                <span>{siteConfig.contact.address}</span>
              </div>
            )}
            {siteConfig.contact.hotline && (
              <div className="flex items-center gap-2">
                <Phone className="h-3.5 w-3.5 flex-shrink-0 text-gold" />
                <span>Hotline: {siteConfig.contact.hotline}</span>
              </div>
            )}
            {siteConfig.contact.email && (
              <div className="flex items-center gap-2">
                <Mail className="h-3.5 w-3.5 flex-shrink-0 text-gold" />
                <span>Email: {siteConfig.contact.email}</span>
              </div>
            )}
            {siteConfig.isDemo && (
              <p className="rounded-lg border border-gold/30 bg-gold/10 px-3 py-2 font-semibold text-gold-light">
                {siteConfig.demoNotice}
              </p>
            )}
          </div>
        </div>

        {/* Categories */}
        <div>
          <h4 className="text-ivory font-bold text-sm uppercase tracking-wider mb-4 border-l-2 border-gold pl-2">
            Danh Mục Nổi Bật
          </h4>
          <ul className="flex flex-col gap-2.5 text-sm">
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
          <h4 className="text-ivory font-bold text-sm uppercase tracking-wider mb-4 border-l-2 border-gold pl-2">
            Hỗ Trợ Khách Hàng
          </h4>
          <ul className="flex flex-col gap-2.5 text-sm">
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
          <h4 className="text-ivory font-bold text-sm uppercase tracking-wider mb-4 border-l-2 border-gold pl-2">
            Phương Thức Thanh Toán
          </h4>
          <p className="text-sm text-slate-DEFAULT mb-3">
            Hỗ trợ đa dạng phương thức thanh toán an toàn, bảo mật cao:
          </p>
          <div className="grid grid-cols-2 gap-2 text-sm font-semibold text-ivory">
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
        </div>
      </div>

      {/* Bottom Copyright */}
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 border-t border-charcoal-border/40 px-4 pt-6 text-sm text-slate-DEFAULT sm:flex-row lg:px-8">
        <p>
          © {new Date().getFullYear()} {siteConfig.legal.companyName ?? siteConfig.name}.
          {siteConfig.isDemo ? ` ${siteConfig.demoNotice}.` : ''}
        </p>
        {(siteConfig.legal.taxCode || siteConfig.legal.businessLicense) && (
          <p>
            {siteConfig.legal.taxCode && <>MST: {siteConfig.legal.taxCode}</>}
            {siteConfig.legal.taxCode && siteConfig.legal.businessLicense && ' · '}
            {siteConfig.legal.businessLicense && <>Giấy phép: {siteConfig.legal.businessLicense}</>}
          </p>
        )}
      </div>
    </footer>
  );
}

