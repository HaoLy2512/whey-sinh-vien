import React from 'react';
import Link from 'next/link';
import prisma from '@/lib/prisma';
import { BookOpen, Clock, ArrowRight, ChevronRight, User } from 'lucide-react';
import { formatDate } from '@/lib/utils';

export const revalidate = 60;

export default async function BlogPage() {
  const articles = await prisma.article.findMany({
    where: { isPublished: true },
    orderBy: { publishedAt: 'desc' },
  });

  return (
    <div className="bg-charcoal min-h-screen py-10">
      <div className="max-w-7xl mx-auto px-4 lg:px-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-slate-DEFAULT mb-6">
          <Link href="/" className="hover:text-gold transition">Trang chủ</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-ivory font-semibold">Cẩm nang dinh dưỡng & thể thao</span>
        </div>

        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-1.5 text-gold text-xs font-bold uppercase tracking-widest mb-1">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Kho Tri Thức Chuyên Nghiệp</span>
          </div>
          <h1 className="font-display font-black text-3xl sm:text-4xl text-ivory">
            KIẾN THỨC DINH DƯỠNG & GYM KHOA HỌC
          </h1>
          <p className="text-xs text-slate-subtle mt-2">
            Tổng hợp các bài viết nghiên cứu về whey protein, creatine, hypertrophy và chế độ phục hồi cơ bắp
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {articles.map((art) => (
            <Link
              key={art.slug}
              href={`/blog/${art.slug}`}
              className="group card-luxury overflow-hidden flex flex-col justify-between border-charcoal-border hover:border-gold/50 transition"
            >
              <div className="aspect-video relative overflow-hidden bg-charcoal-deep">
                <img
                  src={art.coverImage || 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=800&q=80'}
                  alt={art.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>

              <div className="p-6 flex flex-col justify-between flex-1">
                <div>
                  <span className="text-[10px] text-gold font-bold uppercase tracking-wider block mb-2">
                    {art.category}
                  </span>
                  <h3 className="font-display font-bold text-base text-ivory group-hover:text-gold transition line-clamp-2">
                    {art.title}
                  </h3>
                  <p className="text-xs text-slate-subtle mt-2 line-clamp-3 leading-relaxed">
                    {art.excerpt}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-charcoal-border/50 flex items-center justify-between text-[11px] text-slate-DEFAULT">
                  <span className="flex items-center gap-1">
                    <User className="w-3 h-3 text-gold" />
                    {art.authorName}
                  </span>
                  <span className="font-bold text-gold-light group-hover:text-gold flex items-center gap-1">
                    Đọc tiếp <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

