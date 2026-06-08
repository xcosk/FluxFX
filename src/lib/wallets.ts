import { prisma } from "./prisma";
import { getRates } from "./rates";

export interface WalletBalance {
  currency: string;
  amount: number;
}

export async function getUserWallets(userId: string): Promise<WalletBalance[]> {
  const wallets = await prisma.wallet.findMany({
    where: { userId, amount: { gt: 0 } },
    orderBy: { currency: "asc" },
  });
  return wallets.map((w) => ({ currency: w.currency, amount: w.amount }));
}

export async function getWalletAmount(
  userId: string,
  currency: string
): Promise<number> {
  const wallet = await prisma.wallet.findUnique({
    where: { userId_currency: { userId, currency } },
  });
  return wallet?.amount ?? 0;
}

export async function ensureWallet(userId: string, currency: string) {
  return prisma.wallet.upsert({
    where: { userId_currency: { userId, currency } },
    create: { userId, currency, amount: 0 },
    update: {},
  });
}

export async function getTotalUsdBalance(
  userId: string
): Promise<{ totalUsd: number; wallets: WalletBalance[] }> {
  const wallets = await getUserWallets(userId);
  if (wallets.length === 0) {
    return { totalUsd: 0, wallets: [] };
  }

  const rates = await getRates();
  let totalUsd = 0;

  for (const w of wallets) {
    if (w.currency === "USD") {
      totalUsd += w.amount;
    } else {
      const rate = rates.rates[w.currency];
      if (rate) totalUsd += w.amount / rate;
    }
  }

  return { totalUsd, wallets };
}

export async function transferCurrency(
  userId: string,
  fromCurrency: string,
  toCurrency: string,
  fromAmount: number,
  toAmount: number
) {
  const fromBalance = await getWalletAmount(userId, fromCurrency);
  if (fromBalance < fromAmount) {
    throw new Error("INSUFFICIENT_FUNDS");
  }

  await ensureWallet(userId, fromCurrency);
  await ensureWallet(userId, toCurrency);

  await prisma.$transaction([
    prisma.wallet.update({
      where: { userId_currency: { userId, currency: fromCurrency } },
      data: { amount: { decrement: fromAmount } },
    }),
    prisma.wallet.update({
      where: { userId_currency: { userId, currency: toCurrency } },
      data: { amount: { increment: toAmount } },
    }),
  ]);
}

export async function adjustWallet(
  userId: string,
  currency: string,
  amount: number,
  action: "deposit" | "withdraw"
) {
  await ensureWallet(userId, currency);
  const current = await getWalletAmount(userId, currency);

  if (action === "withdraw" && current < amount) {
    throw new Error("INSUFFICIENT_FUNDS");
  }

  const updated = await prisma.wallet.update({
    where: { userId_currency: { userId, currency } },
    data: {
      amount: action === "withdraw" ? { decrement: amount } : { increment: amount },
    },
  });

  return updated.amount;
}

export async function createInitialWallet(userId: string) {
  await prisma.wallet.create({
    data: { userId, currency: "USD", amount: 12500 },
  });
}
