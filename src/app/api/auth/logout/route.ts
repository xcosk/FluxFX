import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
import { clearSessionCookie } from "@/lib/auth";

export async function POST() {
  await clearSessionCookie();
  return NextResponse.json({ ok: true });
}
