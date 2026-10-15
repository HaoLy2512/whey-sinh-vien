'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Package, Plus, Trash2, ArrowLeft, ShieldCheck, Sparkles, Upload } from 'lucide-react';

export default function NewProductPage() {
  const router = useRouter();

  const [categories, setCategories] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);

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
  const [imageUrl, setImageUrl] = useState('');

  // Variants
  const [variants, setVariants] = useState<any[]>([
    { title: 'Tiêu chuẩn', sku: '', price: '', salePrice: '', inStock: '20' },
  ]);

  // Nutrition Fields
  const [protein, setProtein] = useState('25g');
  const [bcaa, setBcaa] = useState('5.5g');
  const [calories, setCalories] = useState('120');
  const [servingSize, setServingSize] = useState('30g (1 muỗng)');
  const [servingsCount, setServingsCount] = useState('70');

  useEffect(() => {
    fetch('/api/categories').then((r) => r.json()).then((d) => d.categories && setCategories(d.categories));
    fetch('/api/brands').then((r) => r.json()).then((d) => d.brands && setBrands(d.brands));
  }, []);

  const addVariantRow = () => {
    setVariants([...variants, { title: '', sku: '', price: price, salePrice: salePrice, inStock: '10' }]);
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

      const res = await fetch('/api/products', {
        method: 'POST',
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
          images: imageUrl ? [{ url: imageUrl, isThumbnail: true }] : [
            { url: 'https://images.unsplash.com/photo-1579722821273-0f6c7d44362f?auto=format&fit=crop&w=800&q=80', isThumbnail: true }
          ],
          variants: variants.filter((v) => v.title && v.price).map((v) => ({
            title: v.title,
            sku: v.sku || `${sku}-${Math.random().toString(36).substring(2, 5).toUpperCase()}`,
            price: v.price,
            salePrice: v.salePrice || null,
            costPrice: costPrice || 0,
            inStock: v.inStock || '0',
          })),
        }),
      });

      const data = await res.json();
      if (res.ok) {
        router.push('/admin/products');
      } else {
        alert(data.message || 'Lỗi khi tạo sản phẩm');
      }
    } catch {
      alert('Lỗi kết nối máy chủ');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-3">
        <Link href="/admin/products" className="p-2 rounded-lg bg-charcoal border border-charcoal-border text-slate-DEFAULT hover:text-ivory">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="font-display font-black text-2xl text-ivory">THÊM SẢN PHẨM MỚI</h1>
          <p className="text-xs text-slate-subtle">Khai báo chi tiết sản phẩm, công thức dinh dưỡng, giá vốn và biến thể</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 text-xs">
        {/* Basic Info */}
        <div className="card-luxury p-6 border-charcoal-border space-y-4">
          <h2 className="font-display font-bold text-sm text-gold uppercase tracking-wider">
            1. Thông Tin Chung
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-slate-subtle mb-1 font-semibold">Tên sản phẩm *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="VD: Dymatize ISO 100 Hydrolyzed 100% Whey Isolate 5 lbs"
                className="w-full bg-charcoal-deep border border-charcoal-border rounded-xl p-3 text-ivory focus:outline-none focus:border-gold"
              />
            </div>

            <div>
              <label className="block text-slate-subtle mb-1 font-semibold">Mã SKU gốc *</label>
              <input
                type="text"
                required
                value={sku}
                onChange={(e) => setSku(e.target.value.toUpperCase())}
                placeholder="VD: DYM-ISO-01"
                className="w-full bg-charcoal-deep border border-charcoal-border rounded-xl p-3 text-ivory focus:outline-none focus:border-gold font-mono"
              />
            </div>

            <div>
              <label className="block text-slate-subtle mb-1 font-semibold">Mục tiêu thể hình</label>
              <select
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                className="w-full bg-charcoal-deep border border-charcoal-border rounded-xl p-3 text-ivory focus:outline-none focus:border-gold"
              >
                <option value="Muscle Building">Tăng Cơ Bắp (Muscle Building)</option>
                <option value="Recovery">Phục Hồi Sâu (Recovery)</option>
                <option value="Performance">Sức Mạnh & Năng Lượng (Performance)</option>
                <option value="General Nutrition">Sức Khỏe Toàn Diện (General Nutrition)</option>
              </select>
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
              <label className="block text-slate-subtle mb-1 font-semibold">Xuất xứ</label>
              <input
                type="text"
                value={originCountry}
                onChange={(e) => setOriginCountry(e.target.value)}
                className="w-full bg-charcoal-deep border border-charcoal-border rounded-xl p-3 text-ivory focus:outline-none focus:border-gold"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-slate-subtle mb-1 font-semibold">Hình ảnh sản phẩm (Tải lên từ máy tính hoặc nhập đường dẫn)</label>
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
                    <p className="text-ivory font-semibold">Ảnh đang chọn:</p>
                    <code className="text-gold break-all">{imageUrl}</code>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Pricing & Cost */}
        <div className="card-luxury p-6 border-charcoal-border space-y-4">
          <h2 className="font-display font-bold text-sm text-gold uppercase tracking-wider">
            2. Giá Bán & Giá Vốn Nội Bộ (COGS)
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
              <label className="block text-slate-subtle mb-1 font-semibold text-rose-400">
                Giá vốn COGS (Bảo mật - Chỉ Admin thấy)
              </label>
              <input
                type="number"
                value={costPrice}
                onChange={(e) => setCostPrice(e.target.value)}
                placeholder="1300000"
                className="w-full bg-charcoal-deep border border-rose-500/30 rounded-xl p-3 text-ivory focus:outline-none focus:border-gold font-mono"
              />
            </div>
          </div>
        </div>

        {/* Nutrition Facts */}
        <div className="card-luxury p-6 border-charcoal-border space-y-4">
          <h2 className="font-display font-bold text-sm text-gold uppercase tracking-wider">
            3. Thông Số Bảng Dinh Dưỡng (Nutrition Facts)
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <div>
              <label className="block text-slate-subtle mb-1">Protein / Serving</label>
              <input
                type="text"
                value={protein}
                onChange={(e) => setProtein(e.target.value)}
                className="w-full bg-charcoal-deep border border-charcoal-border rounded-lg p-2.5 text-ivory"
              />
            </div>
            <div>
              <label className="block text-slate-subtle mb-1">BCAA</label>
              <input
                type="text"
                value={bcaa}
                onChange={(e) => setBcaa(e.target.value)}
                className="w-full bg-charcoal-deep border border-charcoal-border rounded-lg p-2.5 text-ivory"
              />
            </div>
            <div>
              <label className="block text-slate-subtle mb-1">Calories</label>
              <input
                type="text"
                value={calories}
                onChange={(e) => setCalories(e.target.value)}
                className="w-full bg-charcoal-deep border border-charcoal-border rounded-lg p-2.5 text-ivory"
              />
            </div>
            <div>
              <label className="block text-slate-subtle mb-1">Khẩu phần</label>
              <input
                type="text"
                value={servingSize}
                onChange={(e) => setServingSize(e.target.value)}
                className="w-full bg-charcoal-deep border border-charcoal-border rounded-lg p-2.5 text-ivory"
              />
            </div>
            <div>
              <label className="block text-slate-subtle mb-1">Số lần dùng</label>
              <input
                type="text"
                value={servingsCount}
                onChange={(e) => setServingsCount(e.target.value)}
                className="w-full bg-charcoal-deep border border-charcoal-border rounded-lg p-2.5 text-ivory"
              />
            </div>
          </div>
        </div>

        {/* Description & Usage */}
        <div className="card-luxury p-6 border-charcoal-border space-y-4">
          <h2 className="font-display font-bold text-sm text-gold uppercase tracking-wider">
            4. Mô Tả & Hướng Dẫn Sử Dụng
          </h2>

          <div>
            <label className="block text-slate-subtle mb-1 font-semibold">Mô tả ngắn gọn:</label>
            <input
              type="text"
              value={shortDescription}
              onChange={(e) => setShortDescription(e.target.value)}
              className="w-full bg-charcoal-deep border border-charcoal-border rounded-xl p-3 text-ivory"
            />
          </div>

          <div>
            <label className="block text-slate-subtle mb-1 font-semibold">Mô tả chi tiết sản phẩm:</label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-charcoal-deep border border-charcoal-border rounded-xl p-3 text-ivory leading-relaxed"
            />
          </div>

          <div>
            <label className="block text-slate-subtle mb-1 font-semibold">Cách dùng khuyến nghị:</label>
            <input
              type="text"
              value={usageGuide}
              onChange={(e) => setUsageGuide(e.target.value)}
              className="w-full bg-charcoal-deep border border-charcoal-border rounded-xl p-3 text-ivory"
            />
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end gap-3 pt-4">
          <Link
            href="/admin/products"
            className="px-6 py-3 rounded-xl bg-charcoal border border-charcoal-border text-slate-subtle hover:text-ivory"
          >
            Hủy bỏ
          </Link>
          <button
            type="submit"
            disabled={submitting}
            className="px-8 py-3.5 rounded-xl bg-gold text-charcoal font-bold text-xs uppercase tracking-wider hover:bg-gold-light transition shadow-glow disabled:opacity-50"
          >
            {submitting ? 'Đang lưu sản phẩm...' : 'Hoàn tất & Xuất bản'}
          </button>
        </div>
      </form>
    </div>
  );
}

