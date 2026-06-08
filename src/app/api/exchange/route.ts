import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { convert, getRates } from "@/lib/rates";
import { getUserWallets, getWalletAmount } from "@/lib/wallets";

export async function POST(request: Request) {
  const user = await getSession();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { fromCurrency, toCurrency, fromAmount } = await request.json();

    if (!fromCurrency || !toCurrency || !fromAmount || fromAmount <= 0) {
      return NextResponse.json({ error: "Некорректные данные" }, { status: 400 });
    }

    if (fromCurrency === toCurrency) {
      return NextResponse.json(
        { error: "Выберите разные валюты" },
        { status: 400 }
      );
    }

    const rates = await getRates();
    const toAmount = convert(fromAmount, fromCurrency, toCurrency, rates.rates);
    const rate = convert(1, fromCurrency, toCurrency, rates.rates);

    const fromBalance = await getWalletAmount(user.id, fromCurrency);
    if (fromBalance < fromAmount) {
      return NextResponse.json(
        {
          error: `Недостаточно ${fromCurrency} на балансе (доступно: ${fromBalance.toFixed(2)})`,
        },
        { status: 400 }
      );
    }

    await prisma.$transaction(async (tx) => {
      await tx.exchange.create({
        data: {
          userId: user.id,
          fromCurrency,
          toCurrency,
          fromAmount,
          toAmount,
          rate,
        },
      });

      await tx.wallet.upsert({
        where: { userId_currency: { userId: user.id, currency: fromCurrency } },
        create: { userId: user.id, currency: fromCurrency, amount: 0 },
        update: {},
      });
      await tx.wallet.upsert({
        where: { userId_currency: { userId: user.id, currency: toCurrency } },
        create: { userId: user.id, currency: toCurrency, amount: 0 },
        update: {},
      });

      await tx.wallet.update({
        where: { userId_currency: { userId: user.id, currency: fromCurrency } },
        data: { amount: { decrement: fromAmount } },
      });
      await tx.wallet.update({
        where: { userId_currency: { userId: user.id, currency: toCurrency } },
        data: { amount: { increment: toAmount } },
      });
    });

    const wallets = await getUserWallets(user.id);

    return NextResponse.json({ wallets, toAmount, rate });
  } catch {
    return NextResponse.json({ error: "Ошибка обмена" }, { status: 500 });
  }
}

export async function GET() {
  const user = await getSession();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const exchanges = await prisma.exchange.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  return NextResponse.json({ exchanges });
}
