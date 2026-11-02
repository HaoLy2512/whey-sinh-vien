import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { checkAuthFromRequest } from '@/lib/auth';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

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

    // Supported extensions & MIME types
    const validExts = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg', '.avif'];
    const validMimes = [
      'image/jpeg',
      'image/jpg',
      'image/pjpeg',
      'image/png',
      'image/x-png',
      'image/webp',
      'image/svg+xml',
      'image/gif',
      'image/avif',
    ];

    const ext = path.extname(file.name).toLowerCase();
    const isMimeValid = file.type ? validMimes.includes(file.type.toLowerCase()) : false;
    const isExtValid = validExts.includes(ext);

    if (!isMimeValid && !isExtValid) {
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

    // Sanitize filename and remove Vietnamese diacritics
    const originalExt = ext || (file.type ? `.${file.type.split('/')[1]}` : '.png');
    const baseName = path.basename(file.name, originalExt)
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/Đ/g, 'd')
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '') || 'image';

    const uniqueFileName = `${Date.now()}-${baseName}${originalExt}`;

    // 1. Save to local filesystem
    try {
      const uploadDir = path.join(process.cwd(), 'public', 'uploads');
      await mkdir(uploadDir, { recursive: true });
      const filePath = path.join(uploadDir, uniqueFileName);
      await writeFile(filePath, buffer);
    } catch (fsErr) {
      console.warn('Filesystem write warning:', fsErr);
    }

    // 2. Save to database for high availability & survival across container restarts
    const mimeType = file.type || (originalExt === '.png' ? 'image/png' : 'image/jpeg');
    try {
      await prisma.uploadedFile.upsert({
        where: { filename: uniqueFileName },
        create: {
          filename: uniqueFileName,
          mimeType,
          data: buffer,
          size: file.size,
        },
        update: {
          mimeType,
          data: buffer,
          size: file.size,
        },
      });
    } catch (dbErr) {
      console.error('Database write error for uploaded file:', dbErr);
    }

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
