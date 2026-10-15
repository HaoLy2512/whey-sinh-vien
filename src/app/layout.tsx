import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { CartProvider } from '@/context/CartContext';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

export const metadata: Metadata = {
  title: 'VITACORE SUPPLEMENTS | Đỉnh Cao Dinh Dưỡng Thể Thao & Whey Protein Chính Hãng',
  description:
    'Hệ thống phân phối thực phẩm bổ sung, dinh dưỡng thể thao cao cấp và phụ kiện gym uy tín hàng đầu Việt Nam. Cam kết 100% nhập khẩu chính hãng, tem chống giả, date xa.',
  keywords: [
    'whey protein',
    'whey isolate',
    'creatine',
    'mass gainer',
    'pre-workout',
    'bcaa',
    'thực phẩm bổ sung',
    'vitacore supplements',
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" className="dark">
      <body className="min-h-screen flex flex-col bg-charcoal text-ivory antialiased selection:bg-gold selection:text-charcoal">
        <AuthProvider>
          <CartProvider>
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

