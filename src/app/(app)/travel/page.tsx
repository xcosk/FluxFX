import TravelClient from "@/components/TravelClient";
import { getRates } from "@/lib/rates";

export default async function TravelPage() {
  const rateData = await getRates();

  return (
    <div>
      <p className="font-mono text-xs uppercase tracking-[0.25em] text-[#8e98b2]">
        Travel calculator
      </p>
      <h1 className="mt-2 font-mono text-4xl font-bold text-[#f2f5fc] md:text-5xl">
        Бюджет <span className="gradient-text">поездки</span>
      </h1>
      <p className="mt-3 max-w-lg text-base text-[#8e98b2]">
        Сколько денег брать с собой? Прикинем по городам мира с реальными
        ценами.
      </p>

      <TravelClient rates={rateData.rates} />
    </div>
  );
}
