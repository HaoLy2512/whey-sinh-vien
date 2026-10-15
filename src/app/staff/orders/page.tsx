'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Package,
  Search,
  Filter,
  Printer,
  ChevronRight,
  CheckCircle,
  Truck,
  Eye,
  FileText,
} from 'lucide-react';
import { formatCurrency, formatDate, getOrderStatusBadge, getPaymentStatusBadge } from '@/lib/utils';

export default function StaffOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Status update modal
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [newStatus, setNewStatus] = useState('');
  const [internalNote, setInternalNote] = useState('');
  const [updating, setUpdating] = useState(false);

  const fetchOrders = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (statusFilter !== 'ALL') params.set('status', statusFilter);

    fetch(`/api/orders?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.orders) setOrders(data.orders);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchOrders();
  }, [statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchOrders();
  };

  const handleUpdateStatus = async () => {
    if (!selectedOrder || !newStatus) return;
    setUpdating(true);
    try {
      const res = await fetch(`/api/orders/${selectedOrder.id}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderStatus: newStatus,
          note: internalNote,
        }),
      });
      if (res.ok) {
        setSelectedOrder(null);
        setInternalNote('');
        fetchOrders();
      } else {
        alert('Lỗi cập nhật trạng thái đơn hàng');
      }
    } catch {
      alert('Lỗi kết nối máy chủ');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-black text-2xl text-ivory">
            QUẢN LÝ & XỬ LÝ ĐƠN HÀNG
          </h1>
          <p className="text-xs text-slate-subtle mt-1">
            Xác nhận đơn, chuyển trạng thái đóng gói, in phiếu xuất kho và bàn giao vận chuyển
          </p>
        </div>

        {/* Search & Filter */}
        <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <input
              type="text"
              placeholder="Tìm mã đơn, tên, SĐT..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-charcoal border border-charcoal-border rounded-xl py-2 pl-3 pr-9 text-xs text-ivory focus:outline-none focus:border-gold"
            />
            <button type="submit" className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-DEFAULT">
              <Search className="w-3.5 h-3.5" />
            </button>
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-charcoal border border-charcoal-border rounded-xl px-3 py-2 text-xs text-ivory focus:outline-none focus:border-gold"
          >
            <option value="ALL">Tất cả trạng thái</option>
            <option value="PENDING">Chờ xử lý</option>
            <option value="CONFIRMED">Đã xác nhận</option>
            <option value="PROCESSING">Đang chuẩn bị</option>
            <option value="SHIPPING">Đang giao hàng</option>
            <option value="DELIVERED">Đã giao</option>
            <option value="CANCELLED">Đã hủy</option>
          </select>
        </form>
      </div>

      {/* Orders Table */}
      <div className="card-luxury overflow-hidden border-charcoal-border">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-DEFAULT">Đang tải danh sách đơn hàng...</div>
        ) : orders.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-DEFAULT">Không tìm thấy đơn hàng nào phù hợp.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-charcoal-deep text-slate-subtle uppercase text-[10px] tracking-wider border-b border-charcoal-border">
                <tr>
                  <th className="p-3.5">Mã Đơn Hàng</th>
                  <th className="p-3.5">Khách Hàng</th>
                  <th className="p-3.5">Địa Chỉ Nhận</th>
                  <th className="p-3.5">Tổng Tiền</th>
                  <th className="p-3.5">Thanh Toán</th>
                  <th className="p-3.5">Trạng Thái Đơn</th>
                  <th className="p-3.5 text-right">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-charcoal-border/60 text-ivory">
                {orders.map((ord) => {
                  const statusBadge = getOrderStatusBadge(ord.orderStatus);
                  const paymentBadge = getPaymentStatusBadge(ord.paymentStatus);

                  return (
                    <tr key={ord.id} className="hover:bg-charcoal-hover transition">
                      <td className="p-3.5">
                        <span className="font-mono font-bold text-gold block">{ord.orderNumber}</span>
                        <span className="text-[10px] text-slate-DEFAULT">{formatDate(ord.createdAt)}</span>
                      </td>

                      <td className="p-3.5">
                        <strong className="block text-ivory">{ord.customerName}</strong>
                        <span className="text-[11px] text-slate-DEFAULT">{ord.customerPhone}</span>
                      </td>

                      <td className="p-3.5 max-w-xs">
                        <p className="truncate text-slate-subtle text-[11px]">{ord.shippingAddress}</p>
                      </td>

                      <td className="p-3.5 font-mono font-bold text-ivory">
                        {formatCurrency(ord.totalAmount)}
                      </td>

                      <td className="p-3.5">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${paymentBadge.color}`}>
                          {paymentBadge.label}
                        </span>
                      </td>

                      <td className="p-3.5">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${statusBadge.color}`}>
                          {statusBadge.label}
                        </span>
                      </td>

                      <td className="p-3.5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => {
                              setSelectedOrder(ord);
                              setNewStatus(ord.orderStatus);
                            }}
                            className="px-3 py-1.5 rounded-lg bg-charcoal-deep border border-charcoal-border hover:border-gold text-gold font-bold text-xs transition"
                          >
                            Cập nhật
                          </button>

                          <Link
                            href={`/staff/orders/${ord.id}/packing-slip`}
                            target="_blank"
                            className="p-1.5 rounded-lg bg-charcoal-deep border border-charcoal-border hover:text-gold text-slate-DEFAULT transition"
                            title="In phiếu đóng gói"
                          >
                            <Printer className="w-4 h-4" />
                          </Link>
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

      {/* Update Order Status Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-charcoal-card border border-charcoal-border rounded-2xl p-6 shadow-2xl">
            <h3 className="font-display font-bold text-base text-ivory mb-1">
              Cập Nhật Trạng Thái Đơn {selectedOrder.orderNumber}
            </h3>
            <p className="text-xs text-slate-subtle mb-4">
              Khách hàng: {selectedOrder.customerName} - {selectedOrder.customerPhone}
            </p>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-subtle mb-1 font-semibold">Trạng thái mới:</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full bg-charcoal-deep border border-charcoal-border rounded-xl p-3 text-ivory focus:outline-none focus:border-gold"
                >
                  <option value="CONFIRMED">Đã xác nhận</option>
                  <option value="PROCESSING">Đang chuẩn bị hàng</option>
                  <option value="SHIPPING">Đã bàn giao vận chuyển</option>
                  <option value="DELIVERED">Đã giao thành công</option>
                  <option value="CANCELLED">Hủy đơn hàng</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-subtle mb-1 font-semibold">Ghi chú nội bộ (Staff note):</label>
                <textarea
                  rows={2}
                  value={internalNote}
                  onChange={(e) => setInternalNote(e.target.value)}
                  placeholder="Ví dụ: Đã kiểm tra hạn sử dụng lô hàng LOT-2026, đóng thùng carton chống sốc..."
                  className="w-full bg-charcoal-deep border border-charcoal-border rounded-xl p-3 text-ivory focus:outline-none focus:border-gold"
                />
              </div>

              <div className="flex gap-3 justify-end pt-3 border-t border-charcoal-border">
                <button
                  type="button"
                  onClick={() => setSelectedOrder(null)}
                  className="px-4 py-2 rounded-xl bg-charcoal-deep border border-charcoal-border text-slate-DEFAULT hover:text-ivory"
                >
                  Đóng
                </button>
                <button
                  type="button"
                  onClick={handleUpdateStatus}
                  disabled={updating}
                  className="px-5 py-2 rounded-xl bg-gold text-charcoal font-bold hover:bg-gold-light shadow-glow disabled:opacity-50"
                >
                  {updating ? 'Đang lưu...' : 'Lưu trạng thái'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

