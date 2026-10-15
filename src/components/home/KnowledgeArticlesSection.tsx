import React from 'react';
import Link from 'next/link';
import { BookOpen, ArrowRight, Clock } from 'lucide-react';
import prisma from '@/lib/prisma';

const DEFAULT_ARTICLES = [
  {
    id: 'default-1',
    title: 'Thời Điểm Vàng Bổ Sung Whey Protein Để Tối Ưu Hóa Tăng Cơ',
    slug: 'thoi-diem-vang-bo-sung-whey-protein',
    category: 'Dinh Dưỡng Thể Hình',
    readTime: '5 phút đọc',
    excerpt: 'Khám phá sự thật về cửa sổ đồng hóa (anabolic window) và chiến lược nạp protein khoa học giúp cơ bắp tổng hợp tối đa.',
    coverImage: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'default-2',
    title: 'Creatine Monohydrate: Hướng Dẫn Sử Dụng Chi Tiết Từ A Đến Z',
    slug: 'creatine-monohydrate-huong-dan-toan-dien',
    category: 'Kiến Thức Tập Luyện',
    readTime: '7 phút đọc',
    excerpt: 'Creatine là thực phẩm bổ sung được nghiên cứu khoa học nhiều nhất. Hãy tìm hiểu cách nạp, liều dùng và giải đáp các hiểu lầm.',
    coverImage: 'https://images.unsplash.com/photo-1546483875-ad9014c88eba?auto=format&fit=crop&w=800&q=80',
  },
];

export default async function KnowledgeArticlesSection() {
  let displayArticles = DEFAULT_ARTICLES;

  try {
    const dbArticles = await prisma.article.findMany({
      where: { isPublished: true },
      take: 2,
      orderBy: { publishedAt: 'desc' },
    });

    if (dbArticles.length > 0) {
      displayArticles = dbArticles.map((a) => ({
        id: a.id,
        title: a.title,
        slug: a.slug,
        category: a.category,
        readTime: '5 phút đọc',
        excerpt: a.excerpt,
        coverImage: a.coverImage || 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=800&q=80',
      }));
    }
  } catch (err) {
    console.error('Error loading articles for homepage:', err);
  }

  return (
    <section className="py-16 bg-charcoal-deep border-b border-charcoal-border/50">
      <div className="max-w-7xl mx-auto px-4 lg:px-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-10">
          <div>
            <div className="inline-flex items-center gap-1.5 text-gold text-xs font-bold uppercase tracking-widest mb-1">
              <BookOpen className="w-3.5 h-3.5" />
              <span>Kho Tri Thức Chuyên Sâu</span>
            </div>
            <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-ivory">
              KIẾN THỨC DINH DƯỠNG & GYM KHOA HỌC
            </h2>
          </div>
          <Link
            href="/blog"
            className="text-xs font-bold text-gold-light hover:text-gold flex items-center gap-1.5 transition"
          >
            <span>Đọc tất cả bài viết</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {displayArticles.map((art) => (
            <Link
              key={art.slug}
              href={`/blog/${art.slug}`}
              className="group card-luxury overflow-hidden flex flex-col sm:flex-row border-charcoal-border/80 hover:border-gold/50 transition"
            >
              <div className="sm:w-2/5 aspect-video sm:aspect-auto relative overflow-hidden bg-charcoal-card flex-shrink-0">
                <img
                  src={art.coverImage}
                  alt={art.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>

              <div className="p-6 flex flex-col justify-between flex-1">
                <div>
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="text-gold font-bold text-[11px] uppercase tracking-wider">
                      {art.category}
                    </span>
                    <span className="text-slate-DEFAULT text-[11px] flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {art.readTime}
                    </span>
                  </div>

                  <h3 className="font-display font-bold text-base text-ivory group-hover:text-gold transition line-clamp-2">
                    {art.title}
                  </h3>

                  <p className="text-xs text-slate-subtle mt-2 line-clamp-3 leading-relaxed">
                    {art.excerpt}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-charcoal-border/50 flex items-center text-xs font-bold text-gold-light group-hover:text-gold gap-1">
                  <span>Đọc tiếp</span>
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
