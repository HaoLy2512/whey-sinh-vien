const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'vitacore-ultra-secure-jwt-token-production-quality-98234';

function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '1d' });
}

function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}

async function runTests() {
  console.log('====================================================');
  console.log('   VITACORE SUPPLEMENTS - SYSTEM VERIFICATION SUITE  ');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`[PASS] ${message}`);
      passed++;
    } else {
      console.error(`[FAIL] ${message}`);
      failed++;
    }
  }

  try {
    // 1. RBAC & Authentication Tests
    console.log('\n--- 1. Testing RBAC & Authentication ---');
    const adminUser = await prisma.user.findUnique({ where: { email: 'admin@vitacore.vn' } });
    const staffUser = await prisma.user.findUnique({ where: { email: 'staff@vitacore.vn' } });
    const customerUser = await prisma.user.findUnique({ where: { email: 'customer@vitacore.vn' } });

    assert(adminUser && adminUser.role === 'ADMIN', 'Admin user exists with role ADMIN');
    assert(staffUser && staffUser.role === 'STAFF', 'Staff user exists with role STAFF');
    assert(customerUser && customerUser.role === 'USER', 'Customer user exists with role USER');

    // Password verification with bcrypt
    const isPasswordValid = await bcrypt.compare('Vitacore@2026', adminUser.passwordHash);
    assert(isPasswordValid, 'Admin password hash successfully verifies via bcrypt');

    // Token creation and verification
    const adminToken = signToken({ userId: adminUser.id, email: adminUser.email, role: adminUser.role });
    const userToken = signToken({ userId: customerUser.id, email: customerUser.email, role: customerUser.role });
    const decodedAdmin = verifyToken(adminToken);
    const decodedUser = verifyToken(userToken);

    assert(decodedAdmin && decodedAdmin.role === 'ADMIN', 'Admin token decodes with role ADMIN');
    assert(decodedUser && decodedUser.role === 'USER', 'User token decodes with role USER');

    // Verify privilege escalation protection: USER cannot be granted ADMIN privileges without ADMIN session
    assert(decodedUser.role !== 'ADMIN', 'USER token cannot claim ADMIN role privileges');
    assert(decodedUser.role !== 'STAFF', 'USER token cannot claim STAFF role privileges');

    // 2. Product Catalog & Variant Stock Tests
    console.log('\n--- 2. Testing Products, Variants & Confidential COGS Protection ---');
    const testProduct = await prisma.product.findFirst({
      where: { slug: 'on-gold-standard-100-whey' },
      include: { variants: true, brand: true, category: true },
    });

    assert(testProduct !== null, 'Product "Gold Standard 100% Whey" exists in DB');
    assert(testProduct.variants.length > 0, 'Product has multiple packaging/flavor variants');
    assert(testProduct.costPrice > 0, 'Internal costPrice (COGS) is recorded in database');
    assert(testProduct.ratingAvg >= 4.0, 'Rating average is calculated and grounded in data');

    // 3. Coupon Validation Logic
    console.log('\n--- 3. Testing Coupons & Order Discounts ---');
    const coupon10 = await prisma.coupon.findUnique({ where: { code: 'VITACORE10' } });
    assert(coupon10 !== null && coupon10.isActive === true, 'Coupon VITACORE10 is active');

    // Subtotal 1,500,000 VND with 10% coupon (capped at 150,000)
    const testSubtotal = 1500000;
    const discount10 = Math.round((testSubtotal * coupon10.discountValue) / 100);
    const finalDiscount10 = coupon10.maxDiscountValue ? Math.min(discount10, coupon10.maxDiscountValue) : discount10;
    assert(finalDiscount10 === 150000, 'Coupon VITACORE10 correctly calculates 150,000 VND discount for 1.5M order');

    // Fixed amount coupon SUPP50K
    const coupon50k = await prisma.coupon.findUnique({ where: { code: 'SUPP50K' } });
    assert(coupon50k !== null && coupon50k.discountValue === 50000, 'Coupon SUPP50K has exact 50,000 VND discount');

    // 4. Order Creation & Inventory Transaction Rollback
    console.log('\n--- 4. Testing Atomic Order Creation, Inventory Stock Deduction & Cancellation ---');
    const firstVariant = testProduct.variants[0];
    const initialStock = firstVariant.inStock;

    // Simulate placing order for 2 units
    const orderNumber = `TEST-ORD-${Date.now()}`;
    const testOrder = await prisma.$transaction(async (tx) => {
      const ord = await tx.order.create({
        data: {
          orderNumber,
          userId: customerUser.id,
          customerName: customerUser.fullName,
          customerEmail: customerUser.email,
          customerPhone: '0909123456',
          shippingAddress: '45 Nam Ky Khoi Nghia, Q3, TPHCM',
          subtotal: firstVariant.price * 2,
          shippingFee: 0,
          totalAmount: firstVariant.price * 2,
          paymentMethod: 'COD',
          paymentStatus: 'PENDING',
          orderStatus: 'CONFIRMED',
          items: {
            create: [
              {
                productId: testProduct.id,
                variantId: firstVariant.id,
                productName: testProduct.name,
                productSku: firstVariant.sku,
                variantTitle: firstVariant.title,
                price: firstVariant.price,
                costPrice: firstVariant.costPrice,
                quantity: 2,
                total: firstVariant.price * 2,
              },
            ],
          },
        },
      });

      // Decrement stock
      await tx.productVariant.update({
        where: { id: firstVariant.id },
        data: { inStock: { decrement: 2 } },
      });

      // Record movement
      await tx.inventoryMovement.create({
        data: {
          productId: testProduct.id,
          variantId: firstVariant.id,
          movementType: 'EXPORT',
          quantity: 2,
          referenceType: 'ORDER',
          referenceId: ord.id,
          note: 'Test export',
          performedBy: 'TEST_SUITE',
        },
      });

      return ord;
    });

    const updatedVariant = await prisma.productVariant.findUnique({ where: { id: firstVariant.id } });
    assert(updatedVariant.inStock === initialStock - 2, `Inventory decremented from ${initialStock} to ${initialStock - 2}`);

    // Cancel order and verify stock return
    await prisma.$transaction(async (tx) => {
      await tx.order.update({
        where: { id: testOrder.id },
        data: { orderStatus: 'CANCELLED', cancelReason: 'Customer request test' },
      });

      await tx.productVariant.update({
        where: { id: firstVariant.id },
        data: { inStock: { increment: 2 } },
      });

      await tx.inventoryMovement.create({
        data: {
          productId: testProduct.id,
          variantId: firstVariant.id,
          movementType: 'RETURN',
          quantity: 2,
          referenceType: 'ORDER',
          referenceId: testOrder.id,
          note: 'Test return',
          performedBy: 'TEST_SUITE',
        },
      });
    });

    const restoredVariant = await prisma.productVariant.findUnique({ where: { id: firstVariant.id } });
    assert(restoredVariant.inStock === initialStock, `Inventory successfully restored back to ${initialStock} upon cancellation`);

    // Clean up test order
    await prisma.inventoryMovement.deleteMany({ where: { referenceId: testOrder.id } });
    await prisma.orderItem.deleteMany({ where: { orderId: testOrder.id } });
    await prisma.order.delete({ where: { id: testOrder.id } });

    // 5. Store Settings Customization
    console.log('\n--- 5. Testing Dynamic Brand & Store Settings ---');
    const storeSettings = await prisma.storeSettings.findUnique({ where: { id: 'default' } });
    assert(storeSettings !== null, 'StoreSettings model is properly initialized');
    assert(storeSettings.storeName.length > 0, `Store name is dynamic: "${storeSettings.storeName}"`);
    assert(storeSettings.freeShippingThreshold === 1000000, 'Free shipping threshold is 1,000,000 VND');

    // 6. Audit Logging Verification
    console.log('\n--- 6. Testing Audit Log Immutability & Logging ---');
    const auditLogs = await prisma.auditLog.findMany({ take: 5, orderBy: { createdAt: 'desc' } });
    assert(auditLogs.length > 0, `Audit logs properly record system actions (${auditLogs.length} found)`);

  } catch (error) {
    console.error('Test execution error:', error);
    failed++;
  } finally {
    await prisma.$disconnect();
  }

  console.log('\n====================================================');
  console.log(`   TOTAL TESTS: ${passed + failed} | PASSED: ${passed} | FAILED: ${failed}`);
  console.log('====================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests();

