'use client';

import React, { useState, useEffect } from 'react';
import { Settings, Save, ShieldCheck, Check, DollarSign, Building, Upload } from 'lucide-react';

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);

  // Form states
  const [storeName, setStoreName] = useState('VITACORE SUPPLEMENTS');
  const [legalName, setLegalName] = useState('Công Ty TNHH Dinh Dưỡng Thể Thao Vitacore Việt Nam');
  const [hotline, setHotline] = useState('1900 8899');
  const [email, setEmail] = useState('support@vitacore.vn');
  const [address, setAddress] = useState('123 Võ Văn Tần, Phường 6, Quận 3, TP. Hồ Chí Minh');
  const [logoUrl, setLogoUrl] = useState('/images/vitacore-logo.svg');
  const [freeShippingThreshold, setFreeShippingThreshold] = useState('1000000');
  const [defaultShippingFee, setDefaultShippingFee] = useState('30000');
  const [primaryColor, setPrimaryColor] = useState('#101318');
  const [accentColor, setAccentColor] = useState('#C8A96A');

  // Banking
  const [bankName, setBankName] = useState('Techcombank');
  const [accountNumber, setAccountNumber] = useState('19036888999999');
  const [accountHolder, setAccountHolder] = useState('CTY TNHH VITACORE VIET NAM');

  useEffect(() => {
    fetch('/api/settings')
      .then((res) => res.json())
      .then((data) => {
        if (data.settings) {
          const s = data.settings;
          setSettings(s);
          if (s.storeName) setStoreName(s.storeName);
          if (s.legalName) setLegalName(s.legalName);
          if (s.hotline) setHotline(s.hotline);
          if (s.email) setEmail(s.email);
          if (s.address) setAddress(s.address);
          if (s.logoUrl) setLogoUrl(s.logoUrl);
          if (s.freeShippingThreshold) setFreeShippingThreshold(s.freeShippingThreshold.toString());
          if (s.defaultShippingFee) setDefaultShippingFee(s.defaultShippingFee.toString());
          if (s.primaryColor) setPrimaryColor(s.primaryColor);
          if (s.accentColor) setAccentColor(s.accentColor);

          try {
            if (s.bankAccountInfo) {
              const b = JSON.parse(s.bankAccountInfo);
              if (b.bankName) setBankName(b.bankName);
              if (b.accountNumber) setAccountNumber(b.accountNumber);
              if (b.accountHolder) setAccountHolder(b.accountHolder);
            }
          } catch {}
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingLogo(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (res.ok && data.url) {
        setLogoUrl(data.url);
      } else {
        alert(data.message || 'Lỗi tải ảnh logo');
      }
    } catch {
      alert('Không thể kết nối máy chủ để tải ảnh');
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveSuccess(false);

    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          storeName,
          legalName,
          hotline,
          email,
          address,
          logoUrl,
          primaryColor,
          accentColor,
          freeShippingThreshold: parseFloat(freeShippingThreshold),
          defaultShippingFee: parseFloat(defaultShippingFee),
          bankAccountInfo: {
            bankName,
            accountNumber,
            accountHolder,
          },
        }),
      });

      if (res.ok) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      } else {
        alert('Lỗi cập nhật cấu hình cửa hàng');
      }
    } catch {
      alert('Lỗi kết nối máy chủ');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="w-10 h-10 rounded-full border-2 border-gold border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="font-display font-black text-2xl text-ivory">
          CẤU HÌNH THƯƠNG HIỆU & HỆ THỐNG
        </h1>
        <p className="text-xs text-slate-subtle mt-1">
          Chỉnh sửa tên thương hiệu (Store Name), logo, màu nhận diện, ngưỡng miễn phí vận chuyển và tài khoản VietQR
        </p>
      </div>

      {saveSuccess && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-center gap-2">
          <Check className="w-4 h-4" />
          <span>Cấu hình thương hiệu và cửa hàng đã được lưu thành công trên toàn hệ thống!</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6 text-xs">
        {/* Brand & Store Name */}
        <div className="card-luxury p-6 border-charcoal-border space-y-4">
          <h2 className="font-display font-bold text-sm text-gold uppercase tracking-wider flex items-center gap-2">
            <Building className="w-4 h-4" />
            1. Bộ Nhận Diện Thương Hiệu & Tên Cửa Hàng
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-slate-subtle mb-1 font-semibold">
                Tên thương hiệu hiển thị trên thanh Header & Footer *
              </label>
              <input
                type="text"
                required
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                placeholder="VITACORE SUPPLEMENTS"
                className="w-full bg-charcoal-deep border border-charcoal-border rounded-xl p-3 text-ivory font-bold text-sm focus:outline-none focus:border-gold"
              />
              <p className="text-[11px] text-slate-DEFAULT mt-1">
                Tên thương hiệu sẽ cập nhật tự động tức thì trên Navbar, Footer, hóa đơn và email xác nhận.
              </p>
            </div>

            <div>
              <label className="block text-slate-subtle mb-1 font-semibold">Tên pháp nhân công ty</label>
              <input
                type="text"
                value={legalName}
                onChange={(e) => setLegalName(e.target.value)}
                className="w-full bg-charcoal-deep border border-charcoal-border rounded-xl p-3 text-ivory"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-slate-subtle mb-1 font-semibold">Logo cửa hàng (File nội bộ hoặc tải lên từ máy tính)</label>
              <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
                <input
                  type="text"
                  value={logoUrl}
                  onChange={(e) => setLogoUrl(e.target.value)}
                  placeholder="/images/logo.png hoặc /uploads/... hoặc https://..."
                  className="flex-1 bg-charcoal-deep border border-charcoal-border rounded-xl p-3 text-ivory focus:outline-none focus:border-gold"
                />
                <label className="cursor-pointer px-4 py-3 rounded-xl bg-charcoal border border-gold/40 text-gold hover:bg-gold hover:text-charcoal transition flex items-center justify-center gap-2 font-semibold text-sm whitespace-nowrap shadow-sm">
                  <Upload className="w-4 h-4" />
                  <span>{uploadingLogo ? 'Đang tải lên...' : 'Tải logo từ máy tính'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    disabled={uploadingLogo}
                    className="hidden"
                  />
                </label>
              </div>
              {logoUrl && (
                <div className="mt-3 flex items-center gap-3 p-2 bg-charcoal-deep rounded-lg border border-charcoal-border/70">
                  <img src={logoUrl} alt="Logo preview" className="h-10 max-w-[120px] object-contain rounded bg-charcoal p-1 border border-gold/30" />
                  <div className="text-xs">
                    <p className="text-ivory font-semibold">Đường dẫn logo hiện tại:</p>
                    <code className="text-gold break-all">{logoUrl}</code>
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="block text-slate-subtle mb-1 font-semibold">Hotline CSKH</label>
              <input
                type="text"
                value={hotline}
                onChange={(e) => setHotline(e.target.value)}
                className="w-full bg-charcoal-deep border border-charcoal-border rounded-xl p-3 text-ivory"
              />
            </div>

            <div>
              <label className="block text-slate-subtle mb-1 font-semibold">Email hỗ trợ</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-charcoal-deep border border-charcoal-border rounded-xl p-3 text-ivory"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-slate-subtle mb-1 font-semibold">Địa chỉ trụ sở / Showroom</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full bg-charcoal-deep border border-charcoal-border rounded-xl p-3 text-ivory"
              />
            </div>
          </div>
        </div>

        {/* Shipping & Fees */}
        <div className="card-luxury p-6 border-charcoal-border space-y-4">
          <h2 className="font-display font-bold text-sm text-gold uppercase tracking-wider flex items-center gap-2">
            <DollarSign className="w-4 h-4" />
            2. Chính Sách Phí Giao Hàng & Ngưỡng Freeship
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-subtle mb-1 font-semibold">
                Ngưỡng đơn hàng Miễn Phí Vận Chuyển (VND)
              </label>
              <input
                type="number"
                required
                value={freeShippingThreshold}
                onChange={(e) => setFreeShippingThreshold(e.target.value)}
                placeholder="1000000"
                className="w-full bg-charcoal-deep border border-charcoal-border rounded-xl p-3 text-ivory font-mono"
              />
              <p className="text-[11px] text-slate-DEFAULT mt-1">Đơn từ mức này trở lên sẽ có phí ship = 0đ</p>
            </div>

            <div>
              <label className="block text-slate-subtle mb-1 font-semibold">
                Phí vận chuyển mặc định (VND)
              </label>
              <input
                type="number"
                required
                value={defaultShippingFee}
                onChange={(e) => setDefaultShippingFee(e.target.value)}
                placeholder="30000"
                className="w-full bg-charcoal-deep border border-charcoal-border rounded-xl p-3 text-ivory font-mono"
              />
              <p className="text-[11px] text-slate-DEFAULT mt-1">Áp dụng cho các đơn hàng chưa đạt ngưỡng freeship</p>
            </div>
          </div>
        </div>

        {/* Bank Account for VietQR */}
        <div className="card-luxury p-6 border-charcoal-border space-y-4">
          <h2 className="font-display font-bold text-sm text-gold uppercase tracking-wider">
            3. Tài Khoản Ngân Hàng Cho Cổng Chuyển Khoản VietQR 24/7
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-slate-subtle mb-1 font-semibold">Tên Ngân hàng</label>
              <input
                type="text"
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                className="w-full bg-charcoal-deep border border-charcoal-border rounded-xl p-3 text-ivory"
              />
            </div>

            <div>
              <label className="block text-slate-subtle mb-1 font-semibold">Số tài khoản</label>
              <input
                type="text"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                className="w-full bg-charcoal-deep border border-charcoal-border rounded-xl p-3 text-ivory font-mono"
              />
            </div>

            <div>
              <label className="block text-slate-subtle mb-1 font-semibold">Tên chủ tài khoản</label>
              <input
                type="text"
                value={accountHolder}
                onChange={(e) => setAccountHolder(e.target.value.toUpperCase())}
                className="w-full bg-charcoal-deep border border-charcoal-border rounded-xl p-3 text-ivory uppercase"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={saving}
            className="px-8 py-3.5 rounded-xl bg-gold text-charcoal font-bold text-xs uppercase tracking-wider hover:bg-gold-light transition shadow-glow flex items-center gap-2 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Đang lưu cấu hình...' : 'Lưu Thay Đổi'}
          </button>
        </div>
      </form>
    </div>
  );
}

