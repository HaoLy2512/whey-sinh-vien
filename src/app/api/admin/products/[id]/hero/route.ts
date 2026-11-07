import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };
const prisma = globalForPrisma.prisma ?? new PrismaClient();
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

async function getAdmin(req: Request) {
  const secret = process.env.JWT_SECRET;
  if (!secret) return null;

  const tokens: string[] = [];
  const auth = req.headers.get("authorization");
  if (auth?.startsWith("Bearer ")) tokens.push(auth.slice(7));
  for (const c of cookies().getAll()) tokens.push(c.value);

  for (const t of tokens) {
    try {
      const payload = jwt.verify(t, secret) as Record<string, unknown>;
      const id = (payload.id ?? payload.userId ?? payload.sub) as string | undefined;
      const email = payload.email as string | undefined;
      const user = id
        ? await prisma.user.findUnique({ where: { id } })
        : email
        ? await prisma.user.findUnique({ where: { email } })
        : null;
      if (user && user.role === "ADMIN" && user.status === "ACTIVE") return user;
    } catch {
      // không phải token hợp lệ, thử cookie kế tiếp
    }
  }
  return null;
}

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  const admin = await getAdmin(req);
  if (!admin) {
    return NextResponse.json({ error: "Không có quyền" }, { status: 403 });
  }

  const body = await req.json().catch(() => ({}));
  const unpin = body.action === "unpin";

  const product = await prisma.product.findUnique({ where: { id: params.id } });
  if (!product || product.deletedAt) {
    return NextResponse.json({ error: "Không tìm thấy sản phẩm" }, { status: 404 });
  }

  if (unpin) {
    await prisma.product.update({
      where: { id: params.id },
      data: { isHero: false, pinnedAt: null },
    });
  } else {
    await prisma.$transaction([
      prisma.product.updateMany({ where: { isHero: true }, data: { isHero: false } }),
      prisma.product.update({
        where: { id: params.id },
        data: { isHero: true, isActive: true, pinnedAt: new Date() },
      }),
    ]);
  }

  await prisma.auditLog.create({
    data: {
      userId: admin.id,
      userEmail: admin.email,
      userRole: admin.role,
      action: "UPDATE",
      entity: "PRODUCT",
      entityId: params.id,
      details: JSON.stringify({ hero: !unpin }),
    },
  });

  revalidatePath("/");
  return NextResponse.json({ ok: true });
}