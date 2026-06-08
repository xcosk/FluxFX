import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
import { getSession } from "@/lib/auth";
import {
  adjustWallet,
  getUserWallets,
  getWalletAmount,
} from "@/lib/wallets";

export async function GET() {
  const user = await getSession();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const wallets = await getUserWallets(user.id);
  return NextResponse.json({ wallets });
}

export async function POST(request: Request) {
  const user = await getSession();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { amount, action, currency = "USD" } = await request.json();

  if (!amount || amount <= 0) {
    return NextResponse.json({ error: "Некорректная сумма" }, { status: 400 });
  }

  try {
    const newAmount = await adjustWallet(user.id, currency, amount, action);
    const wallets = await getUserWallets(user.id);
    return NextResponse.json({ amount: newAmount, wallets });
  } catch (e) {
    if (e instanceof Error && e.message === "INSUFFICIENT_FUNDS") {
      const current = await getWalletAmount(user.id, currency);
      return NextResponse.json(
        { error: `Недостаточно ${currency} (доступно: ${current.toFixed(2)})` },
        { status: 400 }
      );
    }
    return NextResponse.json({ error: "Ошибка операции" }, { status: 500 });
  }
}
