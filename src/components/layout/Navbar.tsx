'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import {
  ShoppingBag,
  Heart,
  User as UserIcon,
  Search,
  Menu,
  X,
  ChevronDown,
  ShieldCheck,
  Package,
  LogOut,
  LayoutDashboard,
  Settings,
  PhoneCall,
  Sparkles,
} from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { totalItems } = useCart();
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [categories, setCategories] = useState<Array<{ id: string; name: string; slug: string }>>([]);
  const [storeName, setStoreName] = useState('VITACORE SUPPLEMENTS');

  useEffect(() => {
    // Fetch categories and store name
    fetch('/api/categories')
      .then((res) => res.json())
      .then((data) => {
        if (data.categories) setCategories(data.categories.slice(0, 7));
      })
      .catch(() => {});

    fetch('/api/settings')
      .then((res) => res.json())
      .then((data) => {
        if (data.settings?.storeName) setStoreName(data.settings.storeName);
      })
      .catch(() => {});
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setIsMobileMenuOpen(false);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full transition-all duration-300 print:hidden">
      {/* Top Notification Bar */}
      <div className="bg-charcoal-deep border-b border-charcoal-border/50 py-1.5 px-4 text-xs text-slate-subtle">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-1">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-gold-light">
              <ShieldCheck className="w-3.5 h-3.5 text-gold" />
              100% Nhập khẩu chính hãng & có hóa đơn VAT
            </span>
            <span className="hidden md:inline text-zinc-600">|</span>
            <span className="hidden md:inline">Freeship toàn quốc đơn từ 1.000.000đ</span>
          </div>
          <div className="flex items-center gap-4">
            <a href="tel:19008899" className="flex items-center gap-1 hover:text-gold transition">
              <PhoneCall className="w-3 h-3 text-gold" /> Hotline: 1900 8899
            </a>
            <span className="text-zinc-600">|</span>
            <Link href="/support" className="hover:text-gold transition">
              Tư vấn dinh dưỡng
            </Link>
          </div>
        </div>
      </div>

      {/* Main Navigation Glass Bar */}
      <nav className="nav-glass px-4 lg:px-8 py-3.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group flex-shrink-0">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-gold via-gold-dark to-charcoal-deep p-0.5 shadow-glow">
              <div className="w-full h-full bg-charcoal rounded-[7px] flex items-center justify-center">
                <span className="font-display font-black text-lg text-gold group-hover:scale-110 transition duration-300">
                  V
                </span>
              </div>
            </div>
            <div className="flex flex-col">
              <span className="font-display font-extrabold tracking-wider text-base sm:text-lg text-ivory group-hover:text-gold transition">
                {storeName}
              </span>
              <span className="text-[10px] uppercase tracking-widest text-gold-light font-medium -mt-1">
                Luxury Nutrition
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden lg:flex items-center gap-6 text-xs uppercase tracking-wider font-semibold text-slate-subtle ml-2">
            <Link href="/products" className="hover:text-gold text-ivory transition">
              Sản phẩm
            </Link>
            <Link href="/blog" className="hover:text-gold transition">
              Kiến thức
            </Link>
            <Link href="/policies" className="hover:text-gold transition">
              Chính sách
            </Link>
            <Link href="/support" className="hover:text-gold transition">
              Tư vấn
            </Link>
          </div>

          {/* Desktop Search */}
          <form
            onSubmit={handleSearchSubmit}
            className="hidden md:flex flex-1 max-w-md relative mx-4"
          >
            <input
              type="text"
              placeholder="Tìm whey isolate, creatine, mass, pre-workout..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-charcoal-card border border-charcoal-border rounded-full py-2 pl-4 pr-10 text-sm text-ivory placeholder-slate-DEFAULT focus:outline-none focus:border-gold/60 focus:ring-1 focus:ring-gold/40 transition"
            />
            <button
              type="submit"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-DEFAULT hover:text-gold transition p-1"
            >
              <Search className="w-4 h-4" />
            </button>
          </form>

          {/* Navigation Action Buttons */}
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Wishlist */}
            <Link
              href="/account/wishlist"
              className="hidden sm:flex items-center justify-center w-10 h-10 rounded-full border border-charcoal-border hover:border-gold/40 hover:bg-charcoal-card text-ivory hover:text-gold transition relative"
              title="Danh sách yêu thích"
            >
              <Heart className="w-4 h-4" />
            </Link>

            {/* Cart Badge */}
            <Link
              href="/cart"
              className="flex items-center gap-2 px-3 py-2 rounded-full border border-charcoal-border hover:border-gold/60 bg-charcoal-card hover:bg-charcoal-hover text-ivory transition group relative"
            >
              <ShoppingBag className="w-4 h-4 text-gold group-hover:scale-110 transition" />
              <span className="text-xs font-semibold hidden sm:inline">Giỏ hàng</span>
              {totalItems > 0 && (
                <span className="bg-gold text-charcoal font-bold text-xs px-1.5 py-0.5 rounded-full min-w-[20px] text-center shadow-glow">
                  {totalItems}
                </span>
              )}
            </Link>

            {/* User Dropdown */}
            <div className="relative">
              {user ? (
                <div className="relative">
                  <button
                    onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                    className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-2 rounded-full border border-charcoal-border bg-charcoal-card hover:border-gold/40 transition text-sm"
                  >
                    <div className="w-7 h-7 rounded-full bg-gold/20 text-gold flex items-center justify-center font-bold text-xs uppercase border border-gold/40">
                      {user.fullName.charAt(0)}
                    </div>
                    <span className="hidden sm:inline font-medium text-xs max-w-[100px] truncate text-ivory">
                      {user.fullName}
                    </span>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-DEFAULT hidden sm:inline" />
                  </button>

                  {/* Dropdown Menu */}
                  {isUserDropdownOpen && (
                    <div
                      className="absolute right-0 mt-2 w-64 bg-charcoal-card border border-charcoal-border rounded-xl shadow-card py-2 z-50 text-sm animate-in fade-in slide-in-from-top-2"
                      onMouseLeave={() => setIsUserDropdownOpen(false)}
                    >
                      <div className="px-4 py-2.5 border-b border-charcoal-border/80">
                        <p className="font-semibold text-ivory truncate">{user.fullName}</p>
                        <p className="text-xs text-slate-DEFAULT truncate">{user.email}</p>
                        <div className="mt-1.5 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-gold/10 text-gold border border-gold/30">
                          <Sparkles className="w-2.5 h-2.5" /> Vai trò: {user.role}
                        </div>
                      </div>

                      {/* Role Specific Portals */}
                      {user.role === 'ADMIN' && (
                        <div className="py-1 border-b border-charcoal-border/60">
                          <Link
                            href="/admin/dashboard"
                            onClick={() => setIsUserDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2 text-gold-light hover:bg-gold/10 hover:text-gold transition font-medium"
                          >
                            <LayoutDashboard className="w-4 h-4 text-gold" />
                            Admin Dashboard
                          </Link>
                          <Link
                            href="/staff/dashboard"
                            onClick={() => setIsUserDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2 text-slate-subtle hover:bg-charcoal-hover hover:text-ivory transition"
                          >
                            <Package className="w-4 h-4 text-slate-DEFAULT" />
                            Staff Portal (Vận hành)
                          </Link>
                        </div>
                      )}

                      {user.role === 'STAFF' && (
                        <div className="py-1 border-b border-charcoal-border/60">
                          <Link
                            href="/staff/dashboard"
                            onClick={() => setIsUserDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2 text-gold-light hover:bg-gold/10 hover:text-gold transition font-medium"
                          >
                            <LayoutDashboard className="w-4 h-4 text-gold" />
                            Staff Dashboard
                          </Link>
                        </div>
                      )}

                      {/* Customer Links */}
                      <div className="py-1">
                        <Link
                          href="/account/orders"
                          onClick={() => setIsUserDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-ivory hover:bg-charcoal-hover transition"
                        >
                          <Package className="w-4 h-4 text-slate-DEFAULT" />
                          Đơn hàng của tôi
                        </Link>
                        <Link
                          href="/account/wishlist"
                          onClick={() => setIsUserDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-ivory hover:bg-charcoal-hover transition"
                        >
                          <Heart className="w-4 h-4 text-slate-DEFAULT" />
                          Sản phẩm yêu thích
                        </Link>
                        <Link
                          href="/account/addresses"
                          onClick={() => setIsUserDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-ivory hover:bg-charcoal-hover transition"
                        >
                          <Settings className="w-4 h-4 text-slate-DEFAULT" />
                          Sổ địa chỉ nhận hàng
                        </Link>
                      </div>

                      <div className="pt-1 border-t border-charcoal-border/60">
                        <button
                          onClick={() => {
                            setIsUserDropdownOpen(false);
                            logout();
                          }}
                          className="w-full text-left flex items-center gap-2.5 px-4 py-2 text-rose-400 hover:bg-rose-500/10 transition"
                        >
                          <LogOut className="w-4 h-4" />
                          Đăng xuất
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link
                    href="/auth/login"
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-semibold text-ivory hover:text-gold border border-charcoal-border hover:border-gold/40 bg-charcoal-card transition"
                  >
                    <UserIcon className="w-3.5 h-3.5" />
                    Đăng nhập
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-ivory hover:text-gold border border-charcoal-border bg-charcoal-card"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden mt-3 pt-3 border-t border-charcoal-border flex flex-col gap-3">
            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                type="text"
                placeholder="Tìm sản phẩm..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-charcoal-card border border-charcoal-border rounded-lg py-2 pl-3 pr-10 text-sm text-ivory focus:outline-none focus:border-gold"
              />
              <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-DEFAULT">
                <Search className="w-4 h-4" />
              </button>
            </form>

            <div className="flex flex-col gap-2 py-2 text-sm font-medium text-slate-subtle">
              <Link
                href="/products"
                onClick={() => setIsMobileMenuOpen(false)}
                className="px-2 py-1.5 hover:text-gold text-ivory"
              >
                Tất cả sản phẩm
              </Link>
              {categories.map((c) => (
                <Link
                  key={c.id}
                  href={`/products?category=${c.slug}`}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="px-2 py-1.5 hover:text-gold"
                >
                  {c.name}
                </Link>
              ))}
              <div className="border-t border-charcoal-border my-1 pt-1 flex flex-col gap-2">
                <Link
                  href="/blog"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="px-2 py-1.5 text-gold-light"
                >
                  Kiến thức dinh dưỡng & tập luyện
                </Link>
                <Link
                  href="/policies"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="px-2 py-1.5"
                >
                  Chính sách đổi trả & bảo hành
                </Link>
                <Link
                  href="/support"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="px-2 py-1.5 text-gold"
                >
                  Liên hệ chuyên gia tư vấn
                </Link>
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}

