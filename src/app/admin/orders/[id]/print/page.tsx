'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Printer, ArrowLeft, CheckCircle2, ShieldCheck, Phone, Mail, MapPin } from 'lucide-react';

function numberToVietnameseWords(num: number): string {
  if (!num || num === 0) return 'Không đồng';
  const units = ['', 'một', 'hai', 'ba', 'bốn', 'năm', 'sáu', 'bảy', 'tám', 'chín'];
  const scales = ['', 'nghìn', 'triệu', 'tỷ', 'nghìn tỷ', 'triệu tỷ'];

  function readThreeDigits(n: number, isHighest: boolean): string {
    const hundreds = Math.floor(n / 100);
    const remainder = n % 100;
    const tens = Math.floor(remainder / 10);
    const ones = remainder % 10;

    let res = '';
    if (hundreds > 0 || !isHighest) {
      res += units[hundreds] + ' trăm ';
    }

    if (tens > 1) {
      res += units[tens] + ' mươi ';
      if (ones === 1) res += 'mốt ';
      else if (ones === 5) res += 'lăm ';
      else if (ones > 0) res += units[ones] + ' ';
    } else if (tens === 1) {
      res += 'mười ';
      if (ones === 5) res += 'lăm ';
      else if (ones > 0) res += units[ones] + ' ';
    } else if (tens === 0 && ones > 0) {
      if (hundreds > 0 || !isHighest) res += 'lẻ ';
      res += units[ones] + ' ';
    }
    return res.trim();
  }

  const str = Math.round(num).toString();
  const groups: number[] = [];
  for (let i = str.length; i > 0; i -= 3) {
    groups.push(parseInt(str.substring(Math.max(0, i - 3), i), 10));
  }

  let result = '';
  for (let i = groups.length - 1; i >= 0; i--) {
    const val = groups[i];
    if (val > 0) {
      const read = readThreeDigits(val, i === groups.length - 1);
      result += read + ' ' + scales[i] + ' ';
    }
  }

  result = result.trim();
  if (!result) return 'Không đồng';
  return (result.charAt(0).toUpperCase() + result.slice(1) + ' đồng chẵn.').replace(/\s+/g, ' ');
}

