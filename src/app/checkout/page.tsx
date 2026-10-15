'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { formatCurrency } from '@/lib/utils';
import {
  ShieldCheck,
  CreditCard,
  Truck,
  Check,
  ChevronRight,
  AlertCircle,
  MapPin,
  Lock,
  QrCode,
  Wallet,
} from 'lucide-react';

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal, discountAmount, shippingFee, totalAmount, appliedCoupon, clearCart } = useCart();
  const { user } = useAuth();

  // Form Fields
  const [customerName, setCustomerName] = useState(user?.fullName || '');
  const [customerEmail, setCustomerEmail] = useState(user?.email || '');
  const [customerPhone, setCustomerPhone] = useState(user?.phone || '');
  const [shippingAddress, setShippingAddress] = useState('');
  const [province, setProvince] = useState('Hồ Chí Minh');
  const [customerNotes, setCustomerNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'COD' | 'BANK_TRANSFER' | 'MOMO' | 'VNPAY'>('COD');

  const [savedAddresses, setSavedAddresses] = useState<any[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Fetch saved user addresses if logged in
  useEffect(() => {
    if (user) {
      if (!customerName) setCustomerName(user.fullName);
      if (!customerEmail) setCustomerEmail(user.email);
      if (!customerPhone && user.phone) setCustomerPhone(user.phone);

      fetch('/api/user/addresses')
        .then((res) => res.json())
        .then((data) => {
          if (data.addresses && data.addresses.length > 0) {
            setSavedAddresses(data.addresses);
            const defaultAddr = data.addresses.find((a: any) => a.isDefault) || data.addresses[0];
            setShippingAddress(defaultAddr.streetAddress);
            setProvince(defaultAddr.province);
            if (defaultAddr.receiverName) setCustomerName(defaultAddr.receiverName);
            if (defaultAddr.phone) setCustomerPhone(defaultAddr.phone);
          }
        })
        .catch(() => {});
    }
  }, [user]);

  // If cart is empty, redirect back
  useEffect(() => {
    if (items.length === 0) {
      router.push('/cart');
    }
  }, [items, router]);

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!customerName || !customerPhone || !shippingAddress || !customerEmail) {
      setErrorMessage('Vui lòng điền đầy đủ họ tên, số điện thoại, email nhận đơn và địa chỉ giao hàng');
      return;
    }

    setSubmitting(true);

    try {
      // 1. Create order in Database with snapshot numbers
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName,
          customerEmail,
          customerPhone,
          shippingAddress,
          province,
          paymentMethod,
          couponCode: appliedCoupon?.code,
          customerNotes,
          items: items.map((i) => ({
            productId: i.productId,
            variantId: i.variantId,
            quantity: i.quantity,
          })),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.message || 'Lỗi khi tạo đơn hàng');
        setSubmitting(false);
        return;
      }

      const orderId = data.order.id;

      // 2. Clear user cart
      clearCart();

      // 3. Process payment gateway routing
      if (paymentMethod === 'MOMO') {
        const momoRes = await fetch('/api/payments/momo/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ orderId }),
        });
        const momoData = await momoRes.json();
        if (momoData.payUrl) {
          window.location.href = momoData.payUrl;
          return;
        }
      } else if (paymentMethod === 'VNPAY') {
        const vnpayRes = await fetch('/api/payments/vnpay/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ orderId }),
        });
        const vnpayData = await vnpayRes.json();
        if (vnpayData.payUrl) {
          window.location.href = vnpayData.payUrl;
          return;
        }
      }

      // COD or Bank Transfer: redirect directly to order tracking receipt
      router.push(`/orders/${orderId}`);
    } catch {
      setErrorMessage('Lỗi kết nối máy chủ khi xử lý đơn hàng');
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-charcoal min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 lg:px-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-slate-DEFAULT mb-6">
          <Link href="/" className="hover:text-gold transition">Trang chủ</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <Link href="/cart" className="hover:text-gold transition">Giỏ hàng</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-ivory font-semibold">Thanh toán & Đặt hàng</span>
        </div>

        <h1 className="font-display font-black text-2xl sm:text-3xl text-ivory mb-8">
          THÔNG TIN GIAO HÀNG & THANH TOÁN
        </h1>

        {errorMessage && (
          <div className="p-4 mb-6 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmitOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Shipping & Payment Options */}
          <div className="lg:col-span-7 space-y-6">
            {/* Step 1: Customer Details */}
            <div className="card-luxury p-6 border-charcoal-border/80">
              <h2 className="font-display font-bold text-base text-ivory mb-4 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-gold" />
                1. Địa Chỉ Nhận Hàng
              </h2>

              {/* Saved addresses selector */}
              {savedAddresses.length > 0 && (
                <div className="mb-4 p-3 rounded-xl bg-charcoal-deep border border-charcoal-border">
                  <span className="text-xs font-semibold text-slate-subtle block mb-2">Chọn từ sổ địa chỉ:</span>
                  <div className="space-y-2">
                    {savedAddresses.map((addr) => (
                      <button
                        key={addr.id}
                        type="button"
                        onClick={() => {
                          setShippingAddress(addr.streetAddress);
                          setProvince(addr.province);
                          if (addr.receiverName) setCustomerName(addr.receiverName);
                          if (addr.phone) setCustomerPhone(addr.phone);
                        }}
                        className={`w-full text-left p-2.5 rounded-lg border text-xs flex justify-between items-center transition ${
                          shippingAddress === addr.streetAddress
                            ? 'border-gold bg-gold/10 text-ivory'
                            : 'border-charcoal-border text-slate-DEFAULT hover:border-slate-DEFAULT'
                        }`}
                      >
                        <div>
                          <strong className="text-ivory">{addr.receiverName}</strong> - {addr.phone}
                          <p className="text-[11px] text-slate-subtle mt-0.5">{addr.streetAddress}, {addr.province}</p>
                        </div>
                        {shippingAddress === addr.streetAddress && (
                          <Check className="w-4 h-4 text-gold" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-subtle mb-1">
                    Họ và tên người nhận *
                  </label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full bg-charcoal-deep border border-charcoal-border rounded-xl p-3 text-xs text-ivory focus:outline-none focus:border-gold"
                    placeholder="Nguyễn Văn A"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-subtle mb-1">
                    Số điện thoại liên hệ *
                  </label>
                  <input
                    type="tel"
                    required
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full bg-charcoal-deep border border-charcoal-border rounded-xl p-3 text-xs text-ivory focus:outline-none focus:border-gold"
                    placeholder="0909 123 456"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-subtle mb-1 flex items-center justify-between">
                    <span>Email nhận xác nhận đơn hàng *</span>
                    <span className="text-[10px] text-gold font-normal">Hệ thống sẽ gửi hóa đơn điện tử về email này</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    className="w-full bg-charcoal-deep border border-charcoal-border rounded-xl p-3 text-xs text-ivory focus:outline-none focus:border-gold"
                    placeholder="vidu@gmail.com"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-subtle mb-1">
                    Địa chỉ chi tiết (Số nhà, tên đường, phường/xã) *
                  </label>
                  <input
                    type="text"
                    required
                    value={shippingAddress}
                    onChange={(e) => setShippingAddress(e.target.value)}
                    className="w-full bg-charcoal-deep border border-charcoal-border rounded-xl p-3 text-xs text-ivory focus:outline-none focus:border-gold"
                    placeholder="Số 123 Đường Võ Văn Tần, Phường 6"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-subtle mb-1">
                    Tỉnh / Thành phố *
                  </label>
                  <select
                    value={province}
                    onChange={(e) => setProvince(e.target.value)}
                    className="w-full bg-charcoal-deep border border-charcoal-border rounded-xl p-3 text-xs text-ivory focus:outline-none focus:border-gold"
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

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-subtle mb-1">
                    Ghi chú giao hàng (Tùy chọn)
                  </label>
                  <input
                    type="text"
                    value={customerNotes}
                    onChange={(e) => setCustomerNotes(e.target.value)}
                    className="w-full bg-charcoal-deep border border-charcoal-border rounded-xl p-3 text-xs text-ivory focus:outline-none focus:border-gold"
                    placeholder="Ví dụ: Giao giờ hành chính, gọi trước khi giao..."
                  />
                </div>
              </div>
            </div>

            {/* Step 2: Payment Method */}
            <div className="card-luxury p-6 border-charcoal-border/80">
              <h2 className="font-display font-bold text-base text-ivory mb-4 flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-gold" />
                2. Phương Thức Thanh Toán
              </h2>

              <div className="space-y-3">
                {/* COD */}
                <label
                  className={`p-4 rounded-xl border flex items-center justify-between cursor-pointer transition ${
                    paymentMethod === 'COD'
                      ? 'border-gold bg-gold/10'
                      : 'border-charcoal-border bg-charcoal-deep hover:border-slate-DEFAULT'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="paymentMethod"
                      checked={paymentMethod === 'COD'}
                      onChange={() => setPaymentMethod('COD')}
                      className="text-gold focus:ring-0"
                    />
                    <div>
                      <span className="font-bold text-xs text-ivory block">Thanh toán khi nhận hàng (COD)</span>
                      <span className="text-[11px] text-slate-subtle">Kiểm tra tem và thanh toán tiền mặt cho shipper</span>
                    </div>
                  </div>
                  <Truck className="w-5 h-5 text-slate-DEFAULT" />
                </label>

                {/* Bank Transfer QR */}
                <label
                  className={`p-4 rounded-xl border flex items-center justify-between cursor-pointer transition ${
                    paymentMethod === 'BANK_TRANSFER'
                      ? 'border-gold bg-gold/10'
                      : 'border-charcoal-border bg-charcoal-deep hover:border-slate-DEFAULT'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="paymentMethod"
                      checked={paymentMethod === 'BANK_TRANSFER'}
                      onChange={() => setPaymentMethod('BANK_TRANSFER')}
                      className="text-gold focus:ring-0"
                    />
                    <div>
                      <span className="font-bold text-xs text-ivory block flex items-center gap-1.5">
                        Chuyển khoản Ngân hàng (VietQR 24/7)
                        <span className="text-[10px] bg-gold/20 text-gold px-1.5 rounded">Khuyên dùng</span>
                      </span>
                      <span className="text-[11px] text-slate-subtle">Quét mã QR tiện lợi qua mọi app Mobile Banking</span>
                    </div>
                  </div>
                  <QrCode className="w-5 h-5 text-gold" />
                </label>

                {/* MoMo */}
                <label
                  className={`p-4 rounded-xl border flex items-center justify-between cursor-pointer transition ${
                    paymentMethod === 'MOMO'
                      ? 'border-gold bg-gold/10'
                      : 'border-charcoal-border bg-charcoal-deep hover:border-slate-DEFAULT'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="paymentMethod"
                      checked={paymentMethod === 'MOMO'}
                      onChange={() => setPaymentMethod('MOMO')}
                      className="text-gold focus:ring-0"
                    />
                    <div>
                      <span className="font-bold text-xs text-ivory block">Ví điện tử MoMo (Sandbox Test)</span>
                      <span className="text-[11px] text-slate-subtle">Thanh toán tức thì qua cổng MoMo</span>
                    </div>
                  </div>
                  <Wallet className="w-5 h-5 text-pink-400" />
                </label>

                {/* VNPay */}
                <label
                  className={`p-4 rounded-xl border flex items-center justify-between cursor-pointer transition ${
                    paymentMethod === 'VNPAY'
                      ? 'border-gold bg-gold/10'
                      : 'border-charcoal-border bg-charcoal-deep hover:border-slate-DEFAULT'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="paymentMethod"
                      checked={paymentMethod === 'VNPAY'}
                      onChange={() => setPaymentMethod('VNPAY')}
                      className="text-gold focus:ring-0"
                    />
                    <div>
                      <span className="font-bold text-xs text-ivory block">Cổng VNPay / ATM Nội Địa (Sandbox)</span>
                      <span className="text-[11px] text-slate-subtle">Hỗ trợ thẻ ATM 40+ ngân hàng tại Việt Nam</span>
                    </div>
                  </div>
                  <CreditCard className="w-5 h-5 text-blue-400" />
                </label>
              </div>
            </div>
          </div>

          {/* Right Column: Order Items Summary & Final Submit */}
          <div className="lg:col-span-5 space-y-6">
            <div className="card-luxury p-6 border-charcoal-border/80 sticky top-24">
              <h3 className="font-display font-bold text-base text-ivory pb-3 mb-4 border-b border-charcoal-border/60">
                ĐƠN HÀNG CỦA BẠN ({items.length} SẢN PHẨM)
              </h3>

              {/* Items List */}
              <div className="divide-y divide-charcoal-border/50 max-h-72 overflow-y-auto mb-4 pr-1">
                {items.map((item) => (
                  <div key={`${item.productId}-${item.variantId}`} className="py-3 flex gap-3 items-center">
                    <img
                      src={item.productImage}
                      alt={item.productName}
                      className="w-12 h-12 rounded-lg bg-charcoal-deep object-contain p-1 border border-charcoal-border flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0 text-xs">
                      <p className="font-bold text-ivory truncate">{item.productName}</p>
                      {item.variantTitle && <p className="text-[11px] text-gold-light">{item.variantTitle}</p>}
                      <p className="text-[11px] text-slate-DEFAULT">Số lượng: x{item.quantity}</p>
                    </div>
                    <span className="text-xs font-bold font-mono text-ivory">
                      {formatCurrency(item.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Breakdown */}
              <div className="space-y-2.5 text-xs text-slate-subtle py-3 border-t border-b border-charcoal-border/60">
                <div className="flex justify-between">
                  <span>Tạm tính:</span>
                  <span className="font-mono text-ivory">{formatCurrency(subtotal)}</span>
                </div>

                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-400 font-semibold">
                    <span>Mã giảm giá ({appliedCoupon?.code}):</span>
                    <span className="font-mono">-{formatCurrency(discountAmount)}</span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span>Phí vận chuyển:</span>
                  <span className="font-mono">
                    {shippingFee === 0 ? <strong className="text-emerald-400">MIỄN PHÍ</strong> : formatCurrency(shippingFee)}
                  </span>
                </div>
              </div>

              {/* Total */}
              <div className="py-4 flex justify-between items-baseline">
                <span className="font-bold text-sm text-ivory">Tổng thanh toán:</span>
                <span className="font-display font-black text-2xl text-gold">
                  {formatCurrency(totalAmount)}
                </span>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-4 rounded-xl font-display font-extrabold text-xs uppercase tracking-wider bg-gold hover:bg-gold-light text-charcoal transition shadow-glow flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {submitting ? (
                  <span>Đang xử lý đơn hàng...</span>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>Xác nhận đặt hàng</span>
                  </>
                )}
              </button>

              <p className="text-center text-[10px] text-slate-DEFAULT mt-3">
                Bằng việc nhấn đặt hàng, bạn đồng ý với các điều khoản mua sắm và chính sách bảo mật tại Vitacore.
              </p>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

