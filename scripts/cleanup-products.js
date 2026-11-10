/**
 * Dọn sản phẩm rác / sản phẩm test (tên vô nghĩa hoặc giá < 10.000đ).
 *
 *   node scripts/cleanup-products.js            -> chỉ liệt kê (dry-run)
 *   node scripts/cleanup-products.js --apply    -> xóa thật
 *
 * Sản phẩm chưa từng có đơn hàng sẽ bị xóa hẳn. Sản phẩm đã có đơn hàng
 * được ẩn (isActive=false + deletedAt) để không làm hỏng lịch sử đơn.
 * Seed cũng gọi hàm này nên chạy seed lại vẫn sạch.
 */
const MIN_PRICE = 10000;

function stripDiacritics(str) {
  return String(str)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .trim();
}

// Tên vô nghĩa: quá ngắn, một từ đơn ngắn (vd "đâsdsad"), hoặc chứa chuỗi gõ bừa trên bàn phím.
function isGibberishName(name) {
  const n = stripDiacritics(name || '');
  if (n.length < 4) return true;
  if (!/\s/.test(n) && n.length <= 12) return true;
  if (/(asd|sdf|dsa|qwe|wer|zxc|xcv|fgh|ghj|jkl|dfg)/.test(n.replace(/\s/g, ''))) return true;
  if (/(.)\1{3,}/.test(n)) return true;
  return false;
}

function isJunk(p) {
  const prices = [p.price, p.salePrice].filter((x) => x !== null && x !== undefined);
  return isGibberishName(p.name) || prices.some((x) => x < MIN_PRICE);
}

async function cleanupProducts(prisma, { apply = false, log = console.log } = {}) {
  const all = await prisma.product.findMany({
    where: { deletedAt: null },
    select: { id: true, name: true, slug: true, price: true, salePrice: true },
  });
  const junk = all.filter(isJunk);

  if (junk.length === 0) {
    log('Không có sản phẩm rác.');
    return junk;
  }

  for (const p of junk) {
    log(`${apply ? 'Xóa' : 'Sẽ xóa'}: "${p.name}" (${p.slug}) - giá ${p.price}đ${p.salePrice != null ? `, KM ${p.salePrice}đ` : ''}`);
    if (!apply) continue;

    const orderCount = await prisma.orderItem.count({ where: { productId: p.id } });
    if (orderCount === 0) {
      try {
        await prisma.product.delete({ where: { id: p.id } });
        continue;
      } catch (e) {
        log(`  Không xóa hẳn được (${e.code || e.message}), chuyển sang ẩn.`);
      }
    }
    await prisma.product.update({
      where: { id: p.id },
      data: { isActive: false, isFeatured: false, isHero: false, deletedAt: new Date() },
    });
  }
  return junk;
}

module.exports = { cleanupProducts, isGibberishName, isJunk, MIN_PRICE };

if (require.main === module) {
  const { PrismaClient } = require('@prisma/client');
  const prisma = new PrismaClient();
  const apply = process.argv.includes('--apply');
  cleanupProducts(prisma, { apply })
    .then((j) => {
      if (j.length && !apply) console.log('\nDry-run. Thêm --apply để xóa thật.');
    })
    .catch((e) => {
      console.error(e);
      process.exitCode = 1;
    })
    .finally(() => prisma.$disconnect());
}
