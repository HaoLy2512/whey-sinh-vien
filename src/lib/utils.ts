import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(date: string | Date | null | undefined): string {
  if (!date) return '-';
  const d = new Date(date);
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d);
}

export function formatShortDate(date: string | Date | null | undefined): string {
  if (!date) return '-';
  const d = new Date(date);
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(d);
}

export function slugify(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[đĐ]/g, 'd')
    .replace(/([^0-9a-z-\s])/g, '')
    .replace(/(\s+)/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function getOrderStatusBadge(status: string) {
  switch (status) {
    case 'PENDING':
      return { label: 'Chờ xử lý', color: 'bg-amber-500/10 text-amber-400 border-amber-500/30' };
    case 'CONFIRMED':
      return { label: 'Đã xác nhận', color: 'bg-blue-500/10 text-blue-400 border-blue-500/30' };
    case 'PROCESSING':
      return { label: 'Đang chuẩn bị hàng', color: 'bg-purple-500/10 text-purple-400 border-purple-500/30' };
    case 'SHIPPING':
      return { label: 'Đang giao hàng', color: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30' };
    case 'DELIVERED':
      return { label: 'Đã giao thành công', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' };
    case 'CANCELLED':
      return { label: 'Đã hủy', color: 'bg-rose-500/10 text-rose-400 border-rose-500/30' };
    case 'RETURNED':
      return { label: 'Đổi trả / Hoàn hàng', color: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/30' };
    default:
      return { label: status, color: 'bg-zinc-800 text-zinc-300 border-zinc-700' };
  }
}

export function getPaymentStatusBadge(status: string) {
  switch (status) {
    case 'PAID':
      return { label: 'Đã thanh toán', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' };
    case 'PENDING':
      return { label: 'Chưa thanh toán', color: 'bg-amber-500/10 text-amber-400 border-amber-500/30' };
    case 'FAILED':
      return { label: 'Thất bại', color: 'bg-rose-500/10 text-rose-400 border-rose-500/30' };
    case 'REFUNDED':
      return { label: 'Đã hoàn tiền', color: 'bg-purple-500/10 text-purple-400 border-purple-500/30' };
    default:
      return { label: status, color: 'bg-zinc-800 text-zinc-300 border-zinc-700' };
  }
}

