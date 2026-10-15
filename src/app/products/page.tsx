'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import ProductCard, { ProductCardProps } from '@/components/products/ProductCard';
import { Filter, SlidersHorizontal, ChevronRight, X, Search, Sparkles } from 'lucide-react';

function ProductsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [products, setProducts] = useState<ProductCardProps[]>([]);
  const [categories, setCategories] = useState<Array<{ id: string; name: string; slug: string }>>([]);
  const [brands, setBrands] = useState<Array<{ id: string; name: string; slug: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Filter States
  const search = searchParams.get('search') || '';
  const currentCategory = searchParams.get('category') || '';
  const currentBrand = searchParams.get('brand') || '';
  const currentGoal = searchParams.get('goal') || '';
  const currentSort = searchParams.get('sort') || 'latest';
  const currentPage = parseInt(searchParams.get('page') || '1');
  const [inStockOnly, setInStockOnly] = useState(searchParams.get('inStock') === 'true');
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Fetch Categories & Brands
  useEffect(() => {
    fetch('/api/categories')
      .then((res) => res.json())
      .then((data) => {
        if (data.categories) setCategories(data.categories);
      })
      .catch(() => {});

    fetch('/api/brands')
      .then((res) => res.json())
      .then((data) => {
        if (data.brands) setBrands(data.brands);
      })
      .catch(() => {});
  }, []);

  // Fetch Products based on Query Parameters
  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams(searchParams.toString());
    params.set('limit', '12');

    fetch(`/api/products?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.products) {
          setProducts(data.products);
          setTotalPages(data.pagination?.totalPages || 1);
          setTotalCount(data.pagination?.total || 0);
        }
      })
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  }, [searchParams]);

  const updateFilters = (newFilters: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', '1'); // Reset to page 1 on filter change

    Object.entries(newFilters).forEach(([key, value]) => {
      if (value === null || value === '') {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    });

    router.push(`/products?${params.toString()}`);
  };

  const handlePriceApply = () => {
    updateFilters({
      minPrice: minPrice || null,
      maxPrice: maxPrice || null,
    });
  };

  const clearAllFilters = () => {
    setMinPrice('');
    setMaxPrice('');
    setInStockOnly(false);
    router.push('/products');
  };

  return (
    <div className="bg-charcoal min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 lg:px-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-slate-DEFAULT mb-6">
          <button onClick={() => router.push('/')} className="hover:text-gold transition">
            Trang chủ
          </button>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-ivory font-semibold">Tất cả sản phẩm</span>
          {search && (
            <>
              <ChevronRight className="w-3.5 h-3.5" />
              <span className="text-gold-light">Tìm kiếm: "{search}"</span>
            </>
          )}
        </div>

        {/* Title & Sorting Toolbar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-charcoal-border/60">
          <div>
            <h1 className="font-display font-black text-2xl sm:text-3xl text-ivory">
              THỰC PHẨM BỔ SUNG & DINH DƯỠNG
            </h1>
            <p className="text-xs text-slate-subtle mt-1">
              Hiển thị <span className="text-gold font-bold">{totalCount}</span> sản phẩm chính hãng có sẵn
            </p>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
            {/* Mobile Filter Toggle */}
            <button
              onClick={() => setIsMobileFilterOpen(true)}
              className="lg:hidden flex items-center gap-2 px-4 py-2 rounded-xl bg-charcoal-card border border-charcoal-border text-xs font-bold text-ivory"
            >
              <SlidersHorizontal className="w-4 h-4 text-gold" />
              Bộ lọc
            </button>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-DEFAULT hidden sm:inline">Sắp xếp:</span>
              <select
                value={currentSort}
                onChange={(e) => updateFilters({ sort: e.target.value })}
                className="bg-charcoal-card border border-charcoal-border rounded-xl px-3 py-2 text-xs text-ivory focus:outline-none focus:border-gold"
              >
                <option value="latest">Mới nhất</option>
                <option value="bestseller">Bán chạy nhất</option>
                <option value="price_asc">Giá tăng dần</option>
                <option value="price_desc">Giá giảm dần</option>
                <option value="rating">Đánh giá cao nhất</option>
              </select>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Desktop Filter Sidebar */}
          <aside className="hidden lg:block space-y-6">
            <div className="card-luxury p-5 border-charcoal-border/80">
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-charcoal-border/60">
                <h3 className="font-display font-bold text-sm text-ivory flex items-center gap-2">
                  <Filter className="w-4 h-4 text-gold" />
                  Bộ Lọc Nâng Cao
                </h3>
                <button
                  onClick={clearAllFilters}
                  className="text-[11px] text-slate-DEFAULT hover:text-gold transition font-medium"
                >
                  Xóa lọc
                </button>
              </div>

              {/* Categories Filter */}
              <div className="mb-6">
                <h4 className="text-xs font-bold text-gold uppercase tracking-wider mb-2.5">
                  Danh Mục
                </h4>
                <div className="space-y-1.5 text-xs">
                  <button
                    onClick={() => updateFilters({ category: null })}
                    className={`w-full text-left py-1 px-2 rounded transition ${
                      !currentCategory ? 'text-gold font-bold bg-gold/10' : 'text-slate-subtle hover:text-ivory'
                    }`}
                  >
                    Tất cả danh mục
                  </button>
                  {categories.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => updateFilters({ category: c.slug })}
                      className={`w-full text-left py-1 px-2 rounded transition truncate ${
                        currentCategory === c.slug
                          ? 'text-gold font-bold bg-gold/10'
                          : 'text-slate-subtle hover:text-ivory'
                      }`}
                    >
                      {c.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Goal Filter */}
              <div className="mb-6">
                <h4 className="text-xs font-bold text-gold uppercase tracking-wider mb-2.5">
                  Mục Tiêu Thể Hình
                </h4>
                <div className="space-y-1.5 text-xs">
                  {['Muscle Building', 'Recovery', 'Performance', 'General Nutrition'].map((goal) => (
                    <button
                      key={goal}
                      onClick={() => updateFilters({ goal: currentGoal === goal ? null : goal })}
                      className={`w-full text-left py-1 px-2 rounded transition ${
                        currentGoal === goal ? 'text-gold font-bold bg-gold/10' : 'text-slate-subtle hover:text-ivory'
                      }`}
                    >
                      {goal === 'Muscle Building' && 'Tăng Cơ Bắp (Muscle)'}
                      {goal === 'Recovery' && 'Phục Hồi Sâu (Recovery)'}
                      {goal === 'Performance' && 'Sức Mạnh & Năng Lượng'}
                      {goal === 'General Nutrition' && 'Sức Khỏe Toàn Diện'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Brands Filter */}
              <div className="mb-6">
                <h4 className="text-xs font-bold text-gold uppercase tracking-wider mb-2.5">
                  Thương Hiệu
                </h4>
                <div className="space-y-1.5 text-xs">
                  <button
                    onClick={() => updateFilters({ brand: null })}
                    className={`w-full text-left py-1 px-2 rounded transition ${
                      !currentBrand ? 'text-gold font-bold bg-gold/10' : 'text-slate-subtle hover:text-ivory'
                    }`}
                  >
                    Tất cả thương hiệu
                  </button>
                  {brands.map((b) => (
                    <button
                      key={b.id}
                      onClick={() => updateFilters({ brand: b.slug })}
                      className={`w-full text-left py-1 px-2 rounded transition truncate ${
                        currentBrand === b.slug ? 'text-gold font-bold bg-gold/10' : 'text-slate-subtle hover:text-ivory'
                      }`}
                    >
                      {b.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Range Filter */}
              <div className="mb-6">
                <h4 className="text-xs font-bold text-gold uppercase tracking-wider mb-2.5">
                  Khoảng Giá (VND)
                </h4>
                <div className="flex items-center gap-2 mb-2">
                  <input
                    type="number"
                    placeholder="Từ"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    className="w-1/2 bg-charcoal-deep border border-charcoal-border rounded-lg p-2 text-xs text-ivory focus:outline-none focus:border-gold"
                  />
                  <span className="text-slate-DEFAULT">-</span>
                  <input
                    type="number"
                    placeholder="Đến"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    className="w-1/2 bg-charcoal-deep border border-charcoal-border rounded-lg p-2 text-xs text-ivory focus:outline-none focus:border-gold"
                  />
                </div>
                <button
                  onClick={handlePriceApply}
                  className="w-full py-1.5 rounded-lg bg-charcoal-deep hover:bg-gold hover:text-charcoal border border-charcoal-border text-xs font-bold text-gold transition"
                >
                  Áp dụng giá
                </button>
              </div>

              {/* In Stock Toggle */}
              <div className="pt-4 border-t border-charcoal-border/60">
                <label className="flex items-center gap-2 cursor-pointer text-xs text-ivory select-none">
                  <input
                    type="checkbox"
                    checked={inStockOnly}
                    onChange={(e) => {
                      setInStockOnly(e.target.checked);
                      updateFilters({ inStock: e.target.checked ? 'true' : null });
                    }}
                    className="rounded bg-charcoal-deep border-charcoal-border text-gold focus:ring-0"
                  />
                  <span>Chỉ hiện sản phẩm còn hàng</span>
                </label>
              </div>
            </div>
          </aside>

          {/* Products Grid */}
          <main className="lg:col-span-3">
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="h-96 rounded-xl bg-charcoal-card animate-pulse border border-charcoal-border/50" />
                ))}
              </div>
            ) : products.length > 0 ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {products.map((p) => (
                    <ProductCard key={p.id} {...p} />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-12 flex items-center justify-center gap-2">
                    {[...Array(totalPages)].map((_, idx) => {
                      const pageNum = idx + 1;
                      const isActive = pageNum === currentPage;
                      return (
                        <button
                          key={pageNum}
                          onClick={() => updateFilters({ page: pageNum.toString() })}
                          className={`w-9 h-9 rounded-lg font-bold text-xs transition ${
                            isActive
                              ? 'bg-gold text-charcoal shadow-glow'
                              : 'bg-charcoal-card border border-charcoal-border text-slate-subtle hover:text-ivory'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>
                )}
              </>
            ) : (
              <div className="card-luxury p-12 text-center">
                <Search className="w-12 h-12 text-slate-DEFAULT mx-auto mb-3 opacity-50" />
                <h3 className="font-display font-bold text-lg text-ivory">Không tìm thấy sản phẩm phù hợp</h3>
                <p className="text-xs text-slate-subtle mt-1 mb-4">
                  Hãy thử điều chỉnh từ khóa tìm kiếm hoặc bỏ bớt các bộ lọc đang chọn
                </p>
                <button
                  onClick={clearAllFilters}
                  className="px-5 py-2.5 rounded-xl bg-gold text-charcoal font-bold text-xs hover:bg-gold-light transition shadow-glow"
                >
                  Xóa tất cả bộ lọc
                </button>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Mobile Filter Modal */}
      {isMobileFilterOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex justify-end">
          <div className="w-full max-w-xs bg-charcoal-card h-full p-6 overflow-y-auto flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-charcoal-border mb-6">
                <h3 className="font-bold text-ivory text-base">Bộ Lọc Sản Phẩm</h3>
                <button onClick={() => setIsMobileFilterOpen(false)} className="text-slate-DEFAULT hover:text-ivory">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Mobile categories & brands */}
              <div className="space-y-6">
                <div>
                  <h4 className="text-xs font-bold text-gold uppercase mb-2">Danh Mục</h4>
                  <div className="space-y-1.5 text-xs">
                    {categories.map((c) => (
                      <button
                        key={c.id}
                        onClick={() => {
                          updateFilters({ category: c.slug });
                          setIsMobileFilterOpen(false);
                        }}
                        className={`w-full text-left py-1.5 px-2 rounded ${
                          currentCategory === c.slug ? 'bg-gold/20 text-gold font-bold' : 'text-slate-subtle'
                        }`}
                      >
                        {c.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-charcoal-border">
              <button
                onClick={() => setIsMobileFilterOpen(false)}
                className="w-full py-3 rounded-xl bg-gold text-charcoal font-bold text-sm"
              >
                Xem kết quả ({totalCount})
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-charcoal p-12 text-center text-ivory">Đang tải sản phẩm...</div>}>
      <ProductsContent />
    </Suspense>
  );
}

