'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Package,
  Truck,
  AlertTriangle,
  Headphones,
  ArrowRight,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import { formatCurrency, formatDate, getOrderStatusBadge } from '@/lib/utils';

export default function StaffDashboardPage() {
  const [metrics, setMetrics] = useState<any>(null);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/staff/metrics').then((r) => r.json()),
      fetch('/api/orders?limit=5').then((r) => r.json()),
    ])
      .then(([metricsData, ordersData]) => {
        if (metricsData.metrics) setMetrics(metricsData.metrics);
        if (ordersData.orders) setRecentOrders(ordersData.orders);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="w-10 h-10 rounded-full border-2 border-gold border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display font-black text-2xl text-ivory">
          BẢNG ĐIỀU KHIỂN VẬN HÀNH
        </h1>
        <p className="text-xs text-slate-subtle mt-1">
          Theo dõi tiến độ chuẩn bị đơn hàng, kiểm tra kho và chăm sóc khách hàng
        </p>
      </div>

      {/* 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="card-luxury p-5 border-charcoal-border">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-subtle">Cần Đóng Gói</span>
            <div className="w-9 h-9 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <Package className="w-5 h-5" />
            </div>
          </div>
          <span className="font-display font-black text-3xl text-ivory">
            {metrics?.ordersToProcess || 0}
          </span>
          <p className="text-[11px] text-amber-400 mt-1">Đơn hàng mới & đang chuẩn bị</p>
        </div>

        <div className="card-luxury p-5 border-charcoal-border">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-subtle">Đang Vận Chuyển</span>
            <div className="w-9 h-9 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
              <Truck className="w-5 h-5" />
            </div>
          </div>
          <span className="font-display font-black text-3xl text-ivory">
            {metrics?.shippingOrders || 0}
          </span>
          <p className="text-[11px] text-indigo-400 mt-1">Đã bàn giao shipper</p>
        </div>

        <div className="card-luxury p-5 border-charcoal-border">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-subtle">Cảnh Báo Tồn Kho</span>
            <div className="w-9 h-9 rounded-lg bg-rose-500/10 text-rose-400 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <span className="font-display font-black text-3xl text-ivory">
            {metrics?.inventoryAlerts || 0}
          </span>
          <p className="text-[11px] text-rose-400 mt-1">Sản phẩm dưới ngưỡng tối thiểu</p>
        </div>

        <div className="card-luxury p-5 border-charcoal-border">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-subtle">Ticket Cần Hỗ Trợ</span>
            <div className="w-9 h-9 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <Headphones className="w-5 h-5" />
            </div>
          </div>
          <span className="font-display font-black text-3xl text-ivory">
            {metrics?.openTickets || 0}
          </span>
          <p className="text-[11px] text-emerald-400 mt-1">Yêu cầu từ khách hàng</p>
        </div>
      </div>

      {/* Recent Orders Processing Table */}
      <div className="card-luxury p-6 border-charcoal-border">
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-charcoal-border/60">
          <div>
            <h2 className="font-display font-bold text-base text-ivory">Đơn hàng cần xử lý gần đây</h2>
            <p className="text-xs text-slate-subtle mt-0.5">Xác nhận, chuẩn bị hàng và in phiếu giao hàng</p>
          </div>
          <Link
            href="/staff/orders"
            className="text-xs font-bold text-gold-light hover:text-gold flex items-center gap-1"
          >
            <span>Xem toàn bộ đơn</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-charcoal-deep text-slate-subtle uppercase text-[10px] tracking-wider border-b border-charcoal-border">
              <tr>
                <th className="p-3">Mã Đơn Hàng</th>
                <th className="p-3">Khách Hàng</th>
                <th className="p-3">Số Điện Thoại</th>
                <th className="p-3">Tổng Tiền</th>
                <th className="p-3">Thanh Toán</th>
                <th className="p-3">Trạng Thái</th>
                <th className="p-3 text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-charcoal-border/60 text-ivory">
              {recentOrders.map((ord) => {
                const badge = getOrderStatusBadge(ord.orderStatus);
                return (
                  <tr key={ord.id} className="hover:bg-charcoal-hover transition">
                    <td className="p-3 font-mono font-bold text-gold">{ord.orderNumber}</td>
                    <td className="p-3 font-semibold">{ord.customerName}</td>
                    <td className="p-3 text-slate-DEFAULT">{ord.customerPhone}</td>
                    <td className="p-3 font-mono font-bold">{formatCurrency(ord.totalAmount)}</td>
                    <td className="p-3">
                      <span className="text-[11px] text-slate-subtle">{ord.paymentMethod}</span>
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${badge.color}`}>
                        {badge.label}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <Link
                        href={`/staff/orders`}
                        className="px-3 py-1 rounded bg-charcoal-deep border border-charcoal-border text-gold hover:bg-gold hover:text-charcoal transition text-[11px] font-bold inline-block"
                      >
                        Xử lý
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

