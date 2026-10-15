'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  TrendingUp,
  DollarSign,
  ShoppingCart,
  Users,
  Package,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  CheckCircle,
} from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';

export default function AdminDashboardPage() {
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/metrics')
      .then((res) => res.json())
      .then((data) => {
        if (data.metrics) setMetrics(data.metrics);
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

  const monthlyKeys = Object.keys(metrics?.monthlyStats || {});

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display font-black text-2xl text-ivory">
          DASHBOARD ĐIỀU HÀNH DOANH NGHIỆP
        </h1>
        <p className="text-xs text-slate-subtle mt-1">
          Báo cáo doanh thu thực thu, đơn hàng, khách hàng và giám sát rủi ro toàn hệ thống
        </p>
      </div>

      {/* Primary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="card-luxury p-5 border-gold/40 bg-gradient-to-br from-charcoal-card to-charcoal-deep">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-subtle">Tổng Doanh Thu</span>
            <div className="w-9 h-9 rounded-lg bg-gold/10 text-gold flex items-center justify-center">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <span className="font-display font-black text-2xl text-gold">
            {formatCurrency(metrics?.totalRevenue || 0)}
          </span>
          <p className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1 font-semibold">
            <TrendingUp className="w-3.5 h-3.5" />
            Đã thanh toán thực thu
          </p>
        </div>

        <div className="card-luxury p-5 border-charcoal-border">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-subtle">Tổng Đơn Hàng</span>
            <div className="w-9 h-9 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center">
              <ShoppingCart className="w-5 h-5" />
            </div>
          </div>
          <span className="font-display font-black text-2xl text-ivory">
            {metrics?.totalOrders || 0}
          </span>
          <p className="text-[11px] text-slate-DEFAULT mt-1">
            Đang chờ: <strong className="text-amber-400">{metrics?.pendingOrdersCount || 0}</strong> • Hoàn tất: <strong className="text-emerald-400">{metrics?.completedOrdersCount || 0}</strong>
          </p>
        </div>

        <div className="card-luxury p-5 border-charcoal-border">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-subtle">Khách Hàng Đăng Ký</span>
            <div className="w-9 h-9 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <span className="font-display font-black text-2xl text-ivory">
            {metrics?.customersCount || 0}
          </span>
          <p className="text-[11px] text-purple-400 mt-1">Tài khoản thành viên</p>
        </div>

        <div className="card-luxury p-5 border-charcoal-border">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-subtle">Sản Phẩm & Kho</span>
            <div className="w-9 h-9 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <Package className="w-5 h-5" />
            </div>
          </div>
          <span className="font-display font-black text-2xl text-ivory">
            {metrics?.productsCount || 0}
          </span>
          <p className="text-[11px] text-rose-400 mt-1">
            Cảnh báo tồn thấp: {metrics?.lowStockCount || 0} sản phẩm
          </p>
        </div>
      </div>

      {/* Revenue Chart Visualization & Top Products Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Monthly Revenue Chart */}
        <div className="lg:col-span-7 card-luxury p-6 border-charcoal-border flex flex-col justify-between">
          <div className="mb-6">
            <h2 className="font-display font-bold text-base text-ivory">
              Biểu Đồ Doanh Thu Theo Tháng
            </h2>
            <p className="text-xs text-slate-subtle mt-0.5">Dữ liệu ghi nhận từ các giao dịch thanh toán thành công</p>
          </div>

          <div className="h-64 flex items-end justify-between gap-2 pt-8 pb-2 px-2 border-b border-charcoal-border">
            {['T5', 'T6', 'T7', 'T8', 'T9', 'T10'].map((month) => {
              const val = metrics?.monthlyStats?.[month] || (month === 'T10' ? metrics?.totalRevenue : 0);
              const maxVal = Math.max(metrics?.totalRevenue || 1, 3000000);
              const heightPercent = Math.min(100, Math.max(15, Math.round((val / maxVal) * 100)));

              return (
                <div key={month} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                  <span className="text-[10px] font-mono text-gold opacity-0 group-hover:opacity-100 transition whitespace-nowrap">
                    {formatCurrency(val)}
                  </span>
                  <div
                    className="w-full max-w-[40px] bg-gradient-to-t from-gold-dark to-gold rounded-t-lg transition-all duration-700 shadow-glow"
                    style={{ height: `${heightPercent}%` }}
                  />
                  <span className="text-xs font-semibold text-slate-DEFAULT">{month}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top Selling Products */}
        <div className="lg:col-span-5 card-luxury p-6 border-charcoal-border">
          <h2 className="font-display font-bold text-base text-ivory mb-4 pb-2 border-b border-charcoal-border/60">
            Top Sản Phẩm Bán Chạy Nhất
          </h2>

          <div className="space-y-4">
            {metrics?.topProducts && metrics.topProducts.length > 0 ? (
              metrics.topProducts.map((p: any, idx: number) => (
                <div key={idx} className="flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-md bg-gold/10 text-gold font-bold flex items-center justify-center text-xs">
                      #{idx + 1}
                    </span>
                    <strong className="text-ivory max-w-[200px] truncate">{p.name}</strong>
                  </div>
                  <div className="text-right">
                    <span className="text-gold font-bold block">{p.quantitySold} đã bán</span>
                    <span className="text-[10px] text-slate-DEFAULT font-mono">{formatCurrency(p.revenue)}</span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-DEFAULT">Chưa có đủ số liệu giao dịch.</p>
            )}
          </div>
        </div>
      </div>

      {/* Recent System Audit Trail */}
      <div className="card-luxury p-6 border-charcoal-border">
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-charcoal-border/60">
          <div>
            <h2 className="font-display font-bold text-base text-ivory">Nhật Ký Hoạt Động Gần Đây (Audit Trail)</h2>
            <p className="text-xs text-slate-subtle mt-0.5">Theo dõi lịch sử truy cập, thay đổi giá, xuất nhập kho và đơn hàng</p>
          </div>
          <Link
            href="/admin/audit-logs"
            className="text-xs font-bold text-gold-light hover:text-gold flex items-center gap-1"
          >
            <span>Xem toàn bộ nhật ký</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-charcoal-deep text-slate-subtle uppercase text-[10px] tracking-wider border-b border-charcoal-border">
              <tr>
                <th className="p-3">Thời Gian</th>
                <th className="p-3">Người Thực Hiện</th>
                <th className="p-3">Vai Trò</th>
                <th className="p-3">Hành Động</th>
                <th className="p-3">Đối Tượng</th>
                <th className="p-3">Chi Tiết</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-charcoal-border/60 text-ivory">
              {metrics?.recentAuditLogs?.map((log: any) => (
                <tr key={log.id} className="hover:bg-charcoal-hover transition">
                  <td className="p-3 font-mono text-[11px] text-slate-DEFAULT">{formatDate(log.createdAt)}</td>
                  <td className="p-3 font-semibold text-ivory">{log.userEmail || 'Hệ thống'}</td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-gold/10 text-gold border border-gold/30">
                      {log.userRole || 'SYSTEM'}
                    </span>
                  </td>
                  <td className="p-3 font-bold">{log.action}</td>
                  <td className="p-3 text-slate-subtle">{log.entity}</td>
                  <td className="p-3 text-slate-DEFAULT max-w-xs truncate">{log.details || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

