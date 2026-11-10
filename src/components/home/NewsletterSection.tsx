'use client';

import React, { useState } from 'react';
import { Mail, Check, Sparkles, AlertCircle, Loader2 } from 'lucide-react';
import { PROMO, formatMoneyShort } from '@/config/promo';

type Status = 'idle' | 'submitting' | 'success' | 'error';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export default function NewsletterSection() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (status === 'submitting') return;

    const value = email.trim();
    if (!EMAIL_RE.test(value)) {
      setStatus('error');
      setMessage('Email chưa hợp lệ. Ví dụ: ten@gmail.com');
      return;
    }

    setStatus('submitting');
    setMessage('');
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: value }),
      });
      const data = (await res.json().catch(() => ({}))) as { message?: string; code?: string };
      if (!res.ok) {
        setStatus('error');
        setMessage(data.message || 'Không thể đăng ký lúc này. Vui lòng thử lại sau.');
        return;
      }
      setStatus('success');
      setMessage(data.message || `Đăng ký thành công! Dùng mã ${data.code ?? PROMO.firstOrderVoucher.code} ở bước thanh toán.`);
      setEmail('');
    } catch {
      setStatus('error');
      setMessage('Lỗi kết nối. Vui lòng kiểm tra mạng và thử lại.');
    }
  };

  return (
    <section className="relative overflow-hidden border-b border-charcoal-border/50 bg-charcoal py-12 sm:py-16">
      <div className="relative z-10 mx-auto max-w-4xl px-4 text-center lg:px-8">
        <div className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-gold/30 bg-gold/10 px-3 py-1 text-sm font-bold uppercase tracking-wider text-gold-light">
          <Sparkles className="h-3.5 w-3.5 text-gold" />
          <span>Nhận tin ưu đãi</span>
        </div>

        <h2 className="mb-3 font-display text-2xl font-black text-ivory sm:text-4xl">
          NHẬN VOUCHER <span className="gold-gradient-text">{formatMoneyShort(PROMO.firstOrderVoucher.amount)}</span> CHO
          ĐƠN HÀNG ĐẦU TIÊN
        </h2>

        <p className="mx-auto mb-8 max-w-xl text-sm text-slate-subtle">
          Đăng ký email để nhận mã giảm giá và bài viết dinh dưỡng mới. Bạn có thể hủy bất kỳ lúc nào.
        </p>

        {status === 'success' ? (
          <div
            role="status"
            className="mx-auto inline-flex max-w-md items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm font-semibold text-emerald-400"
          >
            <Check className="h-5 w-5 flex-shrink-0" />
            <span>{message}</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate className="mx-auto flex max-w-md flex-col items-stretch gap-3 sm:flex-row">
            <div className="relative w-full">
              <label htmlFor="newsletter-email" className="sr-only">
                Địa chỉ email
              </label>
              <input
                id="newsletter-email"
                type="email"
                inputMode="email"
                autoComplete="email"
                placeholder="Nhập địa chỉ email của bạn"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (status === 'error') setStatus('idle');
                }}
                aria-invalid={status === 'error'}
                aria-describedby={status === 'error' ? 'newsletter-error' : undefined}
                className="min-h-[48px] w-full rounded-xl border border-charcoal-border bg-charcoal-card py-3 pl-4 pr-10 text-sm text-ivory placeholder-slate-subtle focus:border-gold focus:outline-none focus-visible:ring-2 focus-visible:ring-gold"
              />
              <Mail className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-subtle" />
            </div>

            <button
              type="submit"
              disabled={status === 'submitting'}
              className="flex min-h-[48px] flex-shrink-0 items-center justify-center gap-2 rounded-xl bg-gold px-6 py-3 font-display text-sm font-extrabold uppercase tracking-wider text-charcoal shadow-glow transition hover:bg-gold-light focus:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-charcoal disabled:cursor-wait disabled:opacity-80"
            >
              {status === 'submitting' ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Đang gửi...</span>
                </>
              ) : (
                <span>Đăng ký</span>
              )}
            </button>
          </form>
        )}

        {status === 'error' && (
          <p id="newsletter-error" role="alert" className="mt-3 inline-flex items-center gap-1.5 text-sm text-rose-400">
            <AlertCircle className="h-4 w-4" />
            {message}
          </p>
        )}
      </div>
    </section>
  );
}
