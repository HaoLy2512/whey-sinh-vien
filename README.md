# VITACORE SUPPLEMENTS — Premium B2C Supplement E-Commerce Platform

A production-grade, full-stack B2C e-commerce platform built for high-performance sports nutrition and dietary supplements. Crafted with a **Luxury Sports Nutrition + Premium E-commerce + Futuristic 3D** aesthetic.

---

## 1. Project Overview & Brand Identity

- **Brand Name:** VITACORE SUPPLEMENTS (*Configurable from Admin Portal*)
- **Tagline:** Premium Sports Nutrition & Elite Performance
- **Primary Color Palette:**
  - **Deep Charcoal (`#101318`):** Luxury dark background
  - **Metallic Gold (`#C8A96A`):** High-end accents & CTA highlights
  - **Ivory White (`#F6F3ED`):** Clean, high-legibility typography & product cards
  - **Emerald Green (`#174C3C`):** Health, vitality, and verified organic nutrition badges
  - **Slate Gray (`#68717D`):** Subdued borders and secondary metadata

---

## 2. Tech Stack & Architecture

- **Frontend:** Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS, Lucide Icons, Canvas Confetti.
- **Backend & API:** Next.js Serverless Route Handlers (`src/app/api/...`), TypeScript, REST architecture.
- **Database & ORM:** Prisma ORM 5.22.
  - **Development Mode:** Zero-setup SQLite (`file:./dev.db`).
  - **Production Mode:** PostgreSQL (`prisma/schema.postgresql.prisma`) with full schema parity and snake_case mapping.
- **Authentication & Security:**
  - Stateless JSON Web Tokens (JWT) stored in `HttpOnly`, `SameSite=Lax`, `Secure` cookies.
  - Password hashing with `bcryptjs` (salt rounds: 10).
  - Strict 3-Tier Role-Based Access Control (`ADMIN`, `STAFF`, `USER`).
  - Strict Cost-of-Goods-Sold (COGS / `costPrice`) redaction on public and client APIs.
  - Immutable Audit Logging for sensitive mutations.
- **Payment Gateways:**
  - **VietQR:** Automatic dynamic QR code generator with banking credentials managed in Admin Settings.
  - **MoMo Sandbox:** HMAC-SHA256 signature generation and IPN/return callback handling.
  - **VNPay Sandbox:** Secure SHA512 hashing and IPN/return callback handling.
  - **COD (Cash On Delivery):** With address verification and stock reservation.

---

## 3. Quick Start & Setup

### Prerequisites
- Node.js `v18.x` or `v20.x` or `v24.x`
- npm `v9+` or `v10+`

