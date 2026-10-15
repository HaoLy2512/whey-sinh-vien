'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ShoppingCart, Search, Eye, CheckCircle2, RotateCcw, XCircle, Printer } from 'lucide-react';
import { formatCurrency, formatDate, getOrderStatusBadge, getPaymentStatusBadge } from '@/lib/utils';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Status Modal
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [orderStatus, setOrderStatus] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [adminNote, setAdminNote] = useState('');
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

  const handleUpdate = async () => {
    if (!selectedOrder) return;
    setUpdating(true);
    try {
      const res = await fetch(`/api/orders/${selectedOrder.id}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderStatus,
          paymentStatus,
          trackingNumber,
          note: adminNote,
        }),
      });

      if (res.ok) {
        setSelectedOrder(null);
        fetchOrders();
      } else {
        alert('Lỗi cập nhật đơn hàng');
      }
    } catch {
      alert('Lỗi kết nối');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-black text-2xl text-ivory">QUẢN LÝ ĐƠN HÀNG HỆ THỐNG</h1>
          <p className="text-xs text-slate-subtle mt-1">
            Xác nhận thanh toán, theo dõi vận chuyển và xử lý hoàn tiền
          </p>
        </div>

        <div className="flex gap-2 w-full sm:w-auto">
          <input
            type="text"
            placeholder="Tìm mã đơn, tên, SĐT..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchOrders()}
            className="bg-charcoal border border-charcoal-border rounded-xl py-2 px-3 text-xs text-ivory focus:outline-none focus:border-gold w-full sm:w-56"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-charcoal border border-charcoal-border rounded-xl px-3 py-2 text-xs text-ivory focus:outline-none focus:border-gold"
          >
            <option value="ALL">Tất cả</option>
            <option value="PENDING">Chờ xử lý</option>
            <option value="CONFIRMED">Đã xác nhận</option>
            <option value="PROCESSING">Đang chuẩn bị</option>
            <option value="SHIPPING">Đang giao hàng</option>
            <option value="DELIVERED">Đã giao</option>
            <option value="CANCELLED">Đã hủy</option>
          </select>
        </div>
      </div>

      <div className="card-luxury overflow-hidden border-charcoal-border">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-DEFAULT">Đang tải danh sách đơn hàng...</div>
        ) : orders.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-DEFAULT">Không tìm thấy đơn hàng nào.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-charcoal-deep text-slate-subtle uppercase text-[10px] tracking-wider border-b border-charcoal-border">
                <tr>
                  <th className="p-3.5">Mã Đơn & Ngày</th>
                  <th className="p-3.5">Khách Hàng</th>
                  <th className="p-3.5">Tổng Tiền</th>
                  <th className="p-3.5">Thanh Toán</th>
                  <th className="p-3.5">Trạng Thái Đơn</th>
                  <th className="p-3.5">Mã Vận Đơn</th>
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

                      <td className="p-3.5 font-mono text-slate-subtle">
                        {ord.trackingNumber || '-'}
                      </td>

                      <td className="p-3.5 text-right">
                        <button
                          onClick={() => {
                            setSelectedOrder(ord);
                            setOrderStatus(ord.orderStatus);
                            setPaymentStatus(ord.paymentStatus);
                            setTrackingNumber(ord.trackingNumber || '');
                          }}
                          className="px-3 py-1.5 rounded-lg bg-charcoal-deep border border-charcoal-border hover:border-gold text-gold font-bold text-xs transition"
                        >
                          Quản trị
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Admin Order Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-charcoal-card border border-charcoal-border rounded-2xl p-6 shadow-2xl">
            <h3 className="font-display font-bold text-base text-ivory mb-1">
              Quản Trị Đơn Hàng: {selectedOrder.orderNumber}
            </h3>
            <p className="text-xs text-slate-subtle mb-4">
              Khách hàng: {selectedOrder.customerName} • {selectedOrder.customerPhone} • {formatCurrency(selectedOrder.totalAmount)}
            </p>

            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-subtle mb-1 font-semibold">Trạng thái đơn hàng:</label>
                  <select
                    value={orderStatus}
                    onChange={(e) => setOrderStatus(e.target.value)}
                    className="w-full bg-charcoal-deep border border-charcoal-border rounded-xl p-2.5 text-ivory focus:outline-none focus:border-gold"
                  >
                    <option value="PENDING">Chờ xử lý</option>
                    <option value="CONFIRMED">Đã xác nhận</option>
                    <option value="PROCESSING">Đang chuẩn bị hàng</option>
                    <option value="SHIPPING">Đang giao hàng</option>
                    <option value="DELIVERED">Đã giao thành công</option>
                    <option value="CANCELLED">Hủy đơn hàng</option>
                    <option value="RETURNED">Đổi trả / Hoàn tiền</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-subtle mb-1 font-semibold">Trạng thái thanh toán:</label>
                  <select
                    value={paymentStatus}
                    onChange={(e) => setPaymentStatus(e.target.value)}
                    className="w-full bg-charcoal-deep border border-charcoal-border rounded-xl p-2.5 text-ivory focus:outline-none focus:border-gold"
                  >
                    <option value="PENDING">Chưa thanh toán</option>
                    <option value="PAID">Đã thanh toán (PAID)</option>
                    <option value="REFUNDED">Đã hoàn tiền (REFUNDED)</option>
                    <option value="FAILED">Thanh toán thất bại</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-subtle mb-1 font-semibold">Mã vận đơn bưu cục:</label>
                <input
                  type="text"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  placeholder="GHTK-VC-889901"
                  className="w-full bg-charcoal-deep border border-charcoal-border rounded-xl p-2.5 text-ivory font-mono focus:outline-none focus:border-gold"
                />
              </div>

              <div>
                <label className="block text-slate-subtle mb-1 font-semibold">Ghi chú kiểm toán / Lý do thay đổi:</label>
                <textarea
                  rows={2}
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  placeholder="Nhập ghi chú vào nhật ký đơn hàng..."
                  className="w-full bg-charcoal-deep border border-charcoal-border rounded-xl p-2.5 text-ivory focus:outline-none focus:border-gold"
                />
              </div>

              <div className="flex gap-3 justify-end pt-3 border-t border-charcoal-border">
                <button
                  type="button"
                  onClick={() => setSelectedOrder(null)}
                  className="px-4 py-2 rounded-xl bg-charcoal-deep border border-charcoal-border text-slate-DEFAULT"
                >
                  Đóng
                </button>
                <button
                  type="button"
                  onClick={handleUpdate}
                  disabled={updating}
                  className="px-5 py-2 rounded-xl bg-gold text-charcoal font-bold hover:bg-gold-light shadow-glow disabled:opacity-50"
                >
                  {updating ? 'Đang lưu...' : 'Lưu Thay Đổi'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