export default function AdminOrderPrintPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params?.id as string;
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [storeSettings, setStoreSettings] = useState<any>(null);
  const [printDate, setPrintDate] = useState('');

  useEffect(() => {
    setPrintDate(new Date().toLocaleString('vi-VN'));
    if (!orderId) return;

    Promise.all([
      fetch(`/api/orders/${orderId}`).then((r) => r.json()),
      fetch('/api/settings').then((r) => r.json()).catch(() => ({})),
    ])
      .then(([orderData, settingsData]) => {
        if (orderData.order) setOrder(orderData.order);
        if (settingsData.settings) setStoreSettings(settingsData.settings);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [orderId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center text-neutral-800 text-sm">
        Đang khởi tạo bản in hóa đơn & phiếu xuất kho...
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-8 text-neutral-800">
        <p className="font-bold text-base mb-4">Không tìm thấy thông tin đơn hàng này.</p>
        <button
          onClick={() => router.back()}
          className="px-4 py-2 bg-black text-white text-xs rounded-lg"
        >
          Quay lại danh sách
        </button>
      </div>
    );
  }

  const storeName = storeSettings?.storeName || 'WHEY SINH VIÊN';
  const brandSub = 'VITACORE LUXURY NUTRITION';
  const hotline = storeSettings?.contactPhone || '1900 8899 - 0988 123 456';
  const address = storeSettings?.contactAddress || 'Kho Logistics Trung Tâm, Cầu Giấy, Hà Nội & Quận 7, TP.HCM';
  const email = storeSettings?.contactEmail || 'hotro@wheysinhvien.vn';
  const isPaid = order.paymentStatus === 'PAID';

  return (
    <div className="bg-neutral-100 min-h-screen py-6 print:py-0 print:bg-white text-neutral-900 font-sans">
      {/* Top Action Bar (Always hidden when printed) */}
      <div className="max-w-4xl mx-auto px-4 mb-4 print:hidden flex items-center justify-between">
        <button
          onClick={() => router.back()}
          className="px-4 py-2 bg-white border border-neutral-300 rounded-xl text-xs font-semibold text-neutral-700 hover:bg-neutral-50 shadow-sm flex items-center gap-1.5 transition cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Quay lại danh sách đơn
        </button>

        <div className="flex items-center gap-3">
          <button
            onClick={() => window.print()}
            className="px-6 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-2 transition cursor-pointer"
          >
            <Printer className="w-4 h-4 text-amber-400" />
            In phiếu đơn hàng (Ctrl + P)
          </button>
        </div>
      </div>

      {/* Main Printable Sheet (Strict A4 Layout) */}
      <div className="max-w-4xl mx-auto bg-white border border-neutral-300 p-8 sm:p-10 shadow-sm rounded-xl print:border-none print:shadow-none print:p-2 print:m-0 print:max-w-none print:rounded-none">
        {/* Header: Brand & Document Meta */}
        <div className="flex justify-between items-start pb-5 border-b-2 border-neutral-900 mb-5">
          <div className="max-w-md">
            <div className="flex items-center gap-2.5 mb-1">
              <div className="w-8 h-8 rounded bg-neutral-900 text-amber-400 flex items-center justify-center font-black text-sm">
                W
              </div>
              <div>
                <h1 className="font-black text-xl tracking-tight uppercase text-neutral-900 leading-none">
                  {storeName}
                </h1>
                <span className="text-[10px] text-amber-700 font-bold uppercase tracking-wider block mt-0.5">
                  {brandSub}
                </span>
              </div>
            </div>
            <p className="text-xs text-neutral-600 font-medium mt-1.5">
              Hệ thống dinh dưỡng thể thao & Whey Protein chính hãng
            </p>
            <p className="text-[11px] text-neutral-500 mt-0.5 leading-snug">
              Kho vận: {address}
            </p>
            <p className="text-[11px] text-neutral-600 mt-0.5">
              Hotline: <strong className="text-neutral-900 font-mono">{hotline}</strong> | Email: {email}
            </p>
          </div>

          <div className="text-right">
            <span className="inline-block px-3 py-1 bg-neutral-900 text-white text-[11px] font-black uppercase tracking-wider rounded mb-1.5">
              PHIẾU XUẤT KHO & GIAO HÀNG
            </span>
            <div className="font-mono font-black text-xl text-neutral-900 tracking-wider">
              {order.orderNumber}
            </div>
            <p className="text-[11px] text-neutral-500 mt-1">
              Ngày đặt hàng: <strong className="text-neutral-800">{formatDate(order.createdAt)}</strong>
            </p>
            <p className="text-[11px] text-neutral-500">
              Thời gian in phiếu: <span className="font-mono">{printDate}</span>
            </p>
          </div>
        </div>

        {/* Recipient & Shipping Information Grid */}
        <div className="grid grid-cols-2 gap-4 text-xs mb-5 print-avoid-break">
          {/* Box 1: Receiver Details */}
          <div className="p-3.5 bg-neutral-50 border border-neutral-200 rounded-lg">
            <h3 className="font-bold text-neutral-900 uppercase tracking-wide text-[11px] mb-2 border-b border-neutral-200 pb-1 flex items-center justify-between">
              <span>1. Thông Tin Người Nhận</span>
              <span className="text-[10px] font-normal text-neutral-500 lowercase">(Khách hàng)</span>
            </h3>
            <div className="space-y-1">
              <p className="text-sm font-black text-neutral-900">{order.customerName}</p>
              <p className="text-neutral-700">
                Điện thoại: <strong className="font-mono text-sm text-neutral-950 font-bold">{order.customerPhone}</strong>
              </p>
              {order.customerEmail && (
                <p className="text-neutral-600 text-[11px]">Email: {order.customerEmail}</p>
              )}
              <p className="text-neutral-800 pt-0.5 leading-relaxed">
                Địa chỉ: <strong className="text-neutral-950">{order.shippingAddress}</strong>
              </p>
              {order.customerNote && (
                <div className="mt-2 text-[11px] text-neutral-800 italic bg-amber-50 p-2 rounded border border-amber-200">
                  <strong>Ghi chú giao hàng:</strong> &ldquo;{order.customerNote}&rdquo;
                </div>
              )}
            </div>
          </div>

          {/* Box 2: Carrier & Payment Terms */}
          <div className="p-3.5 bg-neutral-50 border border-neutral-200 rounded-lg flex flex-col justify-between">
            <div>
              <h3 className="font-bold text-neutral-900 uppercase tracking-wide text-[11px] mb-2 border-b border-neutral-200 pb-1 flex items-center justify-between">
                <span>2. Vận Chuyển & Thanh Toán</span>
                <span className="text-[10px] font-normal text-neutral-500 lowercase">(Bưu tá / Shipper)</span>
              </h3>
              <div className="space-y-1">
                <p className="text-neutral-700">
                  Đơn vị vận chuyển: <strong>Standard Express (GHTK / GHN / Viettel Post)</strong>
                </p>
                <p className="text-neutral-700">
                  Mã vận đơn bưu cục:{' '}
                  <strong className="font-mono text-xs text-neutral-900">
                    {order.trackingNumber || 'Đang cập nhật'}
                  </strong>
                </p>
                <p className="text-neutral-700">
                  Phương thức thanh toán: <strong className="uppercase">{order.paymentMethod}</strong>
                </p>
              </div>
            </div>

            {/* Prominent High-Contrast Cash Collection Box for Shipper */}
            <div className="mt-2.5 pt-2 border-t border-neutral-200">
              {isPaid ? (
                <div className="p-2.5 bg-emerald-50 border-2 border-emerald-600 rounded text-center">
                  <span className="block font-black text-xs text-emerald-800 uppercase tracking-wider">
                    ✔ ĐƠN ĐÃ THANH TOÁN TRƯỚC (PAID)
                  </span>
                  <span className="block font-black text-sm text-emerald-950 mt-0.5">
                    TIỀN THU CỦA KHÁCH: 0 VNĐ
                  </span>
                  <span className="block text-[10px] text-emerald-700 mt-0.5 font-medium">
                    (Bưu tá tuyệt đối KHÔNG thu tiền của người nhận)
                  </span>
                </div>
              ) : (
                <div className="p-2.5 bg-neutral-900 text-white rounded text-center">
                  <span className="block font-bold text-[11px] text-amber-300 uppercase tracking-wider">
                    SỐ TIỀN CẦN THU COD TỪ NGƯỜI NHẬN:
                  </span>
                  <span className="block font-black text-base text-white font-mono mt-0.5">
                    {formatCurrency(order.totalAmount)}
                  </span>
                  <span className="block text-[10px] text-neutral-300 mt-0.5">
                    (Đã bao gồm tiền hàng và phí vận chuyển)
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Items Table */}
        <div className="mb-4 print-avoid-break">
          <table className="w-full text-left text-xs border-collapse border border-neutral-300">
            <thead>
              <tr className="bg-neutral-100 border-b border-neutral-300 uppercase text-[10px] tracking-wider text-neutral-700 font-bold">
                <th className="p-2.5 border-r border-neutral-300 text-center w-10">STT</th>
                <th className="p-2.5 border-r border-neutral-300">Tên Sản Phẩm & Phân Loại</th>
                <th className="p-2.5 border-r border-neutral-300 text-center w-28">Mã SKU</th>
                <th className="p-2.5 border-r border-neutral-300 text-right w-24">Đơn Giá</th>
                <th className="p-2.5 border-r border-neutral-300 text-center w-14">SL</th>
                <th className="p-2.5 text-right w-28">Thành Tiền</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {order.items?.map((item: any, idx: number) => (
                <tr key={item.id} className="text-neutral-800">
                  <td className="p-2.5 border-r border-neutral-300 text-center font-mono">
                    {idx + 1}
                  </td>
                  <td className="p-2.5 border-r border-neutral-300">
                    <strong className="text-neutral-950 block text-xs">{item.productName}</strong>
                    {item.variantTitle && (
                      <span className="text-[11px] text-neutral-600 block mt-0.5">
                        Phân loại / Vị: <strong>{item.variantTitle}</strong>
                      </span>
                    )}
                  </td>
                  <td className="p-2.5 border-r border-neutral-300 text-center font-mono text-[11px] text-neutral-600">
                    {item.productSku || '-'}
                  </td>
                  <td className="p-2.5 border-r border-neutral-300 text-right font-mono">
                    {formatCurrency(item.unitPrice)}
                  </td>
                  <td className="p-2.5 border-r border-neutral-300 text-center font-bold font-mono text-sm">
                    {item.quantity}
                  </td>
                  <td className="p-2.5 text-right font-mono font-bold text-neutral-950">
                    {formatCurrency(item.subtotal || item.unitPrice * item.quantity)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Financial Summary & Policy Notes */}
        <div className="flex justify-between items-start gap-6 mb-6 print-avoid-break">
          {/* Policy & Guarantees */}
          <div className="flex-1 text-[11px] text-neutral-600 leading-relaxed border border-neutral-200 p-3 rounded-lg bg-neutral-50/50">
            <h4 className="font-bold text-neutral-900 uppercase text-[10px] tracking-wider mb-1">
              Chính Sách Đồng Kiểm & Đổi Trả:
            </h4>
            <ul className="list-disc list-inside space-y-0.5">
              <li>Khách hàng được quyền mở kiện hàng kiểm tra tem niêm phong và đúng sản phẩm trước khi thanh toán.</li>
              <li>Cam kết 100% nhập khẩu chính hãng, date xa. Đền 200% nếu phát hiện hàng giả, hàng nhái.</li>
              <li>Hỗ trợ đổi trả miễn phí trong 7 ngày nếu lỗi từ nhà sản xuất hoặc giao sai quy cách.</li>
              <li>Hotline khiếu nại & xử lý bảo hành nhanh: <strong>{hotline}</strong></li>
            </ul>
          </div>

          {/* Pricing Calculation Box */}
          <div className="w-72 text-xs space-y-1.5 border border-neutral-300 p-3.5 rounded-lg bg-neutral-50">
            <div className="flex justify-between text-neutral-600">
              <span>Tổng tiền hàng:</span>
              <span className="font-mono text-neutral-900 font-medium">
                {formatCurrency(order.subtotal || order.totalAmount)}
              </span>
            </div>
            {order.discountAmount > 0 && (
              <div className="flex justify-between text-emerald-700 font-medium">
                <span>Giảm giá khuyến mãi:</span>
                <span className="font-mono">-{formatCurrency(order.discountAmount)}</span>
              </div>
            )}
            <div className="flex justify-between text-neutral-600">
              <span>Phí vận chuyển:</span>
              <span className="font-mono text-neutral-900 font-medium">
                {order.shippingFee ? formatCurrency(order.shippingFee) : '0 đ (Freeship)'}
              </span>
            </div>
            <div className="pt-2 border-t-2 border-neutral-300 flex justify-between font-black text-sm text-neutral-950">
              <span>TỔNG THANH TOÁN:</span>
              <span className="font-mono text-base font-black">
                {formatCurrency(order.totalAmount)}
              </span>
            </div>
            <p className="text-[10px] text-neutral-600 italic pt-1 border-t border-neutral-200">
              * Bằng chữ: {numberToVietnameseWords(order.totalAmount)}
            </p>
          </div>
        </div>

        {/* 4-Column Signatures */}
        <div className="grid grid-cols-4 gap-2 text-center text-xs pt-4 border-t-2 border-neutral-900 print-avoid-break">
          <div>
            <p className="font-bold text-neutral-900">Người lập phiếu</p>
            <p className="text-[10px] text-neutral-400 mt-0.5">(Ký, họ tên)</p>
            <div className="h-14" />
          </div>
          <div>
            <p className="font-bold text-neutral-900">Thủ kho xuất hàng</p>
            <p className="text-[10px] text-neutral-400 mt-0.5">(Ký, họ tên)</p>
            <div className="h-14" />
          </div>
          <div>
            <p className="font-bold text-neutral-900">Bưu tá giao hàng</p>
            <p className="text-[10px] text-neutral-400 mt-0.5">(Ký xác nhận)</p>
            <div className="h-14" />
          </div>
          <div>
            <p className="font-bold text-neutral-900">Khách hàng nhận</p>
            <p className="text-[10px] text-neutral-400 mt-0.5">(Ký xác nhận)</p>
            <div className="h-14" />
          </div>
        </div>
      </div>
    </div>
  );
}
