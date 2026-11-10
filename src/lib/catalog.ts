import type { Prisma } from '@prisma/client';

/** Giá tối thiểu để một sản phẩm được hiển thị ngoài cửa hàng (loại bỏ dữ liệu test như giá 1đ). */
export const MIN_STOREFRONT_PRICE = 10000;

/**
 * Điều kiện chung cho mọi truy vấn công khai (trang chủ, danh mục, hero):
 * có ảnh, giá gốc >= 10.000đ, và giá khuyến mãi (nếu có) cũng >= 10.000đ.
 * Điều kiện isActive / deletedAt vẫn được thêm riêng ở từng truy vấn.
 */
export const STOREFRONT_PRODUCT_FILTER: Prisma.ProductWhereInput = {
  price: { gte: MIN_STOREFRONT_PRICE },
  images: { some: {} },
  OR: [{ salePrice: null }, { salePrice: { gte: MIN_STOREFRONT_PRICE } }],
};
