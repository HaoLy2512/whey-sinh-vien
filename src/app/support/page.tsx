'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Headphones, Mail, Phone, MapPin, Send, CheckCircle2, ChevronRight, HelpCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const FAQS = [
  {
    q: 'Người mới tập gym nên chọn dòng Whey Protein nào?',
    a: 'Đối với người mới bắt đầu tập luyện, dòng Whey Protein Blend kết hợp Isolate & Concentrate (như Gold Standard 100% Whey) là sự lựa chọn kinh tế và toàn diện nhất. Nếu bạn có tiền sử đau bụng hoặc bất dung nạp Lactose khi uống sữa tươi, hãy ưu tiên các dòng 100% Whey Isolate hoặc Hydrolyzed như Dymatize ISO100.',
  },
  {
    q: 'Uống Creatine có gây hại thận hay tích mỡ không?',
    a: 'Creatine là thực phẩm bổ sung được chứng minh lâm sàng an toàn tuyệt đối cho người khỏe mạnh. Creatine chỉ giữ nước bên trong tế bào cơ bắp (Intracellular water) giúp tăng lực nâng và phồng cơ, hoàn toàn không gây tích mỡ hay tích nước dưới da. Chỉ cần đảm bảo uống đủ 2.5 - 3 lít nước mỗi ngày.',
  },
  {
    q: 'Bao lâu thì nhận được hàng sau khi đặt?',
    a: 'Đối với khu vực nội thành TP.HCM và Hà Nội, đơn hàng sẽ được giao trong 2H - 4H hoặc trong ngày. Đối với các tỉnh thành khác trên toàn quốc, thời gian giao hàng qua bưu cục chuyển phát nhanh từ 2 - 4 ngày.',
  },
];

