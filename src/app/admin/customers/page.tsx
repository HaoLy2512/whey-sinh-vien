'use client';

import React, { useState, useEffect } from 'react';
import { Users, Lock, Unlock, ShoppingBag, DollarSign } from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCustomers = () => {
    setLoading(true);
    fetch('/api/customers')
      .then((res) => res.json())
      .then((data) => {
        if (data.customers) setCustomers(data.customers);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleToggleStatus = async (customerId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'ACTIVE' ? 'LOCKED' : 'ACTIVE';
    try {
      const res = await fetch('/api/customers', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customerId, status: newStatus }),
      });
      if (res.ok) {
        fetchCustomers();
      }
    } catch {
      alert('Lỗi cập nhật trạng thái khách hàng');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display font-black text-2xl text-ivory">QUẢN LÝ KHÁCH HÀNG</h1>
        <p className="text-xs text-slate-subtle mt-1">
          Theo dõi tổng chi tiêu tích lũy, số lượng đơn hàng và kiểm soát khóa tài khoản
        </p>
      </div>

      <div className="card-luxury overflow-hidden border-charcoal-border">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-DEFAULT">Đang tải danh sách khách hàng...</div>
        ) : (
          <table className="w-full text-left text-xs">
            <thead className="bg-charcoal-deep text-slate-subtle uppercase text-[10px] tracking-wider border-b border-charcoal-border">
              <tr>
                <th className="p-3.5">Họ và Tên</th>
                <th className="p-3.5">Email</th>
                <th className="p-3.5">Số Điện Thoại</th>
                <th className="p-3.5 text-center">Đơn Đã Mua</th>
                <th className="p-3.5">Tổng Chi Tiêu</th>
                <th className="p-3.5">Trạng Thái</th>
                <th className="p-3.5 text-right">Khóa / Mở</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-charcoal-border/60 text-ivory">
              {customers.map((c) => (
                <tr key={c.id} className="hover:bg-charcoal-hover transition">
                  <td className="p-3.5 font-bold text-ivory">{c.fullName}</td>
                  <td className="p-3.5 font-mono text-slate-DEFAULT">{c.email}</td>
                  <td className="p-3.5 text-slate-DEFAULT">{c.phone || '-'}</td>
                  <td className="p-3.5 text-center font-bold text-slate-subtle">
                    {c.ordersCount} đơn
                  </td>
                  <td className="p-3.5 font-mono font-bold text-gold">
                    {formatCurrency(c.totalSpent)}
                  </td>
                  <td className="p-3.5">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        c.status === 'ACTIVE'
                          ? 'text-emerald-400 bg-emerald-500/10'
                          : 'text-rose-400 bg-rose-500/10'
                      }`}
                    >
                      {c.status === 'ACTIVE' ? 'Hoạt động' : 'Đã khóa'}
                    </span>
                  </td>
                  <td className="p-3.5 text-right">
                    <button
                      onClick={() => handleToggleStatus(c.id, c.status)}
                      className={`p-1.5 rounded transition ${
                        c.status === 'ACTIVE'
                          ? 'bg-rose-500/10 text-rose-400 hover:bg-rose-500/20'
                          : 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
                      }`}
                      title={c.status === 'ACTIVE' ? 'Khóa tài khoản' : 'Mở khóa tài khoản'}
                    >
                      {c.status === 'ACTIVE' ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

