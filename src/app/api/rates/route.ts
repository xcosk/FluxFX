import { NextResponse } from "next/server";
import { getRates } from "@/lib/rates";

export async function GET() {
  try {
    const rates = await getRates();
    return NextResponse.json(rates);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch rates" },
      { status: 500 }
    );
  }
}
