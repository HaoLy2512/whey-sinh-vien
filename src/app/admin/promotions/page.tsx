'use client';

import React, { useState, useEffect } from 'react';
import { Tag, Plus, Check } from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';

export default function AdminPromotionsPage() {
  const [coupons, setCoupons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  // Form
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [discountType, setDiscountType] = useState<'PERCENTAGE' | 'FIXED_AMOUNT'>('PERCENTAGE');
  const [discountValue, setDiscountValue] = useState('10');
  const [minOrderValue, setMinOrderValue] = useState('500000');
  const [maxDiscountValue, setMaxDiscountValue] = useState('100000');
  const [usageLimit, setUsageLimit] = useState('100');
  const [submitting, setSubmitting] = useState(false);

  const fetchCoupons = () => {
    setLoading(true);
    fetch('/api/admin/promotions')
      .then((res) => res.json())
      .then((data) => {
        if (data.coupons) setCoupons(data.coupons);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch('/api/admin/promotions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code,
          description,
          discountType,
          discountValue,
          minOrderValue,
          maxDiscountValue: discountType === 'PERCENTAGE' ? maxDiscountValue : null,
          usageLimit,
        }),
      });

      if (res.ok) {
        setModalOpen(false);
        setCode('');
        setDescription('');
        fetchCoupons();
      } else {
        alert('Lỗi tạo mã giảm giá');
      }
    } catch {
      alert('Lỗi kết nối máy chủ');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-black text-2xl text-ivory">QUẢN LÝ MÃ GIẢM GIÁ & VOUCHER</h1>
          <p className="text-xs text-slate-subtle mt-1">Thiết lập các chương trình khuyến mãi, giảm % hoặc giảm tiền trực tiếp</p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-gold text-charcoal font-bold text-xs hover:bg-gold-light transition shadow-glow flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          Tạo mã mới
        </button>
      </div>

      <div className="card-luxury overflow-hidden border-charcoal-border">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-DEFAULT">Đang tải danh sách voucher...</div>
        ) : (
          <table className="w-full text-left text-xs">
            <thead className="bg-charcoal-deep text-slate-subtle uppercase text-[10px] tracking-wider border-b border-charcoal-border">
              <tr>
                <th className="p-3.5">Mã Coupon</th>
                <th className="p-3.5">Mô Tả</th>
                <th className="p-3.5">Mức Giảm</th>
                <th className="p-3.5">Đơn Tối Thiểu</th>
                <th className="p-3.5">Đã Dùng / Giới Hạn</th>
                <th className="p-3.5 text-right">Trạng Thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-charcoal-border/60 text-ivory">
              {coupons.map((c) => (
                <tr key={c.id} className="hover:bg-charcoal-hover transition">
                  <td className="p-3.5 font-mono font-bold text-gold text-sm">{c.code}</td>
                  <td className="p-3.5 text-slate-subtle">{c.description || '-'}</td>
                  <td className="p-3.5 font-bold text-ivory">
                    {c.discountType === 'PERCENTAGE' ? `${c.discountValue}%` : formatCurrency(c.discountValue)}
                  </td>
                  <td className="p-3.5 font-mono text-slate-DEFAULT">
                    {formatCurrency(c.minOrderValue)}
                  </td>
                  <td className="p-3.5 font-mono">
                    <span className="text-gold font-bold">{c.usageCount}</span> / {c.usageLimit} lượt
                  </td>
                  <td className="p-3.5 text-right">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                      {c.isActive ? 'Đang hoạt động' : 'Tạm ngưng'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-charcoal-card border border-charcoal-border rounded-2xl p-6 shadow-2xl">
            <h3 className="font-display font-bold text-base text-ivory mb-4">Tạo Mã Khuyến Mãi Mới</h3>
            <form onSubmit={handleCreateCoupon} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-subtle mb-1 font-semibold">Mã code *</label>
                <input
                  type="text"
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="VD: FLASH20"
                  className="w-full bg-charcoal-deep border border-charcoal-border rounded-xl p-3 text-gold font-mono font-bold text-sm focus:outline-none focus:border-gold"
                />
              </div>

              <div>
                <label className="block text-slate-subtle mb-1 font-semibold">Loại giảm giá</label>
                <select
                  value={discountType}
                  onChange={(e: any) => setDiscountType(e.target.value)}
                  className="w-full bg-charcoal-deep border border-charcoal-border rounded-xl p-3 text-ivory focus:outline-none focus:border-gold"
                >
                  <option value="PERCENTAGE">Giảm theo % (Phần trăm)</option>
                  <option value="FIXED_AMOUNT">Giảm số tiền cố định (VND)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-subtle mb-1 font-semibold">Giá trị giảm *</label>
                  <input
                    type="number"
                    required
                    value={discountValue}
                    onChange={(e) => setDiscountValue(e.target.value)}
                    className="w-full bg-charcoal-deep border border-charcoal-border rounded-xl p-3 text-ivory font-mono focus:outline-none focus:border-gold"
                  />
                </div>

                <div>
                  <label className="block text-slate-subtle mb-1 font-semibold">Đơn tối thiểu (VND)</label>
                  <input
                    type="number"
                    value={minOrderValue}
                    onChange={(e) => setMinOrderValue(e.target.value)}
                    className="w-full bg-charcoal-deep border border-charcoal-border rounded-xl p-3 text-ivory font-mono focus:outline-none focus:border-gold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-subtle mb-1 font-semibold">Giới hạn số lượt dùng tối đa</label>
                <input
                  type="number"
                  value={usageLimit}
                  onChange={(e) => setUsageLimit(e.target.value)}
                  className="w-full bg-charcoal-deep border border-charcoal-border rounded-xl p-3 text-ivory font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-subtle mb-1 font-semibold">Mô tả ngắn</label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Giảm 20% tối đa 100k..."
                  className="w-full bg-charcoal-deep border border-charcoal-border rounded-xl p-3 text-ivory"
                />
              </div>

              <div className="flex gap-3 justify-end pt-3 border-t border-charcoal-border">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-charcoal-deep border border-charcoal-border text-slate-DEFAULT"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-gold text-charcoal font-bold hover:bg-gold-light"
                >
                  {submitting ? 'Đang tạo...' : 'Lưu mã voucher'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

