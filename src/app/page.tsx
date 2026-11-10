import React from 'react';
import HeroSection from '@/components/home/HeroSection';
import FeaturedCategories from '@/components/home/FeaturedCategories';
import BestSellersSection from '@/components/home/BestSellersSection';
import GoalCollectionsSection from '@/components/home/GoalCollectionsSection';
import BudgetFinder from '@/components/home/BudgetFinder';
import BrandsMarquee from '@/components/home/BrandsMarquee';
import PromotionsBanner from '@/components/home/PromotionsBanner';
import WhyChooseUsSection from '@/components/home/WhyChooseUsSection';
import VerifiedReviewsSection from '@/components/home/VerifiedReviewsSection';
import KnowledgeArticlesSection from '@/components/home/KnowledgeArticlesSection';
import NewsletterSection from '@/components/home/NewsletterSection';
import { HomeDedupeProvider } from '@/components/home/HomeDedupeContext';
import { getHomeData, type HomeData } from '@/lib/home-products';

// Dữ liệu sản phẩm lấy từ DB mỗi lần truy cập (không prerender lúc build)
export const dynamic = 'force-dynamic';

const EMPTY_HOME: HomeData = { hero: null, bestSellers: [], usedIds: [] };

export default async function HomePage() {
  let home = EMPTY_HOME;
  try {
    home = await getHomeData(4);
  } catch (err) {
    console.error('Error loading homepage products:', err);
  }

  return (
    <div className="flex w-full flex-col">
      {/* Hero: 1 sản phẩm nổi bật */}
      <HeroSection hero={home.hero} />

      <BrandsMarquee />
      <FeaturedCategories />

      {/* Mỗi section dùng một tiêu chí riêng và loại sản phẩm đã xuất hiện ở section trước */}
      <BestSellersSection products={home.bestSellers} />

      <HomeDedupeProvider baseExcludeIds={home.usedIds}>
        <GoalCollectionsSection />
        <BudgetFinder />
      </HomeDedupeProvider>

      <PromotionsBanner />
      <WhyChooseUsSection />
      <VerifiedReviewsSection />
      <KnowledgeArticlesSection />
      <NewsletterSection />
    </div>
  );
}
