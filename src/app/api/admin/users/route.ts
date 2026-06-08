import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getTotalUsdBalance } from "@/lib/wallets";

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      blocked: true,
      createdAt: true,
      _count: { select: { exchanges: true, operatorMessages: true } },
    },
  });

  const usersWithBalance = await Promise.all(
    users.map(async (u) => {
      const { totalUsd, wallets } = await getTotalUsdBalance(u.id);
      return { ...u, totalUsd, wallets };
    })
  );

  return NextResponse.json({ users: usersWithBalance });
}
