'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { BookOpen, Plus, Search, Edit, Trash2, Eye, Calendar, User, Sparkles } from 'lucide-react';
import { formatDate } from '@/lib/utils';

export default function AdminArticlesPage() {
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  const fetchArticles = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (categoryFilter) params.set('category', categoryFilter);

      const res = await fetch(`/api/articles?${params.toString()}`);
      const data = await res.json();
      if (data.articles) {
        setArticles(data.articles);
      }
    } catch (err) {
      console.error('Fetch articles error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArticles();
  }, [categoryFilter]);

  const handleTogglePublish = async (id: string, currentStatus: boolean) => {
    try {
      const res = await fetch(`/api/articles/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPublished: !currentStatus }),
      });
      if (res.ok) {
        setArticles(
          articles.map((a) => (a.id === id ? { ...a, isPublished: !currentStatus } : a))
        );
      } else {
        alert('Lỗi cập nhật trạng thái xuất bản');
      }
    } catch {
      alert('Lỗi kết nối máy chủ');
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa bài viết "${title}"?`)) return;

    try {
      const res = await fetch(`/api/articles/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setArticles(articles.filter((a) => a.id !== id));
      } else {
        alert('Lỗi khi xóa bài viết');
      }
    } catch {
      alert('Lỗi kết nối máy chủ');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-black text-2xl text-ivory tracking-wide flex items-center gap-2">
            <span>Quản Lý Bài Viết Kiến Thức</span>
            <BookOpen className="w-5 h-5 text-gold" />
          </h1>
          <p className="text-xs text-slate-subtle mt-0.5">
            Biên tập bài viết cẩm nang dinh dưỡng, tập luyện gym và hướng dẫn thực phẩm bổ sung.
          </p>
        </div>

        <Link
          href="/admin/articles/new"
          className="px-5 py-2.5 rounded-xl bg-gold text-charcoal font-bold text-xs hover:bg-gold-light transition shadow-glow flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          Viết bài mới
        </Link>
      </div>

      {/* Filter toolbar */}
      <div className="card-luxury p-4 border-charcoal-border flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Tìm theo tiêu đề hoặc nội dung tóm tắt..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchArticles()}
            className="w-full bg-charcoal-deep border border-charcoal-border rounded-xl py-2.5 pl-3 pr-10 text-xs text-ivory focus:outline-none focus:border-gold"
          />
          <button
            onClick={fetchArticles}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-DEFAULT hover:text-gold"
          >
            <Search className="w-4 h-4" />
          </button>
        </div>

        <div className="sm:w-60">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full bg-charcoal-deep border border-charcoal-border rounded-xl py-2.5 px-3 text-xs text-ivory focus:outline-none focus:border-gold"
          >
            <option value="">Tất cả chuyên mục</option>
            <option value="Nutrition">Dinh dưỡng (Nutrition)</option>
            <option value="Workout">Tập luyện (Workout)</option>
            <option value="Recovery">Phục hồi cơ (Recovery)</option>
            <option value="Weight Loss">Giảm cân / Siết cơ (Weight Loss)</option>
            <option value="General">Tổng hợp (General)</option>
          </select>
        </div>
      </div>

      {/* Articles Table */}
      <div className="card-luxury overflow-hidden border-charcoal-border">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-DEFAULT">Đang tải danh sách bài viết...</div>
        ) : articles.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-DEFAULT">
            Chưa có bài viết nào phù hợp. Bấm "Viết bài mới" để đăng bài đầu tiên!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-charcoal-deep text-slate-subtle uppercase text-[10px] tracking-wider border-b border-charcoal-border">
                <tr>
                  <th className="p-3.5">Ảnh bìa</th>
                  <th className="p-3.5">Tiêu đề bài viết</th>
                  <th className="p-3.5">Chuyên mục</th>
                  <th className="p-3.5">Tác giả</th>
                  <th className="p-3.5">Ngày đăng</th>
                  <th className="p-3.5 text-center">Trạng thái</th>
                  <th className="p-3.5 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-charcoal-border/60 text-ivory">
                {articles.map((art) => (
                  <tr key={art.id} className="hover:bg-charcoal-hover transition">
                    <td className="p-3.5 w-16">
                      <div className="w-14 h-10 rounded-lg overflow-hidden bg-charcoal-deep border border-charcoal-border/60 flex-shrink-0">
                        <img
                          src={art.coverImage || 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=400&q=80'}
                          alt={art.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </td>

                    <td className="p-3.5 max-w-sm">
                      <strong className="block text-ivory line-clamp-1">{art.title}</strong>
                      <span className="text-[10px] text-slate-subtle line-clamp-1">{art.excerpt}</span>
                    </td>

                    <td className="p-3.5">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-gold/10 text-gold border border-gold/30">
                        {art.category}
                      </span>
                    </td>

                    <td className="p-3.5 text-slate-subtle">
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3 text-slate-DEFAULT" />
                        {art.authorName}
                      </span>
                    </td>

                    <td className="p-3.5 text-slate-subtle font-mono text-[11px]">
                      {formatDate(art.publishedAt)}
                    </td>

                    <td className="p-3.5 text-center">
                      <button
                        onClick={() => handleTogglePublish(art.id, art.isPublished)}
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold border transition ${
                          art.isPublished
                            ? 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10'
                            : 'border-zinc-700 text-zinc-500 bg-zinc-800'
                        }`}
                      >
                        {art.isPublished ? 'Đã xuất bản' : 'Bản nháp'}
                      </button>
                    </td>

                    <td className="p-3.5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/admin/articles/${art.id}`}
                          className="p-1.5 rounded bg-charcoal-deep border border-charcoal-border hover:text-gold text-slate-DEFAULT transition"
                          title="Chỉnh sửa bài viết"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </Link>

                        <Link
                          href={`/blog/${art.slug}`}
                          target="_blank"
                          className="p-1.5 rounded bg-charcoal-deep border border-charcoal-border hover:text-gold text-slate-DEFAULT transition"
                          title="Xem trên website"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </Link>

                        <button
                          onClick={() => handleDelete(art.id, art.title)}
                          className="p-1.5 rounded bg-charcoal-deep border border-charcoal-border hover:text-rose-400 text-slate-DEFAULT transition"
                          title="Xóa bài viết"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

