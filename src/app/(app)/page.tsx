import Link from "next/link";
import DashboardClient from "@/components/DashboardClient";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getRates } from "@/lib/rates";
import { getTotalUsdBalance } from "@/lib/wallets";

export default async function DashboardPage() {
  const user = await getSession();
  const rates = await getRates();

  const [exchanges, favorites, balanceData] = await Promise.all([
    prisma.exchange.findMany({
      where: { userId: user!.id },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.favorite.findMany({ where: { userId: user!.id } }),
    getTotalUsdBalance(user!.id),
  ]);

  const totalVolume = exchanges.reduce((sum, e) => sum + e.fromAmount, 0);
  const eurRate = rates.rates.EUR ?? 0.92;
  const eurChange = rates.changes.EUR ?? 0;
  const jpyRate = rates.rates.JPY ?? 150;
  const gbpRate = rates.rates.GBP ?? 0.79;

  const today = new Date().toLocaleDateString("ru-RU", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <div>
      <section className="mb-10 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.25em] text-[#8e98b2]">
            {today}
          </p>
          <h1 className="mt-2 font-mono text-4xl font-bold text-[#f2f5fc] md:text-5xl">
            Привет, <span className="gradient-text">{user!.name}</span>
          </h1>
          <p className="mt-3 max-w-lg text-base text-[#8e98b2]">
            Все курсы мира, история ваших обменов и помощник — в одном
            пространстве.
          </p>
        </div>
        <Link
          href="/exchange"
          className="btn-primary flex items-center gap-2 px-6 py-3 text-sm"
        >
          Новый обмен <span>→</span>
        </Link>
      </section>

      <DashboardClient
        initialWallets={balanceData.wallets}
        totalUsd={balanceData.totalUsd}
        rates={rates.rates}
        eurRate={eurRate}
        eurChange={eurChange}
        jpyRate={jpyRate}
        gbpRate={gbpRate}
        favorites={favorites.map((f) => f.currency)}
        exchanges={exchanges}
        totalVolume={totalVolume}
        exchangeCount={exchanges.length}
      />
    </div>
  );
}
