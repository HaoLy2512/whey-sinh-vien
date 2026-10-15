import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import prisma from './prisma';

const JWT_SECRET = process.env.JWT_SECRET || 'vitacore-fallback-jwt-secret-key-2026';

export interface TokenPayload {
  userId: string;
  email: string;
  role: 'USER' | 'STAFF' | 'ADMIN';
  fullName: string;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function signToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch {
    return null;
  }
}

export async function getSessionUser(): Promise<TokenPayload | null> {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get('vitacore_token')?.value;
    if (!token) return null;
    return verifyToken(token);
  } catch {
    return null;
  }
}

export async function getUserWithPermissions(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      fullName: true,
      role: true,
      status: true,
      avatarUrl: true,
      phone: true,
    },
  });

  if (!user || user.status !== 'ACTIVE') return null;

  // If Admin, has all permissions
  if (user.role === 'ADMIN') {
    return {
      ...user,
      permissions: ['*'],
    };
  }

  // Get permissions assigned to role
  const role = await prisma.role.findUnique({
    where: { name: user.role },
    include: {
      rolePermissions: {
        include: {
          permission: true,
        },
      },
    },
  });

  const permissions = role?.rolePermissions.map((rp) => rp.permission.code) || [];

  return {
    ...user,
    permissions,
  };
}

export async function checkAuthFromRequest(request: Request): Promise<TokenPayload | null> {
  // Check Authorization Bearer header
  const authHeader = request.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    return verifyToken(token);
  }

  // Check Cookie header
  const cookieHeader = request.headers.get('cookie') || '';
  const match = cookieHeader.match(/vitacore_token=([^;]+)/);
  if (match) {
    return verifyToken(match[1]);
  }

  return null;
}

