import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
import { requireAdmin, hashPassword } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const body = await request.json();
  const data: { blocked?: boolean; password?: string; role?: string } = {};

  if (typeof body.blocked === "boolean") {
    data.blocked = body.blocked;
  }

  if (body.password) {
    if (body.password.length < 6) {
      return NextResponse.json(
        { error: "Пароль минимум 6 символов" },
        { status: 400 }
      );
    }
    data.password = await hashPassword(body.password);
  }

  if (body.role === "ADMIN" || body.role === "USER") {
    data.role = body.role;
  }

  if (id === admin.id && body.blocked === true) {
    return NextResponse.json(
      { error: "Нельзя заблокировать себя" },
      { status: 400 }
    );
  }

  const user = await prisma.user.update({
    where: { id },
    data,
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      blocked: true,
    },
  });

  return NextResponse.json({ user });
}
