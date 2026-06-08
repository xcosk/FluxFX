import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
import { getAuthErrorMessage, logApiError } from "@/lib/api-errors";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    await prisma.user.count();
    return NextResponse.json({ ok: true });
  } catch (error) {
    logApiError("health/db", error);
    return NextResponse.json(
      { ok: false, error: getAuthErrorMessage(error) },
      { status: 500 }
    );
  }
}
