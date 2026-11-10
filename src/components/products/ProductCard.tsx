'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Star, ShoppingBag, Heart, Check, Loader2 } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { useCart } from '@/context/CartContext';
import { goalLabel } from '@/config/home';
import ProductImage from '@/components/products/ProductImage';

export interface ProductCardProps {
  id: string;
  name: string;
  slug: string;
  price: number;
  salePrice?: number | null;
  ratingAvg?: number;
  reviewCount?: number;
  goal?: string;
  brand?: { name: string; slug: string } | null;
  images?: Array<{ url: string; alt?: string; isThumbnail?: boolean }>;
  variants?: Array<{
    id: string;
    title: string;
    price: number;
    salePrice?: number | null;
    inStock: number;
    flavor?: string | null;
    weight?: string | null;
    packaging?: string | null;
  }>;
}

type AddState = 'idle' | 'loading' | 'added';

export default function ProductCard({
  id,
  name,
  slug,
  price,
  salePrice,
  ratingAvg = 5.0,
  reviewCount = 0,
  goal,
  brand,
  images = [],
  variants = [],
}: ProductCardProps) {
  const { addToCart } = useCart();
  const [addState, setAddState] = useState<AddState>('idle');
  const [isFavorited, setIsFavorited] = useState(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    const pending = timers.current;
    return () => pending.forEach(clearTimeout);
  }, []);

  const imageUrl = images.find((i) => i.isThumbnail)?.url || images[0]?.url || '';
  const effectivePrice = salePrice || price;
  const hasDiscount = !!salePrice && salePrice < price;
  const discountPercent = hasDiscount ? Math.round(((price - (salePrice as number)) / price) * 100) : 0;
  const goalText = goalLabel(goal);

  // Determine stock from variants or default
  const totalStock = variants.length > 0 ? variants.reduce((sum, v) => sum + v.inStock, 0) : 10;
  const isOutOfStock = totalStock <= 0;

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isOutOfStock || addState !== 'idle') return;

    const selectedVariant = variants.length > 0 ? variants[0] : null;

    setAddState('loading');
    addToCart(
      {
        productId: id,
        variantId: selectedVariant?.id || null,
        productName: name,
        productSlug: slug,
        productImage: imageUrl,
        variantTitle: selectedVariant?.title || null,
        price: selectedVariant ? selectedVariant.salePrice || selectedVariant.price : effectivePrice,
        originalPrice: selectedVariant?.price || price,
        inStock: selectedVariant?.inStock || totalStock,
      },
      1
    );
    // Phản hồi ngắn để người dùng thấy nút đã nhận thao tác
    timers.current.push(
      setTimeout(() => {
        setAddState('added');
        timers.current.push(setTimeout(() => setAddState('idle'), 1500));
      }, 350)
    );
  };

  const handleToggleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      const res = await fetch('/api/wishlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: id }),
      });
      if (res.ok) {
        const data = await res.json();
        setIsFavorited(data.isFavorited);
      }
    } catch {
      // ignore
    }
  };

  const buttonBase =
    'mt-4 flex min-h-[44px] w-full items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-bold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-charcoal-card';

  return (
    <div className="group card-luxury relative flex flex-col justify-between overflow-hidden">
      {/* Badges: giảm giá = vàng thương hiệu, nhãn danh mục = trung tính */}
      <div className="absolute left-3 top-3 z-10 flex flex-col items-start gap-1.5">
        {hasDiscount && (
          <span className="rounded-md bg-gold px-2 py-0.5 text-sm font-extrabold tracking-wide text-charcoal shadow-md">
            -{discountPercent}%
          </span>
        )}
        {goalText && (
          <span className="rounded-md border border-charcoal-border bg-charcoal-deep/85 px-2 py-0.5 text-sm font-semibold text-ivory-muted backdrop-blur-sm">
            {goalText}
          </span>
        )}
      </div>

      {/* Wishlist Button (vùng bấm 44px) */}
      <button
        type="button"
        onClick={handleToggleWishlist}
        className={`absolute right-2 top-2 z-10 flex h-11 w-11 items-center justify-center rounded-full backdrop-blur-md transition focus:outline-none focus-visible:ring-2 focus-visible:ring-gold ${
          isFavorited
            ? 'border border-rose-500/40 bg-rose-500/20 text-rose-500'
            : 'border border-charcoal-border bg-charcoal-deep/60 text-slate-subtle hover:text-rose-400'
        }`}
        title="Lưu vào yêu thích"
        aria-label="Lưu vào yêu thích"
        aria-pressed={isFavorited}
      >
        <Heart className={`h-4 w-4 ${isFavorited ? 'fill-current text-rose-500' : ''}`} />
      </button>

      {/* Product Image */}
      <Link href={`/products/${slug}`} className="block" aria-label={name}>
        <ProductImage
          src={imageUrl}
          alt={name}
          brandName={brand?.name}
          imgClassName="transform transition-transform duration-500 ease-out group-hover:scale-105"
        />
      </Link>

      {/* Product Content */}
      <div className="flex flex-1 flex-col justify-between p-4">
        <div>
          <div className="mb-1.5 flex items-center justify-between gap-2 text-sm">
            <span className="max-w-[140px] truncate font-semibold uppercase tracking-wider text-gold-light">
              {brand?.name || 'VITACORE'}
            </span>
            <div className="flex items-center gap-1 text-amber-400">
              <Star className="h-3.5 w-3.5 fill-current" />
              <span className="font-bold text-ivory">{ratingAvg.toFixed(1)}</span>
              <span className="text-slate-subtle">({reviewCount})</span>
            </div>
          </div>

          <Link href={`/products/${slug}`} className="block transition group-hover:text-gold">
            <h3 className="line-clamp-2 min-h-[2.75rem] text-base font-semibold leading-snug text-ivory">
              {name}
            </h3>
          </Link>

          {variants.length > 0 && (
            <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
              {variants.slice(0, 2).map((v) => (
                <span
                  key={v.id}
                  className="max-w-full truncate rounded border border-charcoal-border/50 bg-charcoal-deep px-1.5 py-0.5 text-sm text-slate-subtle"
                >
                  {v.flavor || v.weight || v.title}
                </span>
              ))}
              {variants.length > 2 && (
                <span className="text-sm text-slate-subtle">+{variants.length - 2} loại</span>
              )}
            </div>
          )}
        </div>

        <div>
          <div className="mt-4 flex flex-wrap items-baseline gap-x-2 border-t border-charcoal-border/60 pt-3">
            <span className="font-display text-lg font-extrabold text-gold">
              {formatCurrency(effectivePrice)}
            </span>
            {hasDiscount && (
              <span className="text-sm text-slate-subtle line-through">{formatCurrency(price)}</span>
            )}
          </div>

          <button
            type="button"
            onClick={handleQuickAdd}
            disabled={isOutOfStock || addState === 'loading'}
            aria-live="polite"
            className={`${buttonBase} ${
              isOutOfStock
                ? 'cursor-not-allowed border border-zinc-700 bg-zinc-800 text-zinc-400'
                : addState === 'added'
                ? 'bg-emerald-600 text-white'
                : addState === 'loading'
                ? 'cursor-wait bg-gold/80 text-charcoal'
                : 'bg-gold text-charcoal shadow-glow hover:bg-gold-light active:scale-[0.98]'
            }`}
          >
            {isOutOfStock ? (
              <span>Hết hàng</span>
            ) : addState === 'loading' ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Đang thêm...</span>
              </>
            ) : addState === 'added' ? (
              <>
                <Check className="h-4 w-4" />
                <span>Đã thêm vào giỏ</span>
              </>
            ) : (
              <>
                <ShoppingBag className="h-4 w-4" />
                <span>Thêm vào giỏ</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