### Installation
```bash
# Clone or navigate into the project directory
cd WheySinhVien

# Install all dependencies
npm install

# Initialize database schema (SQLite dev.db)
npx prisma db push

# Seed sample data (categories, brands, products, lots, orders, coupons, accounts)
node prisma/seed.js

# Run the comprehensive 21-point automated verification suite
node scripts/test-system.js

# Start development server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to view the storefront.

---

## 4. Default Seeded Credentials

| Role | Email | Password | Access Area |
| :--- | :--- | :--- | :--- |
| **ADMIN** | `admin@vitacore.vn` | `Vitacore@2026` | Admin Portal (`/admin/dashboard`), Full System Control |
| **STAFF** | `staff@vitacore.vn` | `Vitacore@2026` | Staff Portal (`/staff/dashboard`), Order Processing, Inventory |
| **USER** | `customer@vitacore.vn` | `Vitacore@2026` | Storefront, Wishlist, Cart, Checkout, Order Tracking |

*Tip: You can use the Quick Fill buttons on the [Login Page](/auth/login) to log into any role with a single click.*

---

## 5. Role-Based Access Control (RBAC) Matrix

| Feature / Resource | USER (Customer) | STAFF (Operations) | ADMIN (Executive) |
| :--- | :---: | :---: | :---: |
| Browse Catalog, Search, Filter | :white_check_mark: | :white_check_mark: | :white_check_mark: |
| Cart, Wishlist, Checkout | :white_check_mark: | :white_check_mark: | :white_check_mark: |
| Order History & Cancel Unpaid Orders | :white_check_mark: (Own) | :white_check_mark: (All) | :white_check_mark: (All) |
| View COGS / Cost Price | :x: *(Redacted)* | :x: *(Redacted)* | :white_check_mark: |
| Staff Dashboard & Packing Slips | :x: | :white_check_mark: | :white_check_mark: |
| Order Status Updates & Internal Notes | :x: | :white_check_mark: | :white_check_mark: |
| Inventory Adjustment with Reason Logging | :x: | :white_check_mark: | :white_check_mark: |
| Batch Lot & Expiry Date Management | :x: | :white_check_mark: | :white_check_mark: |
| Customer Support Tickets | :white_check_mark: (Own) | :white_check_mark: (Respond) | :white_check_mark: (Full) |
| Product & Category CRUD | :x: | :x: | :white_check_mark: |
| Staff Account Creation & Permissions | :x: | :x: | :white_check_mark: |
| Financial KPIs & Profit Margins | :x: | :x: | :white_check_mark: |
| Store Settings (Name, Colors, Banking) | :x: | :x: | :white_check_mark: |
| System Audit Trail Inspection | :x: | :x: | :white_check_mark: |

---

## 6. Storefront Features

### 13 Curated Homepage Sections
1. **Sticky Header:** Category mega-navigation, live search, currency formatter, wishlist counter, cart slide-over.
2. **Hero Banner:** 3D interactive floating supplement visual, luxury gold accents, "Shop Now" and "Explore Collection" CTAs.
3. **Featured Categories:** Whey Protein, Creatine & Strength, Pre-Workout Energy, Essential Vitamins & Minerals.
4. **Best Sellers Grid:** Real-time stock status, star ratings, variant picker, Quick Add to Cart.
5. **New Arrivals:** Latest supplements with lab-tested purity tags.
6. **Goal-Based Collections:** Filter by Muscle Building, Recovery, Performance, Fat Loss.
7. **Featured Brands Marquee:** Optimum Nutrition, Dymatize, Mutant, Rule 1, MyProtein.
8. **Promotions & Value Combos:** Dynamic banner for active coupons (`VITACORE10`, `SUPP50K`).
9. **Why Choose Us:** 100% Authentic Guarantee, Express 2H Delivery, Expert Nutrition Consultation, Easy Returns.
10. **Verified Customer Reviews:** Grounded in actual database purchase reviews.
11. **Nutrition & Training Knowledge Hub:** Scientific blog articles on protein timing, creatine loading, and intra-workout hydration.
12. **VIP Newsletter Subscription:** Instant 50,000 VND discount code signup with email validation.
13. **Comprehensive Footer:** Company registration info, payment gateway badges, contact hotline, operating hours, social channels.

### Catalog, Search & Product Detail
- **Dynamic Multi-faceted Filtering:** Price range slider, brand checkboxes, category selection, in-stock only toggle, goal tags.
- **Sorting Options:** Price low-to-high, price high-to-low, newest arrivals, top rated.
- **Product Detail (`/products/[slug]`):**
  - High-resolution image gallery.
  - Interactive variant selector (Size / Weight / Flavor).
  - Dynamic stock check and real-time pricing recalculation.
  - Lab Nutrition Facts panel (Protein per serving, BCAAs, Calories, Servings per container).
  - Verified reviews with star breakdown and customer purchase tags.

### Shopping Cart & Checkout
- **Cart (`/cart`):**
  - Real-time quantity adjustments and item removal.
  - **Dynamic Free Shipping Progress Bar:** Threshold set to 1,000,000 VND (e.g. "Add 250,000 VND more for FREE shipping!").
  - **Coupon Engine:** Validates minimum order amounts, expiration dates, and usage limits.
- **Checkout (`/checkout`):**
  - Server-side price recalculation (prevents client-side price tampering).
  - Shipping address form with province/city, district, and phone number validation.
  - Payment Method Selection:
    1. **VietQR:** Displays bank logo, account number, beneficiary name, transfer content code, and QR image.
    2. **Cash On Delivery (COD):** Zero upfront payment, instant reservation.
    3. **MoMo E-Wallet Sandbox:** Redirects to sandbox gateway with HMAC signature.
    4. **VNPay Sandbox:** Direct payment redirect with secure SHA512 check.
  - Order confirmation screen (`/orders/[id]`) with live tracking timeline:
    `Pending -> Confirmed -> Processing -> Shipping -> Completed`.

---

## 7. Staff Operations Portal (`/staff/...`)

- **Dashboard (`/staff/dashboard`):** Real-time operational metric cards (Orders to Process, In Transit, Inventory Alerts, Open Tickets).
- **Order Management (`/staff/orders`):**
  - Filter by Order Status (`PENDING`, `CONFIRMED`, `PROCESSING`, `SHIPPED`, `DELIVERED`, `CANCELLED`).
  - One-click status progression (`Confirm Order`, `Handover to Courier`, `Mark Delivered`).
  - Internal fulfillment notes.
  - **Printable Packing Slip (`/staff/orders/[id]/packing-slip`):** Formatted for A4/A5 receipt printers with barcode, shipping details, itemized variant SKUs, and inspector signature block.
- **Inventory & Lot Expiry Tracking (`/staff/inventory`):**
  - Low-stock indicator badges (`< 10 units`).
  - **Batch Lot Management:** Displays batch numbers (`LOT-2026-X`), manufacture dates, and expiration alerts (`< 90 days warning`).
  - Stock Adjustment modal requiring mandatory audit reason (`RESTOCK`, `DAMAGED`, `AUDIT`, `RETURN`).
- **Customer Support (`/staff/support`):** Ticket response panel to address user inquiries.
- **Reports Export (`/staff/reports`):** UTF-8 BOM CSV export for orders and warehouse inventory.

---

## 8. Admin Control Center (`/admin/...`)

- **Executive KPI Dashboard (`/admin/dashboard`):**
  - Total Revenue, Paid Orders, Customer Count, Average Order Value (AOV).
  - Estimated Gross Margin and Net Profit calculations.
  - Recent order stream and top selling products.
- **Products Catalog Management (`/admin/products` & `/admin/products/new`):**
  - Full CRUD with variant builder (Flavor, Weight, SKU, Price, Sale Price, COGS Cost Price).
  - Nutrition facts specifications.
- **Category & Brand Management (`/admin/categories`, `/admin/brands`):** Create, edit, and organize taxonomy.
- **Customer Directory (`/admin/customers`):** View customer order histories, total lifetime spend, and address records.
- **Staff Access Control (`/admin/staff`):** Provision staff members, assign active roles, or revoke access.
- **Promotions & Coupons (`/admin/promotions`):** Configure discount percentages, fixed discounts, usage caps, and expiration dates.
- **Store Settings (`/admin/settings`):**
  - Change Store Name, Hotline, Support Email, and Physical Address.
  - Customize Branding (Primary Color, Accent Gold).
  - Set Free Shipping Threshold and Standard Shipping Fee.
  - Configure VietQR Banking Credentials (Bank Code, Account Number, Account Name).
- **Audit Logs (`/admin/audit-logs`):**
  - Immutable security log capturing every action, operator user, IP address, timestamp, and metadata payload.

---

## 9. Production PostgreSQL Migration Guide

When deploying to a production server (Docker, Railway, Supabase, Neon, AWS RDS):

1. Set your `DATABASE_URL` in `.env`:
   ```env
   DATABASE_URL="postgresql://user:password@hostname:5432/vitacore_db?schema=public"
   ```
2. Replace `prisma/schema.prisma` with `prisma/schema.postgresql.prisma` or switch the datasource provider to `postgresql`.
3. Execute the migration:
   ```bash
   npx prisma migrate deploy
   ```
4. Seed production master data:
   ```bash
   node prisma/seed.js
   ```

---

## 10. Automated Test Suite

A standalone 21-point integration verification test is included:

```bash
node scripts/test-system.js
```

### Coverage:
- RBAC validation for `ADMIN`, `STAFF`, and `USER`.
- Bcrypt password hash verification and JWT token integrity.
- Role privilege enforcement (ensures `USER` tokens cannot execute `STAFF`/`ADMIN` tasks).
- COGS cost price confidentiality.
- Coupon discount calculations and logic.
- Transactional atomic order placement, stock decrement, and inventory rollback on cancellation.
- Dynamic store settings persistence.
- Security audit log generation and immutability.

---

*Built with passion for Vietnamese fitness enthusiasts and athletes. VITACORE SUPPLEMENTS.*

