// Sản phẩm bổ sung cho seed (dùng cùng định dạng với mảng products trong prisma/seed.js).
// Quy ước: price = giá gốc, salePrice = giá bán sau giảm. discount (%) được dùng để tính salePrice
// nên % hiển thị trên thẻ sản phẩm luôn khớp với giá. Chạy seed nhiều lần không tạo bản ghi trùng (upsert theo slug/sku).

const IMG = {
  tub1: 'https://images.unsplash.com/photo-1579722821273-0f6c7d44362f?auto=format&fit=crop&w=800&q=80',
  tub2: 'https://images.unsplash.com/photo-1593095948071-474c5cc2989d?auto=format&fit=crop&w=800&q=80',
  gym1: 'https://images.unsplash.com/photo-1546483875-ad9014c88eba?auto=format&fit=crop&w=800&q=80',
  gym2: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=800&q=80',
  pills: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=800&q=80',
};

// Làm tròn giá bán đến 1.000đ; nếu làm tròn làm lệch % thì dùng giá chính xác đến 100đ.
function sale(price, pct) {
  if (!pct) return null;
  const exact = price * (1 - pct / 100);
  const rounded1000 = Math.round(exact / 1000) * 1000;
  if (Math.round(((price - rounded1000) / price) * 100) === pct) return rounded1000;
  return Math.round(exact / 100) * 100;
}

const cost = (price) => Math.round((price * 0.62) / 1000) * 1000;

function make(o) {
  const variants = o.variants.map((v, i) => ({
    title: v.flavor ? `${v.weight} - ${v.flavor}` : v.weight,
    weight: v.weight,
    flavor: v.flavor || null,
    price: v.price,
    salePrice: sale(v.price, o.discount),
    costPrice: cost(v.price),
    sku: `${o.sku}-${v.code || i + 1}`,
    inStock: v.stock,
  }));
  const base = variants[0];
  return {
    name: o.name,
    slug: o.slug,
    sku: o.sku,
    brandSlug: o.brand,
    catSlug: o.cat,
    goal: o.goal,
    price: base.price,
    salePrice: base.salePrice,
    costPrice: base.costPrice,
    isFeatured: Boolean(o.featured),
    ratingAvg: o.rating,
    reviewCount: o.reviews,
    soldCount: o.sold,
    shortDescription: o.short,
    description: o.desc,
    nutritionFacts: JSON.stringify(o.facts),
    usageGuide: o.usage,
    allergens: o.allergens || 'Không chứa Gluten. Có thể chứa vết Sữa, Đậu nành.',
    warnings:
      'Sản phẩm bổ sung dinh dưỡng, không thay thế chế độ ăn cân bằng. Không dùng cho phụ nữ có thai, đang cho con bú hoặc người dưới 18 tuổi nếu chưa có chỉ định của bác sĩ.',
    manufacturer: o.maker,
    originCountry: o.country || 'USA',
    images: o.images,
    variants,
  };
}

