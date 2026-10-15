import { NextResponse } from 'next/server';

export async function POST() {
  const response = NextResponse.json({ success: true, message: 'Đã đăng xuất' });
  response.cookies.delete('vitacore_token');
  return response;
}

