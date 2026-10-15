'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { Package, Plus, Trash2, ArrowLeft, ShieldCheck, Sparkles, Upload, Save, Eye } from 'lucide-react';

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params?.id as string;

  const [categories, setCategories] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Form Fields
  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [barcode, setBarcode] = useState('');
  const [brandId, setBrandId] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [goal, setGoal] = useState('Muscle Building');
  const [price, setPrice] = useState('');
  const [salePrice, setSalePrice] = useState('');
  const [costPrice, setCostPrice] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [description, setDescription] = useState('');
  const [originCountry, setOriginCountry] = useState('USA');
  const [manufacturer, setManufacturer] = useState('');
  const [usageGuide, setUsageGuide] = useState('');
  const [allergens, setAllergens] = useState('');
  const [warnings, setWarnings] = useState('');
  const [isFeatured, setIsFeatured] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const [imageUrl, setImageUrl] = useState('');
  const [productSlug, setProductSlug] = useState('');

  // Nutrition Facts
  const [servingSize, setServingSize] = useState('1 Muỗng (31g)');
  const [servingsCount, setServingsCount] = useState('73');
  const [calories, setCalories] = useState('120');
  const [protein, setProtein] = useState('24g');
  const [bcaa, setBcaa] = useState('5.5g');

  // Variants
  const [variants, setVariants] = useState<any[]>([]);

  // Fetch initial product & taxonomy data
  useEffect(() => {
    async function loadData() {
      try {
        const [catRes, brandRes, prodRes] = await Promise.all([
          fetch('/api/categories'),
          fetch('/api/brands'),
          fetch(`/api/products/${productId}`),
        ]);

        const catData = await catRes.json();
        const brandData = await brandRes.json();
        const prodData = await prodRes.json();

        if (catData.categories) setCategories(catData.categories);
        if (brandData.brands) setBrands(brandData.brands);

        if (prodData.product) {
          const p = prodData.product;
          setName(p.name || '');
          setSku(p.sku || '');
          setBarcode(p.barcode || '');
          setBrandId(p.brandId || '');
          setCategoryId(p.categoryId || '');
          setGoal(p.goal || 'Muscle Building');
          setPrice(p.price ? String(p.price) : '');
          setSalePrice(p.salePrice ? String(p.salePrice) : '');
          setCostPrice(p.costPrice ? String(p.costPrice) : '');
          setShortDescription(p.shortDescription || '');
          setDescription(p.description || '');
          setOriginCountry(p.originCountry || 'USA');
          setManufacturer(p.manufacturer || '');
          setUsageGuide(p.usageGuide || '');
          setAllergens(p.allergens || '');
          setWarnings(p.warnings || '');
          setIsFeatured(Boolean(p.isFeatured));
          setIsActive(Boolean(p.isActive));
          setProductSlug(p.slug || '');

          if (p.images && p.images.length > 0) {
            setImageUrl(p.images[0].url || '');
          }

          if (p.nutritionFacts) {
            try {
              const nf = typeof p.nutritionFacts === 'string' ? JSON.parse(p.nutritionFacts) : p.nutritionFacts;
              if (nf.servingSize) setServingSize(nf.servingSize);
              if (nf.servingsPerContainer) setServingsCount(nf.servingsPerContainer);
              if (nf.calories) setCalories(nf.calories);
              if (nf.protein) setProtein(nf.protein);
              if (nf.bcaa) setBcaa(nf.bcaa);
            } catch {}
          }

          if (p.variants && p.variants.length > 0) {
            setVariants(
              p.variants.map((v: any) => ({
                id: v.id,
                title: v.title || '',
                sku: v.sku || '',
                flavor: v.flavor || '',
                weight: v.weight || '',
                price: String(v.price || ''),
                salePrice: v.salePrice ? String(v.salePrice) : '',
                costPrice: v.costPrice ? String(v.costPrice) : '',
                inStock: String(v.inStock ?? 10),
              }))
            );
          } else {
            setVariants([{ title: 'Tiêu chuẩn', sku: p.sku, price: p.price, inStock: '10' }]);
          }
        }
      } catch (err) {
        console.error('Error loading product for edit:', err);
      } finally {
        setLoading(false);
      }
    }

    if (productId) loadData();
  }, [productId]);

  const addVariantRow = () => {
    setVariants([
      ...variants,
      { title: '', sku: '', flavor: '', weight: '', price: price, salePrice: salePrice, costPrice: costPrice, inStock: '10' },
    ]);
  };

  const removeVariantRow = (index: number) => {
    setVariants(variants.filter((_, idx) => idx !== index));
  };

  const updateVariant = (index: number, field: string, val: string) => {
    const updated = [...variants];
    updated[index][field] = val;
    setVariants(updated);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (res.ok && data.url) {
        setImageUrl(data.url);
      } else {
        alert(data.message || 'Lỗi tải ảnh lên');
      }
    } catch {
      alert('Không thể kết nối máy chủ để tải ảnh');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !sku || !price) {
      alert('Vui lòng điền tên sản phẩm, mã SKU và giá bán');
      return;
    }

    setSubmitting(true);
    try {
      const nutritionFacts = {
        servingSize,
        servingsPerContainer: servingsCount,
        calories,
        protein,
        bcaa,
      };

      const res = await fetch(`/api/products/${productId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          sku,
          barcode,
          brandId: brandId || null,
          categoryId: categoryId || null,
          goal,
          price,
          salePrice: salePrice || null,
          costPrice: costPrice || 0,
          shortDescription,
          description,
          nutritionFacts,
          usageGuide,
          allergens,
          warnings,
          manufacturer,
          originCountry,
          isFeatured,
          isActive,
          images: imageUrl ? [{ url: imageUrl, isThumbnail: true }] : undefined,
          variants: variants.filter((v) => v.title && v.price).map((v) => ({
            id: v.id,
            title: v.title,
            sku: v.sku || `${sku}-${Math.random().toString(36).substring(2, 5).toUpperCase()}`,
            flavor: v.flavor || null,
            weight: v.weight || null,
            price: v.price,
            salePrice: v.salePrice || null,
            costPrice: v.costPrice || 0,
            inStock: v.inStock || '0',
          })),
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      } else {
        alert(data.message || 'Lỗi khi cập nhật sản phẩm');
      }
    } catch {
      alert('Lỗi kết nối máy chủ');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-16">
        <div className="w-10 h-10 rounded-full border-2 border-gold border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/products"
            className="p-2 rounded-lg bg-charcoal border border-charcoal-border text-slate-DEFAULT hover:text-ivory transition"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="font-display font-black text-xl text-ivory tracking-wide flex items-center gap-2">
              <span>Chỉnh Sửa Sản Phẩm</span>
              <Sparkles className="w-4 h-4 text-gold" />
            </h1>
            <p className="text-xs text-slate-subtle">
              Mã ID: <span className="font-mono text-gold">{productId}</span>
            </p>
          </div>
        </div>

        {productSlug && (
          <Link
            href={`/products/${productSlug}`}
            target="_blank"
            className="px-4 py-2 rounded-xl bg-charcoal border border-charcoal-border text-slate-DEFAULT hover:text-gold transition flex items-center gap-1.5 text-xs font-semibold"
          >
            <Eye className="w-4 h-4" />
            <span>Xem trang bán hàng</span>
          </Link>
        )}
      </div>

      {saveSuccess && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center gap-2">
          <ShieldCheck className="w-4 h-4" />
          <span>Đã lưu tất cả thay đổi sản phẩm thành công!</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <div className="card-luxury p-6 border-charcoal-border space-y-4">
          <h2 className="font-display font-bold text-sm text-gold uppercase tracking-wider flex items-center gap-2">
            <Package className="w-4 h-4" />
            1. Thông Tin Chung
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="sm:col-span-2">
              <label className="block text-slate-subtle mb-1 font-semibold">Tên sản phẩm *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="VD: Gold Standard 100% Whey Protein 5lbs"
                className="w-full bg-charcoal-deep border border-charcoal-border rounded-xl p-3 text-ivory focus:outline-none focus:border-gold font-semibold"
              />
            </div>

            <div>
              <label className="block text-slate-subtle mb-1 font-semibold">Mã SKU chính *</label>
              <input
                type="text"
                required
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                placeholder="ON-GSW-5LBS"
                className="w-full bg-charcoal-deep border border-charcoal-border rounded-xl p-3 text-ivory focus:outline-none focus:border-gold font-mono uppercase"
              />
            </div>

            <div>
              <label className="block text-slate-subtle mb-1 font-semibold">Mã vạch (Barcode / EAN)</label>
              <input
                type="text"
                value={barcode}
                onChange={(e) => setBarcode(e.target.value)}
                placeholder="748927028669"
                className="w-full bg-charcoal-deep border border-charcoal-border rounded-xl p-3 text-ivory focus:outline-none focus:border-gold font-mono"
              />
            </div>

            <div>
              <label className="block text-slate-subtle mb-1 font-semibold">Thương hiệu</label>
              <select
                value={brandId}
                onChange={(e) => setBrandId(e.target.value)}
                className="w-full bg-charcoal-deep border border-charcoal-border rounded-xl p-3 text-ivory focus:outline-none focus:border-gold"
              >
                <option value="">Chọn thương hiệu...</option>
                {brands.map((b) => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-subtle mb-1 font-semibold">Danh mục</label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full bg-charcoal-deep border border-charcoal-border rounded-xl p-3 text-ivory focus:outline-none focus:border-gold"
              >
                <option value="">Chọn danh mục...</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-subtle mb-1 font-semibold">Mục tiêu sử dụng (Goal)</label>
              <select
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                className="w-full bg-charcoal-deep border border-charcoal-border rounded-xl p-3 text-ivory focus:outline-none focus:border-gold"
              >
                <option value="Muscle Building">Tăng cơ bắp (Muscle Building)</option>
                <option value="Recovery">Phục hồi cơ (Recovery)</option>
                <option value="Performance">Tăng sức mạnh (Performance)</option>
                <option value="Weight Loss">Giảm mỡ & Kiểm soát cân (Weight Loss)</option>
                <option value="General Health">Sức khỏe tổng quát (General Health)</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-subtle mb-1 font-semibold">Xuất xứ</label>
              <input
                type="text"
                value={originCountry}
                onChange={(e) => setOriginCountry(e.target.value)}
                className="w-full bg-charcoal-deep border border-charcoal-border rounded-xl p-3 text-ivory focus:outline-none focus:border-gold"
              />
            </div>

            {/* Product Image Section with Upload */}
            <div className="sm:col-span-2">
              <label className="block text-slate-subtle mb-1 font-semibold">Hình ảnh đại diện sản phẩm</label>
              <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
                <input
                  type="text"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="/images/products/whey.jpg hoặc /uploads/... hoặc https://..."
                  className="flex-1 bg-charcoal-deep border border-charcoal-border rounded-xl p-3 text-ivory focus:outline-none focus:border-gold"
                />
                <label className="cursor-pointer px-4 py-3 rounded-xl bg-charcoal border border-gold/40 text-gold hover:bg-gold hover:text-charcoal transition flex items-center justify-center gap-2 font-semibold text-sm whitespace-nowrap shadow-sm">
                  <Upload className="w-4 h-4" />
                  <span>{uploading ? 'Đang tải lên...' : 'Tải ảnh từ máy tính'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    disabled={uploading}
                    className="hidden"
                  />
                </label>
              </div>
              {imageUrl && (
                <div className="mt-3 flex items-center gap-3 p-2 bg-charcoal-deep rounded-lg border border-charcoal-border/70">
                  <img src={imageUrl} alt="Xem trước" className="w-14 h-14 object-cover rounded-md border border-gold/30" />
                  <div className="text-xs">
                    <p className="text-ivory font-semibold">Ảnh hiện tại:</p>
                    <code className="text-gold break-all">{imageUrl}</code>
                  </div>
                </div>
              )}
            </div>

            <div className="sm:col-span-2 flex items-center gap-6 pt-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="w-4 h-4 accent-gold"
                />
                <span className="text-ivory font-semibold">Đang kích hoạt bán (Hiển thị ngoài cửa hàng)</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isFeatured}
                  onChange={(e) => setIsFeatured(e.target.checked)}
                  className="w-4 h-4 accent-gold"
                />
                <span className="text-ivory font-semibold">Sản phẩm nổi bật (Trang chủ)</span>
              </label>
            </div>
          </div>
        </div>

        {/* Pricing & Cost */}
        <div className="card-luxury p-6 border-charcoal-border space-y-4">
          <h2 className="font-display font-bold text-sm text-gold uppercase tracking-wider">
            2. Giá Bán & Giá Vốn Nội Bộ (COGS)
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block text-slate-subtle mb-1 font-semibold">Giá niêm yết (VND) *</label>
              <input
                type="number"
                required
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="2000000"
                className="w-full bg-charcoal-deep border border-charcoal-border rounded-xl p-3 text-ivory focus:outline-none focus:border-gold font-mono"
              />
            </div>

            <div>
              <label className="block text-slate-subtle mb-1 font-semibold">Giá khuyến mãi (VND)</label>
              <input
                type="number"
                value={salePrice}
                onChange={(e) => setSalePrice(e.target.value)}
                placeholder="1850000"
                className="w-full bg-charcoal-deep border border-charcoal-border rounded-xl p-3 text-gold focus:outline-none focus:border-gold font-mono"
              />
            </div>

            <div>
              <label className="block text-slate-subtle mb-1 font-semibold flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-gold" />
                <span>Giá vốn COGS (Bảo mật Admin)</span>
              </label>
              <input
                type="number"
                value={costPrice}
                onChange={(e) => setCostPrice(e.target.value)}
                placeholder="1300000"
                className="w-full bg-charcoal-deep border border-charcoal-border rounded-xl p-3 text-slate-DEFAULT focus:outline-none focus:border-gold font-mono"
              />
            </div>
          </div>
        </div>

        {/* Variants Builder */}
        <div className="card-luxury p-6 border-charcoal-border space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display font-bold text-sm text-gold uppercase tracking-wider">
                3. Danh Sách Biến Thể (Hương Vị / Trọng Lượng)
              </h2>
              <p className="text-[11px] text-slate-subtle">
                Quản lý các biến thể theo vị và dung tích để khách hàng lựa chọn khi mua.
              </p>
            </div>

            <button
              type="button"
              onClick={addVariantRow}
              className="px-3 py-1.5 rounded-lg bg-charcoal border border-gold/40 text-gold text-xs font-semibold hover:bg-gold hover:text-charcoal transition flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Thêm biến thể</span>
            </button>
          </div>

          <div className="space-y-3">
            {variants.map((v, idx) => (
              <div key={idx} className="p-3 bg-charcoal-deep rounded-xl border border-charcoal-border grid grid-cols-1 sm:grid-cols-6 gap-2 text-xs items-center">
                <div className="sm:col-span-2">
                  <input
                    type="text"
                    placeholder="Tên biến thể (VD: Chocolate 5lbs)"
                    value={v.title}
                    onChange={(e) => updateVariant(idx, 'title', e.target.value)}
                    className="w-full bg-charcoal border border-charcoal-border rounded-lg p-2 text-ivory font-semibold"
                  />
                </div>

                <div>
                  <input
                    type="text"
                    placeholder="Hương vị (VD: Chocolate)"
                    value={v.flavor || ''}
                    onChange={(e) => updateVariant(idx, 'flavor', e.target.value)}
                    className="w-full bg-charcoal border border-charcoal-border rounded-lg p-2 text-ivory"
                  />
                </div>

                <div>
                  <input
                    type="text"
                    placeholder="Trọng lượng (VD: 5 lbs)"
                    value={v.weight || ''}
                    onChange={(e) => updateVariant(idx, 'weight', e.target.value)}
                    className="w-full bg-charcoal border border-charcoal-border rounded-lg p-2 text-ivory"
                  />
                </div>

                <div>
                  <input
                    type="number"
                    placeholder="Giá bán"
                    value={v.price}
                    onChange={(e) => updateVariant(idx, 'price', e.target.value)}
                    className="w-full bg-charcoal border border-charcoal-border rounded-lg p-2 text-gold font-mono"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    placeholder="Tồn kho"
                    value={v.inStock}
                    onChange={(e) => updateVariant(idx, 'inStock', e.target.value)}
                    className="w-full bg-charcoal border border-charcoal-border rounded-lg p-2 text-emerald-400 font-mono"
                  />
                  {variants.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeVariantRow(idx)}
                      className="p-2 text-rose-400 hover:text-rose-300"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Nutrition Facts */}
        <div className="card-luxury p-6 border-charcoal-border space-y-4">
          <h2 className="font-display font-bold text-sm text-gold uppercase tracking-wider">
            4. Bảng Thành Phần Dinh Dưỡng (Supplement Facts)
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
            <div>
              <label className="block text-slate-subtle mb-1">Serving Size</label>
              <input
                type="text"
                value={servingSize}
                onChange={(e) => setServingSize(e.target.value)}
                className="w-full bg-charcoal-deep border border-charcoal-border rounded-xl p-2.5 text-ivory"
              />
            </div>

            <div>
              <label className="block text-slate-subtle mb-1">Số lần dùng (Servings)</label>
              <input
                type="text"
                value={servingsCount}
                onChange={(e) => setServingsCount(e.target.value)}
                className="w-full bg-charcoal-deep border border-charcoal-border rounded-xl p-2.5 text-ivory"
              />
            </div>

            <div>
              <label className="block text-slate-subtle mb-1">Calories</label>
              <input
                type="text"
                value={calories}
                onChange={(e) => setCalories(e.target.value)}
                className="w-full bg-charcoal-deep border border-charcoal-border rounded-xl p-2.5 text-ivory"
              />
            </div>

            <div>
              <label className="block text-slate-subtle mb-1">Hàm lượng Protein</label>
              <input
                type="text"
                value={protein}
                onChange={(e) => setProtein(e.target.value)}
                className="w-full bg-charcoal-deep border border-charcoal-border rounded-xl p-2.5 text-gold font-bold"
              />
            </div>

            <div>
              <label className="block text-slate-subtle mb-1">BCAA</label>
              <input
                type="text"
                value={bcaa}
                onChange={(e) => setBcaa(e.target.value)}
                className="w-full bg-charcoal-deep border border-charcoal-border rounded-xl p-2.5 text-ivory"
              />
            </div>
          </div>
        </div>

        {/* Detailed Descriptions */}
        <div className="card-luxury p-6 border-charcoal-border space-y-4">
          <h2 className="font-display font-bold text-sm text-gold uppercase tracking-wider">
            5. Mô Tả Chi Tiết & Hướng Dẫn Sử Dụng
          </h2>

          <div className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-subtle mb-1 font-semibold">Mô tả ngắn gọn (Hiển thị đầu trang sản phẩm)</label>
              <textarea
                rows={2}
                value={shortDescription}
                onChange={(e) => setShortDescription(e.target.value)}
                className="w-full bg-charcoal-deep border border-charcoal-border rounded-xl p-3 text-ivory focus:outline-none focus:border-gold"
              />
            </div>

            <div>
              <label className="block text-slate-subtle mb-1 font-semibold">Bài viết giới thiệu chi tiết sản phẩm</label>
              <textarea
                rows={5}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-charcoal-deep border border-charcoal-border rounded-xl p-3 text-ivory focus:outline-none focus:border-gold"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-subtle mb-1 font-semibold">Hướng dẫn sử dụng</label>
                <textarea
                  rows={3}
                  value={usageGuide}
                  onChange={(e) => setUsageGuide(e.target.value)}
                  className="w-full bg-charcoal-deep border border-charcoal-border rounded-xl p-3 text-ivory focus:outline-none focus:border-gold"
                />
              </div>

              <div>
                <label className="block text-slate-subtle mb-1 font-semibold">Cảnh báo & Dị ứng</label>
                <textarea
                  rows={3}
                  value={allergens}
                  onChange={(e) => setAllergens(e.target.value)}
                  placeholder="Chứa sữa, lecithin đậu nành..."
                  className="w-full bg-charcoal-deep border border-charcoal-border rounded-xl p-3 text-ivory focus:outline-none focus:border-gold"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Submit Action */}
        <div className="flex items-center justify-between pt-4">
          <Link
            href="/admin/products"
            className="px-6 py-3 rounded-xl bg-charcoal border border-charcoal-border text-slate-DEFAULT hover:text-ivory text-xs font-semibold"
          >
            Hủy Bỏ
          </Link>

          <button
            type="submit"
            disabled={submitting}
            className="px-8 py-3.5 rounded-xl bg-gold text-charcoal font-bold text-xs uppercase tracking-wider hover:bg-gold-light transition shadow-glow flex items-center gap-2 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {submitting ? 'Đang lưu sản phẩm...' : 'Lưu Thay Đổi Sản Phẩm'}
          </button>
        </div>
      </form>
    </div>
  );
}

