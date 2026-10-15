'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { formatCurrency, formatDate, getOrderStatusBadge, getPaymentStatusBadge } from '@/lib/utils';
import { Package, ChevronRight, Eye, AlertCircle, ShoppingBag } from 'lucide-react';

export default function AccountOrdersPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/auth/login?redirect=/account/orders');
      return;
    }

    if (user) {
      fetch('/api/orders')
        .then((res) => res.json())
        .then((data) => {
          if (data.orders) setOrders(data.orders);
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [user, isLoading, router]);

  if (isLoading || loading) {
    return (
      <div className="min-h-screen bg-charcoal flex items-center justify-center p-8">
        <div className="w-12 h-12 rounded-full border-2 border-gold border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="bg-charcoal min-h-screen py-10">
      <div className="max-w-6xl mx-auto px-4 lg:px-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-slate-DEFAULT mb-6">
          <Link href="/" className="hover:text-gold transition">Trang chủ</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-ivory font-semibold">Tài khoản</span>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-gold-light">Đơn hàng của tôi</span>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8 pb-4 border-b border-charcoal-border/60">
          <div>
            <h1 className="font-display font-black text-2xl sm:text-3xl text-ivory">
              LỊCH SỬ ĐẶT HÀNG
            </h1>
            <p className="text-xs text-slate-subtle mt-1">
              Quản lý tiến trình vận chuyển và hóa đơn mua hàng của bạn
            </p>
          </div>
          <Link
            href="/products"
            className="px-5 py-2.5 rounded-xl bg-gold text-charcoal font-bold text-xs hover:bg-gold-light transition shadow-glow"
          >
            Mua sắm thêm
          </Link>
        </div>

        {orders.length === 0 ? (
          <div className="card-luxury p-12 text-center">
            <Package className="w-12 h-12 text-slate-DEFAULT mx-auto mb-3 opacity-50" />
            <h3 className="font-display font-bold text-lg text-ivory">Bạn chưa có đơn hàng nào</h3>
            <p className="text-xs text-slate-subtle mt-1 mb-6">
              Khám phá các sản phẩm thực phẩm bổ sung cao cấp và đặt hàng ngay hôm nay!
            </p>
            <Link
              href="/products"
              className="px-6 py-3 rounded-xl bg-gold text-charcoal font-bold text-xs inline-block"
            >
              Khám phá ngay
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((ord) => {
              const statusBadge = getOrderStatusBadge(ord.orderStatus);
              const paymentBadge = getPaymentStatusBadge(ord.paymentStatus);

              return (
                <div key={ord.id} className="card-luxury p-6 border-charcoal-border/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                      <span className="font-mono font-bold text-sm text-gold">
                        {ord.orderNumber}
                      </span>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${statusBadge.color}`}>
                        {statusBadge.label}
                      </span>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${paymentBadge.color}`}>
                        {paymentBadge.label}
                      </span>
                    </div>

                    <p className="text-xs text-slate-DEFAULT">
                      Ngày đặt: {formatDate(ord.createdAt)} • {ord.items?.length || 0} sản phẩm
                    </p>

                    <div className="mt-2 text-xs text-slate-subtle line-clamp-1">
                      {ord.items?.map((i: any) => `${i.productName} (x${i.quantity})`).join(', ')}
                    </div>
                  </div>

                  <div className="flex items-center gap-4 sm:flex-col sm:items-end w-full sm:w-auto justify-between pt-4 sm:pt-0 border-t sm:border-t-0 border-charcoal-border/60">
                    <span className="font-display font-black text-base text-ivory">
                      {formatCurrency(ord.totalAmount)}
                    </span>

                    <Link
                      href={`/orders/${ord.id}`}
                      className="px-4 py-2 rounded-lg bg-charcoal-deep hover:bg-gold hover:text-charcoal border border-charcoal-border text-gold font-bold text-xs transition flex items-center gap-1.5"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      Chi tiết
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

