'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  LayoutDashboard,
  Package,
  Layers,
  Award,
  ShoppingCart,
  Users,
  ShieldCheck,
  Tag,
  Settings,
  History,
  ArrowLeft,
  ShieldAlert,
  LogOut,
  Boxes,
  BookOpen,
} from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading, logout } = useAuth();
  const pathname = usePathname();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-charcoal flex items-center justify-center p-8">
        <div className="w-12 h-12 rounded-full border-2 border-gold border-t-transparent animate-spin" />
      </div>
    );
  }

  // Strict Admin Role Enforcement
  if (!user || user.role !== 'ADMIN') {
    return (
      <div className="min-h-screen bg-charcoal flex flex-col items-center justify-center p-8 text-center">
        <div className="w-16 h-16 rounded-2xl bg-rose-500/10 text-rose-500 border border-rose-500/30 flex items-center justify-center mb-4">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h1 className="font-display font-black text-2xl text-ivory">403 - KHÔNG CÓ QUYỀN QUẢN TRỊ</h1>
        <p className="text-xs text-slate-subtle max-w-md mt-2 mb-6">
          Khu vực này chỉ dành riêng cho Quản trị viên hệ thống (ADMIN). Tài khoản hiện tại không có thẩm quyền truy cập.
        </p>
        <div className="flex gap-3">
          <Link href="/" className="px-5 py-2.5 rounded-xl bg-charcoal-card border border-charcoal-border text-xs text-ivory hover:text-gold">
            Về trang chủ
          </Link>
          <Link href="/auth/login" className="px-5 py-2.5 rounded-xl bg-gold text-charcoal font-bold text-xs hover:bg-gold-light">
            Đăng nhập tài khoản Admin
          </Link>
        </div>
      </div>
    );
  }

  const adminNav = [
    { href: '/admin/dashboard', label: 'Dashboard Tổng quan', icon: LayoutDashboard },
    { href: '/admin/products', label: 'Quản lý Sản phẩm', icon: Package },
    { href: '/admin/categories', label: 'Danh mục', icon: Layers },
    { href: '/admin/brands', label: 'Thương hiệu', icon: Award },
    { href: '/admin/articles', label: 'Bài viết Kiến thức', icon: BookOpen },
    { href: '/admin/orders', label: 'Quản lý Đơn hàng', icon: ShoppingCart },
    { href: '/admin/customers', label: 'Khách hàng', icon: Users },
    { href: '/admin/staff', label: 'Nhân viên & RBAC', icon: ShieldCheck },
    { href: '/admin/promotions', label: 'Khuyến mãi & Mã giảm', icon: Tag },
    { href: '/admin/settings', label: 'Cấu hình Cửa hàng', icon: Settings },
    { href: '/admin/audit-logs', label: 'Nhật ký Kiểm toán', icon: History },
  ];

  return (
    <div className="min-h-screen bg-charcoal-deep flex flex-col md:flex-row">
      {/* Admin Sidebar */}
      <aside className="w-full md:w-64 bg-charcoal border-r border-charcoal-border/80 flex flex-col justify-between p-4 flex-shrink-0">
        <div>
          {/* Header */}
          <div className="pb-4 mb-4 border-b border-charcoal-border/60">
            <Link href="/" className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-gold to-gold-dark text-charcoal flex items-center justify-center font-black text-sm shadow-glow">
                V
              </div>
              <div>
                <span className="font-display font-bold text-xs text-ivory block">VITACORE ADMIN</span>
                <span className="text-[10px] text-gold font-bold tracking-wider uppercase">System Controller</span>
              </div>
            </Link>

            {/* Admin Profile */}
            <div className="p-2.5 rounded-xl bg-charcoal-card border border-gold/30 text-xs">
              <p className="font-bold text-ivory truncate">{user.fullName}</p>
              <div className="flex items-center justify-between mt-1 text-[11px]">
                <span className="text-gold font-bold uppercase tracking-wider">ADMINISTRATOR</span>
                <span className="text-slate-DEFAULT">ID: {user.id.slice(0, 6)}</span>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1 text-xs font-semibold">
            {adminNav.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition ${
                    isActive
                      ? 'bg-gradient-to-r from-gold to-gold-dark text-charcoal font-bold shadow-glow'
                      : 'text-slate-subtle hover:text-ivory hover:bg-charcoal-hover'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-charcoal' : 'text-gold'}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Actions */}
        <div className="pt-4 mt-6 border-t border-charcoal-border/60 space-y-2">
          <Link
            href="/staff/dashboard"
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-slate-DEFAULT hover:text-blue-400 text-xs transition"
          >
            <Boxes className="w-3.5 h-3.5" />
            Xem cổng Staff (Vận hành)
          </Link>

          <Link
            href="/"
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-slate-DEFAULT hover:text-ivory text-xs transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Về giao diện Storefront
          </Link>

          <button
            onClick={() => logout()}
            className="w-full text-left flex items-center gap-2 px-3 py-2 rounded-lg text-rose-400 hover:bg-rose-500/10 text-xs transition"
          >
            <LogOut className="w-3.5 h-3.5" />
            Đăng xuất
          </button>
        </div>
      </aside>

      {/* Admin Content Area */}
      <main className="flex-1 overflow-x-hidden p-6 lg:p-8">
        {children}
      </main>
    </div>
  );
}

