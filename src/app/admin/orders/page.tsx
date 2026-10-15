'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ShoppingCart,
  Search,
  Eye,
  CheckCircle2,
  RotateCcw,
  XCircle,
  Printer,
  X,
  Package,
  User,
  Phone,
  MapPin,
  CreditCard,
  Clock,
  Truck,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';
import {
  formatCurrency,
  formatDate,
  getOrderStatusBadge,
  getPaymentStatusBadge,
} from '@/lib/utils';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Order Detail & Status Modal
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'details' | 'update'>('details');
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
        if (data.orders) {
          setOrders(data.orders);
          // If modal is open, refresh selected order data
          if (selectedOrder) {
            const updated = data.orders.find((o: any) => o.id === selectedOrder.id);
            if (updated) setSelectedOrder(updated);
          }
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchOrders();
  }, [statusFilter]);

  const openOrderModal = (ord: any, tab: 'details' | 'update' = 'details') => {
    setSelectedOrder(ord);
    setActiveTab(tab);
    setOrderStatus(ord.orderStatus);
    setPaymentStatus(ord.paymentStatus);
    setTrackingNumber(ord.trackingNumber || '');
    setAdminNote('');
  };

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
        // Fetch fresh order details
        const refreshed = await (await fetch(`/api/orders/${selectedOrder.id}`)).json();
        if (refreshed.order) {
          setSelectedOrder(refreshed.order);
        }
        fetchOrders();
        alert('Cập nhật trạng thái đơn hàng thành công!');
      } else {
        alert('Lỗi cập nhật đơn hàng');
      }
    } catch {
      alert('Lỗi kết nối máy chủ');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-black text-2xl text-ivory">QUẢN LÝ ĐƠN HÀNG HỆ THỐNG</h1>
          <p className="text-xs text-slate-subtle mt-1">
            Bấm vào bất kỳ đơn hàng nào để xem chi tiết, in phiếu xuất kho hoặc cập nhật trạng thái
          </p>
        </div>

        <div className="flex gap-2 w-full sm:w-auto">
          <input
            type="text"
            placeholder="Tìm mã đơn, tên khách, SĐT..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchOrders()}
            className="bg-charcoal border border-charcoal-border rounded-xl py-2 px-3 text-xs text-ivory focus:outline-none focus:border-gold w-full sm:w-64"
          />
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
            <option value="DELIVERED">Đã giao thành công</option>
            <option value="CANCELLED">Đã hủy</option>
            <option value="RETURNED">Đổi trả / Hoàn tiền</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
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
                  <th className="p-3.5">Sản Phẩm</th>
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
                  const itemCount = ord.items?.reduce((sum: number, it: any) => sum + it.quantity, 0) || ord.items?.length || 1;

                  return (
                    <tr
                      key={ord.id}
                      onClick={() => openOrderModal(ord, 'details')}
                      className="hover:bg-charcoal-hover cursor-pointer transition group"
                      title="Bấm để xem chi tiết và in phiếu đơn hàng"
                    >
                      <td className="p-3.5">
                        <span className="font-mono font-bold text-gold group-hover:underline block">
                          {ord.orderNumber}
                        </span>
                        <span className="text-[10px] text-slate-DEFAULT">{formatDate(ord.createdAt)}</span>
                      </td>

                      <td className="p-3.5">
                        <strong className="block text-ivory">{ord.customerName}</strong>
                        <span className="text-[11px] text-slate-DEFAULT">{ord.customerPhone}</span>
                      </td>

                      <td className="p-3.5 text-slate-subtle text-[11px]">
                        <span className="inline-block px-2 py-0.5 rounded bg-charcoal-deep border border-charcoal-border font-medium">
                          {itemCount} món hàng
                        </span>
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

                      <td className="p-3.5 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Print Slip Button */}
                          <Link
                            href={`/admin/orders/${ord.id}/print`}
                            target="_blank"
                            className="p-1.5 rounded-lg bg-charcoal-deep border border-charcoal-border hover:border-gold text-slate-DEFAULT hover:text-gold transition flex items-center gap-1 text-[11px] font-semibold"
                            title="In phiếu xuất kho & giao hàng"
                          >
                            <Printer className="w-3.5 h-3.5 text-gold" />
                            <span className="hidden lg:inline">In phiếu</span>
                          </Link>

                          {/* View Detail & Edit Button */}
                          <button
                            onClick={() => openOrderModal(ord, 'details')}
                            className="p-1.5 rounded-lg bg-gold/10 border border-gold/30 hover:bg-gold text-gold hover:text-charcoal transition flex items-center gap-1 text-[11px] font-bold"
                            title="Xem chi tiết & Quản lý"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span className="hidden lg:inline">Chi tiết</span>
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

      {/* Comprehensive Order Detail & Management Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="w-full max-w-4xl bg-charcoal-card border border-charcoal-border rounded-2xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
            {/* Modal Header */}
            <div className="p-5 border-b border-charcoal-border bg-charcoal-deep/80 flex items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2.5">
                  <span className="font-mono font-black text-lg text-gold">
                    ĐƠN HÀNG: {selectedOrder.orderNumber}
                  </span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                      getOrderStatusBadge(selectedOrder.orderStatus).color
                    }`}
                  >
                    {getOrderStatusBadge(selectedOrder.orderStatus).label}
                  </span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                      getPaymentStatusBadge(selectedOrder.paymentStatus).color
                    }`}
                  >
                    {getPaymentStatusBadge(selectedOrder.paymentStatus).label}
                  </span>
                </div>
                <p className="text-xs text-slate-subtle mt-0.5">
                  Thời gian đặt: {formatDate(selectedOrder.createdAt)} &bull; Hình thức:{' '}
                  <strong className="text-ivory uppercase">{selectedOrder.paymentMethod}</strong>
                </p>
              </div>

              <div className="flex items-center gap-2">
                {/* Print Button directly in Modal */}
                <Link
                  href={`/admin/orders/${selectedOrder.id}/print`}
                  target="_blank"
                  className="px-4 py-2 rounded-xl bg-gold text-charcoal font-bold text-xs hover:bg-gold-light transition shadow-glow flex items-center gap-1.5"
                >
                  <Printer className="w-4 h-4" />
                  In Phiếu Đơn Hàng
                </Link>

                <button
                  onClick={() => setSelectedOrder(null)}
                  className="p-2 rounded-xl bg-charcoal-border/50 text-slate-DEFAULT hover:text-ivory hover:bg-charcoal-border transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Tab Switcher */}
            <div className="flex border-b border-charcoal-border px-6 bg-charcoal-deep/40">
              <button
                onClick={() => setActiveTab('details')}
                className={`py-3 px-4 font-bold text-xs border-b-2 transition flex items-center gap-2 ${
                  activeTab === 'details'
                    ? 'border-gold text-gold'
                    : 'border-transparent text-slate-DEFAULT hover:text-ivory'
                }`}
              >
                <Package className="w-4 h-4" />
                Chi Tiết Sản Phẩm & Khách Hàng
              </button>
              <button
                onClick={() => setActiveTab('update')}
                className={`py-3 px-4 font-bold text-xs border-b-2 transition flex items-center gap-2 ${
                  activeTab === 'update'
                    ? 'border-gold text-gold'
                    : 'border-transparent text-slate-DEFAULT hover:text-ivory'
                }`}
              >
                <Truck className="w-4 h-4" />
                Cập Nhật Trạng Thái & Vận Chuyển
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
              {activeTab === 'details' ? (
                <>
                  {/* Customer & Shipping Summary Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-charcoal-deep border border-charcoal-border">
                      <div className="flex items-center gap-2 text-gold font-bold mb-3 uppercase tracking-wider text-[11px]">
                        <User className="w-4 h-4" /> Thông Tin Người Nhận
                      </div>
                      <div className="space-y-1.5 text-slate-subtle">
                        <p>
                          Họ và tên: <strong className="text-ivory text-sm">{selectedOrder.customerName}</strong>
                        </p>
                        <p>
                          Số điện thoại: <strong className="text-gold font-mono">{selectedOrder.customerPhone}</strong>
                        </p>
                        {selectedOrder.customerEmail && (
                          <p>
                            Email: <strong className="text-ivory">{selectedOrder.customerEmail}</strong>
                          </p>
                        )}
                        <p className="pt-1 leading-relaxed">
                          <span className="flex items-start gap-1">
                            <MapPin className="w-3.5 h-3.5 text-gold shrink-0 mt-0.5" />
                            <strong className="text-ivory">{selectedOrder.shippingAddress}</strong>
                          </span>
                        </p>
                        {selectedOrder.customerNote && (
                          <p className="mt-2 p-2 rounded bg-charcoal border border-charcoal-border text-gold-light italic">
                            Lời nhắn khách: &ldquo;{selectedOrder.customerNote}&rdquo;
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-charcoal-deep border border-charcoal-border">
                      <div className="flex items-center gap-2 text-gold font-bold mb-3 uppercase tracking-wider text-[11px]">
                        <CreditCard className="w-4 h-4" /> Thanh Toán & Vận Chuyển
                      </div>
                      <div className="space-y-2 text-slate-subtle">
                        <div className="flex justify-between">
                          <span>Phương thức:</span>
                          <strong className="text-ivory uppercase">{selectedOrder.paymentMethod}</strong>
                        </div>
                        <div className="flex justify-between">
                          <span>Trạng thái thanh toán:</span>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                              getPaymentStatusBadge(selectedOrder.paymentStatus).color
                            }`}
                          >
                            {getPaymentStatusBadge(selectedOrder.paymentStatus).label}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Mã vận đơn bưu cục:</span>
                          <strong className="font-mono text-gold">
                            {selectedOrder.trackingNumber || 'Chưa có'}
                          </strong>
                        </div>
                        <div className="flex justify-between">
                          <span>Tạm tính tiền hàng:</span>
                          <span className="font-mono text-ivory">
                            {formatCurrency(selectedOrder.subtotal || selectedOrder.totalAmount)}
                          </span>
                        </div>
                        {selectedOrder.discountAmount > 0 && (
                          <div className="flex justify-between text-emerald-400">
                            <span>Giảm giá khuyến mãi:</span>
                            <span className="font-mono">-{formatCurrency(selectedOrder.discountAmount)}</span>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span>Phí giao hàng:</span>
                          <span className="font-mono text-ivory">
                            {selectedOrder.shippingFee ? formatCurrency(selectedOrder.shippingFee) : '0 đ (Freeship)'}
                          </span>
                        </div>
                        <div className="pt-2 border-t border-charcoal-border flex justify-between font-black text-sm text-gold">
                          <span>Tổng cộng thanh toán:</span>
                          <span className="font-mono text-base">{formatCurrency(selectedOrder.totalAmount)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Items Table */}
                  <div>
                    <h3 className="font-bold text-ivory mb-3 flex items-center gap-2 uppercase tracking-wide text-[11px]">
                      <Package className="w-4 h-4 text-gold" />
                      Danh Sách Sản Phẩm Trong Đơn ({selectedOrder.items?.length || 0} mục)
                    </h3>
                    <div className="border border-charcoal-border rounded-xl overflow-hidden bg-charcoal-deep">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-charcoal text-slate-subtle uppercase text-[10px] border-b border-charcoal-border">
                          <tr>
                            <th className="p-3">Sản phẩm</th>
                            <th className="p-3 text-center">SKU</th>
                            <th className="p-3 text-right">Giá bán</th>
                            {/* Confidential COGS Price for Admin */}
                            <th className="p-3 text-right">Giá vốn (COGS)</th>
                            <th className="p-3 text-center">SL</th>
                            <th className="p-3 text-right">Thành tiền</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-charcoal-border text-ivory">
                          {selectedOrder.items?.map((it: any) => (
                            <tr key={it.id} className="hover:bg-charcoal/40">
                              <td className="p-3">
                                <strong className="block text-ivory">{it.productName}</strong>
                                {it.variantTitle && (
                                  <span className="text-[11px] text-slate-subtle">
                                    Phân loại: {it.variantTitle}
                                  </span>
                                )}
                              </td>
                              <td className="p-3 text-center font-mono text-slate-subtle text-[11px]">
                                {it.productSku || '-'}
                              </td>
                              <td className="p-3 text-right font-mono text-ivory">
                                {formatCurrency(it.unitPrice)}
                              </td>
                              <td className="p-3 text-right font-mono text-slate-DEFAULT">
                                {formatCurrency(it.costPrice || 0)}
                              </td>
                              <td className="p-3 text-center font-mono font-bold text-gold">
                                x{it.quantity}
                              </td>
                              <td className="p-3 text-right font-mono font-bold text-ivory">
                                {formatCurrency(it.subtotal || it.unitPrice * it.quantity)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Status Timeline History */}
                  {selectedOrder.statusHistory && selectedOrder.statusHistory.length > 0 && (
                    <div>
                      <h3 className="font-bold text-ivory mb-3 flex items-center gap-2 uppercase tracking-wide text-[11px]">
                        <Clock className="w-4 h-4 text-gold" />
                        Nhật Ký & Lịch Sử Trạng Thái Đơn Hàng
                      </h3>
                      <div className="space-y-2 border border-charcoal-border rounded-xl p-4 bg-charcoal-deep">
                        {selectedOrder.statusHistory.map((hist: any, index: number) => (
                          <div
                            key={hist.id || index}
                            className="flex items-start justify-between border-b border-charcoal-border/50 pb-2 last:border-b-0 last:pb-0"
                          >
                            <div>
                              <span className="font-bold text-gold">{hist.status}</span>
                              {hist.note && (
                                <p className="text-slate-subtle text-[11px] mt-0.5">{hist.note}</p>
                              )}
                            </div>
                            <span className="text-[10px] text-slate-DEFAULT font-mono">
                              {formatDate(hist.createdAt)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                /* Management & Status Update Tab */
                <div className="max-w-xl mx-auto space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-subtle mb-1.5 font-semibold">
                        Trạng thái đơn hàng:
                      </label>
                      <select
                        value={orderStatus}
                        onChange={(e) => setOrderStatus(e.target.value)}
                        className="w-full bg-charcoal-deep border border-charcoal-border rounded-xl p-3 text-ivory focus:outline-none focus:border-gold font-medium"
                      >
                        <option value="PENDING">Chờ xử lý (PENDING)</option>
                        <option value="CONFIRMED">Đã xác nhận (CONFIRMED)</option>
                        <option value="PROCESSING">Đang chuẩn bị hàng (PROCESSING)</option>
                        <option value="SHIPPING">Đang giao hàng (SHIPPING)</option>
                        <option value="DELIVERED">Đã giao thành công (DELIVERED)</option>
                        <option value="CANCELLED">Hủy đơn hàng (CANCELLED)</option>
                        <option value="RETURNED">Đổi trả / Hoàn tiền (RETURNED)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-subtle mb-1.5 font-semibold">
                        Trạng thái thanh toán:
                      </label>
                      <select
                        value={paymentStatus}
                        onChange={(e) => setPaymentStatus(e.target.value)}
                        className="w-full bg-charcoal-deep border border-charcoal-border rounded-xl p-3 text-ivory focus:outline-none focus:border-gold font-medium"
                      >
                        <option value="PENDING">Chưa thanh toán (PENDING)</option>
                        <option value="PAID">Đã thanh toán (PAID)</option>
                        <option value="REFUNDED">Đã hoàn tiền (REFUNDED)</option>
                        <option value="FAILED">Thanh toán thất bại (FAILED)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-subtle mb-1.5 font-semibold">
                      Mã vận đơn bưu cục (GHTK / GHN / ViettelPost):
                    </label>
                    <input
                      type="text"
                      value={trackingNumber}
                      onChange={(e) => setTrackingNumber(e.target.value)}
                      placeholder="Ví dụ: GHTK-VC-889901"
                      className="w-full bg-charcoal-deep border border-charcoal-border rounded-xl p-3 text-ivory font-mono focus:outline-none focus:border-gold"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-subtle mb-1.5 font-semibold">
                      Ghi chú kiểm toán / Lý do cập nhật:
                    </label>
                    <textarea
                      rows={3}
                      value={adminNote}
                      onChange={(e) => setAdminNote(e.target.value)}
                      placeholder="Nhập lý do thay đổi trạng thái, thông tin bưu cục hoặc ghi chú nội bộ..."
                      className="w-full bg-charcoal-deep border border-charcoal-border rounded-xl p-3 text-ivory focus:outline-none focus:border-gold"
                    />
                  </div>

                  <div className="pt-4 flex gap-3 justify-end">
                    <button
                      type="button"
                      onClick={() => setSelectedOrder(null)}
                      className="px-5 py-2.5 rounded-xl bg-charcoal-deep border border-charcoal-border text-slate-DEFAULT hover:text-ivory"
                    >
                      Đóng
                    </button>
                    <button
                      type="button"
                      onClick={handleUpdate}
                      disabled={updating}
                      className="px-6 py-2.5 rounded-xl bg-gold text-charcoal font-bold hover:bg-gold-light shadow-glow disabled:opacity-50 flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      {updating ? 'Đang lưu...' : 'Lưu Thay Đổi'}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Bottom Quick Bar */}
            <div className="p-4 border-t border-charcoal-border bg-charcoal-deep/80 flex items-center justify-between">
              <span className="text-[11px] text-slate-subtle">
                Mã định danh hệ thống (ID): <strong className="font-mono text-slate-DEFAULT">{selectedOrder.id}</strong>
              </span>

              <div className="flex gap-2">
                <Link
                  href={`/admin/orders/${selectedOrder.id}/print`}
                  target="_blank"
                  className="px-4 py-2 rounded-xl bg-charcoal border border-charcoal-border hover:border-gold text-gold font-bold text-xs flex items-center gap-1.5 transition"
                >
                  <Printer className="w-3.5 h-3.5" />
                  Mở bản in toàn trang
                </Link>
                <button
                  type="button"
                  onClick={() => setSelectedOrder(null)}
                  className="px-4 py-2 rounded-xl bg-charcoal border border-charcoal-border text-slate-DEFAULT hover:text-ivory text-xs"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
