'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { formatCurrency } from '@/lib/utils';
import { Heart, Trash2, ShoppingBag, ChevronRight } from 'lucide-react';

export default function AccountWishlistPage() {
  const { user, isLoading } = useAuth();
  const { addToCart } = useCart();
  const router = useRouter();

  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchWishlist = () => {
    fetch('/api/wishlist')
      .then((res) => res.json())
      .then((data) => {
        if (data.items) setItems(data.items);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/auth/login?redirect=/account/wishlist');
      return;
    }
    if (user) {
      fetchWishlist();
    }
  }, [user, isLoading, router]);

  const handleRemove = async (productId: string) => {
    await fetch('/api/wishlist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId }),
    });
    fetchWishlist();
  };

  if (isLoading || loading) {
    return (
      <div className="min-h-screen bg-charcoal flex items-center justify-center p-8">
        <div className="w-12 h-12 rounded-full border-2 border-gold border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="bg-charcoal min-h-screen py-10">
      <div className="max-w-6xl mx-auto px-4 lg:px-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-slate-DEFAULT mb-6">
          <Link href="/" className="hover:text-gold transition">Trang chủ</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-ivory font-semibold">Tài khoản</span>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-gold-light">Sản phẩm yêu thích</span>
        </div>

        <h1 className="font-display font-black text-2xl sm:text-3xl text-ivory mb-8">
          DANH SÁCH YÊU THÍCH ({items.length})
        </h1>

        {items.length === 0 ? (
          <div className="card-luxury p-12 text-center">
            <Heart className="w-12 h-12 text-slate-DEFAULT mx-auto mb-3 opacity-50" />
            <h3 className="font-display font-bold text-lg text-ivory">Chưa có sản phẩm yêu thích</h3>
            <p className="text-xs text-slate-subtle mt-1 mb-6">
              Bạn có thể nhấn vào biểu tượng trái tim ở từng sản phẩm để lưu lại xem sau
            </p>
            <Link href="/products" className="px-6 py-3 rounded-xl bg-gold text-charcoal font-bold text-xs inline-block">
              Khám phá sản phẩm ngay
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((item) => {
              const p = item.product;
              return (
                <div key={item.id} className="card-luxury p-4 flex flex-col justify-between">
                  <Link href={`/products/${p.slug}`} className="block aspect-square bg-charcoal-deep rounded-xl p-4 mb-3">
                    <img
                      src={p.images?.[0]?.url || 'https://images.unsplash.com/photo-1579722821273-0f6c7d44362f?auto=format&fit=crop&w=800&q=80'}
                      alt={p.name}
                      className="w-full h-full object-contain"
                    />
                  </Link>

                  <div>
                    <span className="text-[10px] text-gold font-bold uppercase">{p.brand?.name}</span>
                    <Link href={`/products/${p.slug}`}>
                      <h3 className="font-bold text-sm text-ivory line-clamp-2 hover:text-gold transition mt-0.5">
                        {p.name}
                      </h3>
                    </Link>
                    <p className="font-display font-black text-gold text-base mt-2">
                      {formatCurrency(p.salePrice || p.price)}
                    </p>
                  </div>

                  <div className="flex gap-2 mt-4 pt-3 border-t border-charcoal-border/60">
                    <button
                      onClick={() => {
                        addToCart({
                          productId: p.id,
                          productName: p.name,
                          productSlug: p.slug,
                          productImage: p.images?.[0]?.url || '',
                          price: p.salePrice || p.price,
                          inStock: 10,
                        }, 1);
                        handleRemove(p.id);
                      }}
                      className="flex-1 py-2 rounded-lg bg-gold hover:bg-gold-light text-charcoal font-bold text-xs transition flex items-center justify-center gap-1.5 shadow-glow"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      Chuyển vào giỏ
                    </button>
                    <button
                      onClick={() => handleRemove(p.id)}
                      className="p-2 rounded-lg bg-charcoal-deep border border-charcoal-border text-slate-DEFAULT hover:text-rose-400 transition"
                      title="Xóa"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

