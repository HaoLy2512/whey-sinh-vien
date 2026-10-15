const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('--- SEEDING VITACORE SUPPLEMENTS DATABASE ---');

  // 1. Roles & Permissions
  console.log('1. Seeding Roles and Permissions...');
  const roleAdmin = await prisma.role.upsert({
    where: { name: 'ADMIN' },
    update: {},
    create: { name: 'ADMIN', description: 'System Administrator with full access' },
  });

  const roleStaff = await prisma.role.upsert({
    where: { name: 'STAFF' },
    update: {},
    create: { name: 'STAFF', description: 'Operations & Store Management Staff' },
  });

  const roleUser = await prisma.role.upsert({
    where: { name: 'USER' },
    update: {},
    create: { name: 'USER', description: 'End-user customer' },
  });

  const permissionsList = [
    { code: 'orders:read', name: 'View Orders', module: 'orders' },
    { code: 'orders:write', name: 'Update Orders & Status', module: 'orders' },
    { code: 'inventory:read', name: 'View Inventory', module: 'inventory' },
    { code: 'inventory:adjust', name: 'Adjust Stock & Record Movements', module: 'inventory' },
    { code: 'products:read', name: 'View Products & Lots', module: 'products' },
    { code: 'products:write', name: 'Create & Update Products', module: 'products' },
    { code: 'customers:read', name: 'View Customer Data', module: 'customers' },
    { code: 'support:manage', name: 'Answer Support Tickets', module: 'support' },
    { code: 'reports:read', name: 'View Operational Reports', module: 'reports' },
    { code: 'admin:full', name: 'Full Administrative Privileges', module: 'admin' },
  ];

  for (const perm of permissionsList) {
    const createdPerm = await prisma.permission.upsert({
      where: { code: perm.code },
      update: {},
      create: perm,
    });

    // Admin has all
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: roleAdmin.id,
          permissionId: createdPerm.id,
        },
      },
      update: {},
      create: {
        roleId: roleAdmin.id,
        permissionId: createdPerm.id,
      },
    });

    // Staff has operational permissions
    if (perm.code !== 'admin:full' && perm.code !== 'products:write') {
      await prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: {
            roleId: roleStaff.id,
            permissionId: createdPerm.id,
          },
        },
        update: {},
        create: {
          roleId: roleStaff.id,
          permissionId: createdPerm.id,
        },
      });
    }
  }

  // 2. Default Accounts
  console.log('2. Seeding Users (Admin, Staff, Customer)...');
  const passwordHash = await bcrypt.hash('Vitacore@2026', 10);

  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@vitacore.vn' },
    update: { passwordHash, role: 'ADMIN', status: 'ACTIVE' },
    create: {
      email: 'admin@vitacore.vn',
      phone: '0901889901',
      fullName: 'Trịnh Quản Trị (Admin)',
      passwordHash,
      role: 'ADMIN',
      status: 'ACTIVE',
      emailVerified: true,
    },
  });

  const staffUser = await prisma.user.upsert({
    where: { email: 'staff@vitacore.vn' },
    update: { passwordHash, role: 'STAFF', status: 'ACTIVE' },
    create: {
      email: 'staff@vitacore.vn',
      phone: '0901889902',
      fullName: 'Lê Hoàng Nhân Viên (Staff)',
      passwordHash,
      role: 'STAFF',
      status: 'ACTIVE',
      emailVerified: true,
    },
  });

  const customerUser = await prisma.user.upsert({
    where: { email: 'customer@vitacore.vn' },
    update: { passwordHash, role: 'USER', status: 'ACTIVE' },
    create: {
      email: 'customer@vitacore.vn',
      phone: '0909123456',
      fullName: 'Nguyễn Văn Khách Hàng',
      passwordHash,
      role: 'USER',
      status: 'ACTIVE',
      emailVerified: true,
    },
  });

  // Customer addresses
  await prisma.userAddress.create({
    data: {
      userId: customerUser.id,
      receiverName: 'Nguyễn Văn Khách Hàng',
      phone: '0909123456',
      province: 'Hồ Chí Minh',
      district: 'Quận 3',
      ward: 'Phường Võ Thị Sáu',
      streetAddress: 'Số 45 Nam Kỳ Khởi Nghĩa',
      isDefault: true,
    },
  });

  // 3. Store Settings
  console.log('3. Seeding Store Settings...');
  await prisma.storeSettings.upsert({
    where: { id: 'default' },
    update: {},
    create: {
      id: 'default',
      storeName: 'VITACORE SUPPLEMENTS',
      legalName: 'Công Ty TNHH Dinh Dưỡng Thể Thao Vitacore Việt Nam',
      hotline: '1900 8899 - 0901 889 901',
      email: 'contact@vitacore.vn',
      address: '123 Võ Văn Tần, Phường 6, Quận 3, TP. Hồ Chí Minh',
      logoUrl: '/images/vitacore-logo.svg',
      primaryColor: '#101318',
      accentColor: '#C8A96A',
      currency: 'VND',
      freeShippingThreshold: 1000000,
      defaultShippingFee: 30000,
      taxRate: 0.08,
      bankAccountInfo: JSON.stringify({
        bankName: 'Techcombank',
        accountNumber: '19036888999999',
        accountHolder: 'CTY TNHH VITACORE VIET NAM',
        branch: 'Chi nhánh Sài Gòn',
        qrTemplate: 'compact2',
      }),
      paymentSettingsJson: JSON.stringify({
        cod: true,
        bankTransfer: true,
        momo: true,
        vnpay: true,
      }),
      socialLinksJson: JSON.stringify({
        facebook: 'https://facebook.com/vitacorevn',
        instagram: 'https://instagram.com/vitacorevn',
        youtube: 'https://youtube.com/@vitacorevn',
        tiktok: 'https://tiktok.com/@vitacorevn',
      }),
    },
  });

  // 4. Brands
  console.log('4. Seeding Brands...');
  const brandsData = [
    { name: 'Optimum Nutrition', slug: 'optimum-nutrition', originCountry: 'USA', description: 'Thương hiệu whey protein số 1 thế giới với hơn 35 năm uy tín.', isFeatured: true },
    { name: 'Dymatize', slug: 'dymatize', originCountry: 'USA', description: 'Nổi tiếng toàn cầu với dòng ISO100 Hydrolyzed tinh khiết hàng đầu.', isFeatured: true },
    { name: 'Rule 1 Proteins', slug: 'rule-1-proteins', originCountry: 'USA', description: 'Được sáng lập bởi các chuyên gia với tiêu chuẩn WPI & WPH đỉnh cao.', isFeatured: true },
    { name: 'MuscleTech', slug: 'muscletech', originCountry: 'USA', description: 'Tiên phong trong công nghệ nghiên cứu dinh dưỡng và Creatine tinh khiết.', isFeatured: true },
    { name: 'Applied Nutrition', slug: 'applied-nutrition', originCountry: 'UK', description: 'Thương hiệu thể thao đình đám từ Vương Quốc Anh với dòng ABE pre-workout.', isFeatured: true },
    { name: 'Cellucor', slug: 'cellucor', originCountry: 'USA', description: 'Nhà sản xuất dòng Pre-workout C4 bán chạy nhất tại Mỹ.', isFeatured: false },
  ];

  const brandMap = {};
  for (const b of brandsData) {
    const brand = await prisma.brand.upsert({
      where: { slug: b.slug },
      update: {},
      create: b,
    });
    brandMap[b.slug] = brand.id;
  }

  // 5. Categories
  console.log('5. Seeding Categories...');
  const categoriesData = [
    { name: 'Whey Protein', slug: 'whey-protein', description: 'Đạm whey tinh khiết hấp thu nhanh, hỗ trợ phát triển cơ bắp tối đa.' },
    { name: 'Mass Gainer', slug: 'mass-gainer', description: 'Sữa tăng cân tăng cơ nạp năng lượng dồi dào cho người gầy.' },
    { name: 'Creatine Monohydrate', slug: 'creatine', description: 'Gia tăng sức mạnh bùng nổ, sức bền và độ phồng tế bào cơ.' },
    { name: 'Pre-Workout & Năng Lượng', slug: 'pre-workout', description: 'Tăng tỉnh táo, độ tập trung và pump cơ trước buổi tập nặng.' },
    { name: 'BCAA & Phục Hồi Cơ', slug: 'bcaa-amino-acids', description: 'Giảm dị hóa cơ, chống đau mỏi và đẩy nhanh tốc độ phục hồi.' },
    { name: 'Vitamin & Khoáng Chất', slug: 'vitamins-minerals', description: 'Vi chất thiết yếu bảo vệ hệ miễn dịch và tối ưu hóa trao đổi chất.' },
    { name: 'Omega-3 & Dầu Cá', slug: 'omega-3', description: 'Bảo vệ tim mạch, khớp xương và hỗ trợ kháng viêm tế bào.' },
  ];

  const catMap = {};
  for (const c of categoriesData) {
    const cat = await prisma.category.upsert({
      where: { slug: c.slug },
      update: {},
      create: c,
    });
    catMap[c.slug] = cat.id;
  }

  // 6. Suppliers
  console.log('6. Seeding Suppliers...');
  const supplier = await prisma.supplier.upsert({
    where: { code: 'SUP-USA-DIRECT' },
    update: {},
    create: {
      code: 'SUP-USA-DIRECT',
      name: 'Global Sports Nutrition Importer JSC',
      contactName: 'Mr. David Tran',
      phone: '02838991122',
      email: 'supply@globalsupp.vn',
      address: 'Khu Công Nghệ Cao, TP. Thủ Đức, TP. Hồ Chí Minh',
      taxCode: '0315889988',
    },
  });

  // 7. Products & Variants & Lots
  console.log('7. Seeding Products & Lots...');
  const products = [
    {
      name: 'Optimum Nutrition Gold Standard 100% Whey',
      slug: 'on-gold-standard-100-whey',
      sku: 'ON-GS-WHEY-01',
      brandSlug: 'optimum-nutrition',
      catSlug: 'whey-protein',
      goal: 'Muscle Building',
      price: 1850000,
      salePrice: 1690000,
      costPrice: 1250000,
      isFeatured: true,
      ratingAvg: 4.9,
      reviewCount: 38,
      shortDescription: 'Biểu tượng whey protein số 1 toàn cầu, cung cấp 24g protein chất lượng cao mỗi khẩu phần.',
      description: 'Gold Standard 100% Whey từ Optimum Nutrition kết hợp Whey Protein Isolate tinh khiết, Whey Protein Concentrate và Whey Peptides thủy phân hấp thu nhanh. Chứa 5.5g BCAA tự nhiên và 4g Glutamine giúp cơ bắp phục hồi thần tốc sau mỗi buổi tập.',
      nutritionFacts: JSON.stringify({
        servingSize: '30.4g (1 muỗng)',
        servingsPerContainer: 74,
        calories: 120,
        protein: '24g',
        bcaa: '5.5g',
        glutamine: '4g',
        fat: '1.5g',
        carbs: '3g',
        sugar: '1g',
      }),
      usageGuide: 'Pha 1 muỗng với 250-300ml nước lạnh hoặc sữa tươi không đường. Dùng ngay sau khi tập và buổi sáng khi thức dậy.',
      allergens: 'Chứa thành phần từ Sữa và Đậu nành (Lecithin). Không chứa Gluten.',
      warnings: 'Sản phẩm bổ sung dinh dưỡng, không thay thế chế độ ăn cân bằng. Không dùng cho phụ nữ có thai nếu chưa có chỉ định y khoa.',
      manufacturer: 'Glanbia Performance Nutrition (USA)',
      originCountry: 'USA',
      images: [
        'https://images.unsplash.com/photo-1579722821273-0f6c7d44362f?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1593095948071-474c5cc2989d?auto=format&fit=crop&w=800&q=80',
      ],
      variants: [
        { title: '5 lbs (2.27kg) - Double Rich Chocolate', weight: '5 lbs (2.27kg)', flavor: 'Double Rich Chocolate', price: 1850000, salePrice: 1690000, costPrice: 1250000, sku: 'ON-GS-5LBS-CHOCO', inStock: 45 },
        { title: '5 lbs (2.27kg) - Vanilla Ice Cream', weight: '5 lbs (2.27kg)', flavor: 'Vanilla Ice Cream', price: 1850000, salePrice: 1690000, costPrice: 1250000, sku: 'ON-GS-5LBS-VANILLA', inStock: 30 },
        { title: '2 lbs (907g) - Double Rich Chocolate', weight: '2 lbs (907g)', flavor: 'Double Rich Chocolate', price: 950000, salePrice: 890000, costPrice: 620000, sku: 'ON-GS-2LBS-CHOCO', inStock: 25 },
      ],
    },
    {
      name: 'Dymatize ISO 100 Hydrolyzed 100% Whey Isolate',
      slug: 'dymatize-iso-100-hydrolyzed',
      sku: 'DYM-ISO100-01',
      brandSlug: 'dymatize',
      catSlug: 'whey-protein',
      goal: 'Muscle Building',
      price: 2350000,
      salePrice: 2190000,
      costPrice: 1600000,
      isFeatured: true,
      ratingAvg: 5.0,
      reviewCount: 42,
      shortDescription: '100% Hydrolyzed Whey Protein Isolate siêu tinh khiết, 0g đường, 0g chất béo.',
      description: 'Dymatize ISO100 là đỉnh cao của công nghệ phân tách whey thủy phân. Mỗi muỗng đem lại 25g protein siêu mịn, tiêu hóa cực nhanh mà không gây đầy bụng khó tiêu cho người dị ứng lactose.',
      nutritionFacts: JSON.stringify({
        servingSize: '30g',
        servingsPerContainer: 76,
        calories: 110,
        protein: '25g',
        bcaa: '5.5g',
        leucine: '2.6g',
        fat: '0g',
        carbs: '< 1g',
        sugar: '0g',
      }),
      usageGuide: 'Pha 1 muỗng với 200-250ml nước lạnh. Thích hợp nhất ngay sau buổi tập cường độ cao.',
      allergens: 'Chứa Sữa. Đã tách gần như toàn bộ Lactose (<0.5g).',
      warnings: 'Bảo quản nơi khô ráo thoáng mát dưới 25 độ C.',
      manufacturer: 'Dymatize Enterprises LLC (USA)',
      originCountry: 'USA',
      images: [
        'https://images.unsplash.com/photo-1593095948071-474c5cc2989d?auto=format&fit=crop&w=800&q=80',
      ],
      variants: [
        { title: '5 lbs (2.3kg) - Gourmet Chocolate', weight: '5 lbs (2.3kg)', flavor: 'Gourmet Chocolate', price: 2350000, salePrice: 2190000, costPrice: 1600000, sku: 'DYM-ISO-5LBS-CHOCO', inStock: 35 },
        { title: '5 lbs (2.3kg) - Peanut Butter', weight: '5 lbs (2.3kg)', flavor: 'Peanut Butter', price: 2350000, salePrice: 2190000, costPrice: 1600000, sku: 'DYM-ISO-5LBS-PB', inStock: 18 },
      ],
    },
    {
      name: 'MuscleTech Platinum 100% Creatine Monohydrate',
      slug: 'muscletech-platinum-creatine',
      sku: 'MT-PLAT-CREATINE-01',
      brandSlug: 'muscletech',
      catSlug: 'creatine',
      goal: 'Performance',
      price: 650000,
      salePrice: 580000,
      costPrice: 380000,
      isFeatured: true,
      ratingAvg: 4.8,
      reviewCount: 29,
      shortDescription: '5g Creatine siêu micronized tinh khiết giúp tăng kích thước và sức mạnh sợi cơ.',
      description: 'Platinum 100% Creatine cung cấp cho cơ bắp của bạn dạng creatine micronized được nghiên cứu lâm sàng kỹ lưỡng nhất trên thế giới. Giúp tái tạo ATP cực nhanh trong các hiệp nâng tạ nặng.',
      nutritionFacts: JSON.stringify({
        servingSize: '5g (1 muỗng)',
        servingsPerContainer: 80,
        calories: 0,
        creatineMonohydrate: '5g',
        protein: '0g',
        fat: '0g',
        carbs: '0g',
      }),
      usageGuide: 'Hòa tan 1 muỗng (5g) với 250ml nước lọc hoặc nước ép hoa quả/whey protein. Uống đều đặn hàng ngày.',
      allergens: 'Không chứa chất gây dị ứng thông thường.',
      warnings: 'Uống đủ ít nhất 2.5 - 3 lít nước mỗi ngày khi sử dụng Creatine.',
      manufacturer: 'Iovate Health Sciences (USA)',
      originCountry: 'USA',
      images: [
        'https://images.unsplash.com/photo-1546483875-ad9014c88eba?auto=format&fit=crop&w=800&q=80',
      ],
      variants: [
        { title: '400g (80 lần dùng) - Unflavored', weight: '400g', flavor: 'Không vị (Unflavored)', price: 650000, salePrice: 580000, costPrice: 380000, sku: 'MT-CREATINE-400G', inStock: 60 },
      ],
    },
    {
      name: 'Applied Nutrition ABE All Black Everything Pre-Workout',
      slug: 'applied-nutrition-abe-pre-workout',
      sku: 'AN-ABE-PRE-01',
      brandSlug: 'applied-nutrition',
      catSlug: 'pre-workout',
      goal: 'Performance',
      price: 850000,
      salePrice: 750000,
      costPrice: 490000,
      isFeatured: true,
      ratingAvg: 4.9,
      reviewCount: 31,
      shortDescription: 'Công thức Pre-workout bùng nổ sức mạnh hàng đầu châu Âu với TeaCrine & Citrulline.',
      description: 'ABE mang đến sự pha trộn độc đáo của các thành phần năng lượng quan trọng nhất: Citrulline Malate, Beta-Alanine, Taurine, Caffeine khan kết hợp cùng TeaCrine giúp duy trì sự tỉnh táo kéo dài mà không gây sụp năng lượng.',
      nutritionFacts: JSON.stringify({
        servingSize: '10.5g',
        servingsPerContainer: 30,
        citrullineMalate: '4g',
        betaAlanine: '3.25g',
        caffeine: '200mg',
        teaCrine: '100mg',
        vitaminsB3B12: '100% DV',
      }),
      usageGuide: 'Pha 1 muỗng (10.5g) với 250ml nước lạnh, uống trước khi tập 15-20 phút. Không dùng trước khi đi ngủ 4-5 tiếng.',
      allergens: 'Không.',
      warnings: 'Có chứa caffeine cao (200mg). Không dùng cho người dưới 18 tuổi hoặc người mẫn cảm với chất kích thích.',
      manufacturer: 'Applied Nutrition Ltd (UK)',
      originCountry: 'UK',
      images: [
        'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=800&q=80',
      ],
      variants: [
        { title: '315g (30 lần) - Sour Gummy Bear', weight: '315g', flavor: 'Kẹo Dẻo Chua', price: 850000, salePrice: 750000, costPrice: 490000, sku: 'AN-ABE-SOUR-GUMMY', inStock: 40 },
        { title: '315g (30 lần) - Energy Flavoured', weight: '315g', flavor: 'Hương Nước Tăng Lực', price: 850000, salePrice: 750000, costPrice: 490000, sku: 'AN-ABE-ENERGY', inStock: 25 },
      ],
    },
    {
      name: 'Optimum Nutrition Serious Mass High Calorie Gainer',
      slug: 'on-serious-mass-gainer',
      sku: 'ON-SM-12LBS-01',
      brandSlug: 'optimum-nutrition',
      catSlug: 'mass-gainer',
      goal: 'Muscle Building',
      price: 1950000,
      salePrice: 1790000,
      costPrice: 1350000,
      isFeatured: false,
      ratingAvg: 4.7,
      reviewCount: 22,
      shortDescription: '1250 Calories và 50g Protein chất lượng cao giúp người gầy bứt phá cân nặng.',
      description: 'Serious Mass là giải pháp tối ưu cho người khó tăng cân (hardgainer). Chứa hỗn hợp carbohydrate phức hợp, protein đa nguồn, 25 loại vitamin và khoáng chất, cộng thêm Creatine và Glutamine.',
      nutritionFacts: JSON.stringify({
        servingSize: '334g (2 muỗng)',
        servingsPerContainer: 16,
        calories: 1250,
        protein: '50g',
        carbs: '252g',
        fat: '4.5g',
        creatine: '3g',
        glutamine: '500mg',
      }),
      usageGuide: 'Dùng 2 muỗng chia làm 2-3 lần uống trong ngày: giữa các bữa ăn chính và ngay sau buổi tập.',
      allergens: 'Chứa Sữa, Trứng, Đậu nành, Lúa mì.',
      warnings: 'Sản phẩm giàu năng lượng, kết hợp chế độ ăn uống và tập luyện để tăng cân săn chắc.',
      manufacturer: 'Glanbia Performance Nutrition (USA)',
      originCountry: 'USA',
      images: [
        'https://images.unsplash.com/photo-1546483875-ad9014c88eba?auto=format&fit=crop&w=800&q=80',
      ],
      variants: [
        { title: '12 lbs (5.44kg) - Chocolate', weight: '12 lbs (5.44kg)', flavor: 'Sô cô la', price: 1950000, salePrice: 1790000, costPrice: 1350000, sku: 'ON-SM-12LBS-CHOCO', inStock: 20 },
      ],
    },
    {
      name: 'Vitacore Ultra Pure Omega-3 Fish Oil 1000mg',
      slug: 'vitacore-ultra-pure-omega-3',
      sku: 'VITA-OMEGA3-01',
      brandSlug: 'optimum-nutrition',
      catSlug: 'omega-3',
      goal: 'General Nutrition',
      price: 490000,
      salePrice: 420000,
      costPrice: 240000,
      isFeatured: false,
      ratingAvg: 5.0,
      reviewCount: 15,
      shortDescription: 'Hàm lượng cao EPA 500mg & DHA 250mg từ cá biển sâu Na Uy giúp bảo vệ tim và khớp.',
      description: 'Viên nang dầu cá tinh khiết qua quy trình chưng cất phân tử loại bỏ hoàn toàn kim loại nặng chì và thủy ngân. Hỗ trợ bôi trơn khớp xương cho gymer tập tạ nặng và tăng cường sức khỏe tim mạch.',
      nutritionFacts: JSON.stringify({
        servingSize: '2 viên nang mềm',
        servingsPerContainer: 90,
        totalOmega3: '1000mg',
        epa: '500mg',
        dha: '250mg',
        vitaminE: '10 IU',
      }),
      usageGuide: 'Uống 1-2 viên mỗi ngày sau bữa ăn có chất béo để hấp thu tối ưu.',
      allergens: 'Chứa Cá biển (Cá hồi, Cá cơm).',
      warnings: 'Tham khảo bác sĩ nếu đang dùng thuốc chống đông máu.',
      manufacturer: 'Vitacore Labs LLC',
      originCountry: 'USA',
      images: [
        'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=800&q=80',
      ],
      variants: [
        { title: '180 viên mềm', weight: '180 viên', flavor: 'Không tanh (Enteric Coated)', price: 490000, salePrice: 420000, costPrice: 240000, sku: 'VITA-OMEGA3-180C', inStock: 80 },
      ],
    },
  ];

  for (const prod of products) {
    const createdProduct = await prisma.product.upsert({
      where: { slug: prod.slug },
      update: {},
      create: {
        name: prod.name,
        slug: prod.slug,
        sku: prod.sku,
        brandId: brandMap[prod.brandSlug],
        categoryId: catMap[prod.catSlug],
        goal: prod.goal,
        price: prod.price,
        salePrice: prod.salePrice,
        costPrice: prod.costPrice,
        isFeatured: prod.isFeatured,
        ratingAvg: prod.ratingAvg,
        reviewCount: prod.reviewCount,
        shortDescription: prod.shortDescription,
        description: prod.description,
        nutritionFacts: prod.nutritionFacts,
        usageGuide: prod.usageGuide,
        allergens: prod.allergens,
        warnings: prod.warnings,
        manufacturer: prod.manufacturer,
        originCountry: prod.originCountry,
        images: {
          create: prod.images.map((url, idx) => ({
            url,
            isThumbnail: idx === 0,
            displayOrder: idx,
            alt: prod.name,
          })),
        },
      },
    });

    // Create variants and inventory lots
    for (const v of prod.variants) {
      const variant = await prisma.productVariant.upsert({
        where: { sku: v.sku },
        update: {},
        create: {
          productId: createdProduct.id,
          sku: v.sku,
          title: v.title,
          weight: v.weight,
          flavor: v.flavor,
          price: v.price,
          salePrice: v.salePrice,
          costPrice: v.costPrice,
          inStock: v.inStock,
        },
      });

      // Create Inventory Record
      await prisma.inventory.upsert({
        where: {
          productId_variantId_warehouseLocation: {
            productId: createdProduct.id,
            variantId: variant.id,
            warehouseLocation: 'Main Warehouse HN',
          },
        },
        update: {
          quantityOnHand: v.inStock,
          quantityAvailable: v.inStock,
        },
        create: {
          productId: createdProduct.id,
          variantId: variant.id,
          warehouseLocation: 'Main Warehouse HN',
          quantityOnHand: v.inStock,
          quantityReserved: 0,
          quantityAvailable: v.inStock,
          minStockAlert: 5,
        },
      });

      // Create Inventory Lot with Expiry in 2026 / 2027
      const lotNumber = `LOT-${new Date().getFullYear()}-${v.sku.slice(0, 8)}`;
      await prisma.inventoryLot.create({
        data: {
          productId: createdProduct.id,
          variantId: variant.id,
          lotNumber,
          manufacturingDate: new Date('2024-06-01'),
          expiryDate: new Date('2026-12-31'),
          quantityInitial: v.inStock + 20,
          quantityRemaining: v.inStock,
          status: 'ACTIVE',
        },
      });

      // Record Initial Inward Movement
      await prisma.inventoryMovement.create({
        data: {
          productId: createdProduct.id,
          variantId: variant.id,
          movementType: 'IMPORT',
          quantity: v.inStock,
          referenceType: 'PO',
          referenceId: 'PO-INITIAL-IMPORT-2024',
          note: 'Initial lot import from USA supplier',
          performedBy: 'ADMIN',
        },
      });
    }

    // Add sample reviews
    await prisma.productReview.create({
      data: {
        productId: createdProduct.id,
        userId: customerUser.id,
        rating: 5,
        title: 'Chất lượng xuất sắc, vị dễ uống!',
        comment: 'Sản phẩm chính hãng có tem cào chống giả đầy đủ. Pha với nước đá lạnh tan rất nhanh không hề vón cục. Sẽ ủng hộ shop dài lâu!',
        verifiedPurchase: true,
        status: 'APPROVED',
      },
    });
  }

  // 8. Coupons
  console.log('8. Seeding Coupons...');
  await prisma.coupon.upsert({
    where: { code: 'VITACORE10' },
    update: {},
    create: {
      code: 'VITACORE10',
      description: 'Giảm 10% tối đa 150.000đ cho đơn hàng từ 1.000.000đ',
      discountType: 'PERCENTAGE',
      discountValue: 10,
      minOrderValue: 1000000,
      maxDiscountValue: 150000,
      usageLimit: 500,
      usageCount: 12,
      isActive: true,
      startDate: new Date('2024-01-01'),
      endDate: new Date('2027-12-31'),
    },
  });

  await prisma.coupon.upsert({
    where: { code: 'SUPP50K' },
    update: {},
    create: {
      code: 'SUPP50K',
      description: 'Giảm trực tiếp 50.000đ cho đơn hàng từ 500.000đ',
      discountType: 'FIXED_AMOUNT',
      discountValue: 50000,
      minOrderValue: 500000,
      usageLimit: 300,
      usageCount: 8,
      isActive: true,
      startDate: new Date('2024-01-01'),
      endDate: new Date('2027-12-31'),
    },
  });

  // 9. Sample Orders
  console.log('9. Seeding Orders & Order History...');
  const firstProduct = await prisma.product.findFirst({
    where: { slug: 'on-gold-standard-100-whey' },
    include: { variants: true },
  });

  if (firstProduct && firstProduct.variants.length > 0) {
    const v = firstProduct.variants[0];
    const orderNumber = 'VC-ORD-202410-001';

    const sampleOrder = await prisma.order.upsert({
      where: { orderNumber },
      update: {},
      create: {
        orderNumber,
        userId: customerUser.id,
        customerName: 'Nguyễn Văn Khách Hàng',
        customerEmail: 'customer@vitacore.vn',
        customerPhone: '0909123456',
        shippingAddress: 'Số 45 Nam Kỳ Khởi Nghĩa, Phường Võ Thị Sáu, Quận 3, Hồ Chí Minh',
        province: 'Hồ Chí Minh',
        subtotal: v.salePrice || v.price,
        discountAmount: 50000,
        shippingFee: 0,
        taxAmount: 0,
        totalAmount: (v.salePrice || v.price) - 50000,
        paymentMethod: 'COD',
        paymentStatus: 'PAID',
        orderStatus: 'DELIVERED',
        couponCode: 'SUPP50K',
        internalNotes: 'Khách hàng thân thiết, giao hàng giờ hành chính',
        trackingNumber: 'VITA-SHIP-889922',
        items: {
          create: [
            {
              productId: firstProduct.id,
              variantId: v.id,
              productName: firstProduct.name,
              productSku: v.sku,
              variantTitle: v.title,
              price: v.salePrice || v.price,
              costPrice: v.costPrice,
              quantity: 1,
              total: v.salePrice || v.price,
            },
          ],
        },
      },
    });

    await prisma.orderStatusHistory.create({
      data: {
        orderId: sampleOrder.id,
        previousStatus: 'PENDING',
        newStatus: 'CONFIRMED',
        note: 'Staff xác nhận đơn qua điện thoại',
        changedBy: 'STAFF',
      },
    });

    await prisma.orderStatusHistory.create({
      data: {
        orderId: sampleOrder.id,
        previousStatus: 'CONFIRMED',
        newStatus: 'SHIPPING',
        note: 'Đã bàn giao đơn vị vận chuyển GHTK',
        changedBy: 'STAFF',
      },
    });

    await prisma.orderStatusHistory.create({
      data: {
        orderId: sampleOrder.id,
        previousStatus: 'SHIPPING',
        newStatus: 'DELIVERED',
        note: 'Giao hàng thành công, thu COD tiền mặt',
        changedBy: 'SYSTEM',
      },
    });

    // Shipment record
    await prisma.shipment.create({
      data: {
        orderId: sampleOrder.id,
        carrier: 'Giao Hàng Tiết Kiệm (GHTK)',
        trackingCode: 'GHTK-VC-889901',
        status: 'DELIVERED',
        shippingFee: 30000,
        deliveredAt: new Date(),
      },
    });
  }

  // 10. Articles / Nutrition Blog
  console.log('10. Seeding Nutrition & Fitness Articles...');
  const articles = [
    {
      title: 'Thời Điểm Vàng Bổ Sung Whey Protein Để Tối Ưu Hóa Tăng Cơ',
      slug: 'thoi-diem-vang-bo-sung-whey-protein',
      excerpt: 'Khám phá sự thật về cửa sổ đồng hóa (anabolic window) và chiến lược nạp protein khoa học giúp phát triển cơ bắp bền vững.',
      category: 'Nutrition',
      coverImage: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=800&q=80',
      content: `Khi nói đến việc tối ưu hóa khối lượng cơ bắp, lượng protein tổng nạp trong ngày đóng vai trò then chốt nhất (từ 1.6g đến 2.2g trên mỗi kg trọng lượng cơ thể).

Tuy nhiên, việc phân bổ thời gian nạp protein hợp lý sẽ thúc đẩy quá trình tổng hợp protein cơ bắp (MPS - Muscle Protein Synthesis) diễn ra liên tục:
1. Buổi sáng ngay sau khi thức dậy: Sau một đêm dài nhịn ăn, cơ thể cần nguồn amino acid tinh khiết để ngăn ngừa quá trình dị hóa.
2. Ngay sau buổi tập luyện (trong vòng 30-45 phút): Đây là thời điểm các sợi cơ đang bị tổn thương cơ học và sẵn sàng hấp thu amino acid nhanh nhất.
3. Trước khi đi ngủ: Bổ sung protein hấp thu chậm (như Micellar Casein) giúp duy trì dòng chảy amino acid suốt giấc ngủ.`,
    },
    {
      title: 'Creatine Monohydrate: Hướng Dẫn Sử Dụng Chi Tiết Từ A Đến Z',
      slug: 'creatine-monohydrate-huong-dan-toan-dien',
      excerpt: 'Creatine là thực phẩm bổ sung được nghiên cứu khoa học nhiều nhất. Hãy tìm hiểu cách nạp, liều dùng và giải đáp các hiểu lầm phổ biến.',
      category: 'Workout',
      coverImage: 'https://images.unsplash.com/photo-1546483875-ad9014c88eba?auto=format&fit=crop&w=800&q=80',
      content: `Creatine hoạt động bằng cách tăng nồng độ phosphocreatine trong tế bào cơ bắp, hỗ trợ tái tạo ATP - đơn vị năng lượng cho các động tác bùng nổ như cử tạ nặng hoặc chạy nước rút.

Có 2 phương pháp sử dụng phổ biến:
- Giai đoạn nạp nhanh (Loading phase): Dùng 20g/ngày (chia làm 4 lần, mỗi lần 5g) trong 5-7 ngày để bão hòa tế bào cơ nhanh nhất, sau đó duy trì 3-5g/ngày.
- Phương pháp nạp đều (Consistent dose): Uống đều đặn 5g mỗi ngày, nồng độ creatine trong cơ sẽ bão hòa sau khoảng 3-4 tuần mà không gây bất kỳ gánh nặng dạ dày nào.

Lưu ý: Luôn uống đủ 2.5 - 3 lít nước mỗi ngày để tối ưu khả năng giữ nước nội bào của creatine.`,
    },
  ];

  for (const art of articles) {
    await prisma.article.upsert({
      where: { slug: art.slug },
      update: {},
      create: art,
    });
  }

  // 11. Banners
  console.log('11. Seeding Banners...');
  await prisma.banner.create({
    data: {
      title: 'ĐẲNG CẤP DINH DƯỠNG THỂ HÌNH CAO CẤP',
      subtitle: 'Cam kết 100% nhập khẩu chính hãng từ Hoa Kỳ & Châu Âu. Miễn phí vận chuyển toàn quốc cho đơn từ 1.000.000đ.',
      imageUrl: 'https://images.unsplash.com/photo-1579722821273-0f6c7d44362f?auto=format&fit=crop&w=1600&q=85',
      linkUrl: '/products',
      position: 'HERO',
      displayOrder: 1,
      isActive: true,
    },
  });

  // 12. Support Ticket
  console.log('12. Seeding Support Ticket...');
  await prisma.supportTicket.upsert({
    where: { ticketNumber: 'TK-202410-001' },
    update: {},
    create: {
      ticketNumber: 'TK-202410-001',
      userId: customerUser.id,
      name: 'Nguyễn Văn Khách Hàng',
      email: 'customer@vitacore.vn',
      phone: '0909123456',
      subject: 'Tư vấn lựa chọn Whey Isolate cho người dị ứng sữa',
      message: 'Chào shop, mình hay bị đầy bụng khi uống sữa đặc có đường. Mình nên chọn dòng ISO100 hay Gold Standard thì tốt hơn?',
      priority: 'MEDIUM',
      status: 'RESOLVED',
      staffReply: 'Chào bạn! Trường hợp của bạn là bất dung nạp Lactose nhẹ. Dòng Dymatize ISO100 Hydrolyzed đã được lọc bỏ hoàn toàn đường lactose nên bạn hoàn toàn yên tâm sử dụng êm bụng không lo đầy hơi nhé!',
      assignedTo: staffUser.fullName,
    },
  });

  // 13. Audit Log
  console.log('13. Seeding Audit Logs...');
  await prisma.auditLog.create({
    data: {
      userId: adminUser.id,
      userEmail: adminUser.email,
      userRole: 'ADMIN',
      action: 'INITIALIZE',
      entity: 'SYSTEM',
      entityId: 'SYSTEM-SETUP',
      details: 'System initialized with luxury supplement catalog, RBAC rules and store settings',
      ipAddress: '127.0.0.1',
    },
  });

  console.log('--- SEEDING COMPLETED SUCCESSFULLY! ---');
  console.log('Default credentials:');
  console.log('ADMIN: admin@vitacore.vn | Pass: Vitacore@2026');
  console.log('STAFF: staff@vitacore.vn | Pass: Vitacore@2026');
  console.log('USER:  customer@vitacore.vn | Pass: Vitacore@2026');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

