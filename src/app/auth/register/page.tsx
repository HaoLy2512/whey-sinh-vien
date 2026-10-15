'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { User, Mail, Lock, Phone, ArrowRight, AlertCircle, ShieldCheck } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (password !== confirmPassword) {
      setErrorMessage('Mật khẩu xác nhận không trùng khớp');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('Mật khẩu phải có tối thiểu 6 ký tự');
      return;
    }

    setLoading(true);
    const res = await register({ fullName, email, phone, password });
    setLoading(false);

    if (res.success) {
      router.push('/');
    } else {
      setErrorMessage(res.message || 'Lỗi khi tạo tài khoản');
    }
  };

  return (
    <div className="bg-charcoal min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-gold/10 blur-[130px] rounded-full pointer-events-none" />

      <div className="max-w-md w-full space-y-6 card-luxury p-8 border-gold/30 relative z-10">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gold/10 text-gold border border-gold/30 mb-3 shadow-glow">
            <User className="w-6 h-6" />
          </div>
          <h2 className="font-display font-black text-2xl text-ivory">
            ĐĂNG KÝ THÀNH VIÊN
          </h2>
          <p className="text-xs text-slate-subtle mt-1">
            Gia nhập cộng đồng gymer & nhận ngay ưu đãi 100.000₫
          </p>
        </div>

        {errorMessage && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-subtle mb-1 font-semibold">Họ và tên *</label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full bg-charcoal-deep border border-charcoal-border rounded-xl p-3 text-ivory focus:outline-none focus:border-gold"
              placeholder="Nguyễn Văn A"
            />
          </div>

          <div>
            <label className="block text-slate-subtle mb-1 font-semibold">Địa chỉ Email *</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-charcoal-deep border border-charcoal-border rounded-xl p-3 text-ivory focus:outline-none focus:border-gold"
              placeholder="name@example.com"
            />
          </div>

          <div>
            <label className="block text-slate-subtle mb-1 font-semibold">Số điện thoại</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full bg-charcoal-deep border border-charcoal-border rounded-xl p-3 text-ivory focus:outline-none focus:border-gold"
              placeholder="0909 123 456"
            />
          </div>

          <div>
            <label className="block text-slate-subtle mb-1 font-semibold">Mật khẩu *</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-charcoal-deep border border-charcoal-border rounded-xl p-3 text-ivory focus:outline-none focus:border-gold font-mono"
              placeholder="Tối thiểu 6 ký tự"
            />
          </div>

          <div>
            <label className="block text-slate-subtle mb-1 font-semibold">Xác nhận mật khẩu *</label>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full bg-charcoal-deep border border-charcoal-border rounded-xl p-3 text-ivory focus:outline-none focus:border-gold font-mono"
              placeholder="Nhập lại mật khẩu"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl font-display font-bold text-xs uppercase tracking-wider bg-gold hover:bg-gold-light text-charcoal transition shadow-glow flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <span>Đang tạo tài khoản...</span>
            ) : (
              <>
                <span>Tạo tài khoản ngay</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="pt-4 border-t border-charcoal-border/60 text-center text-xs text-slate-subtle">
          Đã có tài khoản?{' '}
          <Link href="/auth/login" className="text-gold font-bold hover:underline">
            Đăng nhập
          </Link>
        </div>
      </div>
    </div>
  );
}

