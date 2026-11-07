const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  const keyword = process.argv[2];
  if (!keyword) throw new Error('Cách dùng: node scripts/set-hero.js "tên sản phẩm"');

  const product = await prisma.product.findFirst({
    where: { name: { contains: keyword, mode: "insensitive" } },
  });
  if (!product) throw new Error("Không tìm thấy sản phẩm");

  await prisma.product.updateMany({ data: { isHero: false } });
  await prisma.product.update({
    where: { id: product.id },
    data: { isHero: true, isActive: true, deletedAt: null, pinnedAt: new Date() },
  });
  console.log("Đã đặt Hero:", product.name);
}

main()
  .catch((e) => { console.error(e.message); process.exit(1); })
  .finally(() => prisma.$disconnect());