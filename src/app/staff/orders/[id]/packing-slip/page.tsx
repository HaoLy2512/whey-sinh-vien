'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Printer, CheckSquare } from 'lucide-react';

export default function PackingSlipPage() {
  const params = useParams();
  const orderId = params?.id as string;
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orderId) return;
    fetch(`/api/orders/${orderId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.order) setOrder(data.order);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [orderId]);

  if (loading || !order) {
    return <div className="p-8 text-center text-black">Đang tải thông tin phiếu đóng gói...</div>;
  }

  return (
    <div className="bg-white text-black min-h-screen p-8 print:p-0 max-w-3xl mx-auto font-sans">
      {/* Print Controls (Hidden on print) */}
      <div className="print:hidden mb-6 flex justify-between items-center bg-gray-100 p-4 rounded-xl border border-gray-300">
        <div>
          <h2 className="font-bold text-sm">Xem trước phiếu đóng gói (Packing Slip)</h2>
          <p className="text-xs text-gray-600">Sử dụng cho nhân viên kho đóng hàng trước khi bàn giao đơn vị vận chuyển</p>
        </div>
        <button
          onClick={() => window.print()}
          className="px-4 py-2 bg-black text-white text-xs font-bold rounded-lg flex items-center gap-1.5 shadow"
        >
          <Printer className="w-4 h-4" />
          In ngay (Ctrl + P)
        </button>
      </div>

      {/* Slip Content */}
      <div className="border border-gray-400 p-8 rounded-lg">
        {/* Header */}
        <div className="flex justify-between items-start border-b-2 border-black pb-4 mb-6">
          <div>
            <h1 className="font-black text-xl tracking-wider uppercase">VITACORE SUPPLEMENTS</h1>
            <p className="text-xs text-gray-600">Kho Vận Hà Nội / TP.HCM • Hotline: 1900 8899</p>
            <p className="text-xs text-gray-600">Email: support@vitacore.vn</p>
          </div>
          <div className="text-right">
            <span className="font-mono font-bold text-lg block">{order.orderNumber}</span>
            <span className="text-xs text-gray-500">Ngày tạo: {formatDate(order.createdAt)}</span>
            <p className="text-xs font-bold mt-1 uppercase text-gray-700">PHIẾU ĐÓNG GÓI XUẤT KHO</p>
          </div>
        </div>

        {/* Receiver & Carrier Info */}
        <div className="grid grid-cols-2 gap-6 text-xs mb-6 p-4 bg-gray-50 rounded border border-gray-200">
          <div>
            <strong className="block text-gray-800 uppercase mb-1">Thông tin người nhận:</strong>
            <p className="font-bold text-sm">{order.customerName}</p>
            <p>SĐT: {order.customerPhone}</p>
            <p className="mt-1 leading-relaxed">{order.shippingAddress}</p>
          </div>
          <div>
            <strong className="block text-gray-800 uppercase mb-1">Vận chuyển & Thanh toán:</strong>
            <p>Đơn vị: <strong>Standard Express (GHTK / GHN)</strong></p>
            <p>Mã vận đơn: <strong>{order.trackingNumber || '---'}</strong></p>
            <p>Phương thức: <strong>{order.paymentMethod}</strong></p>
            <p className="font-bold text-red-600 mt-1">
              {order.paymentStatus === 'PAID' ? 'ĐÃ THANH TOÁN (Không thu tiền)' : `THU COD: ${formatCurrency(order.totalAmount)}`}
            </p>
          </div>
        </div>

        {/* Item Checklist Table */}
        <table className="w-full text-left text-xs mb-6 border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-100 border-b border-gray-300">
              <th className="p-2.5 border-r border-gray-300 w-10 text-center">Check</th>
              <th className="p-2.5 border-r border-gray-300">Tên Sản Phẩm / Biến Thể</th>
              <th className="p-2.5 border-r border-gray-300">Mã SKU</th>
              <th className="p-2.5 text-center w-16">SL</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((item: any) => (
              <tr key={item.id} className="border-b border-gray-200">
                <td className="p-2.5 border-r border-gray-300 text-center">
                  <div className="w-4 h-4 border-2 border-gray-400 rounded mx-auto" />
                </td>
                <td className="p-2.5 border-r border-gray-300">
                  <strong className="block">{item.productName}</strong>
                  {item.variantTitle && <span className="text-gray-600 text-[11px]">{item.variantTitle}</span>}
                </td>
                <td className="p-2.5 border-r border-gray-300 font-mono">{item.productSku}</td>
                <td className="p-2.5 text-center font-bold text-sm">x{item.quantity}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Footer Signatures */}
        <div className="grid grid-cols-3 gap-4 text-center text-xs pt-8 border-t border-gray-300">
          <div>
            <p className="font-bold mb-12">Nhân viên đóng gói</p>
            <p className="text-gray-500">(Ký và ghi rõ họ tên)</p>
          </div>
          <div>
            <p className="font-bold mb-12">Nhân viên kiểm kho</p>
            <p className="text-gray-500">(Ký và ghi rõ họ tên)</p>
          </div>
          <div>
            <p className="font-bold mb-12">Đại diện bưu tá / Shipper</p>
            <p className="text-gray-500">(Ký nhận kiện hàng)</p>
          </div>
        </div>
      </div>
    </div>
  );
}

