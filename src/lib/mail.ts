import nodemailer from 'nodemailer';
import { formatCurrency, formatDate } from './utils';

export interface OrderEmailItem {
  productName: string;
  variantTitle?: string | null;
  productSku?: string | null;
  price: number;
  quantity: number;
  total: number;
}

export interface OrderEmailPayload {
  orderId: string;
  orderNumber: string;
  createdAt: Date | string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: string;
  province?: string | null;
  paymentMethod: string;
  paymentStatus: string;
  subtotal: number;
  discountAmount: number;
  shippingFee: number;
  totalAmount: number;
  customerNotes?: string | null;
  items: OrderEmailItem[];
}

function getMailTransporter() {
  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT || '587', 10);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  // If no SMTP credentials, return null
  if (!host || !user || !pass) {
    return null;
  }

  const isSecure = port === 465 || process.env.SMTP_SECURE === 'true';

  return nodemailer.createTransport({
    host,
    port,
    secure: isSecure,
    auth: {
      user,
      pass,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });
}

export async function sendOrderConfirmationEmail(payload: OrderEmailPayload) {
  const {
    orderId,
    orderNumber,
    createdAt,
    customerName,
    customerEmail,
    customerPhone,
    shippingAddress,
    paymentMethod,
    paymentStatus,
    subtotal,
    discountAmount,
    shippingFee,
    totalAmount,
    customerNotes,
    items,
  } = payload;

  if (!customerEmail || !customerEmail.includes('@') || customerEmail === 'guest@vitacore.vn') {
    console.log(`[EMAIL] Bỏ qua gửi email: Địa chỉ email không hợp lệ (${customerEmail})`);
    return { success: false, reason: 'Invalid email' };
  }

  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL ||
    (process.env.RENDER_EXTERNAL_URL ? `https://${process.env.RENDER_EXTERNAL_URL}` : 'https://whey-sinh-vien.onrender.com');

  const trackingLink = `${appUrl}/orders/${orderId}`;
  const fromName = process.env.SMTP_FROM || 'Whey Sinh Viên - Vitacore <hotro@wheysinhvien.vn>';

  const formattedDate = formatDate(createdAt);
  const isPaid = paymentStatus === 'PAID';

  // Generate Items Table HTML
  const itemsHtml = items
    .map(
      (it, idx) => `
    <tr style="border-bottom: 1px solid #252b36;">
      <td style="padding: 12px 8px; color: #8a94a0; font-size: 12px; text-align: center;">${idx + 1}</td>
      <td style="padding: 12px 8px; color: #f6f3ed; font-size: 13px;">
        <strong style="color: #f6f3ed; display: block;">${it.productName}</strong>
        ${it.variantTitle ? `<span style="color: #c8a96a; font-size: 11px;">Phân loại: ${it.variantTitle}</span>` : ''}
        ${it.productSku ? `<span style="color: #8a94a0; font-size: 10px; display: block; font-family: monospace;">SKU: ${it.productSku}</span>` : ''}
      </td>
      <td style="padding: 12px 8px; color: #c8a96a; font-weight: bold; font-size: 13px; text-align: center;">x${it.quantity}</td>
      <td style="padding: 12px 8px; color: #f6f3ed; font-size: 13px; text-align: right; font-family: monospace;">${formatCurrency(it.price)}</td>
      <td style="padding: 12px 8px; color: #c8a96a; font-weight: bold; font-size: 13px; text-align: right; font-family: monospace;">${formatCurrency(it.total)}</td>
    </tr>
  `
    )
    .join('');

  const htmlContent = `
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Xác nhận đơn hàng ${orderNumber}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0b0d11; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #f6f3ed; line-height: 1.6;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #0b0d11; padding: 24px 12px;">
    <tr>
      <td align="center">
        <!-- Main Card Container -->
        <table role="presentation" width="100%" style="max-width: 640px; background-color: #101318; border: 1px solid #252b36; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.5);" cellspacing="0" cellpadding="0" border="0">
          
          <!-- Header with Brand Logo -->
          <tr>
            <td style="background: linear-gradient(135deg, #171b22 0%, #101318 100%); padding: 28px 24px; text-align: center; border-bottom: 2px solid #c8a96a;">
              <div style="display: inline-block; background-color: #c8a96a; color: #101318; font-weight: 900; font-size: 16px; padding: 6px 14px; border-radius: 8px; margin-bottom: 8px; letter-spacing: 1px;">
                WHEY SINH VIÊN
              </div>
              <h1 style="margin: 4px 0 0 0; font-size: 20px; font-weight: 800; color: #f6f3ed; letter-spacing: 0.5px;">
                VITACORE SUPPLEMENTS
              </h1>
              <p style="margin: 4px 0 0 0; font-size: 12px; color: #c8a96a; font-weight: 600;">
                Hệ Thống Dinh Dưỡng Thể Thao & Whey Protein Chính Hãng
              </p>
            </td>
          </tr>

          <!-- Confirmation Banner -->
          <tr>
            <td style="padding: 24px 24px 16px 24px; text-align: center;">
              <div style="display: inline-block; background-color: rgba(23, 76, 60, 0.4); border: 1px solid #258368; color: #34d399; font-size: 12px; font-weight: 700; padding: 6px 16px; border-radius: 999px; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 12px;">
                ✔ ĐẶT HÀNG THÀNH CÔNG
              </div>
              <h2 style="margin: 0; font-size: 18px; font-weight: 700; color: #f6f3ed;">
                Cảm ơn bạn, ${customerName}!
              </h2>
              <p style="margin: 8px 0 0 0; font-size: 13px; color: #8a94a0;">
                Đơn hàng <strong style="color: #c8a96a; font-family: monospace;">#${orderNumber}</strong> của bạn đã được tiếp nhận và đang được đóng gói để bàn giao bưu cục sớm nhất.
              </p>
            </td>
          </tr>

          <!-- Order Summary Info Grid -->
          <tr>
            <td style="padding: 0 24px 20px 24px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #171b22; border: 1px solid #252b36; border-radius: 12px; padding: 16px;">
                <tr>
                  <td width="50%" style="vertical-align: top; padding: 8px;">
                    <span style="font-size: 11px; color: #8a94a0; text-transform: uppercase; font-weight: 700; display: block; margin-bottom: 4px;">
                      Thông tin giao hàng
                    </span>
                    <strong style="font-size: 13px; color: #f6f3ed; display: block;">${customerName}</strong>
                    <span style="font-size: 12px; color: #c8a96a; font-family: monospace; display: block; margin-top: 2px;">${customerPhone}</span>
                    <p style="margin: 4px 0 0 0; font-size: 12px; color: #8a94a0; line-height: 1.4;">${shippingAddress}</p>
                    ${customerNotes ? `<p style="margin: 6px 0 0 0; font-size: 11px; color: #c8a96a; font-style: italic;">Ghi chú: "${customerNotes}"</p>` : ''}
                  </td>
                  <td width="50%" style="vertical-align: top; padding: 8px; border-left: 1px solid #252b36;">
                    <span style="font-size: 11px; color: #8a94a0; text-transform: uppercase; font-weight: 700; display: block; margin-bottom: 4px;">
                      Thanh toán & Vận chuyển
                    </span>
                    <div style="font-size: 12px; color: #8a94a0; margin-bottom: 4px;">
                      Phương thức: <strong style="color: #f6f3ed; text-transform: uppercase;">${paymentMethod}</strong>
                    </div>
                    <div style="font-size: 12px; color: #8a94a0; margin-bottom: 4px;">
                      Trạng thái: 
                      <strong style="color: ${isPaid ? '#34d399' : '#f59e0b'};">
                        ${isPaid ? 'Đã thanh toán (PAID)' : 'Thanh toán khi nhận hàng (COD)'}
                      </strong>
                    </div>
                    <div style="font-size: 12px; color: #8a94a0;">
                      Đơn vị vận chuyển: <strong style="color: #f6f3ed;">GHTK / GHN Express</strong>
                    </div>
                    <div style="font-size: 11px; color: #8a94a0; margin-top: 4px;">
                      Thời gian: ${formattedDate}
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Items Table -->
          <tr>
            <td style="padding: 0 24px 20px 24px;">
              <h3 style="margin: 0 0 10px 0; font-size: 13px; font-weight: 700; color: #c8a96a; text-transform: uppercase; letter-spacing: 0.5px;">
                Chi Tiết Sản Phẩm Đặt Mua
              </h3>
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #171b22; border: 1px solid #252b36; border-radius: 12px; overflow: hidden; border-collapse: collapse;">
                <thead>
                  <tr style="background-color: #0b0d11; border-bottom: 2px solid #252b36;">
                    <th style="padding: 10px 8px; font-size: 11px; font-weight: 700; color: #8a94a0; text-align: center; width: 40px;">#</th>
                    <th style="padding: 10px 8px; font-size: 11px; font-weight: 700; color: #8a94a0; text-align: left;">Sản phẩm</th>
                    <th style="padding: 10px 8px; font-size: 11px; font-weight: 700; color: #8a94a0; text-align: center; width: 50px;">SL</th>
                    <th style="padding: 10px 8px; font-size: 11px; font-weight: 700; color: #8a94a0; text-align: right; width: 90px;">Đơn giá</th>
                    <th style="padding: 10px 8px; font-size: 11px; font-weight: 700; color: #8a94a0; text-align: right; width: 100px;">Thành tiền</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsHtml}
                </tbody>
              </table>
            </td>
          </tr>

          <!-- Financial Calculation Breakdown -->
          <tr>
            <td style="padding: 0 24px 24px 24px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #171b22; border: 1px solid #252b36; border-radius: 12px; padding: 16px;">
                <tr>
                  <td style="padding: 4px 0; font-size: 12px; color: #8a94a0;">Tạm tính tiền hàng:</td>
                  <td style="padding: 4px 0; font-size: 12px; color: #f6f3ed; text-align: right; font-family: monospace;">${formatCurrency(subtotal)}</td>
                </tr>
                ${
                  discountAmount > 0
                    ? `<tr>
                  <td style="padding: 4px 0; font-size: 12px; color: #34d399;">Giảm giá khuyến mãi:</td>
                  <td style="padding: 4px 0; font-size: 12px; color: #34d399; text-align: right; font-family: monospace;">-${formatCurrency(discountAmount)}</td>
                </tr>`
                    : ''
                }
                <tr>
                  <td style="padding: 4px 0; font-size: 12px; color: #8a94a0;">Phí vận chuyển:</td>
                  <td style="padding: 4px 0; font-size: 12px; color: #f6f3ed; text-align: right; font-family: monospace;">${shippingFee > 0 ? formatCurrency(shippingFee) : 'Miễn phí'}</td>
                </tr>
                <tr>
                  <td colspan="2" style="padding-top: 10px; border-top: 1px solid #252b36;"></td>
                </tr>
                <tr>
                  <td style="font-size: 14px; font-weight: 800; color: #c8a96a; text-transform: uppercase;">TỔNG CỘNG THANH TOÁN:</td>
                  <td style="font-size: 18px; font-weight: 900; color: #c8a96a; text-align: right; font-family: monospace;">${formatCurrency(totalAmount)}</td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Track Order CTA Button -->
          <tr>
            <td style="padding: 0 24px 28px 24px; text-align: center;">
              <a href="${trackingLink}" target="_blank" style="display: inline-block; background: linear-gradient(135deg, #c8a96a 0%, #a78345 100%); color: #101318; font-weight: 800; font-size: 14px; text-decoration: none; padding: 14px 32px; border-radius: 12px; box-shadow: 0 4px 20px rgba(200, 169, 106, 0.4); text-transform: uppercase; letter-spacing: 0.5px;">
                Xem Chi Tiết & Theo Dõi Đơn Hàng
              </a>
              <p style="margin: 12px 0 0 0; font-size: 11px; color: #8a94a0;">
                Hoặc truy cập đường dẫn: <a href="${trackingLink}" style="color: #c8a96a; text-decoration: underline;">${trackingLink}</a>
              </p>
            </td>
          </tr>

          <!-- Support & Policy Footer -->
          <tr>
            <td style="background-color: #0b0d11; border-top: 1px solid #252b36; padding: 20px 24px; text-align: center;">
              <p style="margin: 0 0 8px 0; font-size: 12px; color: #f6f3ed; font-weight: 600;">
                Cần hỗ trợ về đơn hàng? Đội ngũ Whey Sinh Viên luôn sẵn sàng 24/7!
              </p>
              <p style="margin: 0 0 12px 0; font-size: 11px; color: #8a94a0;">
                Hotline: <strong style="color: #c8a96a;">1900 8899 - 0988 123 456</strong> &bull; Email: <a href="mailto:hotro@wheysinhvien.vn" style="color: #c8a96a; text-decoration: none;">hotro@wheysinhvien.vn</a>
              </p>
              <div style="font-size: 10px; color: #68717d; line-height: 1.5; border-top: 1px solid #171b22; pt: 8px;">
                Cam kết 100% chính hãng có tem chống giả &bull; Đổi trả miễn phí trong 7 ngày &bull; Đền 200% nếu phát hiện hàng giả.<br>
                © ${new Date().getFullYear()} Whey Sinh Viên - Vitacore Supplements. All rights reserved.
              </div>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  const transporter = getMailTransporter();

  if (!transporter) {
    console.log('----------------------------------------------------');
    console.log(`[EMAIL SIMULATION] SMTP chưa được cấu hình. Chi tiết email đơn hàng:`);
    console.log(`Tới: ${customerEmail} (${customerName})`);
    console.log(`Mã đơn: ${orderNumber}`);
    console.log(`Tổng tiền: ${formatCurrency(totalAmount)}`);
    console.log(`Link theo dõi: ${trackingLink}`);
    console.log(`(Để gửi email thật qua hòm thư, bạn chỉ cần thêm biến SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS vào môi trường)`);
    console.log('----------------------------------------------------');
    return { success: true, simulated: true };
  }

  try {
    const info = await transporter.sendMail({
      from: fromName,
      to: customerEmail,
      subject: `[Whey Sinh Viên] Xác nhận đơn hàng thành công #${orderNumber}`,
      html: htmlContent,
    });

    console.log(`[EMAIL SUCCESS] Đã gửi email xác nhận đơn hàng tới ${customerEmail}: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (err: any) {
    console.error(`[EMAIL ERROR] Lỗi khi gửi email xác nhận tới ${customerEmail}:`, err?.message || err);
    // Don't throw error to prevent order transaction failure
    return { success: false, error: err?.message };
  }
}
