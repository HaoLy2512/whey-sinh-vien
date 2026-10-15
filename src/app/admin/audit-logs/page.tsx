'use client';

import React, { useState, useEffect } from 'react';
import { History, ShieldCheck, Filter } from 'lucide-react';
import { formatDate } from '@/lib/utils';

export default function AdminAuditLogsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [entityFilter, setEntityFilter] = useState('');
  const [actionFilter, setActionFilter] = useState('');

  const fetchLogs = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (entityFilter) params.set('entity', entityFilter);
    if (actionFilter) params.set('action', actionFilter);

    fetch(`/api/admin/audit-logs?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.logs) setLogs(data.logs);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchLogs();
  }, [entityFilter, actionFilter]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-black text-2xl text-ivory">
            NHẬT KÝ KIỂM TOÁN HỆ THỐNG (AUDIT TRAIL)
          </h1>
          <p className="text-xs text-slate-subtle mt-1">
            Ghi vết bất biến mọi hành động nhạy cảm: thay đổi tồn kho, phân quyền, đăng nhập và xử lý đơn
          </p>
        </div>

        <div className="flex gap-2">
          <select
            value={entityFilter}
            onChange={(e) => setEntityFilter(e.target.value)}
            className="bg-charcoal border border-charcoal-border rounded-xl px-3 py-2 text-xs text-ivory focus:outline-none focus:border-gold"
          >
            <option value="">Tất cả thực thể</option>
            <option value="USER">USER (Tài khoản & RBAC)</option>
            <option value="ORDER">ORDER (Đơn hàng)</option>
            <option value="INVENTORY">INVENTORY (Kho hàng)</option>
            <option value="PRODUCT">PRODUCT (Sản phẩm & Giá)</option>
            <option value="SETTINGS">SETTINGS (Cấu hình)</option>
          </select>

          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="bg-charcoal border border-charcoal-border rounded-xl px-3 py-2 text-xs text-ivory focus:outline-none focus:border-gold"
          >
            <option value="">Tất cả hành động</option>
            <option value="CREATE">CREATE (Tạo mới)</option>
            <option value="UPDATE">UPDATE (Cập nhật)</option>
            <option value="DELETE">DELETE (Xóa)</option>
            <option value="LOGIN">LOGIN (Đăng nhập)</option>
            <option value="STATUS_CHANGE">STATUS_CHANGE (Đổi trạng thái)</option>
            <option value="ADJUST_STOCK">ADJUST_STOCK (Chỉnh kho)</option>
          </select>
        </div>
      </div>

      <div className="card-luxury overflow-hidden border-charcoal-border">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-DEFAULT">Đang tải nhật ký kiểm toán...</div>
        ) : logs.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-DEFAULT">Không có bản ghi nhật ký nào.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-charcoal-deep text-slate-subtle uppercase text-[10px] tracking-wider border-b border-charcoal-border">
                <tr>
                  <th className="p-3.5">Thời Gian</th>
                  <th className="p-3.5">Người Thực Hiện</th>
                  <th className="p-3.5">Vai Trò</th>
                  <th className="p-3.5">Hành Động</th>
                  <th className="p-3.5">Đối Tượng</th>
                  <th className="p-3.5">Nội Dung Chi Tiết</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-charcoal-border/60 text-ivory">
                {logs.map((l) => (
                  <tr key={l.id} className="hover:bg-charcoal-hover transition">
                    <td className="p-3.5 font-mono text-slate-DEFAULT whitespace-nowrap">
                      {formatDate(l.createdAt)}
                    </td>
                    <td className="p-3.5 font-semibold text-ivory">
                      {l.userEmail || 'Hệ thống'}
                    </td>
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold border border-gold/30 bg-gold/10 text-gold">
                        {l.userRole || 'SYSTEM'}
                      </span>
                    </td>
                    <td className="p-3.5 font-bold font-mono text-xs">
                      {l.action}
                    </td>
                    <td className="p-3.5 text-slate-subtle font-semibold">
                      {l.entity}
                    </td>
                    <td className="p-3.5 text-slate-DEFAULT max-w-md break-words font-mono text-[11px]">
                      {l.details || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

