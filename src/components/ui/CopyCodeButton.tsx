'use client';

import React, { useState } from 'react';
import { Check, Copy } from 'lucide-react';

export default function CopyCodeButton({ code, className = '' }: { code: string; className?: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Trình duyệt chặn clipboard: không làm gì, mã vẫn hiển thị trên nút
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={`inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl border border-gold/40 bg-charcoal-deep px-4 py-2.5 font-mono text-sm font-bold text-gold transition hover:bg-gold hover:text-charcoal focus:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-charcoal sm:w-auto ${className}`}
      aria-label={copied ? 'Đã sao chép mã' : `Sao chép mã ${code}`}
    >
      {copied ? (
        <>
          <Check className="h-4 w-4 text-emerald-400" />
          <span className="text-emerald-400">Đã sao chép</span>
        </>
      ) : (
        <>
          <Copy className="h-4 w-4" />
          <span>{code}</span>
        </>
      )}
    </button>
  );
}
