'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Lock, Mail, ArrowRight, ShieldCheck, AlertCircle, Sparkles } from 'lucide-react';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '';

  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setLoading(true);

    const res = await login(email, password);
    setLoading(false);

    if (res.success) {
      if (redirect) {
        router.push(redirect);
      } else {
        // Fetch session to determine role
        const me = await (await fetch('/api/auth/me')).json();
        if (me.user?.role === 'ADMIN') {
          router.push('/admin/dashboard');
        } else if (me.user?.role === 'STAFF') {
          router.push('/staff/dashboard');
        } else {
          router.push('/');
        }
      }
    } else {
      setErrorMessage(res.message || 'Email hoặc mật khẩu không chính xác');
    }
  };

  const handleQuickFill = (role: 'ADMIN' | 'STAFF' | 'USER') => {
    if (role === 'ADMIN') {
      setEmail('admin@vitacore.vn');
      setPassword('Vitacore@2026');
    } else if (role === 'STAFF') {
      setEmail('staff@vitacore.vn');
      setPassword('Vitacore@2026');
    } else {
      setEmail('customer@vitacore.vn');
      setPassword('Vitacore@2026');
    }
  };

  return (
    <div className="bg-charcoal min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-gold/10 blur-[130px] rounded-full pointer-events-none" />

      <div className="max-w-md w-full space-y-6 card-luxury p-8 border-gold/30 relative z-10">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gold/10 text-gold border border-gold/30 mb-3 shadow-glow">
            <Lock className="w-6 h-6" />
          </div>
          <h2 className="font-display font-black text-2xl text-ivory">
            ĐĂNG NHẬP VITACORE
          </h2>
          <p className="text-xs text-slate-subtle mt-1">
            Truy cập tài khoản khách hàng, nhân viên hoặc quản trị
          </p>
        </div>

        {/* Quick Fill Test Accounts Banner */}
        <div className="p-3 rounded-xl bg-charcoal-deep border border-charcoal-border text-xs">
          <span className="text-gold-light font-bold flex items-center gap-1 mb-2 text-[11px] uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" /> Điền nhanh tài khoản mẫu:
          </span>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleQuickFill('ADMIN')}
              className="py-1 px-2 rounded bg-charcoal-card border border-gold/40 text-[11px] font-bold text-gold hover:bg-gold hover:text-charcoal transition"
            >
              Admin
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill('STAFF')}
              className="py-1 px-2 rounded bg-charcoal-card border border-blue-400/40 text-[11px] font-bold text-blue-400 hover:bg-blue-400 hover:text-charcoal transition"
            >
              Staff
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill('USER')}
              className="py-1 px-2 rounded bg-charcoal-card border border-emerald-400/40 text-[11px] font-bold text-emerald-400 hover:bg-emerald-400 hover:text-charcoal transition"
            >
              User
            </button>
          </div>
        </div>

        {errorMessage && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-subtle mb-1 font-semibold">Địa chỉ Email</label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-charcoal-deep border border-charcoal-border rounded-xl py-3 pl-3 pr-10 text-ivory focus:outline-none focus:border-gold"
                placeholder="name@example.com"
              />
              <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-DEFAULT" />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-slate-subtle font-semibold">Mật khẩu</label>
            </div>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-charcoal-deep border border-charcoal-border rounded-xl py-3 pl-3 pr-10 text-ivory focus:outline-none focus:border-gold font-mono"
                placeholder="••••••••"
              />
              <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-DEFAULT" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl font-display font-bold text-xs uppercase tracking-wider bg-gold hover:bg-gold-light text-charcoal transition shadow-glow flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <span>Đang xác thực...</span>
            ) : (
              <>
                <span>Đăng nhập</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="pt-4 border-t border-charcoal-border/60 text-center text-xs text-slate-subtle">
          Chưa có tài khoản?{' '}
          <Link href="/auth/register" className="text-gold font-bold hover:underline">
            Đăng ký ngay
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-charcoal flex items-center justify-center text-ivory">Đang tải...</div>}>
      <LoginForm />
    </Suspense>
  );
}
