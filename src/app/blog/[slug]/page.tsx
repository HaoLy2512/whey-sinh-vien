import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import prisma from '@/lib/prisma';
import { ChevronRight, Clock, User, Calendar, ArrowLeft, Share2 } from 'lucide-react';
import { formatDate } from '@/lib/utils';

export default async function ArticleDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const article = await prisma.article.findUnique({
    where: { slug: params.slug },
  });

  if (!article || !article.isPublished) {
    notFound();
  }

  return (
    <div className="bg-charcoal min-h-screen py-10">
      <article className="max-w-4xl mx-auto px-4 lg:px-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-slate-DEFAULT mb-8 flex-wrap">
          <Link href="/" className="hover:text-gold transition">Trang chủ</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <Link href="/blog" className="hover:text-gold transition">Cẩm nang dinh dưỡng</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-ivory font-semibold truncate max-w-xs">{article.title}</span>
        </div>

        {/* Article Header */}
        <div className="mb-8">
          <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-gold/10 text-gold border border-gold/30 inline-block mb-3">
            {article.category}
          </span>
          <h1 className="font-display font-black text-2xl sm:text-4xl text-ivory leading-tight mb-4">
            {article.title}
          </h1>

          <div className="flex items-center gap-4 text-xs text-slate-DEFAULT pb-6 border-b border-charcoal-border/60">
            <span className="flex items-center gap-1.5 text-ivory font-semibold">
              <User className="w-3.5 h-3.5 text-gold" />
              {article.authorName}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-gold" />
              {formatDate(article.publishedAt)}
            </span>
          </div>
        </div>

        {/* Featured Image */}
        {article.coverImage && (
          <div className="aspect-video w-full rounded-2xl overflow-hidden mb-8 border border-charcoal-border shadow-card">
            <img src={article.coverImage} alt={article.title} className="w-full h-full object-cover" />
          </div>
        )}

        {/* Lead Excerpt */}
        <div className="p-4 rounded-xl bg-charcoal-card border-l-4 border-gold text-sm text-ivory font-medium leading-relaxed mb-8">
          {article.excerpt}
        </div>

        {/* Article Body Content */}
        <div className="prose prose-invert max-w-none text-slate-subtle text-sm sm:text-base leading-relaxed space-y-4 whitespace-pre-line pb-12 border-b border-charcoal-border/60">
          {article.content}
        </div>

        {/* Bottom Navigation */}
        <div className="mt-8 flex justify-between items-center text-xs">
          <Link href="/blog" className="text-gold-light hover:text-gold font-bold flex items-center gap-1.5">
            <ArrowLeft className="w-4 h-4" />
            Về danh sách bài viết
          </Link>
          <Link href="/products" className="px-5 py-2.5 rounded-xl bg-gold text-charcoal font-bold hover:bg-gold-light shadow-glow">
            Khám phá thực phẩm bổ sung
          </Link>
        </div>
      </article>
    </div>
  );
}

