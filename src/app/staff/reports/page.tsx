'use client';

import React from 'react';
import { FileSpreadsheet, Download, ShieldCheck, Database } from 'lucide-react';

export default function StaffReportsPage() {
  const handleExport = (type: 'orders' | 'inventory') => {
    window.location.href = `/api/reports/export?type=${type}`;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display font-black text-2xl text-ivory">
          BÁO CÁO VẬN HÀNH & XUẤT DỮ LIỆU
        </h1>
        <p className="text-xs text-slate-subtle mt-1">
          Xuất dữ liệu đơn hàng và tồn kho phục vụ đối soát, kế toán và kiểm kê kho định kỳ
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Orders CSV Card */}
        <div className="card-luxury p-6 border-charcoal-border flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 rounded-xl bg-gold/10 text-gold flex items-center justify-center border border-gold/30 mb-4">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <h3 className="font-display font-bold text-base text-ivory mb-1">
              Báo Cáo Toàn Bộ Đơn Hàng (Orders CSV)
            </h3>
            <p className="text-xs text-slate-subtle leading-relaxed mb-6">
              Bao gồm mã đơn hàng, thông tin khách hàng, số điện thoại, tổng tiền thanh toán, trạng thái giao nhận và phương thức thanh toán. Hỗ trợ font Tiếng Việt UTF-8 cho Microsoft Excel.
            </p>
          </div>

          <button
            onClick={() => handleExport('orders')}
            className="w-full py-3 rounded-xl bg-gold hover:bg-gold-light text-charcoal font-bold text-xs uppercase tracking-wider transition shadow-glow flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4" />
            Tải xuống file CSV Đơn Hàng
          </button>
        </div>

        {/* Inventory CSV Card */}
        <div className="card-luxury p-6 border-charcoal-border flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/30 mb-4">
              <Database className="w-6 h-6" />
            </div>
            <h3 className="font-display font-bold text-base text-ivory mb-1">
              Báo Cáo Tồn Kho Thực Tế (Inventory CSV)
            </h3>
            <p className="text-xs text-slate-subtle leading-relaxed mb-6">
              Bao gồm danh sách sản phẩm, SKU biến thể, số lượng tồn kho thực tế, số lượng có thể xuất bán, vị trí kho và cảnh báo ngưỡng an toàn.
            </p>
          </div>

          <button
            onClick={() => handleExport('inventory')}
            className="w-full py-3 rounded-xl bg-charcoal-deep border border-charcoal-border hover:border-gold text-gold font-bold text-xs uppercase tracking-wider transition flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4" />
            Tải xuống file CSV Tồn Kho
          </button>
        </div>
      </div>
    </div>
  );
}

