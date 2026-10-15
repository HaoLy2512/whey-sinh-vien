import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { checkAuthFromRequest } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const authSession = await checkAuthFromRequest(request);
    if (!authSession || (authSession.role !== 'ADMIN' && authSession.role !== 'STAFF')) {
      return NextResponse.json({ message: 'Bạn không có quyền tải ảnh lên hệ thống' }, { status: 403 });
    }

    const data = await request.formData();
    const file: File | null = data.get('file') as unknown as File;

    if (!file) {
      return NextResponse.json({ message: 'Vui lòng chọn file hình ảnh' }, { status: 400 });
    }

    // Validate MIME type
    const validMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml', 'image/gif'];
    if (!validMimes.includes(file.type)) {
      return NextResponse.json(
        { message: 'Định dạng file không hỗ trợ. Vui lòng chọn ảnh JPG, PNG, WEBP, SVG hoặc GIF' },
        { status: 400 }
      );
    }

    // Limit size to 10MB
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json({ message: 'Dung lượng file tối đa là 10MB' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Sanitize filename and append timestamp
    const cleanFileName = file.name
      .toLowerCase()
      .replace(/[^a-z0-9.]/g, '-')
      .replace(/-+/g, '-');
    const uniqueFileName = `${Date.now()}-${cleanFileName}`;

    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    await mkdir(uploadDir, { recursive: true });

    const filePath = path.join(uploadDir, uniqueFileName);
    await writeFile(filePath, buffer);

    const publicUrl = `/uploads/${uniqueFileName}`;

    return NextResponse.json({
      success: true,
      url: publicUrl,
      fileName: uniqueFileName,
      size: file.size,
      message: 'Tải ảnh lên thành công',
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ message: 'Lỗi trong quá trình lưu trữ file' }, { status: 500 });
  }
}

