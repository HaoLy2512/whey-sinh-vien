import React from 'react';
import Link from 'next/link';
import { ShieldCheck, RotateCcw, Truck, Lock, ChevronRight } from 'lucide-react';

export default function PoliciesPage() {
  return (
    <div className="bg-charcoal min-h-screen py-10">
      <div className="max-w-4xl mx-auto px-4 lg:px-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-slate-DEFAULT mb-8">
          <Link href="/" className="hover:text-gold transition">Trang chủ</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-ivory font-semibold">Chính sách & Cam kết dịch vụ</span>
        </div>

        <div className="text-center mb-12">
          <span className="text-gold font-bold text-xs uppercase tracking-widest">Quyền Lợi Khách Hàng</span>
          <h1 className="font-display font-black text-3xl sm:text-4xl text-ivory mt-1">
            CHÍNH SÁCH BÁN HÀNG & BẢO HÀNH
          </h1>
          <p className="text-xs text-slate-subtle mt-2 max-w-xl mx-auto">
            Cam kết minh bạch tuyệt đối về nguồn gốc xuất xứ, điều kiện đổi trả và bảo mật thông tin cá nhân tại Vitacore Supplements
          </p>
        </div>

        <div className="space-y-8 text-xs sm:text-sm text-slate-subtle leading-relaxed">
          {/* Policy 1: Cam kết chính hãng */}
          <div className="card-luxury p-6 sm:p-8 border-charcoal-border">
            <h2 className="font-display font-bold text-lg text-ivory mb-3 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-gold" />
              1. Cam Kết 100% Nhập Khẩu Chính Hãng
            </h2>
            <p className="mb-3">
              Tất cả các sản phẩm thực phẩm bổ sung dinh dưỡng thể thao (Whey Protein, Mass Gainer, Creatine, Pre-Workout, BCAA, Vitamin) phân phối tại Vitacore Supplements đều được nhập khẩu chính ngạch từ các tập đoàn dinh dưỡng hàng đầu Hoa Kỳ, Vương Quốc Anh và Châu Âu (Glanbia, Dymatize, Iovate, Applied Nutrition).
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-xs text-slate-DEFAULT">
              <li>Mỗi hộp sản phẩm đều có tem niêm phong chống hàng giả từ nhà nhập khẩu độc quyền tại Việt Nam.</li>
              <li>Có tem phụ tiếng Việt hướng dẫn sử dụng, bảng thành phần và thông tin cảnh báo rõ ràng.</li>
              <li>Hỗ trợ xuất hóa đơn giá trị gia tăng (VAT) đầy đủ theo yêu cầu của doanh nghiệp hoặc cá nhân.</li>
              <li>Cam kết hoàn tiền 200% nếu phát hiện hàng giả, hàng nhái hoặc hàng không rõ nguồn gốc xuất xứ.</li>
            </ul>
          </div>

          {/* Policy 2: Đổi trả */}
          <div className="card-luxury p-6 sm:p-8 border-charcoal-border">
            <h2 className="font-display font-bold text-lg text-ivory mb-3 flex items-center gap-2">
              <RotateCcw className="w-5 h-5 text-gold" />
              2. Chính Sách Đổi Trả & Hoàn Tiền Trong 7 Ngày
            </h2>
            <p className="mb-3">
              Khách hàng được quyền yêu cầu đổi mới sản phẩm hoặc hoàn tiền trong vòng <strong>7 ngày</strong> kể từ khi nhận hàng trong các trường hợp sau:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-xs text-slate-DEFAULT mb-3">
              <li>Sản phẩm bị móp méo, rách seal, hở nắp hoặc hư hỏng cơ học do lỗi quá trình vận chuyển.</li>
              <li>Giao sai sản phẩm, sai dung tích (lbs/kg) hoặc sai mùi vị so với đơn hàng đã đặt.</li>
              <li>Sản phẩm cận date (hạn sử dụng dưới 3 tháng mà không được thông báo trước khi mua).</li>
            </ul>
            <p className="text-xs">
              <strong>Lưu ý:</strong> Sản phẩm yêu cầu đổi trả phải còn nguyên tem cào, chưa khui seal bảo vệ miệng hũ.
            </p>
          </div>

          {/* Policy 3: Giao hàng */}
          <div className="card-luxury p-6 sm:p-8 border-charcoal-border">
            <h2 className="font-display font-bold text-lg text-ivory mb-3 flex items-center gap-2">
              <Truck className="w-5 h-5 text-gold" />
              3. Chính Sách Vận Chuyển & Phí Giao Hàng
            </h2>
            <p className="mb-3">
              Chúng tôi hợp tác với các đơn vị chuyển phát nhanh hàng đầu (Giao Hàng Tiết Kiệm, Giao Hàng Nhanh, Viettel Post) để giao kiện hàng tận tay quý khách:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-xs text-slate-DEFAULT">
              <li><strong>Nội thành TP.HCM & Hà Nội:</strong> Giao siêu tốc trong 2H - 4H hoặc nhận hàng trong ngày.</li>
              <li><strong>Các tỉnh thành khác:</strong> Thời gian giao hàng tiêu chuẩn từ 2 - 4 ngày làm việc.</li>
              <li><strong>Ưu đãi Freeship:</strong> Miễn phí 100% cước vận chuyển cho toàn bộ đơn hàng có giá trị thanh toán từ <strong>1.000.000₫</strong> trở lên.</li>
              <li>Khách hàng được quyền đồng kiểm tra hàng trước khi thanh toán tiền mặt (COD).</li>
            </ul>
          </div>

          {/* Policy 4: Bảo mật */}
          <div className="card-luxury p-6 sm:p-8 border-charcoal-border">
            <h2 className="font-display font-bold text-lg text-ivory mb-3 flex items-center gap-2">
              <Lock className="w-5 h-5 text-gold" />
              4. Bảo Mật Thông Tin Khách Hàng
            </h2>
            <p>
              Vitacore cam kết bảo mật tuyệt đối dữ liệu cá nhân của khách hàng (họ tên, số điện thoại, địa chỉ nhận hàng, lịch sử đơn hàng). Chúng tôi tuyệt đối không chia sẻ hoặc bán dữ liệu khách hàng cho bên thứ ba vì mục đích tiếp thị hoặc spam. Mọi mật khẩu tài khoản đều được mã hóa một chiều bằng thuật toán an toàn.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

