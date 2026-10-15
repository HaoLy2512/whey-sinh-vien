'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/navigation';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  LayoutDashboard,
  Package,
  Boxes,
  Headphones,
  FileSpreadsheet,
  ArrowLeft,
  ShieldAlert,
  LogOut,
  Sparkles,
} from 'lucide-react';
import LinkItem from 'next/link';

export default function StaffLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-charcoal flex items-center justify-center p-8">
        <div className="w-12 h-12 rounded-full border-2 border-gold border-t-transparent animate-spin" />
      </div>
    );
  }

  // Strict RBAC Verification
  if (!user || (user.role !== 'STAFF' && user.role !== 'ADMIN')) {
    return (
      <div className="min-h-screen bg-charcoal flex flex-col items-center justify-center p-8 text-center">
        <div className="w-16 h-16 rounded-2xl bg-rose-500/10 text-rose-500 border border-rose-500/30 flex items-center justify-center mb-4">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h1 className="font-display font-black text-2xl text-ivory">403 - TRUY CẬP BỊ TỪ CHỐI</h1>
        <p className="text-xs text-slate-subtle max-w-md mt-2 mb-6">
          Khu vực này chỉ dành cho Nhân viên vận hành (STAFF) và Quản trị viên (ADMIN). Tài khoản hiện tại của bạn không có quyền truy cập.
        </p>
        <div className="flex gap-3">
          <LinkItem href="/" className="px-5 py-2.5 rounded-xl bg-charcoal-card border border-charcoal-border text-xs text-ivory hover:text-gold">
            Về trang chủ
          </LinkItem>
          <LinkItem href="/auth/login" className="px-5 py-2.5 rounded-xl bg-gold text-charcoal font-bold text-xs hover:bg-gold-light">
            Đăng nhập tài khoản Staff
          </LinkItem>
        </div>
      </div>
    );
  }

  const navItems = [
    { href: '/staff/dashboard', label: 'Tổng quan vận hành', icon: LayoutDashboard },
    { href: '/staff/orders', label: 'Xử lý đơn hàng', icon: Package },
    { href: '/staff/inventory', label: 'Kho hàng & Hạn dùng', icon: Boxes },
    { href: '/staff/support', label: 'Chăm sóc khách hàng', icon: Headphones },
    { href: '/staff/reports', label: 'Báo cáo & Xuất CSV', icon: FileSpreadsheet },
  ];

  return (
    <div className="min-h-screen bg-charcoal-deep flex flex-col md:flex-row">
      {/* Staff Sidebar */}
      <aside className="w-full md:w-64 bg-charcoal border-r border-charcoal-border/80 flex flex-col justify-between p-4 flex-shrink-0">
        <div>
          {/* Header */}
          <div className="pb-4 mb-4 border-b border-charcoal-border/60">
            <LinkItem href="/" className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-gold/10 text-gold border border-gold/30 flex items-center justify-center font-bold text-sm">
                V
              </div>
              <div>
                <span className="font-display font-bold text-xs text-ivory block">VITACORE STORE</span>
                <span className="text-[10px] text-blue-400 font-bold tracking-wider uppercase">STAFF PORTAL</span>
              </div>
            </LinkItem>

            {/* User Info */}
            <div className="p-2.5 rounded-xl bg-charcoal-card border border-charcoal-border/60 text-xs">
              <p className="font-bold text-ivory truncate">{user.fullName}</p>
              <div className="flex items-center justify-between mt-1 text-[11px] text-slate-DEFAULT">
                <span className="text-blue-400 font-semibold">{user.role}</span>
                <span>ID: {user.id.slice(0, 6)}</span>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5 text-xs font-semibold">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <LinkItem
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition ${
                    isActive
                      ? 'bg-gold/10 text-gold border border-gold/40 shadow-glow'
                      : 'text-slate-subtle hover:text-ivory hover:bg-charcoal-hover'
                  }`}
                >
                  <Icon className="w-4 h-4 text-gold" />
                  <span>{item.label}</span>
                </LinkItem>
              );
            })}
          </nav>
        </div>

        {/* Bottom Actions */}
        <div className="pt-4 mt-6 border-t border-charcoal-border/60 space-y-2">
          {user.role === 'ADMIN' && (
            <LinkItem
              href="/admin/dashboard"
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gold/10 border border-gold/30 text-gold text-xs font-bold hover:bg-gold hover:text-charcoal transition"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Chuyển sang Admin Dashboard
            </LinkItem>
          )}

          <LinkItem
            href="/"
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-slate-DEFAULT hover:text-ivory text-xs transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Về giao diện Storefront
          </LinkItem>

          <button
            onClick={() => logout()}
            className="w-full text-left flex items-center gap-2 px-3 py-2 rounded-lg text-rose-400 hover:bg-rose-500/10 text-xs transition"
          >
            <LogOut className="w-3.5 h-3.5" />
            Đăng xuất
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-x-hidden p-6 lg:p-8">
        {children}
      </main>
    </div>
  );
}