export default function SupportPage() {
  const { user } = useAuth();

  const [name, setName] = useState(user?.fullName || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [priority, setPriority] = useState('MEDIUM');
  const [submitting, setSubmitting] = useState(false);
  const [successTicket, setSuccessTicket] = useState<any>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const res = await fetch('/api/support', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, phone, subject, message, priority }),
      });
      const data = await res.json();
      if (res.ok) {
        setSuccessTicket(data.ticket);
        setSubject('');
        setMessage('');
      } else {
        alert(data.message || 'Lỗi gửi yêu cầu hỗ trợ');
      }
    } catch {
      alert('Lỗi kết nối máy chủ');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-charcoal min-h-screen py-10">
      <div className="max-w-6xl mx-auto px-4 lg:px-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-slate-DEFAULT mb-8">
          <Link href="/" className="hover:text-gold transition">Trang chủ</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-ivory font-semibold">Tư vấn dinh dưỡng & Hỗ trợ</span>
        </div>

        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-gold font-bold text-xs uppercase tracking-widest">Hỗ Trợ Khách Hàng 24/7</span>
          <h1 className="font-display font-black text-3xl sm:text-4xl text-ivory mt-1">
            TRUNG TÂM TƯ VẤN & HỖ TRỢ
          </h1>
          <p className="text-xs text-slate-subtle mt-2">
            Đội ngũ chuyên viên dinh dưỡng thể thao và chăm sóc khách hàng của Vitacore luôn sẵn sàng hỗ trợ bạn
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-16">
          {/* Contact Info Channels */}
          <div className="lg:col-span-5 space-y-4">
            <div className="card-luxury p-6 border-charcoal-border space-y-4">
              <h3 className="font-display font-bold text-base text-ivory mb-2">Thông Tin Liên Hệ Trực Tiếp</h3>

              <div className="flex items-start gap-3 text-xs">
                <div className="w-9 h-9 rounded-lg bg-gold/10 text-gold flex items-center justify-center flex-shrink-0">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <strong className="text-ivory block">Hotline Tư Vấn Bán Hàng:</strong>
                  <a href="tel:19008899" className="text-gold font-bold hover:underline text-sm">1900 8899</a>
                  <p className="text-[11px] text-slate-DEFAULT">Hỗ trợ từ 8h00 - 22h00 tất cả các ngày trong tuần</p>
                </div>
              </div>

              <div className="flex items-start gap-3 text-xs">
                <div className="w-9 h-9 rounded-lg bg-gold/10 text-gold flex items-center justify-center flex-shrink-0">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <strong className="text-ivory block">Email Chăm Sóc Khách Hàng:</strong>
                  <a href="mailto:support@vitacore.vn" className="text-gold font-semibold hover:underline">support@vitacore.vn</a>
                  <p className="text-[11px] text-slate-DEFAULT">Phản hồi giải đáp trong vòng 2 - 4 giờ làm việc</p>
                </div>
              </div>

              <div className="flex items-start gap-3 text-xs">
                <div className="w-9 h-9 rounded-lg bg-gold/10 text-gold flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <strong className="text-ivory block">Showroom & Trung Tâm Vận Hành:</strong>
                  <p className="text-slate-subtle">123 Võ Văn Tần, Phường 6, Quận 3, TP. Hồ Chí Minh</p>
                </div>
              </div>
            </div>

            {/* Guarantees Box */}
            <div className="card-luxury p-6 border-emerald-500/30 bg-emerald-500/5 text-xs text-slate-subtle space-y-2">
              <h4 className="font-bold text-emerald-400 text-sm">Cam Kết Phục Vụ</h4>
              <p>• Mọi thắc mắc về liều dùng thực phẩm bổ sung đều được cố vấn bởi HLV có chứng chỉ quốc tế.</p>
              <p>• Xử lý đổi trả và khiếu nại đơn hàng minh bạch, bảo vệ 100% quyền lợi người tiêu dùng.</p>
            </div>
          </div>

          {/* Ticket Submission Form */}
          <div className="lg:col-span-7 card-luxury p-6 sm:p-8 border-charcoal-border">
            <h3 className="font-display font-bold text-base text-ivory mb-2">Gửi Yêu Cầu Hỗ Trợ Trực Tuyến</h3>
            <p className="text-xs text-slate-subtle mb-6">
              Điền thông tin của bạn vào biểu mẫu bên dưới. Hệ thống sẽ tạo mã ticket hỗ trợ tự động:
            </p>

            {successTicket ? (
              <div className="p-6 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 space-y-3">
                <div className="flex items-center gap-2 font-bold text-sm">
                  <CheckCircle2 className="w-5 h-5" />
                  <span>Yêu cầu hỗ trợ đã được gửi thành công!</span>
                </div>
                <p className="text-xs text-slate-subtle">
                  Mã tra cứu yêu cầu: <strong className="text-gold font-mono">{successTicket.ticketNumber}</strong>. Chuyên viên chăm sóc khách hàng của Vitacore sẽ phản hồi qua email hoặc số điện thoại trong thời gian sớm nhất.
                </p>
                <button
                  onClick={() => setSuccessTicket(null)}
                  className="px-4 py-2 rounded-lg bg-gold text-charcoal font-bold text-xs"
                >
                  Gửi thêm yêu cầu khác
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-subtle mb-1 font-semibold">Họ và tên *</label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-charcoal-deep border border-charcoal-border rounded-xl p-3 text-ivory focus:outline-none focus:border-gold"
                      placeholder="Nguyễn Văn A"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-subtle mb-1 font-semibold">Số điện thoại</label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full bg-charcoal-deep border border-charcoal-border rounded-xl p-3 text-ivory focus:outline-none focus:border-gold"
                      placeholder="0909 123 456"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-subtle mb-1 font-semibold">Địa chỉ Email *</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-charcoal-deep border border-charcoal-border rounded-xl p-3 text-ivory focus:outline-none focus:border-gold"
                    placeholder="email@example.com"
                  />
                </div>

                <div>
                  <label className="block text-slate-subtle mb-1 font-semibold">Tiêu đề cần hỗ trợ *</label>
                  <input
                    type="text"
                    required
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="VD: Cần tư vấn combo tăng cơ giảm mỡ cho người gầy"
                    className="w-full bg-charcoal-deep border border-charcoal-border rounded-xl p-3 text-ivory focus:outline-none focus:border-gold"
                  />
                </div>

                <div>
                  <label className="block text-slate-subtle mb-1 font-semibold">Nội dung chi tiết *</label>
                  <textarea
                    required
                    rows={4}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Mô tả cụ thể mục tiêu tập luyện, chiều cao, cân nặng hoặc mã đơn hàng cần hỗ trợ..."
                    className="w-full bg-charcoal-deep border border-charcoal-border rounded-xl p-3 text-ivory focus:outline-none focus:border-gold leading-relaxed"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="px-8 py-3.5 rounded-xl font-display font-bold text-xs uppercase tracking-wider bg-gold hover:bg-gold-light text-charcoal transition shadow-glow flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  {submitting ? 'Đang gửi yêu cầu...' : 'Gửi yêu cầu hỗ trợ'}
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Frequently Asked Questions */}
        <div className="card-luxury p-6 sm:p-8 border-charcoal-border">
          <h2 className="font-display font-bold text-lg text-ivory mb-6 flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-gold" />
            Câu Hỏi Thường Gặp (FAQ)
          </h2>

          <div className="space-y-4">
            {FAQS.map((faq, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-charcoal-deep border border-charcoal-border/60">
                <h4 className="font-bold text-sm text-ivory mb-1.5">{faq.q}</h4>
                <p className="text-xs text-slate-subtle leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

