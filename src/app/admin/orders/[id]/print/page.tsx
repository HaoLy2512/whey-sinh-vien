'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Printer, ArrowLeft, CheckCircle2 } from 'lucide-react';

export default function AdminOrderPrintPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params?.id as string;
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [storeSettings, setStoreSettings] = useState<any>(null);

  useEffect(() => {
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
      <div className="min-h-screen bg-neutral-100 flex items-center justify-center text-neutral-800 text-sm">
        Đang tải dữ liệu phiếu đơn hàng...
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-neutral-100 flex flex-col items-center justify-center p-8 text-neutral-800">
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

  const storeName = storeSettings?.storeName || 'VITACORE SUPPLEMENTS';
  const hotline = storeSettings?.contactPhone || '1900 8899 - 0988 123 456';
  const address = storeSettings?.contactAddress || 'Tầng 5, Tòa Nhà Thể Thao Cao Cấp, Cầu Giấy, Hà Nội';
  const email = storeSettings?.contactEmail || 'hotro@vitacore.vn';

  return (
    <div className="bg-neutral-100 min-h-screen py-8 print:py-0 print:bg-white text-neutral-900 font-sans">
      {/* Top Action Bar (hidden on print) */}
      <div className="max-w-4xl mx-auto px-4 mb-6 print:hidden flex items-center justify-between">
        <button
          onClick={() => router.back()}
          className="px-4 py-2 bg-white border border-neutral-300 rounded-xl text-xs font-semibold text-neutral-700 hover:bg-neutral-50 shadow-sm flex items-center gap-1.5 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Quay lại danh sách
        </button>

        <div className="flex items-center gap-3">
          <button
            onClick={() => window.print()}
            className="px-5 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-2 transition cursor-pointer"
          >
            <Printer className="w-4 h-4 text-amber-400" />
            In phiếu đơn hàng (Ctrl + P)
          </button>
        </div>
      </div>

      {/* Main Print Container (A4 / Standard Invoice Style) */}
      <div className="max-w-4xl mx-auto bg-white border border-neutral-300 p-8 sm:p-12 shadow-sm rounded-xl print:border-none print:shadow-none print:p-0 print:rounded-none">
        {/* Header */}
        <div className="flex justify-between items-start pb-6 border-b-2 border-neutral-900 mb-6">
          <div>
            <h1 className="font-black text-2xl tracking-tight uppercase text-neutral-900">
              {storeName}
            </h1>
            <p className="text-xs text-neutral-600 mt-1 font-medium">
              Chuyên Thực Phẩm Bổ Sung & Dinh Dưỡng Thể Thao Chính Hãng
            </p>
            <p className="text-xs text-neutral-500 mt-0.5">Địa chỉ: {address}</p>
            <p className="text-xs text-neutral-500">
              Hotline: <strong className="text-neutral-700">{hotline}</strong> | Email: {email}
            </p>
          </div>

          <div className="text-right">
            <span className="font-mono font-black text-xl text-neutral-900 tracking-wider block">
              {order.orderNumber}
            </span>
            <p className="text-xs text-neutral-500 mt-1">
              Ngày đặt: <strong className="text-neutral-800">{formatDate(order.createdAt)}</strong>
            </p>
            <span className="inline-block mt-2 px-3 py-1 bg-neutral-100 border border-neutral-300 text-[11px] font-black uppercase tracking-wider text-neutral-800 rounded">
              PHIẾU XUẤT KHO & GIAO HÀNG
            </span>
          </div>
        </div>

        {/* Customer & Delivery Section */}
        <div className="grid grid-cols-2 gap-6 text-xs mb-6 p-4 bg-neutral-50 border border-neutral-200 rounded-lg">
          <div>
            <h3 className="font-bold text-neutral-900 uppercase tracking-wide text-[11px] mb-2 border-b border-neutral-200 pb-1">
              Thông Tin Người Nhận
            </h3>
            <p className="text-sm font-bold text-neutral-900">{order.customerName}</p>
            <p className="text-neutral-700 mt-0.5">
              Số điện thoại: <strong className="text-neutral-900 font-mono text-xs">{order.customerPhone}</strong>
            </p>
            {order.customerEmail && (
              <p className="text-neutral-600">Email: {order.customerEmail}</p>
            )}
            <p className="text-neutral-700 mt-1 leading-relaxed">
              Địa chỉ nhận: <strong className="text-neutral-900">{order.shippingAddress}</strong>
            </p>
            {order.customerNote && (
              <p className="mt-2 text-neutral-600 italic bg-amber-50 p-2 rounded border border-amber-200">
                Ghi chú của khách: &ldquo;{order.customerNote}&rdquo;
              </p>
            )}
          </div>

          <div>
            <h3 className="font-bold text-neutral-900 uppercase tracking-wide text-[11px] mb-2 border-b border-neutral-200 pb-1">
              Vận Chuyển & Thanh Toán
            </h3>
            <p className="text-neutral-700">
              Phương thức thanh toán:{' '}
              <strong className="text-neutral-900 uppercase">{order.paymentMethod}</strong>
            </p>
            <p className="text-neutral-700 mt-1">
              Trạng thái thanh toán:{' '}
              {order.paymentStatus === 'PAID' ? (
                <span className="inline-flex items-center gap-1 font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-300">
                  <CheckCircle2 className="w-3.5 h-3.5 inline" /> ĐÃ THANH TOÁN (PAID)
                </span>
              ) : (
                <span className="font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-300">
                  CHƯA THANH TOÁN (COD)
                </span>
              )}
            </p>
            <p className="text-neutral-700 mt-2">
              Mã vận đơn:{' '}
              <strong className="font-mono text-neutral-900 text-xs">
                {order.trackingNumber || 'Chưa cập nhật'}
              </strong>
            </p>
            <p className="text-neutral-700 mt-0.5">
              Đơn vị vận chuyển: <strong>Giao Hàng Tiết Kiệm (GHTK) / GHN Express</strong>
            </p>

            {/* Prominent Payment Box */}
            <div className="mt-3 p-2.5 rounded border text-center font-bold">
              {order.paymentStatus === 'PAID' ? (
                <div className="text-emerald-700 bg-emerald-50 border-emerald-200">
                  ĐƠN HÀNG ĐÃ THANH TOÁN ONLINE &bull; BƯU TÁ KHÔNG THU TIỀN
                </div>
              ) : (
                <div className="text-rose-700 bg-rose-50 border-rose-200 text-sm">
                  SỐ TIỀN CẦN THU COD: {formatCurrency(order.totalAmount)}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Items Table */}
        <div className="mb-6">
          <table className="w-full text-left text-xs border-collapse border border-neutral-300">
            <thead>
              <tr className="bg-neutral-100 border-b border-neutral-300 uppercase text-[10px] tracking-wider text-neutral-700">
                <th className="p-3 border-r border-neutral-300 text-center w-12">STT</th>
                <th className="p-3 border-r border-neutral-300">Tên Sản Phẩm & Biến Thể</th>
                <th className="p-3 border-r border-neutral-300 text-center w-28">Mã SKU</th>
                <th className="p-3 border-r border-neutral-300 text-right w-28">Đơn Giá</th>
                <th className="p-3 border-r border-neutral-300 text-center w-16">SL</th>
                <th className="p-3 text-right w-32">Thành Tiền</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {order.items?.map((item: any, idx: number) => (
                <tr key={item.id} className="text-neutral-800">
                  <td className="p-3 border-r border-neutral-300 text-center font-mono">
                    {idx + 1}
                  </td>
                  <td className="p-3 border-r border-neutral-300">
                    <strong className="text-neutral-900 block text-xs">{item.productName}</strong>
                    {item.variantTitle && (
                      <span className="text-[11px] text-neutral-600 block mt-0.5">
                        Phân loại: {item.variantTitle}
                      </span>
                    )}
                  </td>
                  <td className="p-3 border-r border-neutral-300 text-center font-mono text-[11px] text-neutral-600">
                    {item.productSku || '-'}
                  </td>
                  <td className="p-3 border-r border-neutral-300 text-right font-mono">
                    {formatCurrency(item.unitPrice)}
                  </td>
                  <td className="p-3 border-r border-neutral-300 text-center font-bold font-mono">
                    {item.quantity}
                  </td>
                  <td className="p-3 text-right font-mono font-bold text-neutral-900">
                    {formatCurrency(item.subtotal || item.unitPrice * item.quantity)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Financial Summary */}
        <div className="flex justify-between items-start mb-8">
          <div className="max-w-md text-xs text-neutral-500 italic leading-relaxed">
            <p>* Quý khách vui lòng kiểm tra tem niêm phong và ngoại quan kiện hàng trước khi nhận.</p>
            <p>* Hỗ trợ đổi trả miễn phí trong 7 ngày nếu sản phẩm có lỗi từ nhà sản xuất hoặc sai quy cách.</p>
            <p>* Hotline khiếu nại & chăm sóc khách hàng: {hotline}</p>
          </div>

          <div className="w-72 text-xs space-y-1.5 border border-neutral-200 p-4 rounded-lg bg-neutral-50">
            <div className="flex justify-between text-neutral-600">
              <span>Tiền hàng:</span>
              <span className="font-mono">{formatCurrency(order.subtotal || order.totalAmount)}</span>
            </div>
            {order.discountAmount > 0 && (
              <div className="flex justify-between text-emerald-700">
                <span>Giảm giá (Coupon):</span>
                <span className="font-mono">-{formatCurrency(order.discountAmount)}</span>
              </div>
            )}
            <div className="flex justify-between text-neutral-600">
              <span>Phí vận chuyển:</span>
              <span className="font-mono">
                {order.shippingFee ? formatCurrency(order.shippingFee) : 'Miễn phí'}
              </span>
            </div>
            <div className="pt-2 border-t border-neutral-300 flex justify-between font-black text-sm text-neutral-900">
              <span>Tổng thanh toán:</span>
              <span className="font-mono text-base text-neutral-950">
                {formatCurrency(order.totalAmount)}
              </span>
            </div>
          </div>
        </div>

        {/* Signature Footer */}
        <div className="grid grid-cols-4 gap-4 text-center text-xs pt-6 border-t-2 border-neutral-300">
          <div>
            <p className="font-bold text-neutral-800">Người lập phiếu</p>
            <p className="text-[10px] text-neutral-400 mt-0.5">(Ký, họ tên)</p>
            <div className="h-16" />
          </div>
          <div>
            <p className="font-bold text-neutral-800">Nhân viên đóng gói</p>
            <p className="text-[10px] text-neutral-400 mt-0.5">(Ký, họ tên)</p>
            <div className="h-16" />
          </div>
          <div>
            <p className="font-bold text-neutral-800">Bưu tá giao hàng</p>
            <p className="text-[10px] text-neutral-400 mt-0.5">(Ký nhận hàng)</p>
            <div className="h-16" />
          </div>
          <div>
            <p className="font-bold text-neutral-800">Khách hàng nhận</p>
            <p className="text-[10px] text-neutral-400 mt-0.5">(Ký nhận hàng)</p>
            <div className="h-16" />
          </div>
        </div>
      </div>
    </div>
  );
}

