import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

function getMimeType(filename: string): string {
  const ext = path.extname(filename).toLowerCase();
  switch (ext) {
    case '.jpg':
    case '.jpeg':
      return 'image/jpeg';
    case '.png':
      return 'image/png';
    case '.webp':
      return 'image/webp';
    case '.gif':
      return 'image/gif';
    case '.svg':
      return 'image/svg+xml';
    case '.avif':
      return 'image/avif';
    case '.ico':
      return 'image/x-icon';
    default:
      return 'application/octet-stream';
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  try {
    if (!params.path || params.path.length === 0) {
      return new NextResponse('File not found', { status: 404 });
    }

    const rawPath = params.path.join('/');
    const cleanFileName = path.normalize(rawPath).replace(/^(\.\.[\/\\])+/, '');
    
    if (cleanFileName.includes('..')) {
      return new NextResponse('Invalid path', { status: 400 });
    }

    const localUploadsDir = path.join(process.cwd(), 'public', 'uploads');
    const fullFilePath = path.join(localUploadsDir, cleanFileName);

    if (fs.existsSync(fullFilePath)) {
      try {
        const fileBuffer = fs.readFileSync(fullFilePath);
        const mimeType = getMimeType(cleanFileName);
        return new NextResponse(fileBuffer, {
          status: 200,
          headers: {
            'Content-Type': mimeType,
            'Cache-Control': 'public, max-age=31536000, immutable',
            'Content-Disposition': 'inline',
          },
        });
      } catch (readErr) {
        console.error('Error reading file from disk:', readErr);
      }
    }

    const dbFile = await prisma.uploadedFile.findUnique({
      where: { filename: cleanFileName },
    });

    if (dbFile && dbFile.data) {
      try {
        if (!fs.existsSync(localUploadsDir)) {
          fs.mkdirSync(localUploadsDir, { recursive: true });
        }
        fs.writeFileSync(fullFilePath, Buffer.from(dbFile.data));
      } catch (cacheErr) {
        console.warn('Could not cache file to disk:', cacheErr);
      }

      return new NextResponse(Buffer.from(dbFile.data), {
        status: 200,
        headers: {
          'Content-Type': dbFile.mimeType || getMimeType(cleanFileName),
          'Cache-Control': 'public, max-age=31536000, immutable',
          'Content-Disposition': 'inline',
        },
      });
    }

    return new NextResponse('Image not found', { status: 404 });
  } catch (error) {
    console.error('Error serving upload:', error);
    return new NextResponse('Internal server error', { status: 500 });
  }
}

