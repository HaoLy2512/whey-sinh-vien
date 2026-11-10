/**
 * Thông tin pháp lý & liên hệ hiển thị ở header/footer.
 *
 * Dự án hiện chưa có thông tin doanh nghiệp thật nên để null.
 * Khi có thật: điền giá trị và đặt isDemo = false, footer sẽ tự hiện đầy đủ.
 */
export interface SiteConfig {
  name: string;
  tagline: string;
  isDemo: boolean;
  demoNotice: string;
  contact: {
    address: string | null;
    hotline: string | null;
    /** dạng tel:, ví dụ "19008899" */
    hotlineHref: string | null;
    email: string | null;
  };
  legal: {
    companyName: string | null;
    taxCode: string | null;
    businessLicense: string | null;
  };
}

export const siteConfig: SiteConfig = {
  name: 'VITACORE SUPPLEMENTS',
  tagline: 'Luxury Nutrition',
  isDemo: true,
  demoNotice: 'Website phục vụ mục đích học tập',
  contact: {
    address: null,
    hotline: null,
    hotlineHref: null,
    email: null,
  },
  legal: {
    companyName: null,
    taxCode: null,
    businessLicense: null,
  },
};
