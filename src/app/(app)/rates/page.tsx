export const dynamic = "force-dynamic";

import RatesClient from "@/components/RatesClient";
import { getSession } from "@/lib/auth";
import { CURRENCIES } from "@/lib/currencies";
import { prisma } from "@/lib/prisma";
import { getRates } from "@/lib/rates";

export default async function RatesPage() {
  const user = await getSession();
  const rateData = await getRates();
  const favorites = await prisma.favorite.findMany({
    where: { userId: user!.id },
  });

  return (
    <div>
      <p className="font-mono text-xs uppercase tracking-[0.25em] text-[#8e98b2]">
        Глобальные курсы
      </p>
      <h1 className="mt-2 font-mono text-4xl font-bold text-[#f2f5fc] md:text-5xl">
        Курсы <span className="gradient-text">{CURRENCIES.length}</span> валют
      </h1>

      <RatesClient
        currencies={CURRENCIES}
        rates={rateData.rates}
        changes={rateData.changes}
        favorites={favorites.map((f) => f.currency)}
        updatedAt={rateData.updatedAt}
      />
    </div>
  );
}
