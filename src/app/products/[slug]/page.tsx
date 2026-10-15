'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Star,
  ShoppingBag,
  Heart,
  ShieldCheck,
  Truck,
  RotateCcw,
  Check,
  AlertCircle,
  ChevronRight,
  Info,
  Flame,
  Award,
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';

export default function ProductDetailPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const router = useRouter();

  const { addToCart } = useCart();
  const { user } = useAuth();

  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedVariant, setSelectedVariant] = useState<any>(null);
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'desc' | 'nutrition' | 'usage' | 'reviews'>('desc');
  const [isAdded, setIsAdded] = useState(false);

  // Review submission state
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewComment, setReviewComment] = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewSuccessMessage, setReviewSuccessMessage] = useState('');
  const [reviewErrorMessage, setReviewErrorMessage] = useState('');

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    fetch(`/api/products/${slug}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.product) {
          setProduct(data.product);
          if (data.product.variants && data.product.variants.length > 0) {
            setSelectedVariant(data.product.variants[0]);
          }
          if (data.product.images && data.product.images.length > 0) {
            setSelectedImage(data.product.images[0].url);
          }
        }
      })
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-charcoal flex items-center justify-center p-8">
        <div className="w-12 h-12 rounded-full border-2 border-gold border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-charcoal flex flex-col items-center justify-center p-8 text-center">
        <AlertCircle className="w-12 h-12 text-rose-500 mb-4" />
        <h2 className="font-display font-bold text-xl text-ivory">Không tìm thấy sản phẩm</h2>
        <p className="text-xs text-slate-subtle mt-1 mb-6">Sản phẩm có thể đã ngừng kinh doanh hoặc đường dẫn không đúng</p>
        <Link href="/products" className="px-6 py-3 rounded-xl bg-gold text-charcoal font-bold text-xs">
          Về danh mục sản phẩm
        </Link>
      </div>
    );
  }

  const currentPrice = selectedVariant ? (selectedVariant.salePrice || selectedVariant.price) : (product.salePrice || product.price);
  const originalPrice = selectedVariant ? selectedVariant.price : product.price;
  const hasDiscount = (selectedVariant?.salePrice && selectedVariant.salePrice < selectedVariant.price) || (!selectedVariant && product.salePrice && product.salePrice < product.price);
  const currentStock = selectedVariant ? selectedVariant.inStock : 10;
  const isOutOfStock = currentStock <= 0;

  // Parse Nutrition Facts JSON safely
  let nutritionObj: any = null;
  try {
    if (product.nutritionFacts) {
      nutritionObj = JSON.parse(product.nutritionFacts);
    }
  } catch {
    nutritionObj = null;
  }

  const handleAddToCart = () => {
    if (isOutOfStock) return;

    addToCart(
      {
        productId: product.id,
        variantId: selectedVariant?.id || null,
        productName: product.name,
        productSlug: product.slug,
        productImage: selectedImage || product.images?.[0]?.url || '',
        variantTitle: selectedVariant?.title || null,
        price: currentPrice,
        originalPrice,
        inStock: currentStock,
      },
      quantity
    );

    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  const handleBuyNow = () => {
    handleAddToCart();
    router.push('/checkout');
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setReviewErrorMessage('Vui lòng đăng nhập để gửi nhận xét');
      return;
    }

    setReviewSubmitting(true);
    setReviewErrorMessage('');
    setReviewSuccessMessage('');

    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product.id,
          rating: reviewRating,
          title: reviewTitle,
          comment: reviewComment,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setReviewErrorMessage(data.message || 'Lỗi gửi đánh giá');
      } else {
        setReviewSuccessMessage('Cảm ơn bạn! Đánh giá đã được ghi nhận thành công.');
        setReviewComment('');
        setReviewTitle('');
        // Reload product to update review list
        fetch(`/api/products/${slug}`)
          .then((r) => r.json())
          .then((d) => d.product && setProduct(d.product));
      }
    } catch {
      setReviewErrorMessage('Lỗi kết nối khi gửi đánh giá');
    } finally {
      setReviewSubmitting(false);
    }
  };

  return (
    <div className="bg-charcoal min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 lg:px-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-slate-DEFAULT mb-8 flex-wrap">
          <Link href="/" className="hover:text-gold transition">Trang chủ</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <Link href="/products" className="hover:text-gold transition">Sản phẩm</Link>
          {product.category && (
            <>
              <ChevronRight className="w-3.5 h-3.5" />
              <Link href={`/products?category=${product.category.slug}`} className="hover:text-gold transition">
                {product.category.name}
              </Link>
            </>
          )}
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-ivory font-semibold truncate max-w-xs">{product.name}</span>
        </div>

        {/* Product Overview Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 mb-16">
          {/* Left Column: Image Gallery */}
          <div className="lg:col-span-5 flex flex-col items-center">
            {/* Main Showcase Image */}
            <div className="w-full aspect-square bg-charcoal-card rounded-2xl border border-charcoal-border p-8 flex items-center justify-center relative overflow-hidden group">
              <img
                src={selectedImage || 'https://images.unsplash.com/photo-1579722821273-0f6c7d44362f?auto=format&fit=crop&w=800&q=80'}
                alt={product.name}
                className="w-full h-full object-contain filter drop-shadow-[0_15px_25px_rgba(0,0,0,0.6)] group-hover:scale-105 transition-transform duration-500"
              />
              {hasDiscount && (
                <span className="absolute top-4 left-4 bg-rose-600 font-extrabold text-xs px-2.5 py-1 rounded-md text-white shadow-md">
                  Giảm giá đặc biệt
                </span>
              )}
            </div>

            {/* Thumbnail Carousel */}
            {product.images && product.images.length > 1 && (
              <div className="flex items-center gap-3 mt-4 overflow-x-auto w-full pb-2">
                {product.images.map((img: any) => (
                  <button
                    key={img.id}
                    onClick={() => setSelectedImage(img.url)}
                    className={`w-16 h-16 rounded-xl bg-charcoal-card p-1 border transition flex-shrink-0 ${
                      selectedImage === img.url ? 'border-gold shadow-glow' : 'border-charcoal-border hover:border-slate-DEFAULT'
                    }`}
                  >
                    <img src={img.url} alt={img.alt || ''} className="w-full h-full object-contain" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Product Config & Buy Section */}
          <div className="lg:col-span-7 flex flex-col justify-between">
            <div>
              {/* Brand & Goal Badge */}
              <div className="flex items-center justify-between mb-2">
                <Link
                  href={`/products?brand=${product.brand?.slug}`}
                  className="text-xs font-bold text-gold uppercase tracking-widest hover:underline"
                >
                  {product.brand?.name || 'VITACORE NUTRITION'}
                </Link>
                <span className="bg-emerald-950/80 border border-emerald-500/30 text-emerald-300 text-xs font-bold px-2.5 py-0.5 rounded-full">
                  Mục tiêu: {product.goal}
                </span>
              </div>

              {/* Title */}
              <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-ivory mb-3 leading-snug">
                {product.name}
              </h1>

              {/* Ratings & SKU */}
              <div className="flex items-center gap-4 text-xs text-slate-DEFAULT pb-4 mb-4 border-b border-charcoal-border/60">
                <div className="flex items-center gap-1.5 text-amber-400">
                  <Star className="w-4 h-4 fill-current" />
                  <span className="font-bold text-ivory text-sm">{product.ratingAvg.toFixed(1)}</span>
                  <span className="text-slate-DEFAULT">({product.reviewCount} đánh giá đã xác thực)</span>
                </div>
                <span>•</span>
                <span>Mã SKU: <strong className="text-ivory font-mono">{selectedVariant?.sku || product.sku}</strong></span>
                <span>•</span>
                <span>Xuất xứ: <strong className="text-ivory">{product.originCountry || 'USA'}</strong></span>
              </div>

              {/* Pricing Display */}
              <div className="bg-charcoal-card/80 p-4 rounded-xl border border-charcoal-border/80 mb-6 flex items-baseline gap-3">
                <span className="font-display font-black text-2xl sm:text-3xl text-gold">
                  {formatCurrency(currentPrice)}
                </span>
                {hasDiscount && (
                  <span className="text-sm text-slate-DEFAULT line-through">
                    {formatCurrency(originalPrice)}
                  </span>
                )}
                {hasDiscount && (
                  <span className="bg-rose-500/20 text-rose-400 text-xs font-extrabold px-2 py-0.5 rounded border border-rose-500/30">
                    Tiết kiệm {formatCurrency(originalPrice - currentPrice)}
                  </span>
                )}
              </div>

              {/* Short Description */}
              {product.shortDescription && (
                <p className="text-xs text-slate-subtle leading-relaxed mb-6">
                  {product.shortDescription}
                </p>
              )}

              {/* Variants Selector (Flavor & Weight) */}
              {product.variants && product.variants.length > 0 && (
                <div className="mb-6">
                  <label className="block text-xs font-bold text-ivory uppercase tracking-wider mb-2">
                    Lựa Chọn Phiên Bản / Hương Vị:
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {product.variants.map((v: any) => {
                      const isSelected = selectedVariant?.id === v.id;
                      return (
                        <button
                          key={v.id}
                          onClick={() => setSelectedVariant(v)}
                          className={`p-3 rounded-xl border text-left flex items-center justify-between transition ${
                            isSelected
                              ? 'bg-gold/10 border-gold text-ivory shadow-glow'
                              : 'bg-charcoal-card border-charcoal-border text-slate-subtle hover:border-slate-DEFAULT'
                          }`}
                        >
                          <div>
                            <p className="font-bold text-xs text-ivory">{v.title}</p>
                            <p className="text-[11px] text-slate-DEFAULT">Tồn kho: {v.inStock > 0 ? `${v.inStock} hộp` : 'Hết hàng'}</p>
                          </div>
                          <span className="font-bold text-xs text-gold">
                            {formatCurrency(v.salePrice || v.price)}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Stock Status */}
              <div className="mb-6 flex items-center gap-2">
                <span className="text-xs text-slate-DEFAULT">Tình trạng:</span>
                {isOutOfStock ? (
                  <span className="text-xs font-bold text-rose-400 bg-rose-500/10 px-2.5 py-0.5 rounded-full border border-rose-500/30">
                    Hết hàng tạm thời
                  </span>
                ) : (
                  <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/30 flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" />
                    Còn hàng ({currentStock} sản phẩm sẵn sàng giao)
                  </span>
                )}
              </div>

              {/* Quantity Picker & Action Buttons */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-4 border-t border-charcoal-border/60">
                {/* Quantity */}
                <div className="flex items-center border border-charcoal-border bg-charcoal-card rounded-xl overflow-hidden self-start sm:self-auto">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={isOutOfStock || quantity <= 1}
                    className="px-3.5 py-3 text-slate-DEFAULT hover:text-ivory hover:bg-charcoal-hover transition disabled:opacity-50"
                  >
                    -
                  </button>
                  <span className="px-4 py-3 font-bold text-sm text-ivory min-w-[40px] text-center">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(Math.min(currentStock, quantity + 1))}
                    disabled={isOutOfStock || quantity >= currentStock}
                    className="px-3.5 py-3 text-slate-DEFAULT hover:text-ivory hover:bg-charcoal-hover transition disabled:opacity-50"
                  >
                    +
                  </button>
                </div>

                {/* Add to Cart */}
                <button
                  onClick={handleAddToCart}
                  disabled={isOutOfStock}
                  className={`flex-1 py-3.5 px-6 rounded-xl font-display font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition ${
                    isOutOfStock
                      ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed border border-zinc-700'
                      : isAdded
                      ? 'bg-emerald-600 text-white shadow-glow'
                      : 'bg-gold hover:bg-gold-light text-charcoal shadow-glow'
                  }`}
                >
                  {isAdded ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Đã thêm vào giỏ hàng!</span>
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="w-4 h-4" />
                      <span>Thêm vào giỏ</span>
                    </>
                  )}
                </button>

                {/* Buy Now */}
                <button
                  onClick={handleBuyNow}
                  disabled={isOutOfStock}
                  className="px-6 py-3.5 rounded-xl font-display font-bold text-xs uppercase tracking-wider bg-charcoal-card border border-gold text-gold hover:bg-gold hover:text-charcoal transition disabled:opacity-50"
                >
                  Mua ngay
                </button>
              </div>
            </div>

            {/* Trust Assurances */}
            <div className="grid grid-cols-3 gap-3 pt-6 mt-8 border-t border-charcoal-border/50 text-slate-subtle text-[11px]">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-gold flex-shrink-0" />
                <span>100% Chính hãng</span>
              </div>
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-gold flex-shrink-0" />
                <span>Freeship từ 1.000.000₫</span>
              </div>
              <div className="flex items-center gap-2">
                <RotateCcw className="w-4 h-4 text-gold flex-shrink-0" />
                <span>Đổi trả 7 ngày</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tabbed Content: Description, Nutrition Facts, Usage Guide, Reviews */}
        <div className="card-luxury p-6 sm:p-8 border-charcoal-border/80 mb-16">
          <div className="flex items-center gap-6 border-b border-charcoal-border/60 pb-4 mb-6 overflow-x-auto text-xs font-bold tracking-wider uppercase">
            <button
              onClick={() => setActiveTab('desc')}
              className={`pb-2 transition relative ${
                activeTab === 'desc' ? 'text-gold border-b-2 border-gold' : 'text-slate-DEFAULT hover:text-ivory'
              }`}
            >
              Mô Tả Chi Tiết
            </button>
            <button
              onClick={() => setActiveTab('nutrition')}
              className={`pb-2 transition relative ${
                activeTab === 'nutrition' ? 'text-gold border-b-2 border-gold' : 'text-slate-DEFAULT hover:text-ivory'
              }`}
            >
              Bảng Dinh Dưỡng
            </button>
            <button
              onClick={() => setActiveTab('usage')}
              className={`pb-2 transition relative ${
                activeTab === 'usage' ? 'text-gold border-b-2 border-gold' : 'text-slate-DEFAULT hover:text-ivory'
              }`}
            >
              Hướng Dẫn Sử Dụng
            </button>
            <button
              onClick={() => setActiveTab('reviews')}
              className={`pb-2 transition relative flex items-center gap-1.5 ${
                activeTab === 'reviews' ? 'text-gold border-b-2 border-gold' : 'text-slate-DEFAULT hover:text-ivory'
              }`}
            >
              <span>Đánh Giá Khách Hàng</span>
              <span className="bg-charcoal-deep px-2 py-0.5 rounded-full text-[10px] text-slate-DEFAULT">
                {product.reviews?.length || 0}
              </span>
            </button>
          </div>

          {/* Description Tab */}
          {activeTab === 'desc' && (
            <div className="text-slate-subtle text-xs sm:text-sm leading-relaxed space-y-4">
              <p className="whitespace-pre-line">{product.description}</p>
              {product.manufacturer && (
                <div className="mt-4 pt-4 border-t border-charcoal-border/50 text-xs">
                  <p><strong>Nhà sản xuất:</strong> {product.manufacturer}</p>
                  <p><strong>Xuất xứ:</strong> {product.originCountry}</p>
                </div>
              )}
            </div>
          )}

          {/* Nutrition Facts Tab */}
          {activeTab === 'nutrition' && (
            <div>
              {nutritionObj ? (
                <div className="max-w-md bg-charcoal-deep p-6 rounded-xl border border-charcoal-border/80">
                  <h3 className="font-display font-black text-xl text-ivory border-b-4 border-ivory pb-1">
                    Nutrition Facts
                  </h3>
                  <p className="text-xs text-slate-DEFAULT py-1 border-b border-zinc-700">
                    Khẩu phần (Serving Size): <strong className="text-ivory">{nutritionObj.servingSize}</strong>
                  </p>
                  <p className="text-xs text-slate-DEFAULT py-1 border-b-4 border-zinc-700">
                    Số lần dùng (Servings Per Container): <strong className="text-ivory">{nutritionObj.servingsPerContainer}</strong>
                  </p>

                  <div className="py-2 text-xs space-y-2">
                    {Object.entries(nutritionObj).map(([key, val]) => {
                      if (key === 'servingSize' || key === 'servingsPerContainer') return null;
                      return (
                        <div key={key} className="flex justify-between border-b border-zinc-800 py-1">
                          <span className="capitalize text-slate-subtle">{key}</span>
                          <strong className="text-ivory font-mono">{String(val)}</strong>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <p className="text-xs text-slate-DEFAULT">Thông tin bảng dinh dưỡng đang được cập nhật từ nhà sản xuất.</p>
              )}
            </div>
          )}

          {/* Usage Guide Tab */}
          {activeTab === 'usage' && (
            <div className="space-y-4 text-xs sm:text-sm text-slate-subtle">
              <div>
                <h4 className="font-bold text-ivory text-sm mb-1">Cách dùng khuyến nghị:</h4>
                <p className="leading-relaxed">{product.usageGuide || 'Pha 1 muỗng với 250-300ml nước lạnh. Uống sau khi tập hoặc bữa sáng.'}</p>
              </div>

              {product.allergens && (
                <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs">
                  <strong>Cảnh báo dị ứng:</strong> {product.allergens}
                </div>
              )}

              {product.warnings && (
                <div className="p-4 rounded-xl bg-charcoal-deep border border-charcoal-border text-xs text-slate-DEFAULT">
                  <strong>Lưu ý:</strong> {product.warnings}
                </div>
              )}
            </div>
          )}

          {/* Reviews Tab */}
          {activeTab === 'reviews' && (
            <div className="space-y-8">
              {/* Write Review Form */}
              <div className="bg-charcoal-deep p-6 rounded-xl border border-charcoal-border">
                <h4 className="font-display font-bold text-sm text-ivory mb-2">Gửi nhận xét về sản phẩm</h4>
                <p className="text-xs text-slate-DEFAULT mb-4">Chia sẻ trải nghiệm thực tế của bạn sau khi sử dụng sản phẩm</p>

                {reviewSuccessMessage && (
                  <div className="p-3 mb-4 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs">
                    {reviewSuccessMessage}
                  </div>
                )}

                {reviewErrorMessage && (
                  <div className="p-3 mb-4 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs">
                    {reviewErrorMessage}
                  </div>
                )}

                <form onSubmit={handleReviewSubmit} className="space-y-4">
                  {/* Rating Selector */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-subtle">Đánh giá:</span>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setReviewRating(star)}
                          className="p-1 text-amber-400 hover:scale-110 transition"
                        >
                          <Star className={`w-5 h-5 ${star <= reviewRating ? 'fill-current' : 'text-zinc-700'}`} />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <input
                      type="text"
                      placeholder="Tiêu đề nhận xét (ví dụ: Mùi vị rất thơm, tan nhanh)"
                      value={reviewTitle}
                      onChange={(e) => setReviewTitle(e.target.value)}
                      className="w-full bg-charcoal-card border border-charcoal-border rounded-lg p-2.5 text-xs text-ivory focus:outline-none focus:border-gold"
                    />
                  </div>

                  <div>
                    <textarea
                      required
                      rows={3}
                      placeholder="Nội dung đánh giá chi tiết..."
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      className="w-full bg-charcoal-card border border-charcoal-border rounded-lg p-2.5 text-xs text-ivory focus:outline-none focus:border-gold"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={reviewSubmitting}
                    className="px-6 py-2.5 rounded-xl bg-gold text-charcoal font-bold text-xs hover:bg-gold-light transition shadow-glow disabled:opacity-50"
                  >
                    {reviewSubmitting ? 'Đang gửi...' : 'Gửi đánh giá'}
                  </button>
                </form>
              </div>

              {/* Reviews List */}
              <div className="space-y-4">
                {product.reviews && product.reviews.length > 0 ? (
                  product.reviews.map((rev: any) => (
                    <div key={rev.id} className="p-4 rounded-xl bg-charcoal-deep border border-charcoal-border/70">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-ivory">{rev.user?.fullName || 'Khách hàng'}</span>
                          {rev.verifiedPurchase && (
                            <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/20">
                              Đã mua hàng
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-0.5 text-amber-400">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className={`w-3.5 h-3.5 ${i < rev.rating ? 'fill-current' : 'text-zinc-700'}`} />
                          ))}
                        </div>
                      </div>
                      {rev.title && <h5 className="font-bold text-xs text-ivory mb-1">{rev.title}</h5>}
                      <p className="text-xs text-slate-subtle leading-relaxed">{rev.comment}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-DEFAULT text-center py-4">Chưa có đánh giá nào cho sản phẩm này.</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

