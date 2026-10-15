'use client';

import React, { useState, useEffect } from 'react';
import { Headphones, CheckCircle, Clock, Send, User } from 'lucide-react';
import { formatDate } from '@/lib/utils';

export default function StaffSupportPage() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [replyTicketId, setReplyTicketId] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [ticketStatus, setTicketStatus] = useState('RESOLVED');
  const [submitting, setSubmitting] = useState(false);

  const fetchTickets = () => {
    setLoading(true);
    fetch('/api/support')
      .then((res) => res.json())
      .then((data) => {
        if (data.tickets) setTickets(data.tickets);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const handleSendReply = async (ticketId: string) => {
    if (!replyContent.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch('/api/support', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ticketId,
          staffReply: replyContent.trim(),
          status: ticketStatus,
        }),
      });
      if (res.ok) {
        setReplyTicketId(null);
        setReplyContent('');
        fetchTickets();
      }
    } catch {
      alert('Lỗi phản hồi yêu cầu hỗ trợ');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display font-black text-2xl text-ivory">
          CHĂM SÓC KHÁCH HÀNG & HỖ TRỢ
        </h1>
        <p className="text-xs text-slate-subtle mt-1">
          Tiếp nhận các thắc mắc về liều dùng thực phẩm bổ sung, giải đáp đơn hàng và xử lý khiếu nại
        </p>
      </div>

      <div className="card-luxury p-6 border-charcoal-border">
        {loading ? (
          <div className="p-8 text-center text-xs text-slate-DEFAULT">Đang tải danh sách yêu cầu...</div>
        ) : tickets.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-DEFAULT">Không có yêu cầu hỗ trợ nào đang chờ.</div>
        ) : (
          <div className="space-y-4">
            {tickets.map((t) => (
              <div key={t.id} className="p-5 rounded-xl bg-charcoal-deep border border-charcoal-border/70 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-charcoal-border/50 pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-xs text-gold">{t.ticketNumber}</span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                          t.status === 'RESOLVED'
                            ? 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10'
                            : 'border-amber-500/30 text-amber-400 bg-amber-500/10'
                        }`}
                      >
                        {t.status === 'RESOLVED' ? 'Đã phản hồi' : 'Chờ xử lý'}
                      </span>
                    </div>
                    <h3 className="font-bold text-sm text-ivory mt-1">{t.subject}</h3>
                  </div>

                  <span className="text-[11px] text-slate-DEFAULT">{formatDate(t.createdAt)}</span>
                </div>

                <div className="text-xs text-slate-DEFAULT">
                  <span className="text-slate-subtle">Khách hàng: </span>
                  <strong className="text-ivory">{t.name}</strong> • Email: {t.email} {t.phone && `• SĐT: ${t.phone}`}
                </div>

                <p className="p-3 rounded-lg bg-charcoal-card border border-charcoal-border/40 text-xs text-ivory leading-relaxed">
                  "{t.message}"
                </p>

                {t.staffReply && (
                  <div className="p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/20 text-xs">
                    <p className="font-bold text-emerald-400 mb-1 flex items-center gap-1">
                      <CheckCircle className="w-3.5 h-3.5" />
                      Phản hồi từ {t.assignedTo || 'Chuyên viên Vitacore'}:
                    </p>
                    <p className="text-slate-subtle leading-relaxed">{t.staffReply}</p>
                  </div>
                )}

                {/* Reply Form Trigger */}
                {replyTicketId === t.id ? (
                  <div className="pt-3 border-t border-charcoal-border/60 space-y-3">
                    <textarea
                      rows={3}
                      value={replyContent}
                      onChange={(e) => setReplyContent(e.target.value)}
                      placeholder="Nhập nội dung tư vấn/giải đáp cho khách..."
                      className="w-full bg-charcoal-card border border-charcoal-border rounded-xl p-3 text-xs text-ivory focus:outline-none focus:border-gold"
                    />

                    <div className="flex items-center justify-between">
                      <select
                        value={ticketStatus}
                        onChange={(e) => setTicketStatus(e.target.value)}
                        className="bg-charcoal-card border border-charcoal-border rounded-lg px-2.5 py-1.5 text-xs text-ivory"
                      >
                        <option value="RESOLVED">Đã giải quyết xong (RESOLVED)</option>
                        <option value="IN_PROGRESS">Đang xử lý (IN_PROGRESS)</option>
                      </select>

                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setReplyTicketId(null)}
                          className="px-3 py-1.5 rounded-lg bg-charcoal-card border border-charcoal-border text-xs text-slate-DEFAULT"
                        >
                          Hủy
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSendReply(t.id)}
                          disabled={submitting}
                          className="px-4 py-1.5 rounded-lg bg-gold text-charcoal font-bold text-xs flex items-center gap-1.5 shadow-glow"
                        >
                          <Send className="w-3.5 h-3.5" />
                          Gửi phản hồi
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      setReplyTicketId(t.id);
                      setReplyContent(t.staffReply || '');
                    }}
                    className="text-xs font-bold text-gold hover:underline pt-1 inline-block"
                  >
                    {t.staffReply ? 'Sửa nội dung phản hồi' : 'Trả lời khách hàng'}
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

