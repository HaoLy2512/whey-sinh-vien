'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { MapPin, Plus, Check, ChevronRight } from 'lucide-react';

export default function AccountAddressesPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  const [addresses, setAddresses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  // Form
  const [receiverName, setReceiverName] = useState('');
  const [phone, setPhone] = useState('');
  const [province, setProvince] = useState('Hồ Chí Minh');
  const [streetAddress, setStreetAddress] = useState('');
  const [isDefault, setIsDefault] = useState(false);
  const [saving, setSaving] = useState(false);

  const fetchAddresses = () => {
    fetch('/api/user/addresses')
      .then((res) => res.json())
      .then((data) => {
        if (data.addresses) setAddresses(data.addresses);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/auth/login?redirect=/account/addresses');
      return;
    }
    if (user) {
      fetchAddresses();
    }
  }, [user, isLoading, router]);

  const handleCreateAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/user/addresses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          receiverName,
          phone,
          province,
          streetAddress,
          isDefault,
        }),
      });
      if (res.ok) {
        setShowModal(false);
        setReceiverName('');
        setPhone('');
        setStreetAddress('');
        setIsDefault(false);
        fetchAddresses();
      }
    } catch {
      alert('Lỗi lưu địa chỉ');
    } finally {
      setSaving(false);
    }
  };

  if (isLoading || loading) {
    return (
      <div className="min-h-screen bg-charcoal flex items-center justify-center p-8">
        <div className="w-12 h-12 rounded-full border-2 border-gold border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="bg-charcoal min-h-screen py-10">
      <div className="max-w-4xl mx-auto px-4 lg:px-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-slate-DEFAULT mb-6">
          <Link href="/" className="hover:text-gold transition">Trang chủ</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-ivory font-semibold">Tài khoản</span>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-gold-light">Sổ địa chỉ</span>
        </div>

        <div className="flex items-center justify-between mb-8 pb-4 border-b border-charcoal-border/60">
          <div>
            <h1 className="font-display font-black text-2xl sm:text-3xl text-ivory">
              SỔ ĐỊA CHỈ NHẬN HÀNG
            </h1>
            <p className="text-xs text-slate-subtle mt-1">
              Quản lý các địa chỉ nhận hàng để thanh toán nhanh chóng hơn
            </p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2.5 rounded-xl bg-gold text-charcoal font-bold text-xs hover:bg-gold-light transition shadow-glow flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            Thêm địa chỉ mới
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {addresses.map((addr) => (
            <div
              key={addr.id}
              className={`card-luxury p-5 border relative flex flex-col justify-between ${
                addr.isDefault ? 'border-gold bg-gold/5' : 'border-charcoal-border'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <strong className="text-ivory text-sm">{addr.receiverName}</strong>
                  {addr.isDefault && (
                    <span className="text-[10px] bg-gold/20 text-gold px-2 py-0.5 rounded-full font-bold">
                      Mặc định
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-DEFAULT mb-2">SĐT: {addr.phone}</p>
                <p className="text-xs text-slate-subtle leading-relaxed flex items-start gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-gold flex-shrink-0 mt-0.5" />
                  <span>{addr.streetAddress}, {addr.province}</span>
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add Address Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-charcoal-card border border-charcoal-border rounded-2xl p-6 shadow-2xl">
            <h3 className="font-display font-bold text-lg text-ivory mb-4">Thêm Địa Chỉ Nhận Hàng</h3>
            <form onSubmit={handleCreateAddress} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-subtle mb-1">Họ tên người nhận *</label>
                <input
                  type="text"
                  required
                  value={receiverName}
                  onChange={(e) => setReceiverName(e.target.value)}
                  className="w-full bg-charcoal-deep border border-charcoal-border rounded-xl p-3 text-ivory focus:outline-none focus:border-gold"
                  placeholder="Nguyễn Văn A"
                />
              </div>

              <div>
                <label className="block text-slate-subtle mb-1">Số điện thoại *</label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-charcoal-deep border border-charcoal-border rounded-xl p-3 text-ivory focus:outline-none focus:border-gold"
                  placeholder="0909 123 456"
                />
              </div>

              <div>
                <label className="block text-slate-subtle mb-1">Tỉnh / Thành phố *</label>
                <select
                  value={province}
                  onChange={(e) => setProvince(e.target.value)}
                  className="w-full bg-charcoal-deep border border-charcoal-border rounded-xl p-3 text-ivory focus:outline-none focus:border-gold"
                >
                  <option value="Hồ Chí Minh">TP. Hồ Chí Minh</option>
                  <option value="Hà Nội">TP. Hà Nội</option>
                  <option value="Đà Nẵng">TP. Đà Nẵng</option>
                  <option value="Hải Phòng">TP. Hải Phòng</option>
                  <option value="Cần Thơ">TP. Cần Thơ</option>
                  <option value="Bình Dương">Bình Dương</option>
                  <option value="Đồng Nai">Đồng Nai</option>
                  <option value="Khác">Tỉnh thành khác</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-subtle mb-1">Địa chỉ chi tiết (Số nhà, đường, phường) *</label>
                <input
                  type="text"
                  required
                  value={streetAddress}
                  onChange={(e) => setStreetAddress(e.target.value)}
                  className="w-full bg-charcoal-deep border border-charcoal-border rounded-xl p-3 text-ivory focus:outline-none focus:border-gold"
                  placeholder="Số 45 Nam Kỳ Khởi Nghĩa, Phường Võ Thị Sáu"
                />
              </div>

              <label className="flex items-center gap-2 cursor-pointer select-none text-ivory pt-2">
                <input
                  type="checkbox"
                  checked={isDefault}
                  onChange={(e) => setIsDefault(e.target.checked)}
                  className="rounded text-gold focus:ring-0"
                />
                <span>Đặt làm địa chỉ giao hàng mặc định</span>
              </label>

              <div className="flex gap-3 justify-end pt-4 border-t border-charcoal-border">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl bg-charcoal-deep border border-charcoal-border text-slate-DEFAULT hover:text-ivory"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 rounded-xl bg-gold text-charcoal font-bold hover:bg-gold-light shadow-glow disabled:opacity-50"
                >
                  {saving ? 'Đang lưu...' : 'Lưu địa chỉ'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

