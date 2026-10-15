'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { formatCurrency } from '@/lib/utils';
import {
  Trash2,
  ArrowRight,
  ShoppingBag,
  Truck,
  Tag,
  ShieldCheck,
  ChevronRight,
  X,
  Sparkles,
} from 'lucide-react';

export default function CartPage() {
  const {
    items,
    totalItems,
    subtotal,
    shippingFee,
    freeShippingThreshold,
    discountAmount,
    totalAmount,
    appliedCoupon,
    updateQuantity,
    removeFromCart,
    clearCart,
    applyCoupon,
    removeCoupon,
  } = useCart();

  const router = useRouter();
  const [couponInput, setCouponInput] = useState('');
  const [couponError, setCouponError] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);

  // Free shipping progress calculation
  const amountNeededForFreeShipping = Math.max(0, freeShippingThreshold - subtotal);
  const freeShippingProgress = Math.min(100, Math.round((subtotal / freeShippingThreshold) * 100));

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;

    setCouponLoading(true);
    setCouponError('');
    const res = await applyCoupon(couponInput.trim());
    setCouponLoading(false);

    if (!res.success) {
      setCouponError(res.message);
    } else {
      setCouponInput('');
    }
  };

  if (items.length === 0) {
    return (
      <div className="bg-charcoal min-h-[70vh] flex flex-col items-center justify-center p-8 text-center">
        <div className="w-20 h-20 rounded-full bg-charcoal-card border border-charcoal-border flex items-center justify-center text-slate-DEFAULT mb-4">
          <ShoppingBag className="w-10 h-10 text-gold/40" />
        </div>
        <h2 className="font-display font-bold text-xl text-ivory mb-2">Giỏ hàng của bạn đang trống</h2>
        <p className="text-xs text-slate-subtle max-w-sm mb-6">
          Chưa có sản phẩm bổ sung nào trong giỏ. Hãy khám phá ngay các dòng Whey Isolate và Creatine bán chạy!
        </p>
        <Link
          href="/products"
          className="px-8 py-3.5 rounded-xl font-display font-extrabold text-xs uppercase tracking-wider bg-gold text-charcoal hover:bg-gold-light transition shadow-glow flex items-center gap-2"
        >
          <span>Khám phá sản phẩm</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-charcoal min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 lg:px-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-slate-DEFAULT mb-6">
          <Link href="/" className="hover:text-gold transition">Trang chủ</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-ivory font-semibold">Giỏ hàng ({totalItems} sản phẩm)</span>
        </div>

        <h1 className="font-display font-black text-2xl sm:text-3xl text-ivory mb-8">
          GIỎ HÀNG CỦA BẠN
        </h1>

        {/* Free Shipping Progress Bar */}
        <div className="card-luxury p-4 border-charcoal-border/80 mb-8">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="flex items-center gap-1.5 font-bold text-ivory">
              <Truck className="w-4 h-4 text-gold" />
              {amountNeededForFreeShipping === 0 ? (
                <span className="text-emerald-400 font-bold">Bạn đã đủ điều kiện nhận MIỄN PHÍ VẬN CHUYỂN!</span>
              ) : (
                <span>
                  Mua thêm <strong className="text-gold">{formatCurrency(amountNeededForFreeShipping)}</strong> để được Miễn phí giao hàng toàn quốc
                </span>
              )}
            </span>
            <span className="text-gold-light font-bold text-xs">{freeShippingProgress}%</span>
          </div>
          <div className="w-full bg-charcoal-deep h-2 rounded-full overflow-hidden border border-charcoal-border">
            <div
              className="bg-gradient-to-r from-gold to-emerald-400 h-full rounded-full transition-all duration-500"
              style={{ width: `${freeShippingProgress}%` }}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Items List */}
          <div className="lg:col-span-8 space-y-4">
            <div className="card-luxury divide-y divide-charcoal-border/60">
              {items.map((item) => (
                <div key={`${item.productId}-${item.variantId}`} className="p-4 sm:p-6 flex gap-4 items-center">
                  {/* Thumbnail */}
                  <Link href={`/products/${item.productSlug}`} className="w-20 h-20 rounded-xl bg-charcoal-deep p-2 border border-charcoal-border flex-shrink-0">
                    <img src={item.productImage} alt={item.productName} className="w-full h-full object-contain" />
                  </Link>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <Link href={`/products/${item.productSlug}`} className="block hover:text-gold transition">
                      <h3 className="font-bold text-sm text-ivory truncate">{item.productName}</h3>
                    </Link>
                    {item.variantTitle && (
                      <p className="text-xs text-gold-light mt-0.5 font-medium">{item.variantTitle}</p>
                    )}
                    <div className="mt-2 flex items-baseline gap-2">
                      <span className="font-display font-bold text-sm text-gold">
                        {formatCurrency(item.price)}
                      </span>
                      {item.originalPrice && item.originalPrice > item.price && (
                        <span className="text-xs text-slate-DEFAULT line-through">
                          {formatCurrency(item.originalPrice)}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Quantity Adjustment */}
                  <div className="flex items-center border border-charcoal-border bg-charcoal-deep rounded-lg overflow-hidden flex-shrink-0">
                    <button
                      onClick={() => updateQuantity(item.productId, item.variantId, item.quantity - 1)}
                      className="px-2.5 py-1 text-slate-DEFAULT hover:text-ivory text-xs font-bold"
                    >
                      -
                    </button>
                    <span className="px-3 py-1 text-xs font-bold text-ivory min-w-[28px] text-center">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.productId, item.variantId, item.quantity + 1)}
                      className="px-2.5 py-1 text-slate-DEFAULT hover:text-ivory text-xs font-bold"
                    >
                      +
                    </button>
                  </div>

                  {/* Subtotal & Delete */}
                  <div className="text-right flex-shrink-0 flex flex-col items-end gap-2">
                    <span className="font-display font-extrabold text-sm text-ivory">
                      {formatCurrency(item.price * item.quantity)}
                    </span>
                    <button
                      onClick={() => removeFromCart(item.productId, item.variantId)}
                      className="text-slate-DEFAULT hover:text-rose-400 transition p-1"
                      title="Xóa khỏi giỏ"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-between items-center text-xs">
              <Link href="/products" className="text-gold-light hover:text-gold flex items-center gap-1 font-semibold">
                ← Tiếp tục mua sắm
              </Link>
              <button onClick={clearCart} className="text-slate-DEFAULT hover:text-rose-400 transition">
                Xóa sạch giỏ hàng
              </button>
            </div>
          </div>

          {/* Right Column: Order Summary & Coupon */}
          <div className="lg:col-span-4 space-y-6">
            <div className="card-luxury p-6 border-charcoal-border/80">
              <h3 className="font-display font-bold text-base text-ivory pb-3 mb-4 border-b border-charcoal-border/60">
                TÓM TẮT ĐƠN HÀNG
              </h3>

              {/* Coupon Form */}
              <div className="mb-6">
                <label className="block text-xs font-semibold text-slate-subtle mb-2">
                  Mã Giảm Giá / Voucher:
                </label>
                {appliedCoupon ? (
                  <div className="p-3 rounded-xl bg-gold/10 border border-gold/40 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-mono font-bold text-gold uppercase">{appliedCoupon.code}</span>
                      <p className="text-[11px] text-slate-subtle">{appliedCoupon.description}</p>
                    </div>
                    <button
                      onClick={removeCoupon}
                      className="text-slate-DEFAULT hover:text-rose-400 p-1"
                      title="Gỡ bỏ mã"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleApplyCoupon} className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Nhập mã (VD: VITACORE10)"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value)}
                      className="flex-1 bg-charcoal-deep border border-charcoal-border rounded-xl px-3 py-2 text-xs text-ivory uppercase font-mono focus:outline-none focus:border-gold"
                    />
                    <button
                      type="submit"
                      disabled={couponLoading}
                      className="px-4 py-2 rounded-xl bg-charcoal-deep hover:bg-gold hover:text-charcoal border border-charcoal-border text-gold font-bold text-xs transition"
                    >
                      {couponLoading ? '...' : 'Áp dụng'}
                    </button>
                  </form>
                )}
                {couponError && <p className="text-[11px] text-rose-400 mt-1.5">{couponError}</p>}
              </div>

              {/* Price Breakdown */}
              <div className="space-y-3 text-xs text-slate-subtle pb-4 border-b border-charcoal-border/60">
                <div className="flex justify-between">
                  <span>Tạm tính hàng ({totalItems} món):</span>
                  <span className="font-medium text-ivory font-mono">{formatCurrency(subtotal)}</span>
                </div>

                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-400 font-semibold">
                    <span>Giảm giá ({appliedCoupon?.code}):</span>
                    <span className="font-mono">-{formatCurrency(discountAmount)}</span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span>Phí vận chuyển:</span>
                  <span className="font-medium font-mono">
                    {shippingFee === 0 ? (
                      <span className="text-emerald-400 font-bold">MIỄN PHÍ</span>
                    ) : (
                      formatCurrency(shippingFee)
                    )}
                  </span>
                </div>
              </div>

              {/* Total Final */}
              <div className="py-4 flex justify-between items-baseline">
                <span className="font-bold text-sm text-ivory">Tổng thanh toán:</span>
                <span className="font-display font-black text-2xl text-gold">
                  {formatCurrency(totalAmount)}
                </span>
              </div>

              {/* Checkout Button */}
              <button
                onClick={() => router.push('/checkout')}
                className="w-full py-4 rounded-xl font-display font-extrabold text-xs uppercase tracking-wider bg-gold hover:bg-gold-light text-charcoal transition shadow-glow flex items-center justify-center gap-2"
              >
                <span>Tiến hành đặt hàng</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="mt-4 pt-4 border-t border-charcoal-border/40 text-[11px] text-slate-DEFAULT flex items-center justify-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Bảo mật thanh toán chuẩn SSL 256-bit</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

