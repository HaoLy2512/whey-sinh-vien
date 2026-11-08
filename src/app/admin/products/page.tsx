'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Package,
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Check,
  AlertCircle,
  Star,
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

export default function AdminProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [pinningId, setPinningId] = useState<string | null>(null);

  const fetchProducts = () => {
    setLoading(true);
    fetch(`/api/products?limit=50&search=${encodeURIComponent(search)}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.products) setProducts(data.products);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !currentStatus }),
      });
      if (res.ok) {
        fetchProducts();
      }
    } catch {
      alert('Lỗi cập nhật trạng thái hiển thị');
    }
  };

  const handleToggleHero = async (id: string, isHero: boolean) => {
    setPinningId(id);
    try {
      const res = await fetch(`/api/admin/products/${id}/hero`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: isHero ? 'unpin' : 'pin' }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        fetchProducts();
      } else {
        alert(data.error || 'Không thể ghim sản phẩm lên thẻ hero');
      }
    } catch {
      alert('Lỗi kết nối máy chủ');
    } finally {
      setPinningId(null);
    }
  };

  const handleDeleteProduct = async (id: string, name: string) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa mềm sản phẩm "${name}" không?`)) return;

    try {
      const res = await fetch(`/api/products/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        fetchProducts();
      } else {
        alert('Lỗi khi xóa sản phẩm');
      }
    } catch {
      alert('Lỗi kết nối máy chủ');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-black text-2xl text-ivory">
            QUẢN LÝ DANH MỤC SẢN PHẨM
          </h1>
          <p className="text-xs text-slate-subtle mt-1">
            Quản lý mã SKU, giá vốn (COGS), giá bán lẻ, tồn kho và trạng thái hiển thị
          </p>
        </div>

        <Link
          href="/admin/products/new"
          className="px-5 py-2.5 rounded-xl bg-gold text-charcoal font-bold text-xs hover:bg-gold-light transition shadow-glow flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          Thêm sản phẩm mới
        </Link>
      </div>

      {/* Filter Toolbar */}
      <div className="card-luxury p-4 border-charcoal-border flex items-center gap-4">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Tìm theo tên sản phẩm, mã SKU, thương hiệu..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchProducts()}
            className="w-full bg-charcoal-deep border border-charcoal-border rounded-xl py-2.5 pl-3 pr-10 text-xs text-ivory focus:outline-none focus:border-gold"
          />
          <button
            onClick={fetchProducts}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-DEFAULT hover:text-gold"
          >
            <Search className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Products Table */}
      <div className="card-luxury overflow-hidden border-charcoal-border">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-DEFAULT">Đang tải danh sách sản phẩm...</div>
        ) : products.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-DEFAULT">Chưa có sản phẩm nào.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-charcoal-deep text-slate-subtle uppercase text-[10px] tracking-wider border-b border-charcoal-border">
                <tr>
                  <th className="p-3.5">Sản Phẩm & SKU</th>
                  <th className="p-3.5">Thương Hiệu</th>
                  <th className="p-3.5">Danh Mục</th>
                  <th className="p-3.5">Giá Vốn (COGS)</th>
                  <th className="p-3.5">Giá Bán Lẻ</th>
                  <th className="p-3.5">Giá Khuyến Mãi</th>
                  <th className="p-3.5 text-center">Tồn Kho</th>
                  <th className="p-3.5 text-center">Trạng Thái</th>
                  <th className="p-3.5 text-right">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-charcoal-border/60 text-ivory">
                {products.map((p) => {
                  const totalStock = p.variants?.reduce((sum: number, v: any) => sum + v.inStock, 0) ?? 10;
                  const thumb = p.images?.[0]?.url || 'https://images.unsplash.com/photo-1579722821273-0f6c7d44362f?auto=format&fit=crop&w=200&q=80';
                  const isHero = Boolean(p.isHero);
                  return (
                    <tr key={p.id} className="hover:bg-charcoal-hover transition">
                      <td className="p-3.5 max-w-xs">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-charcoal-card border border-charcoal-border p-1 flex items-center justify-center overflow-hidden shrink-0">
                            <img
                              src={thumb}
                              alt={p.name}
                              className="w-full h-full object-contain"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1579722821273-0f6c7d44362f?auto=format&fit=crop&w=200&q=80';
                              }}
                            />
                          </div>
                          <div className="truncate">
                            <strong className="block text-ivory truncate">{p.name}</strong>
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-[10px] text-gold">{p.sku}</span>
                              {isHero && (
                                <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold border border-gold/50 text-gold bg-gold/10 flex items-center gap-1">
                                  <Star className="w-2.5 h-2.5 fill-current" />
                                  Thẻ hero
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="p-3.5 text-slate-subtle font-semibold">
                        {p.brand?.name || '-'}
                      </td>

                      <td className="p-3.5 text-slate-subtle">
                        {p.category?.name || '-'}
                      </td>

                      {/* Confidential COGS Price for Admin */}
                      <td className="p-3.5 font-mono text-slate-DEFAULT">
                        {formatCurrency(p.costPrice || 0)}
                      </td>

                      <td className="p-3.5 font-mono font-bold text-ivory">
                        {formatCurrency(p.price)}
                      </td>

                      <td className="p-3.5 font-mono text-gold font-bold">
                        {p.salePrice ? formatCurrency(p.salePrice) : '-'}
                      </td>

                      <td className="p-3.5 text-center font-mono font-bold">
                        {totalStock <= 5 ? (
                          <span className="text-rose-400">{totalStock}</span>
                        ) : (
                          <span className="text-emerald-400">{totalStock}</span>
                        )}
                      </td>

                      <td className="p-3.5 text-center">
                        <button
                          onClick={() => handleToggleActive(p.id, p.isActive)}
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold border transition ${
                            p.isActive
                              ? 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10'
                              : 'border-zinc-700 text-zinc-500 bg-zinc-800'
                          }`}
                        >
                          {p.isActive ? 'Đang bán' : 'Tạm ẩn'}
                        </button>
                      </td>

                      <td className="p-3.5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleToggleHero(p.id, isHero)}
                            disabled={pinningId === p.id}
                            className={`p-1.5 rounded border transition disabled:opacity-50 ${
                              isHero
                                ? 'bg-gold/10 border-gold/50 text-gold'
                                : 'bg-charcoal-deep border-charcoal-border text-slate-DEFAULT hover:text-gold'
                            }`}
                            title={isHero ? 'Bỏ ghim khỏi thẻ hero' : 'Ghim lên thẻ hero lớn ở trang chủ'}
                          >
                            <Star className={`w-3.5 h-3.5 ${isHero ? 'fill-current' : ''}`} />
                          </button>

                          <Link
                            href={`/admin/products/${p.id}`}
                            className="p-1.5 rounded bg-charcoal-deep border border-charcoal-border hover:text-gold text-slate-DEFAULT transition"
                            title="Chỉnh sửa sản phẩm"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </Link>

                          <Link
                            href={`/products/${p.slug}`}
                            target="_blank"
                            className="p-1.5 rounded bg-charcoal-deep border border-charcoal-border hover:text-gold text-slate-DEFAULT transition"
                            title="Xem trang sản phẩm"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </Link>

                          <button
                            onClick={() => handleDeleteProduct(p.id, p.name)}
                            className="p-1.5 rounded bg-charcoal-deep border border-charcoal-border hover:text-rose-400 text-slate-DEFAULT transition"
                            title="Xóa mềm sản phẩm"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}