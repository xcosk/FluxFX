import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const messages = await prisma.operatorMessage.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { id: true, name: true, email: true } },
    },
  });

  return NextResponse.json({ messages });
}

export async function PATCH(request: Request) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id, status, adminReply } = await request.json();

  if (!id) {
    return NextResponse.json({ error: "ID обязателен" }, { status: 400 });
  }

  const message = await prisma.operatorMessage.update({
    where: { id },
    data: {
      ...(status && { status }),
      ...(adminReply !== undefined && { adminReply }),
    },
    include: {
      user: { select: { id: true, name: true, email: true } },
    },
  });

  return NextResponse.json({ message });
}
