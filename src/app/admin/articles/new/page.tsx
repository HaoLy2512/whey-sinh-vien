'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { BookOpen, ArrowLeft, Upload, Save, Sparkles, ShieldCheck } from 'lucide-react';

export default function NewArticlePage() {
  const router = useRouter();

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Nutrition');
  const [authorName, setAuthorName] = useState('Chuyên gia Dinh dưỡng Vitacore');
  const [excerpt, setExcerpt] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [content, setContent] = useState('');
  const [isPublished, setIsPublished] = useState(true);

  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

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
        setCoverImage(data.url);
      } else {
        alert(data.message || 'Lỗi tải ảnh');
      }
    } catch {
      alert('Không thể kết nối máy chủ để tải ảnh');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !excerpt || !content) {
      alert('Vui lòng điền tiêu đề, tóm tắt và nội dung bài viết');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/articles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          category,
          authorName,
          excerpt,
          coverImage,
          content,
          isPublished,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        router.push('/admin/articles');
      } else {
        alert(data.message || 'Lỗi tạo bài viết');
      }
    } catch {
      alert('Lỗi kết nối máy chủ');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href="/admin/articles"
          className="p-2 rounded-lg bg-charcoal border border-charcoal-border text-slate-DEFAULT hover:text-ivory transition"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="font-display font-black text-xl text-ivory tracking-wide flex items-center gap-2">
            <span>Viết Bài Kiến Thức Mới</span>
            <Sparkles className="w-4 h-4 text-gold" />
          </h1>
          <p className="text-xs text-slate-subtle">
            Xuất bản bài viết cẩm nang khoa học thể hình, dinh dưỡng và bổ sung
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Main Info */}
        <div className="card-luxury p-6 border-charcoal-border space-y-4">
          <h2 className="font-display font-bold text-sm text-gold uppercase tracking-wider flex items-center gap-2">
            <BookOpen className="w-4 h-4" />
            1. Thông Tin Bài Viết
          </h2>

          <div className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-subtle mb-1 font-semibold">Tiêu đề bài viết *</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="VD: Hướng dẫn sử dụng Creatine Monohydrate chuẩn khoa học cho gymer"
                className="w-full bg-charcoal-deep border border-charcoal-border rounded-xl p-3 text-ivory focus:outline-none focus:border-gold font-semibold text-sm"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-subtle mb-1 font-semibold">Chuyên mục</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-charcoal-deep border border-charcoal-border rounded-xl p-3 text-ivory focus:outline-none focus:border-gold"
                >
                  <option value="Nutrition">Dinh dưỡng (Nutrition)</option>
                  <option value="Workout">Tập luyện (Workout)</option>
                  <option value="Recovery">Phục hồi cơ (Recovery)</option>
                  <option value="Weight Loss">Giảm mỡ & Siết cơ (Weight Loss)</option>
                  <option value="General">Tổng hợp & Khoa học (General)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-subtle mb-1 font-semibold">Tác giả bài viết</label>
                <input
                  type="text"
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  placeholder="Chuyên gia Dinh dưỡng Vitacore"
                  className="w-full bg-charcoal-deep border border-charcoal-border rounded-xl p-3 text-ivory focus:outline-none focus:border-gold"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-subtle mb-1 font-semibold">Tóm tắt ngắn gọn (Excerpt) *</label>
              <textarea
                rows={3}
                required
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                placeholder="Mô tả súc tích 2-3 câu để hiển thị ngoài danh sách bài viết và thẻ mạng xã hội..."
                className="w-full bg-charcoal-deep border border-charcoal-border rounded-xl p-3 text-ivory focus:outline-none focus:border-gold leading-relaxed"
              />
            </div>

            {/* Cover Image with upload */}
            <div>
              <label className="block text-slate-subtle mb-1 font-semibold">Ảnh bìa bài viết</label>
              <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
                <input
                  type="text"
                  value={coverImage}
                  onChange={(e) => setCoverImage(e.target.value)}
                  placeholder="/images/blog/creatine.jpg hoặc /uploads/... hoặc https://..."
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
              {coverImage && (
                <div className="mt-3 flex items-center gap-3 p-2 bg-charcoal-deep rounded-lg border border-charcoal-border/70">
                  <img src={coverImage} alt="Xem trước" className="w-20 h-14 object-cover rounded-md border border-gold/30" />
                  <div className="text-xs">
                    <p className="text-ivory font-semibold">Ảnh bìa đã chọn:</p>
                    <code className="text-gold break-all">{coverImage}</code>
                  </div>
                </div>
              )}
            </div>

            {/* Content Textarea */}
            <div>
              <label className="block text-slate-subtle mb-1 font-semibold">Nội dung chi tiết bài viết *</label>
              <textarea
                rows={12}
                required
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Nhập nội dung bài viết chuyên sâu. Bạn có thể xuống dòng, chia các mục 1, 2, 3 và trích dẫn các tài liệu khoa học..."
                className="w-full bg-charcoal-deep border border-charcoal-border rounded-xl p-4 text-ivory focus:outline-none focus:border-gold font-mono leading-relaxed"
              />
            </div>

            <div className="pt-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isPublished}
                  onChange={(e) => setIsPublished(e.target.checked)}
                  className="w-4 h-4 accent-gold"
                />
                <span className="text-ivory font-semibold">Xuất bản bài viết công khai ngay (Hiển thị tại Cẩm nang & Trang chủ)</span>
              </label>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-4">
          <Link
            href="/admin/articles"
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
            {submitting ? 'Đang xuất bản...' : 'Xuất Bản Bài Viết'}
          </button>
        </div>
      </form>
    </div>
  );
}

