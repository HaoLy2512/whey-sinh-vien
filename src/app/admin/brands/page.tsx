'use client';

import React, { useState, useEffect } from 'react';
import { Award, Plus } from 'lucide-react';

export default function AdminBrandsPage() {
  const [brands, setBrands] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [originCountry, setOriginCountry] = useState('USA');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchBrands = () => {
    setLoading(true);
    fetch('/api/brands')
      .then((res) => res.json())
      .then((data) => {
        if (data.brands) setBrands(data.brands);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchBrands();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch('/api/brands', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, originCountry, description }),
      });
      if (res.ok) {
        setModalOpen(false);
        setName('');
        setDescription('');
        fetchBrands();
      }
    } catch {
      alert('Lỗi tạo thương hiệu');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-black text-2xl text-ivory">QUẢN LÝ THƯƠNG HIỆU</h1>
          <p className="text-xs text-slate-subtle mt-1">Danh sách nhà sản xuất và đối tác chiến lược</p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-gold text-charcoal font-bold text-xs hover:bg-gold-light transition shadow-glow flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          Thêm thương hiệu
        </button>
      </div>

      <div className="card-luxury overflow-hidden border-charcoal-border">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-DEFAULT">Đang tải...</div>
        ) : (
          <table className="w-full text-left text-xs">
            <thead className="bg-charcoal-deep text-slate-subtle uppercase text-[10px] tracking-wider border-b border-charcoal-border">
              <tr>
                <th className="p-3.5">Thương Hiệu</th>
                <th className="p-3.5">Slug URL</th>
                <th className="p-3.5">Quốc Gia Xuất Xứ</th>
                <th className="p-3.5 text-center">Số Sản Phẩm</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-charcoal-border/60 text-ivory">
              {brands.map((b) => (
                <tr key={b.id} className="hover:bg-charcoal-hover transition">
                  <td className="p-3.5 font-bold text-ivory">{b.name}</td>
                  <td className="p-3.5 font-mono text-gold-light">{b.slug}</td>
                  <td className="p-3.5 text-slate-subtle">{b.originCountry || '-'}</td>
                  <td className="p-3.5 text-center font-bold text-emerald-400">
                    {b._count?.products || 0} sản phẩm
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
            <h3 className="font-display font-bold text-base text-ivory mb-4">Thêm Thương Hiệu Mới</h3>
            <form onSubmit={handleCreate} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-subtle mb-1 font-semibold">Tên thương hiệu *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="VD: Dymatize"
                  className="w-full bg-charcoal-deep border border-charcoal-border rounded-xl p-3 text-ivory focus:outline-none focus:border-gold"
                />
              </div>

              <div>
                <label className="block text-slate-subtle mb-1 font-semibold">Quốc gia xuất xứ</label>
                <input
                  type="text"
                  value={originCountry}
                  onChange={(e) => setOriginCountry(e.target.value)}
                  className="w-full bg-charcoal-deep border border-charcoal-border rounded-xl p-3 text-ivory focus:outline-none focus:border-gold"
                />
              </div>

              <div>
                <label className="block text-slate-subtle mb-1 font-semibold">Mô tả ngắn</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-charcoal-deep border border-charcoal-border rounded-xl p-3 text-ivory focus:outline-none focus:border-gold"
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
                  {submitting ? 'Đang tạo...' : 'Lưu thương hiệu'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

