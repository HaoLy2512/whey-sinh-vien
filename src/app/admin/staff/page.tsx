'use client';

import React, { useState, useEffect } from 'react';
import { ShieldCheck, Plus, UserCheck, Lock, Unlock, AlertCircle } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';

export default function AdminStaffPage() {
  const { user } = useAuth();
  const [staffList, setStaffList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  // Form
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<'STAFF' | 'ADMIN'>('STAFF');
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const fetchStaff = () => {
    setLoading(true);
    fetch('/api/staff')
      .then((res) => res.json())
      .then((data) => {
        if (data.staff) setStaffList(data.staff);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const handleToggleStatus = async (staffId: string, currentStatus: string) => {
    if (staffId === user?.id) {
      alert('Không thể tự khóa tài khoản của chính mình');
      return;
    }

    const newStatus = currentStatus === 'ACTIVE' ? 'LOCKED' : 'ACTIVE';
    try {
      const res = await fetch('/api/staff', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ staffId, status: newStatus }),
      });
      if (res.ok) {
        fetchStaff();
      } else {
        const d = await res.json();
        alert(d.message || 'Lỗi cập nhật trạng thái');
      }
    } catch {
      alert('Lỗi kết nối máy chủ');
    }
  };

  const handleCreateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSubmitting(true);

    try {
      const res = await fetch('/api/staff', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, fullName, phone, role }),
      });

      const data = await res.json();
      if (res.ok) {
        setModalOpen(false);
        setEmail('');
        setPassword('');
        setFullName('');
        setPhone('');
        fetchStaff();
      } else {
        setErrorMessage(data.message || 'Lỗi khi tạo tài khoản');
      }
    } catch {
      setErrorMessage('Lỗi kết nối máy chủ');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-black text-2xl text-ivory">
            QUẢN LÝ NHÂN VIÊN & PHÂN QUYỀN (RBAC)
          </h1>
          <p className="text-xs text-slate-subtle mt-1">
            Tạo tài khoản nhân viên vận hành, quản trị viên và kiểm soát trạng thái hoạt động
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="px-5 py-2.5 rounded-xl bg-gold text-charcoal font-bold text-xs hover:bg-gold-light transition shadow-glow flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          Thêm Nhân Viên Mới
        </button>
      </div>

      <div className="card-luxury overflow-hidden border-charcoal-border">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-DEFAULT">Đang tải danh sách nhân viên...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-charcoal-deep text-slate-subtle uppercase text-[10px] tracking-wider border-b border-charcoal-border">
                <tr>
                  <th className="p-3.5">Họ và Tên</th>
                  <th className="p-3.5">Email</th>
                  <th className="p-3.5">Số Điện Thoại</th>
                  <th className="p-3.5">Vai Trò (Role)</th>
                  <th className="p-3.5">Trạng Thái</th>
                  <th className="p-3.5">Ngày Khởi Tạo</th>
                  <th className="p-3.5 text-right">Khóa / Mở Khóa</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-charcoal-border/60 text-ivory">
                {staffList.map((s) => (
                  <tr key={s.id} className="hover:bg-charcoal-hover transition">
                    <td className="p-3.5 font-bold text-ivory">{s.fullName}</td>
                    <td className="p-3.5 font-mono text-slate-DEFAULT">{s.email}</td>
                    <td className="p-3.5 text-slate-DEFAULT">{s.phone || '-'}</td>
                    <td className="p-3.5">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                          s.role === 'ADMIN'
                            ? 'border-gold/40 text-gold bg-gold/10'
                            : 'border-blue-400/40 text-blue-400 bg-blue-500/10'
                        }`}
                      >
                        {s.role}
                      </span>
                    </td>
                    <td className="p-3.5">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          s.status === 'ACTIVE'
                            ? 'text-emerald-400 bg-emerald-500/10'
                            : 'text-rose-400 bg-rose-500/10'
                        }`}
                      >
                        {s.status === 'ACTIVE' ? 'Đang hoạt động' : 'Đã khóa'}
                      </span>
                    </td>
                    <td className="p-3.5 text-slate-DEFAULT font-mono">{formatDate(s.createdAt)}</td>
                    <td className="p-3.5 text-right">
                      {s.id !== user?.id && (
                        <button
                          onClick={() => handleToggleStatus(s.id, s.status)}
                          className={`p-1.5 rounded transition ${
                            s.status === 'ACTIVE'
                              ? 'bg-rose-500/10 text-rose-400 hover:bg-rose-500/20'
                              : 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
                          }`}
                          title={s.status === 'ACTIVE' ? 'Khóa tài khoản' : 'Mở khóa tài khoản'}
                        >
                          {s.status === 'ACTIVE' ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal create staff */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-charcoal-card border border-charcoal-border rounded-2xl p-6 shadow-2xl">
            <h3 className="font-display font-bold text-base text-ivory mb-1">
              Thêm Tài Khoản Nhân Viên / Quản Trị
            </h3>
            <p className="text-xs text-slate-subtle mb-4">
              Mật khẩu sẽ được băm bằng thuật toán bcrypt an toàn trước khi lưu vào cơ sở dữ liệu.
            </p>

            {errorMessage && (
              <div className="p-3 mb-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs">
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleCreateStaff} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-subtle mb-1 font-semibold">Họ và tên *</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-charcoal-deep border border-charcoal-border rounded-xl p-3 text-ivory focus:outline-none focus:border-gold"
                  placeholder="Lê Văn Nhân Viên"
                />
              </div>

              <div>
                <label className="block text-slate-subtle mb-1 font-semibold">Địa chỉ Email đăng nhập *</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-charcoal-deep border border-charcoal-border rounded-xl p-3 text-ivory focus:outline-none focus:border-gold"
                  placeholder="staff2@vitacore.vn"
                />
              </div>

              <div>
                <label className="block text-slate-subtle mb-1 font-semibold">Mật khẩu khởi tạo *</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-charcoal-deep border border-charcoal-border rounded-xl p-3 text-ivory focus:outline-none focus:border-gold font-mono"
                  placeholder="Tối thiểu 6 ký tự"
                />
              </div>

              <div>
                <label className="block text-slate-subtle mb-1 font-semibold">Số điện thoại</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-charcoal-deep border border-charcoal-border rounded-xl p-3 text-ivory focus:outline-none focus:border-gold"
                  placeholder="0901 889 903"
                />
              </div>

              <div>
                <label className="block text-slate-subtle mb-1 font-semibold">Phân quyền vai trò (Role):</label>
                <select
                  value={role}
                  onChange={(e: any) => setRole(e.target.value)}
                  className="w-full bg-charcoal-deep border border-charcoal-border rounded-xl p-3 text-ivory focus:outline-none focus:border-gold"
                >
                  <option value="STAFF">STAFF - Nhân viên vận hành & kho</option>
                  <option value="ADMIN">ADMIN - Quản trị viên toàn hệ thống</option>
                </select>
              </div>

              <div className="flex gap-3 justify-end pt-3 border-t border-charcoal-border">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-charcoal-deep border border-charcoal-border text-slate-DEFAULT hover:text-ivory"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-gold text-charcoal font-bold hover:bg-gold-light shadow-glow disabled:opacity-50"
                >
                  {submitting ? 'Đang tạo...' : 'Tạo tài khoản'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

