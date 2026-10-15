'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Star, ShoppingBag, Heart, Check, Sparkles } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { useCart } from '@/context/CartContext';

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
  const [isAdded, setIsAdded] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);

  const imageUrl = images[0]?.url || 'https://images.unsplash.com/photo-1579722821273-0f6c7d44362f?auto=format&fit=crop&w=800&q=80';
  const effectivePrice = salePrice || price;
  const hasDiscount = salePrice && salePrice < price;
  const discountPercent = hasDiscount ? Math.round(((price - salePrice) / price) * 100) : 0;

  // Determine stock from variants or default
  const totalStock = variants.length > 0 ? variants.reduce((sum, v) => sum + v.inStock, 0) : 10;
  const isOutOfStock = totalStock <= 0;

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isOutOfStock) return;

    const selectedVariant = variants.length > 0 ? variants[0] : null;

    addToCart({
      productId: id,
      variantId: selectedVariant?.id || null,
      productName: name,
      productSlug: slug,
      productImage: imageUrl,
      variantTitle: selectedVariant?.title || null,
      price: selectedVariant ? (selectedVariant.salePrice || selectedVariant.price) : effectivePrice,
      originalPrice: selectedVariant?.price || price,
      inStock: selectedVariant?.inStock || totalStock,
    }, 1);

    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 1500);
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

  return (
    <div className="group card-luxury flex flex-col justify-between overflow-hidden relative">
      {/* Badges Overlay */}
      <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5 items-start">
        {hasDiscount && (
          <span className="bg-rose-600/90 text-white font-extrabold text-[11px] px-2 py-0.5 rounded-md shadow-md tracking-wider">
            -{discountPercent}%
          </span>
        )}
        {goal && (
          <span className="bg-emerald-950/80 border border-emerald-500/30 text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-md backdrop-blur-sm">
            {goal}
          </span>
        )}
      </div>

      {/* Wishlist Button */}
      <button
        onClick={handleToggleWishlist}
        className={`absolute top-3 right-3 z-10 p-2 rounded-full backdrop-blur-md transition ${
          isFavorited
            ? 'bg-rose-500/20 text-rose-500 border border-rose-500/40'
            : 'bg-charcoal-deep/60 text-slate-subtle hover:text-rose-400 border border-charcoal-border'
        }`}
        title="Lưu vào yêu thích"
      >
        <Heart className={`w-4 h-4 ${isFavorited ? 'fill-current text-rose-500' : ''}`} />
      </button>

      {/* Product Image */}
      <Link href={`/products/${slug}`} className="block relative aspect-square overflow-hidden bg-charcoal-deep/50 p-4">
        <img
          src={imageUrl}
          alt={name}
          className="w-full h-full object-contain object-center transform group-hover:scale-105 transition-transform duration-500 ease-out"
          loading="lazy"
        />
      </Link>

      {/* Product Content */}
      <div className="p-4 flex flex-col flex-1 justify-between">
        <div>
          {/* Brand & Ratings */}
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-gold-light font-semibold uppercase tracking-wider text-[11px] truncate max-w-[140px]">
              {brand?.name || 'VITACORE'}
            </span>
            <div className="flex items-center gap-1 text-amber-400">
              <Star className="w-3.5 h-3.5 fill-current" />
              <span className="font-bold text-ivory text-xs">{ratingAvg.toFixed(1)}</span>
              <span className="text-slate-DEFAULT text-[10px]">({reviewCount})</span>
            </div>
          </div>

          {/* Title */}
          <Link href={`/products/${slug}`} className="block group-hover:text-gold transition">
            <h3 className="font-semibold text-ivory text-sm leading-snug line-clamp-2 min-h-[2.5rem]">
              {name}
            </h3>
          </Link>

          {/* Variants info snippet */}
          {variants.length > 0 && (
            <div className="mt-1.5 flex items-center gap-1.5 flex-wrap">
              {variants.slice(0, 2).map((v) => (
                <span key={v.id} className="text-[10px] text-slate-subtle bg-charcoal-deep px-1.5 py-0.5 rounded border border-charcoal-border/50">
                  {v.flavor || v.weight || v.title}
                </span>
              ))}
              {variants.length > 2 && (
                <span className="text-[10px] text-slate-DEFAULT">+{variants.length - 2} vị</span>
              )}
            </div>
          )}
        </div>

        {/* Pricing & Add To Cart Button */}
        <div className="mt-4 pt-3 border-t border-charcoal-border/60 flex items-center justify-between gap-2">
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="font-display font-extrabold text-base text-gold">
                {formatCurrency(effectivePrice)}
              </span>
            </div>
            {hasDiscount && (
              <span className="text-xs text-slate-DEFAULT line-through">
                {formatCurrency(price)}
              </span>
            )}
          </div>

          {/* Quick Add Button */}
          <button
            onClick={handleQuickAdd}
            disabled={isOutOfStock}
            className={`p-2.5 rounded-lg font-bold text-xs flex items-center gap-1.5 transition ${
              isOutOfStock
                ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed border border-zinc-700'
                : isAdded
                ? 'bg-emerald-600 text-white shadow-glow'
                : 'bg-gold hover:bg-gold-light text-charcoal shadow-glow'
            }`}
            title={isOutOfStock ? 'Hết hàng' : 'Thêm nhanh vào giỏ'}
          >
            {isOutOfStock ? (
              <span className="text-[10px] px-1">Hết hàng</span>
            ) : isAdded ? (
              <>
                <Check className="w-4 h-4" />
                <span className="hidden sm:inline">Đã thêm</span>
              </>
            ) : (
              <>
                <ShoppingBag className="w-4 h-4" />
                <span className="hidden sm:inline">Mua</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
