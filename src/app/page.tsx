import React from 'react';
import HeroSection from '@/components/home/HeroSection';
import FeaturedCategories from '@/components/home/FeaturedCategories';
import BestSellersSection from '@/components/home/BestSellersSection';
import GoalCollectionsSection from '@/components/home/GoalCollectionsSection';
import BrandsMarquee from '@/components/home/BrandsMarquee';
import PromotionsBanner from '@/components/home/PromotionsBanner';
import WhyChooseUsSection from '@/components/home/WhyChooseUsSection';
import VerifiedReviewsSection from '@/components/home/VerifiedReviewsSection';
import KnowledgeArticlesSection from '@/components/home/KnowledgeArticlesSection';
import NewsletterSection from '@/components/home/NewsletterSection';

export default function HomePage() {
  return (
    <div className="flex flex-col w-full">
      {/* 2. Hero Banner */}
      <HeroSection />

      {/* 7. Brands Marquee */}
      <BrandsMarquee />

      {/* 3. Featured Categories */}
      <FeaturedCategories />

      {/* 4. Best Sellers */}
      <BestSellersSection />

      {/* 6. Goal-oriented Collections */}
      <GoalCollectionsSection />

      {/* 8. Promotions & Coupon Banner */}
      <PromotionsBanner />

      {/* 9. Why Choose Us */}
      <WhyChooseUsSection />

      {/* 10. Verified Reviews */}
      <VerifiedReviewsSection />

      {/* 11. Nutrition & Workout Knowledge */}
      <KnowledgeArticlesSection />

      {/* 12. VIP Club Newsletter */}
      <NewsletterSection />
    </div>
  );
}