module.exports = [
  // ---------- WHEY PROTEIN ----------
  make({
    name: 'Rule 1 R1 Protein Whey Isolate Hydrolysate', slug: 'rule-1-r1-protein', sku: 'R1-PROTEIN',
    brand: 'rule-1-proteins', cat: 'whey-protein', goal: 'Muscle Building', discount: 8, featured: true,
    rating: 4.8, reviews: 52, sold: 640,
    short: '25g protein từ whey isolate và hydrolysate, ít đường, tan nhanh.',
    desc: 'R1 Protein kết hợp Whey Protein Isolate và Whey Protein Hydrolysate cho khả năng hấp thu nhanh, hàm lượng đường và chất béo thấp, phù hợp cả giai đoạn tăng cơ lẫn siết mỡ.',
    facts: { servingSize: '32g (1 muỗng)', servingsPerContainer: 70, calories: 120, protein: '25g', bcaa: '5.5g', fat: '1g', carbs: '2g', sugar: '0g' },
    usage: 'Pha 1 muỗng với 200-250ml nước lạnh, dùng sau tập hoặc giữa các bữa ăn.',
    maker: 'Rule 1 Proteins LLC',
    images: [IMG.tub1, IMG.tub2],
    variants: [
      { weight: '5 lbs (2.27kg)', flavor: 'Chocolate Fudge', price: 1790000, stock: 40, code: '5LB-CHOCO' },
      { weight: '2 lbs (907g)', flavor: 'Vanilla Creme', price: 790000, stock: 35, code: '2LB-VANILLA' },
    ],
  }),
  make({
    name: 'Applied Nutrition Critical Whey Protein', slug: 'applied-nutrition-critical-whey', sku: 'AN-CRITWHEY',
    brand: 'applied-nutrition', cat: 'whey-protein', goal: 'Muscle Building', discount: 10,
    rating: 4.6, reviews: 29, sold: 310,
    short: 'Whey protein vị ngon, 23g protein mỗi khẩu phần, giá dễ tiếp cận.',
    desc: 'Critical Whey từ Applied Nutrition (Anh) cung cấp 23g protein và hơn 5g BCAA mỗi khẩu phần, hòa tan mịn và có nhiều hương vị dễ uống.',
    facts: { servingSize: '30g (1 muỗng)', servingsPerContainer: 67, calories: 118, protein: '23g', bcaa: '5.1g', fat: '1.6g', carbs: '2.5g', sugar: '1.2g' },
    usage: 'Pha 1 muỗng với 200ml nước hoặc sữa, dùng 1-2 lần mỗi ngày.',
    maker: 'Applied Nutrition Ltd', country: 'UK',
    images: [IMG.tub2, IMG.gym1],
    variants: [
      { weight: '2kg', flavor: 'Chocolate Silk', price: 1390000, stock: 30, code: '2KG-CHOCO' },
      { weight: '900g', flavor: 'Cookies & Cream', price: 690000, stock: 28, code: '900G-COOKIE' },
    ],
  }),
  make({
    name: 'MuscleTech Nitro-Tech 100% Whey Gold', slug: 'muscletech-nitro-tech-whey-gold', sku: 'MT-NITRO-GOLD',
    brand: 'muscletech', cat: 'whey-protein', goal: 'Muscle Building', discount: 7, featured: true,
    rating: 4.7, reviews: 44, sold: 520,
    short: 'Whey gold bổ sung creatine, 24g protein mỗi khẩu phần.',
    desc: 'Nitro-Tech 100% Whey Gold kết hợp whey isolate với peptide và creatine, giúp hỗ trợ tăng cơ và sức mạnh trong cùng một sản phẩm.',
    facts: { servingSize: '33g (1 muỗng)', servingsPerContainer: 69, calories: 130, protein: '24g', bcaa: '5.5g', fat: '2g', carbs: '3g', sugar: '1g' },
    usage: 'Pha 1 muỗng với 200-250ml nước lạnh, dùng sau tập hoặc buổi sáng.',
    maker: 'MuscleTech (Iovate Health Sciences)',
    images: [IMG.tub1, IMG.gym2],
    variants: [
      { weight: '5 lbs (2.27kg)', flavor: 'Double Rich Chocolate', price: 1690000, stock: 38, code: '5LB-CHOCO' },
      { weight: '2 lbs (907g)', flavor: 'Vanilla', price: 790000, stock: 26, code: '2LB-VANILLA' },
    ],
  }),
  make({
    name: 'Dymatize Elite Casein Protein', slug: 'dymatize-elite-casein', sku: 'DYM-ELITE-CASEIN',
    brand: 'dymatize', cat: 'whey-protein', goal: 'Recovery', discount: 6,
    rating: 4.7, reviews: 21, sold: 190,
    short: 'Casein hấp thu chậm, nuôi cơ suốt đêm, 24g protein mỗi khẩu phần.',
    desc: 'Elite Casein cung cấp micellar casein hấp thu chậm, phù hợp dùng buổi tối để giảm dị hóa cơ trong lúc ngủ và hỗ trợ phục hồi.',
    facts: { servingSize: '36g (1 muỗng)', servingsPerContainer: 28, calories: 140, protein: '24g', bcaa: '5g', fat: '1.5g', carbs: '5g', sugar: '2g' },
    usage: 'Pha 1 muỗng với 250ml nước hoặc sữa, dùng 30-60 phút trước khi ngủ.',
    maker: 'Dymatize Enterprises LLC',
    images: [IMG.tub2],
    variants: [{ weight: '4 lbs (1.8kg)', flavor: 'Rich Chocolate', price: 1590000, stock: 24, code: '4LB-CHOCO' }],
  }),

  // ---------- MASS GAINER ----------
  make({
    name: 'MuscleTech Mass-Tech Extreme 2000', slug: 'muscletech-mass-tech-extreme-2000', sku: 'MT-MASSTECH',
    brand: 'muscletech', cat: 'mass-gainer', goal: 'Muscle Building', discount: 9,
    rating: 4.6, reviews: 33, sold: 410,
    short: 'Sữa tăng cân 1.000 kcal mỗi khẩu phần, 80g protein, bổ sung creatine.',
    desc: 'Mass-Tech Extreme 2000 cung cấp nguồn calo và protein dồi dào kèm creatine và carbohydrate phức hợp, dành cho người gầy khó tăng cân.',
    facts: { servingSize: '334g (4 muỗng)', servingsPerContainer: 9, calories: 1000, protein: '80g', fat: '9g', carbs: '178g', sugar: '28g' },
    usage: 'Pha 1/2 phần với 350ml nước hoặc sữa, dùng 1-2 lần mỗi ngày giữa các bữa chính.',
    maker: 'MuscleTech (Iovate Health Sciences)',
    images: [IMG.tub1, IMG.gym2],
    variants: [{ weight: '6 lbs (2.72kg)', flavor: 'Milk Chocolate', price: 1590000, stock: 27, code: '6LB-CHOCO' }],
  }),
  make({
    name: 'Dymatize Super Mass Gainer', slug: 'dymatize-super-mass-gainer', sku: 'DYM-SUPERMASS',
    brand: 'dymatize', cat: 'mass-gainer', goal: 'Muscle Building', discount: 8,
    rating: 4.5, reviews: 18, sold: 205,
    short: 'Gainer 1.280 kcal mỗi khẩu phần, 52g protein, dễ pha.',
    desc: 'Super Mass Gainer của Dymatize cung cấp lượng calo cao từ carbohydrate phức hợp và protein chất lượng, phù hợp người cần tăng cân nhanh và đều.',
    facts: { servingSize: '334g (3 muỗng)', servingsPerContainer: 14, calories: 1280, protein: '52g', fat: '8g', carbs: '254g', sugar: '34g' },
    usage: 'Pha 1 phần với 400ml sữa hoặc nước, dùng sau tập hoặc giữa các bữa.',
    maker: 'Dymatize Enterprises LLC',
    images: [IMG.tub2, IMG.gym1],
    variants: [{ weight: '12 lbs (5.4kg)', flavor: 'Rich Chocolate', price: 2090000, stock: 20, code: '12LB-CHOCO' }],
  }),

  // ---------- CREATINE ----------
  make({
    name: 'Optimum Nutrition Micronized Creatine Powder', slug: 'on-micronized-creatine', sku: 'ON-CREATINE',
    brand: 'optimum-nutrition', cat: 'creatine', goal: 'Performance', discount: 10, featured: true,
    rating: 4.9, reviews: 61, sold: 870,
    short: 'Creatine monohydrate dạng bột siêu mịn, 5g mỗi khẩu phần, không vị.',
    desc: 'Creatine Monohydrate dạng micronized giúp tan tốt hơn trong nước, hỗ trợ tăng sức mạnh, sức bền khi tập cường độ cao.',
    facts: { servingSize: '5g (1 muỗng)', servingsPerContainer: 60, calories: 0, creatine: '5g', fat: '0g', carbs: '0g', sugar: '0g' },
    usage: 'Hòa 1 muỗng (5g) với nước hoặc nước ép, dùng mỗi ngày kể cả ngày nghỉ. Uống đủ nước.',
    allergens: 'Không chứa các chất gây dị ứng thông thường.',
    maker: 'Glanbia Performance Nutrition (USA)',
    images: [IMG.gym1, IMG.tub1],
    variants: [
      { weight: '300g', flavor: 'Không vị', price: 490000, stock: 60, code: '300G' },
      { weight: '600g', flavor: 'Không vị', price: 890000, stock: 40, code: '600G' },
    ],
  }),

  // ---------- PRE-WORKOUT ----------
  make({
    name: 'Cellucor C4 Original Pre-Workout', slug: 'cellucor-c4-original', sku: 'CEL-C4-ORIG',
    brand: 'cellucor', cat: 'pre-workout', goal: 'Performance', discount: 12, featured: true,
    rating: 4.7, reviews: 57, sold: 760,
    short: 'Pre-workout bán chạy tại Mỹ, 150mg caffeine, tăng tỉnh táo và pump cơ.',
    desc: 'C4 Original có caffeine, beta-alanine và creatine nitrate giúp tăng năng lượng, độ tập trung và sức bền cho buổi tập nặng.',
    facts: { servingSize: '6.5g (1 muỗng)', servingsPerContainer: 30, calories: 5, caffeine: '150mg', betaAlanine: '1.6g', fat: '0g', carbs: '1g', sugar: '0g' },
    usage: 'Hòa 1 muỗng với 180-240ml nước, uống 20-30 phút trước khi tập. Không dùng quá 1 lần mỗi ngày.',
    warnings: 'Chứa caffeine, không dùng cho người nhạy cảm với caffeine, phụ nữ có thai, cho con bú hoặc người dưới 18 tuổi. Không dùng sau 3 giờ chiều.',
    maker: 'Cellucor (Nutrabolt)',
    images: [IMG.gym2, IMG.tub1],
    variants: [
      { weight: '30 lần dùng', flavor: 'Icy Blue Razz', price: 790000, stock: 50, code: '30S-BLUE' },
      { weight: '60 lần dùng', flavor: 'Fruit Punch', price: 1290000, stock: 32, code: '60S-PUNCH' },
    ],
  }),
  make({
    name: 'MuscleTech Vapor X5 Next Gen Pre-Workout', slug: 'muscletech-vapor-x5', sku: 'MT-VAPORX5',
    brand: 'muscletech', cat: 'pre-workout', goal: 'Performance', discount: 11,
    rating: 4.5, reviews: 24, sold: 260,
    short: 'Pre-workout 275mg caffeine, tập trung cao và bùng nổ sức mạnh.',
    desc: 'Vapor X5 Next Gen kết hợp caffeine, citrulline và beta-alanine giúp tăng tập trung, bơm máu và sức bền cho buổi tập cường độ cao.',
    facts: { servingSize: '16g (1 muỗng)', servingsPerContainer: 30, calories: 15, caffeine: '275mg', citrulline: '4g', betaAlanine: '2g', fat: '0g', carbs: '3g' },
    usage: 'Hòa 1 muỗng với 240ml nước, uống 20 phút trước khi tập. Bắt đầu với nửa muỗng để làm quen.',
    warnings: 'Chứa lượng caffeine cao, không dùng cho người nhạy cảm với caffeine, phụ nữ có thai, cho con bú hoặc người dưới 18 tuổi.',
    maker: 'MuscleTech (Iovate Health Sciences)',
    images: [IMG.gym2],
    variants: [{ weight: '30 lần dùng', flavor: 'Blue Raspberry', price: 850000, stock: 30, code: '30S-BLUE' }],
  }),

  // ---------- BCAA / AMINO / PHỤC HỒI ----------
  make({
    name: 'Optimum Nutrition Essential Amino Energy', slug: 'on-essential-amino-energy', sku: 'ON-AMINO-ENERGY',
    brand: 'optimum-nutrition', cat: 'bcaa-amino-acids', goal: 'Recovery', discount: 10, featured: true,
    rating: 4.8, reviews: 46, sold: 590,
    short: 'Amino thiết yếu và BCAA kèm 100mg caffeine tự nhiên từ trà xanh.',
    desc: 'Essential Amino Energy cung cấp các amino acid thiết yếu và BCAA cùng caffeine tự nhiên, hỗ trợ phục hồi cơ và giữ tỉnh táo khi tập.',
    facts: { servingSize: '9g (1 muỗng)', servingsPerContainer: 30, calories: 5, bcaa: '5g', caffeine: '100mg', fat: '0g', carbs: '0g', sugar: '0g' },
    usage: 'Hòa 1 muỗng với 250-300ml nước, uống trước hoặc trong lúc tập.',
    maker: 'Glanbia Performance Nutrition (USA)',
    images: [IMG.gym1, IMG.tub2],
    variants: [
      { weight: '30 lần dùng', flavor: 'Fruit Punch', price: 790000, stock: 44, code: '30S-PUNCH' },
      { weight: '65 lần dùng', flavor: 'Blueberry Mojito', price: 1490000, stock: 26, code: '65S-BLUE' },
    ],
  }),
  make({
    name: 'Cellucor Alpha Amino', slug: 'cellucor-alpha-amino', sku: 'CEL-ALPHA-AMINO',
    brand: 'cellucor', cat: 'bcaa-amino-acids', goal: 'Recovery', discount: 9,
    rating: 4.6, reviews: 19, sold: 175,
    short: 'BCAA 2:1:1 và EAA, giảm dị hóa cơ, vị dễ uống.',
    desc: 'Alpha Amino cung cấp BCAA, EAA và chất điện giải giúp bù nước, hạn chế dị hóa cơ và hỗ trợ phục hồi sau tập.',
    facts: { servingSize: '14.5g (1 muỗng)', servingsPerContainer: 30, calories: 15, bcaa: '8g', fat: '0g', carbs: '3g', sugar: '0g' },
    usage: 'Hòa 1 muỗng với 300ml nước, uống trong lúc tập hoặc sau tập.',
    maker: 'Cellucor (Nutrabolt)',
    images: [IMG.gym1],
    variants: [{ weight: '30 lần dùng', flavor: 'Watermelon', price: 690000, stock: 33, code: '30S-WATERMELON' }],
  }),
  make({
    name: 'Applied Nutrition BCAA Amino-Hydrate', slug: 'applied-nutrition-bcaa-amino-hydrate', sku: 'AN-BCAA-HYDRATE',
    brand: 'applied-nutrition', cat: 'bcaa-amino-acids', goal: 'Recovery', discount: 8,
    rating: 4.5, reviews: 27, sold: 285,
    short: 'BCAA kèm chất điện giải, giữ nước và phục hồi cơ nhanh.',
    desc: 'BCAA Amino-Hydrate kết hợp BCAA, glutamine và điện giải giúp bù nước và hỗ trợ phục hồi sau buổi tập dài.',
    facts: { servingSize: '15g (1 muỗng)', servingsPerContainer: 32, calories: 20, bcaa: '7g', glutamine: '1g', fat: '0g', carbs: '2g', sugar: '0g' },
    usage: 'Hòa 1 muỗng với 400ml nước, uống trong hoặc sau buổi tập.',
    maker: 'Applied Nutrition Ltd', country: 'UK',
    images: [IMG.gym1, IMG.gym2],
    variants: [{ weight: '450g', flavor: 'Icy Blue Raz', price: 590000, stock: 36, code: '450G-BLUE' }],
  }),

  // ---------- VITAMIN & OMEGA-3 / SỨC KHỎE TỔNG QUÁT ----------
  make({
    name: 'Optimum Nutrition Opti-Men Multivitamin', slug: 'on-opti-men', sku: 'ON-OPTIMEN',
    brand: 'optimum-nutrition', cat: 'vitamins-minerals', goal: 'General Nutrition', discount: 10, featured: true,
    rating: 4.8, reviews: 40, sold: 480,
    short: 'Vitamin tổng hợp cho nam giới tập luyện, hơn 75 thành phần dinh dưỡng.',
    desc: 'Opti-Men là hỗn hợp vitamin, khoáng chất và chiết xuất thực vật được thiết kế cho nam giới thường xuyên vận động, hỗ trợ năng lượng và miễn dịch.',
    facts: { servingSize: '3 viên', servingsPerContainer: 30, calories: 5, fat: '0g', carbs: '1g', sugar: '0g' },
    usage: 'Uống 3 viên mỗi ngày cùng bữa ăn.',
    maker: 'Glanbia Performance Nutrition (USA)',
    images: [IMG.pills],
    variants: [{ weight: '90 viên', flavor: null, price: 650000, stock: 55, code: '90C' }],
  }),
  make({
    name: 'Optimum Nutrition Opti-Women Multivitamin', slug: 'on-opti-women', sku: 'ON-OPTIWOMEN',
    brand: 'optimum-nutrition', cat: 'vitamins-minerals', goal: 'General Nutrition', discount: 10,
    rating: 4.7, reviews: 31, sold: 330,
    short: 'Vitamin tổng hợp cho nữ giới, bổ sung sắt, canxi và vitamin nhóm B.',
    desc: 'Opti-Women cung cấp vitamin, khoáng chất như sắt, canxi, folate cùng chiết xuất thực vật, phù hợp phụ nữ thường xuyên tập luyện.',
    facts: { servingSize: '2 viên', servingsPerContainer: 60, calories: 5, fat: '0g', carbs: '1g', sugar: '0g' },
    usage: 'Uống 2 viên mỗi ngày cùng bữa ăn.',
    maker: 'Glanbia Performance Nutrition (USA)',
    images: [IMG.pills],
    variants: [{ weight: '120 viên', flavor: null, price: 690000, stock: 42, code: '120C' }],
  }),
  make({
    name: 'MuscleTech Platinum Multivitamin', slug: 'muscletech-platinum-multivitamin', sku: 'MT-PLAT-MULTI',
    brand: 'muscletech', cat: 'vitamins-minerals', goal: 'General Nutrition', discount: 0,
    rating: 4.5, reviews: 16, sold: 150,
    short: 'Vitamin và khoáng chất hằng ngày, hỗ trợ năng lượng và phục hồi.',
    desc: 'Platinum Multivitamin bổ sung vitamin, khoáng chất và amino acid cho người tập luyện, giúp lấp đầy khoảng trống dinh dưỡng trong bữa ăn hằng ngày.',
    facts: { servingSize: '3 viên', servingsPerContainer: 30, calories: 5, fat: '0g', carbs: '1g', sugar: '0g' },
    usage: 'Uống 3 viên mỗi ngày cùng bữa ăn.',
    maker: 'MuscleTech (Iovate Health Sciences)',
    images: [IMG.pills],
    variants: [{ weight: '90 viên', flavor: null, price: 450000, stock: 48, code: '90C' }],
  }),
];
