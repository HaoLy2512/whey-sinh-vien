/**
 * NGUỒN DUY NHẤT cho mọi quy tắc ưu đãi hiển thị trên storefront.
 * Hero, thanh thông báo, section voucher, footer, newsletter, giỏ hàng... đều đọc từ đây.
 *
 * LƯU Ý: giá trị coupon thật nằm ở bảng Coupon trong DB (prisma/seed.js).
 * Khi đổi số ở đây, hãy đổi cả seed.js / trang admin Khuyến mãi cho khớp.
 */
export const PROMO = {
  /** Voucher đơn hàng đầu tiên (tặng khi đăng ký newsletter) */
  firstOrderVoucher: {
    code: 'WELCOME100',
    amount: 100_000,
  },
  /** Mã giảm theo phần trăm */
  percentVoucher: {
    code: 'VITACORE10',
    percent: 10,
    maxDiscount: 150_000,
    minOrder: 1_000_000,
  },
  /** Miễn phí vận chuyển */
  freeShip: {
    threshold: 1_000_000,
  },
  /** Thời gian giao hàng (khớp trang /policies) */
  delivery: {
    expressAreas: 'nội thành TP.HCM & Hà Nội',
    expressTime: '2-4 giờ',
    standardTime: '2-4 ngày làm việc',
  },
  /** Đổi trả */
  returnDays: 7,
} as const;

/** 1000000 -> "1.000.000" (không phụ thuộc ICU nên server/client luôn giống nhau) */
export function formatNumberVi(n: number): string {
  return String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

/** 1000000 -> "1.000.000₫" */
export function formatMoneyShort(n: number): string {
  return `${formatNumberVi(n)}₫`;
}

/** Tháng hiện tại theo giờ Việt Nam, ví dụ 11 */
export function getCurrentMonthVN(date: Date = new Date()): number {
  const m = new Intl.DateTimeFormat('en-US', {
    month: 'numeric',
    timeZone: 'Asia/Ho_Chi_Minh',
  }).format(date);
  return parseInt(m, 10);
}

/** "Ưu đãi tháng 11" */
export function getPromoTitle(date: Date = new Date()): string {
  return `Ưu đãi tháng ${getCurrentMonthVN(date)}`;
}
