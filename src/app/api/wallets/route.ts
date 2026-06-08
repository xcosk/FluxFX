import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getTotalUsdBalance } from "@/lib/wallets";

export async function GET() {
  const user = await getSession();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const data = await getTotalUsdBalance(user.id);
  return NextResponse.json(data);
}
