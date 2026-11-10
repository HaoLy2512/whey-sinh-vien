export interface Testimonial {
  id: string;
  name: string;
  city: string;
  product: string;
  rating: 1 | 2 | 3 | 4 | 5;
  quote: string;
}

/** Đánh giá minh họa (dự án học tập) – không phải đánh giá của khách thật. */
export const TESTIMONIALS_ARE_ILLUSTRATIVE = true;

export const testimonials: Testimonial[] = [
  {
    id: 't1',
    name: 'Minh Tuấn',
    city: 'TP.HCM',
    product: 'Whey Protein Isolate',
    rating: 5,
    quote: 'Whey tan nhanh, vị chocolate dễ uống. Quét tem là ra hàng chính hãng nên yên tâm.',
  },
  {
    id: 't2',
    name: 'Thu Hà',
    city: 'Đà Nẵng',
    product: 'BCAA Amino Acids',
    rating: 5,
    quote: 'Giao nhanh, đóng gói kỹ, hũ không bị móp. Mình đặt lần hai rồi.',
  },
  {
    id: 't3',
    name: 'Quốc Bảo',
    city: 'Cần Thơ',
    product: 'Combo Creatine + Pre-workout',
    rating: 5,
    quote: 'Combo creatine và pre-workout rẻ hơn mua lẻ, mã giảm áp dụng ngay.',
  },
];
