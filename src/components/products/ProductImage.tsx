'use client';

import React, { useEffect, useRef, useState } from 'react';

interface ProductImageProps {
  src?: string | null;
  alt: string;
  /** Tên thương hiệu hiển thị trên placeholder */
  brandName?: string | null;
  className?: string;
  imgClassName?: string;
  loading?: 'lazy' | 'eager';
}

/**
 * Ảnh sản phẩm tỉ lệ 1:1, object-fit: contain, nền đồng nhất.
 * Thiếu ảnh hoặc ảnh lỗi -> placeholder hũ sản phẩm xám kèm tên thương hiệu.
 * Không dùng ảnh lifestyle/người tập làm ảnh sản phẩm.
 */
export default function ProductImage({
  src,
  alt,
  brandName,
  className = '',
  imgClassName = '',
  loading = 'lazy',
}: ProductImageProps) {
  const [failed, setFailed] = useState(!src);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    setFailed(!src);
  }, [src]);

  // Ảnh có thể lỗi trước khi React gắn onError (SSR) -> kiểm tra lại sau khi mount
  useEffect(() => {
    const el = imgRef.current;
    if (el && el.complete && el.naturalWidth === 0) setFailed(true);
  }, [src]);

  return (
    <div
      className={`relative aspect-square w-full overflow-hidden bg-charcoal-deep/70 ${className}`}
    >
      {failed || !src ? (
        <div
          role="img"
          aria-label={`${alt} (chưa có ảnh)`}
          className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-4"
        >
          <svg viewBox="0 0 80 100" className="h-[55%] w-auto" aria-hidden="true">
            <rect x="18" y="4" width="44" height="14" rx="4" fill="#3A4350" />
            <rect x="12" y="16" width="56" height="78" rx="10" fill="#2B323C" />
            <rect x="18" y="38" width="44" height="34" rx="4" fill="#3A4350" />
            <rect x="24" y="46" width="32" height="4" rx="2" fill="#2B323C" />
            <rect x="24" y="56" width="20" height="4" rx="2" fill="#2B323C" />
          </svg>
          <span className="max-w-full truncate px-2 text-center text-sm font-semibold uppercase tracking-wider text-slate-subtle">
            {brandName || 'VITACORE'}
          </span>
        </div>
      ) : (
        <img
          ref={imgRef}
          src={src}
          alt={alt}
          loading={loading}
          onError={() => setFailed(true)}
          className={`absolute inset-0 h-full w-full object-contain object-center p-4 ${imgClassName}`}
        />
      )}
    </div>
  );
}
