import ExchangeClient from "@/components/ExchangeClient";
import { CURRENCIES } from "@/lib/currencies";
import { getRates } from "@/lib/rates";

export default async function ExchangePage() {
  const rateData = await getRates();

  return (
    <div>
      <p className="font-mono text-xs uppercase tracking-[0.25em] text-[#8e98b2]">
        Конвертер
      </p>
      <h1 className="mt-2 font-mono text-4xl font-bold text-[#f2f5fc] md:text-5xl">
        Обмен <span className="gradient-text">валют</span>
      </h1>

      <ExchangeClient
        currencies={CURRENCIES}
        rates={rateData.rates}
        changes={rateData.changes}
      />
    </div>
  );
}
