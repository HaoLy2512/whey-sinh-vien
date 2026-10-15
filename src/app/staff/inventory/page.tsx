'use client';

import React, { useState, useEffect } from 'react';
import {
  Boxes,
  AlertTriangle,
  Calendar,
  Plus,
  ArrowDownRight,
  ArrowUpRight,
  History,
  Search,
} from 'lucide-react';
import { formatDate } from '@/lib/utils';

export default function StaffInventoryPage() {
  const [inventory, setInventory] = useState<any[]>([]);
  const [lots, setLots] = useState<any[]>([]);
  const [movements, setMovements] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Stock Adjustment Modal
  const [adjustModalOpen, setAdjustModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [movementType, setMovementType] = useState<'IMPORT' | 'ADJUSTMENT' | 'EXPORT'>('IMPORT');
  const [quantity, setQuantity] = useState('10');
  const [note, setNote] = useState('');
  const [lotNumber, setLotNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchInventory = () => {
    setLoading(true);
    fetch('/api/inventory')
      .then((res) => res.json())
      .then((data) => {
        if (data.inventory) setInventory(data.inventory);
        if (data.lots) setLots(data.lots);
        if (data.movements) setMovements(data.movements);
        if (data.alerts) setAlerts(data.alerts);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const handleAdjustSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem || !note) {
      alert('Vui lòng nhập lý do điều chỉnh bắt buộc');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/inventory/adjust', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: selectedItem.productId,
          variantId: selectedItem.variantId,
          movementType,
          quantity: parseInt(quantity),
          note,
          lotNumber: movementType === 'IMPORT' ? lotNumber : undefined,
          expiryDate: movementType === 'IMPORT' ? expiryDate : undefined,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setAdjustModalOpen(false);
        setNote('');
        setLotNumber('');
        setExpiryDate('');
        fetchInventory();
      } else {
        alert(data.message || 'Lỗi điều chỉnh tồn kho');
      }
    } catch {
      alert('Lỗi kết nối máy chủ');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display font-black text-2xl text-ivory">
          QUẢN LÝ KHO HÀNG & LÔ HẠN SỬ DỤNG
        </h1>
        <p className="text-xs text-slate-subtle mt-1">
          Theo dõi số lượng tồn kho thực tế, hạn dùng từng lô hàng và nhật ký xuất nhập kho bắt buộc
        </p>
      </div>

      {/* Alert Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="card-luxury p-5 border-rose-500/30 bg-rose-500/5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-ivory">Hàng Sắp Hết Trong Kho</h3>
              <p className="text-xs text-slate-subtle">Dưới ngưỡng tối thiểu 5 sản phẩm</p>
            </div>
          </div>
          <span className="font-display font-black text-2xl text-rose-400">
            {alerts?.lowStockCount || 0}
          </span>
        </div>

        <div className="card-luxury p-5 border-amber-500/30 bg-amber-500/5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-ivory">Cảnh Báo Hạn Dùng (Gần Date)</h3>
              <p className="text-xs text-slate-subtle">Lô hàng hết hạn trong vòng 3 tháng tới</p>
            </div>
          </div>
          <span className="font-display font-black text-2xl text-amber-400">
            {alerts?.expiringCount || 0}
          </span>
        </div>
      </div>

      {/* Inventory Stock Table */}
      <div className="card-luxury p-6 border-charcoal-border">
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-charcoal-border/60">
          <h2 className="font-display font-bold text-base text-ivory flex items-center gap-2">
            <Boxes className="w-4 h-4 text-gold" />
            Danh Sách Tồn Kho Theo Biến Thể
          </h2>
          <span className="text-xs text-slate-DEFAULT">{inventory.length} bản ghi</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-charcoal-deep text-slate-subtle uppercase text-[10px] tracking-wider border-b border-charcoal-border">
              <tr>
                <th className="p-3">Sản Phẩm</th>
                <th className="p-3">Biến Thể / SKU</th>
                <th className="p-3">Vị Trí Kho</th>
                <th className="p-3 text-center">Tồn Thực Tế</th>
                <th className="p-3 text-center">Có Thể Bán</th>
                <th className="p-3 text-right">Điều Chỉnh Kho</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-charcoal-border/60 text-ivory">
              {inventory.map((item) => (
                <tr key={item.id} className="hover:bg-charcoal-hover transition">
                  <td className="p-3 font-semibold text-ivory max-w-xs truncate">
                    {item.product.name}
                  </td>
                  <td className="p-3">
                    <span className="font-bold text-gold-light block">{item.variant?.title || 'Tiêu chuẩn'}</span>
                    <span className="text-[10px] font-mono text-slate-DEFAULT">{item.variant?.sku || item.product.sku}</span>
                  </td>
                  <td className="p-3 text-slate-DEFAULT">{item.warehouseLocation}</td>
                  <td className="p-3 text-center font-mono font-bold text-sm">
                    {item.quantityOnHand <= item.minStockAlert ? (
                      <span className="text-rose-400">{item.quantityOnHand} (Thấp)</span>
                    ) : (
                      <span>{item.quantityOnHand}</span>
                    )}
                  </td>
                  <td className="p-3 text-center font-mono font-bold text-emerald-400">
                    {item.quantityAvailable}
                  </td>
                  <td className="p-3 text-right">
                    <button
                      onClick={() => {
                        setSelectedItem(item);
                        setAdjustModalOpen(true);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-charcoal-deep border border-charcoal-border hover:border-gold text-gold font-bold text-xs transition"
                    >
                      Ghi nhận nhập/xuất
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Lots & Expiry Tracking Section */}
      <div className="card-luxury p-6 border-charcoal-border">
        <h2 className="font-display font-bold text-base text-ivory mb-4 pb-2 border-b border-charcoal-border/60 flex items-center gap-2">
          <Calendar className="w-4 h-4 text-gold" />
          Quản Lý Lô Hàng & Hạn Sử Dụng (Lot Number & Expiration Dates)
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-charcoal-deep text-slate-subtle uppercase text-[10px] tracking-wider border-b border-charcoal-border">
              <tr>
                <th className="p-3">Số Lô (Lot Number)</th>
                <th className="p-3">Sản Phẩm & Biến Thể</th>
                <th className="p-3">Hạn Sử Dụng (EXP)</th>
                <th className="p-3 text-center">Số Lượng Ban Đầu</th>
                <th className="p-3 text-center">Số Lượng Còn Lại</th>
                <th className="p-3 text-right">Trạng Thái Lô</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-charcoal-border/60 text-ivory">
              {lots.map((l) => (
                <tr key={l.id} className="hover:bg-charcoal-hover transition">
                  <td className="p-3 font-mono font-bold text-gold">{l.lotNumber}</td>
                  <td className="p-3">
                    <span className="block font-semibold">{l.product.name}</span>
                    {l.variant && <span className="text-[11px] text-slate-DEFAULT">{l.variant.title}</span>}
                  </td>
                  <td className="p-3 font-mono">{formatDate(l.expiryDate)}</td>
                  <td className="p-3 text-center font-mono">{l.quantityInitial}</td>
                  <td className="p-3 text-center font-mono font-bold text-emerald-400">{l.quantityRemaining}</td>
                  <td className="p-3 text-right">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold border border-emerald-500/30 text-emerald-400 bg-emerald-500/10">
                      {l.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Movements Audit */}
      <div className="card-luxury p-6 border-charcoal-border">
        <h2 className="font-display font-bold text-base text-ivory mb-4 pb-2 border-b border-charcoal-border/60 flex items-center gap-2">
          <History className="w-4 h-4 text-gold" />
          Nhật Ký Xuất Nhập Kho Bắt Buộc (Audit Log)
        </h2>

        <div className="divide-y divide-charcoal-border/60">
          {movements.map((m) => (
            <div key={m.id} className="py-3 flex justify-between items-center text-xs">
              <div className="flex items-center gap-3">
                {m.movementType === 'IMPORT' ? (
                  <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                    <ArrowDownRight className="w-4 h-4" />
                  </div>
                ) : (
                  <div className="w-7 h-7 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
                    <ArrowUpRight className="w-4 h-4" />
                  </div>
                )}
                <div>
                  <strong className="text-ivory">{m.product?.name}</strong>
                  <p className="text-[11px] text-slate-subtle">
                    Loại: <span className="font-bold text-gold-light">{m.movementType}</span> • Lý do: {m.note}
                  </p>
                </div>
              </div>

              <div className="text-right">
                <span className={`font-mono font-bold text-sm ${m.movementType === 'IMPORT' ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {m.movementType === 'IMPORT' ? `+${m.quantity}` : `-${m.quantity}`}
                </span>
                <span className="text-[10px] text-slate-DEFAULT block mt-0.5">
                  {formatDate(m.createdAt)} • Bởi: {m.performedBy}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Stock Adjustment Modal */}
      {adjustModalOpen && selectedItem && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-charcoal-card border border-charcoal-border rounded-2xl p-6 shadow-2xl">
            <h3 className="font-display font-bold text-base text-ivory mb-1">
              Ghi Nhận Điều Chỉnh Kho
            </h3>
            <p className="text-xs text-slate-subtle mb-4">
              {selectedItem.product.name} ({selectedItem.variant?.title || 'Tiêu chuẩn'})
            </p>

            <form onSubmit={handleAdjustSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-subtle mb-1 font-semibold">Loại nghiệp vụ:</label>
                <select
                  value={movementType}
                  onChange={(e: any) => setMovementType(e.target.value)}
                  className="w-full bg-charcoal-deep border border-charcoal-border rounded-xl p-3 text-ivory focus:outline-none focus:border-gold"
                >
                  <option value="IMPORT">Nhập kho (Nhập thêm hàng từ nhà cung cấp)</option>
                  <option value="ADJUSTMENT">Điều chỉnh kiểm kê (Cân bằng sai lệch kho)</option>
                  <option value="EXPORT">Xuất kho đặc biệt (Hàng mẫu / Hàng hỏng)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-subtle mb-1 font-semibold">Số lượng:</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="w-full bg-charcoal-deep border border-charcoal-border rounded-xl p-3 text-ivory focus:outline-none focus:border-gold font-mono"
                />
              </div>

              {movementType === 'IMPORT' && (
                <>
                  <div>
                    <label className="block text-slate-subtle mb-1 font-semibold">Mã số lô hàng (Lot Number):</label>
                    <input
                      type="text"
                      placeholder="VD: LOT-2026-WHEY-02"
                      value={lotNumber}
                      onChange={(e) => setLotNumber(e.target.value)}
                      className="w-full bg-charcoal-deep border border-charcoal-border rounded-xl p-3 text-ivory focus:outline-none focus:border-gold font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-subtle mb-1 font-semibold">Hạn sử dụng (Expiry Date):</label>
                    <input
                      type="date"
                      value={expiryDate}
                      onChange={(e) => setExpiryDate(e.target.value)}
                      className="w-full bg-charcoal-deep border border-charcoal-border rounded-xl p-3 text-ivory focus:outline-none focus:border-gold"
                    />
                  </div>
                </>
              )}

              <div>
                <label className="block text-slate-subtle mb-1 font-semibold">
                  Lý do ghi nhận * (Bắt buộc theo quy định kiểm toán)
                </label>
                <textarea
                  required
                  rows={2}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Nhập lý do nhập xuất kho để lưu vào nhật ký..."
                  className="w-full bg-charcoal-deep border border-charcoal-border rounded-xl p-3 text-ivory focus:outline-none focus:border-gold"
                />
              </div>

              <div className="flex gap-3 justify-end pt-3 border-t border-charcoal-border">
                <button
                  type="button"
                  onClick={() => setAdjustModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-charcoal-deep border border-charcoal-border text-slate-DEFAULT hover:text-ivory"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-gold text-charcoal font-bold hover:bg-gold-light shadow-glow disabled:opacity-50"
                >
                  {submitting ? 'Đang lưu...' : 'Xác nhận ghi nhận'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

