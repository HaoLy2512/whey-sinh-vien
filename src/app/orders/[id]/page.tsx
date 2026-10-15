'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  CheckCircle2,
  Clock,
  Truck,
  Package,
  AlertTriangle,
  QrCode,
  Download,
  XCircle,
  ChevronRight,
  ShieldCheck,
  CreditCard,
  User,
  Phone,
  MapPin,
} from 'lucide-react';
import { formatCurrency, formatDate, getOrderStatusBadge, getPaymentStatusBadge } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';

export default function OrderTrackingPage() {
  const params = useParams();
  const orderId = params?.id as string;
  const router = useRouter();
  const { user } = useAuth();

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    if (!orderId) return;
    fetch(`/api/orders/${orderId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.order) setOrder(data.order);
      })
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  }, [orderId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-charcoal flex items-center justify-center p-8">
        <div className="w-12 h-12 rounded-full border-2 border-gold border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-charcoal flex flex-col items-center justify-center p-8 text-center">
        <AlertTriangle className="w-12 h-12 text-rose-500 mb-4" />
        <h2 className="font-display font-bold text-xl text-ivory">Không tìm thấy đơn hàng</h2>
        <p className="text-xs text-slate-subtle mt-1 mb-6">Mã đơn hàng không chính xác hoặc bạn không có quyền xem đơn hàng này</p>
        <Link href="/" className="px-6 py-3 rounded-xl bg-gold text-charcoal font-bold text-xs">
          Trở về trang chủ
        </Link>
      </div>
    );
  }

  const orderBadge = getOrderStatusBadge(order.orderStatus);
  const paymentBadge = getPaymentStatusBadge(order.paymentStatus);

  const canCancel = order.orderStatus === 'PENDING' || order.orderStatus === 'CONFIRMED';

  const handleCancelOrder = async () => {
    setCancelling(true);
    try {
      const res = await fetch(`/api/orders/${order.id}/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: cancelReason }),
      });
      const data = await res.json();
      if (res.ok) {
        setCancelModalOpen(false);
        // Refresh order
        const refreshed = await (await fetch(`/api/orders/${orderId}`)).json();
        if (refreshed.order) setOrder(refreshed.order);
      } else {
        alert(data.message || 'Lỗi khi hủy đơn hàng');
      }
    } catch {
      alert('Lỗi kết nối máy chủ');
    } finally {
      setCancelling(false);
    }
  };

  // VietQR generation url
  const vietQrUrl = `https://api.vietqr.io/image/970407-19036888999999-compact2.jpg?amount=${Math.round(order.totalAmount)}&addInfo=${order.orderNumber}&accountName=CTY%20TNHH%20VITACORE%20VIET%20NAM`;

  return (
    <div className="bg-charcoal min-h-screen py-10">
      <div className="max-w-5xl mx-auto px-4 lg:px-8">
        {/* Header Confirmation Banner */}
        <div className="card-luxury p-6 sm:p-8 border-gold/40 mb-8 bg-gradient-to-r from-charcoal-card via-charcoal to-charcoal-deep">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center justify-center flex-shrink-0">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div>
                <span className="text-xs font-semibold text-gold-light uppercase tracking-wider">
                  Đặt Hàng Thành Công
                </span>
                <h1 className="font-display font-extrabold text-xl sm:text-2xl text-ivory">
                  MÃ ĐƠN HÀNG: <span className="text-gold font-mono">{order.orderNumber}</span>
                </h1>
                <p className="text-xs text-slate-DEFAULT mt-0.5">
                  Ngày đặt: {formatDate(order.createdAt)} • Cập nhật lần cuối: {formatDate(order.updatedAt)}
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:items-end gap-2">
              <span className={`px-3 py-1 rounded-full text-xs font-bold border ${orderBadge.color}`}>
                {orderBadge.label}
              </span>
              <span className={`px-3 py-1 rounded-full text-xs font-bold border ${paymentBadge.color}`}>
                {paymentBadge.label}
              </span>
            </div>
          </div>
        </div>

        {/* VietQR Bank Transfer Box if Chosen */}
        {order.paymentMethod === 'BANK_TRANSFER' && order.paymentStatus !== 'PAID' && (
          <div className="card-luxury p-6 border-gold/60 mb-8 bg-gold/5">
            <div className="flex items-start gap-3 mb-4">
              <QrCode className="w-6 h-6 text-gold flex-shrink-0" />
              <div>
                <h3 className="font-display font-bold text-base text-gold">
                  HƯỚNG DẪN THANH TOÁN CHUYỂN KHOẢN QUA VIETQR
                </h3>
                <p className="text-xs text-slate-subtle">
                  Vui lòng quét mã QR hoặc chuyển khoản chính xác nội dung bên dưới để hệ thống kích hoạt tự động:
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
              <div className="md:col-span-5 flex justify-center">
                <div className="p-3 bg-white rounded-xl shadow-lg">
                  <img
                    src={vietQrUrl}
                    alt="VietQR Payment"
                    className="w-48 h-48 object-contain"
                  />
                </div>
              </div>

              <div className="md:col-span-7 space-y-2.5 text-xs">
                <div className="flex justify-between border-b border-charcoal-border/80 pb-1.5">
                  <span className="text-slate-subtle">Ngân hàng:</span>
                  <strong className="text-ivory">Techcombank (Ngân hàng Kỹ Thương)</strong>
                </div>
                <div className="flex justify-between border-b border-charcoal-border/80 pb-1.5">
                  <span className="text-slate-subtle">Số tài khoản:</span>
                  <strong className="text-gold font-mono text-sm">19036888999999</strong>
                </div>
                <div className="flex justify-between border-b border-charcoal-border/80 pb-1.5">
                  <span className="text-slate-subtle">Chủ tài khoản:</span>
                  <strong className="text-ivory uppercase">CTY TNHH VITACORE VIET NAM</strong>
                </div>
                <div className="flex justify-between border-b border-charcoal-border/80 pb-1.5">
                  <span className="text-slate-subtle">Số tiền chính xác:</span>
                  <strong className="text-emerald-400 font-mono text-sm">{formatCurrency(order.totalAmount)}</strong>
                </div>
                <div className="flex justify-between border-b border-charcoal-border/80 pb-1.5">
                  <span className="text-slate-subtle">Nội dung chuyển khoản:</span>
                  <strong className="text-gold font-mono text-sm">{order.orderNumber}</strong>
                </div>
                <p className="text-[11px] text-slate-DEFAULT italic pt-2">
                  * Hệ thống sẽ tự động đối soát và cập nhật trạng thái "Đã thanh toán" sau 1-3 phút.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Order Details & Summary Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Order Items & Delivery Info */}
          <div className="lg:col-span-8 space-y-6">
            {/* Items */}
            <div className="card-luxury p-6 border-charcoal-border/80">
              <h3 className="font-display font-bold text-base text-ivory mb-4 pb-2 border-b border-charcoal-border/60">
                Sản phẩm trong đơn hàng
              </h3>

              <div className="divide-y divide-charcoal-border/60">
                {order.items.map((item: any) => (
                  <div key={item.id} className="py-4 flex justify-between items-center gap-4">
                    <div>
                      <h4 className="font-bold text-sm text-ivory">{item.productName}</h4>
                      {item.variantTitle && (
                        <p className="text-xs text-gold-light mt-0.5">{item.variantTitle}</p>
                      )}
                      <p className="text-[11px] text-slate-DEFAULT mt-0.5 font-mono">
                        SKU: {item.productSku} • Đơn giá: {formatCurrency(item.price)}
                      </p>
                    </div>

                    <div className="text-right flex-shrink-0">
                      <span className="text-xs text-slate-subtle block">x{item.quantity}</span>
                      <span className="font-bold font-mono text-sm text-gold">
                        {formatCurrency(item.total)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Delivery & Customer Info */}
            <div className="card-luxury p-6 border-charcoal-border/80">
              <h3 className="font-display font-bold text-base text-ivory mb-4 pb-2 border-b border-charcoal-border/60">
                Thông tin giao nhận hàng
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-slate-subtle block mb-1">Người nhận hàng:</span>
                  <p className="font-bold text-ivory flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-gold" />
                    {order.customerName}
                  </p>
                </div>

                <div>
                  <span className="text-slate-subtle block mb-1">Số điện thoại:</span>
                  <p className="font-bold text-ivory flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-gold" />
                    {order.customerPhone}
                  </p>
                </div>

                <div className="sm:col-span-2">
                  <span className="text-slate-subtle block mb-1">Địa chỉ giao hàng:</span>
                  <p className="font-bold text-ivory flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-gold flex-shrink-0" />
                    {order.shippingAddress}
                  </p>
                </div>

                <div>
                  <span className="text-slate-subtle block mb-1">Phương thức thanh toán:</span>
                  <strong className="text-ivory">{order.paymentMethod}</strong>
                </div>

                <div>
                  <span className="text-slate-subtle block mb-1">Mã vận đơn:</span>
                  <strong className="text-gold font-mono">{order.trackingNumber || 'Đang cấp mã'}</strong>
                </div>
              </div>
            </div>

            {/* Status History Timeline */}
            {order.statusHistory && order.statusHistory.length > 0 && (
              <div className="card-luxury p-6 border-charcoal-border/80">
                <h3 className="font-display font-bold text-base text-ivory mb-4 pb-2 border-b border-charcoal-border/60">
                  Tiến trình xử lý đơn hàng
                </h3>

                <div className="space-y-4 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-charcoal-border">
                  {order.statusHistory.map((hist: any) => (
                    <div key={hist.id} className="flex items-start gap-4 relative pl-8">
                      <div className="w-2.5 h-2.5 rounded-full bg-gold absolute left-2 top-1.5 shadow-glow" />
                      <div>
                        <p className="font-bold text-xs text-ivory">
                          {getOrderStatusBadge(hist.newStatus).label}
                        </p>
                        {hist.note && <p className="text-[11px] text-slate-subtle mt-0.5">{hist.note}</p>}
                        <span className="text-[10px] text-slate-DEFAULT block mt-1">
                          {formatDate(hist.createdAt)} • Bởi: {hist.changedBy}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Pricing Breakdown & Actions */}
          <div className="lg:col-span-4 space-y-6">
            <div className="card-luxury p-6 border-charcoal-border/80 sticky top-24">
              <h3 className="font-display font-bold text-base text-ivory pb-3 mb-4 border-b border-charcoal-border/60">
                CHI TIẾT THANH TOÁN
              </h3>

              <div className="space-y-2.5 text-xs text-slate-subtle pb-4 border-b border-charcoal-border/60">
                <div className="flex justify-between">
                  <span>Tạm tính hàng:</span>
                  <span className="font-mono text-ivory">{formatCurrency(order.subtotal)}</span>
                </div>

                {order.discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-400 font-semibold">
                    <span>Mã giảm giá ({order.couponCode}):</span>
                    <span className="font-mono">-{formatCurrency(order.discountAmount)}</span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span>Phí giao hàng:</span>
                  <span className="font-mono">
                    {order.shippingFee === 0 ? <strong className="text-emerald-400">MIỄN PHÍ</strong> : formatCurrency(order.shippingFee)}
                  </span>
                </div>
              </div>

              <div className="py-4 flex justify-between items-baseline">
                <span className="font-bold text-sm text-ivory">Tổng thanh toán:</span>
                <span className="font-display font-black text-2xl text-gold">
                  {formatCurrency(order.totalAmount)}
                </span>
              </div>

              {/* Action buttons */}
              <div className="space-y-3 pt-4 border-t border-charcoal-border/60">
                <button
                  onClick={() => window.print()}
                  className="w-full py-3 rounded-xl bg-charcoal-deep hover:bg-charcoal-hover border border-charcoal-border text-ivory text-xs font-bold transition flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  In phiếu đơn hàng
                </button>

                {canCancel && (
                  <button
                    onClick={() => setCancelModalOpen(true)}
                    className="w-full py-3 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 text-xs font-bold transition flex items-center justify-center gap-2"
                  >
                    <XCircle className="w-4 h-4" />
                    Yêu cầu hủy đơn hàng
                  </button>
                )}

                <Link
                  href="/products"
                  className="block text-center text-xs text-gold-light hover:text-gold pt-2"
                >
                  ← Tiếp tục mua sắm
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Cancel Order Modal */}
      {cancelModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-charcoal-card border border-charcoal-border rounded-2xl p-6 shadow-2xl">
            <h3 className="font-display font-bold text-lg text-ivory mb-2">Xác nhận hủy đơn hàng</h3>
            <p className="text-xs text-slate-subtle mb-4">
              Khi bạn hủy đơn hàng, các sản phẩm sẽ được tự động hoàn lại tồn kho cho hệ thống. Vui lòng cho biết lý do hủy:
            </p>

            <textarea
              rows={3}
              placeholder="Lý do hủy đơn (đổi ý, đặt nhầm sản phẩm, đổi địa chỉ...)"
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              className="w-full bg-charcoal-deep border border-charcoal-border rounded-xl p-3 text-xs text-ivory focus:outline-none focus:border-gold mb-4"
            />

            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => setCancelModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-charcoal-deep border border-charcoal-border text-xs text-slate-DEFAULT hover:text-ivory"
              >
                Đóng
              </button>
              <button
                type="button"
                onClick={handleCancelOrder}
                disabled={cancelling}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-glow disabled:opacity-50"
              >
                {cancelling ? 'Đang hủy...' : 'Đồng ý hủy đơn'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

