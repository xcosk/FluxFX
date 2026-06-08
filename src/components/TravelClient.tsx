"use client";

import { useState } from "react";
import { TRAVEL_CITIES, formatMoney } from "@/lib/currencies";

interface TravelClientProps {
  rates: Record<string, number>;
}

export default function TravelClient({ rates }: TravelClientProps) {
  const [selected, setSelected] = useState(TRAVEL_CITIES[0]);
  const [days, setDays] = useState(7);
  const [budget, setBudget] = useState<"economy" | "standard" | "luxury">(
    "standard"
  );

  const multipliers = { economy: 0.7, standard: 1, luxury: 1.8 };
  const dailyLocal = selected.dailyBudget * multipliers[budget];
  const totalLocal = dailyLocal * days;
  const rate = rates[selected.currency] ?? 1;
  const totalUsd =
    selected.currency === "USD" ? totalLocal : totalLocal / rate;

  return (
    <div className="mt-8">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {TRAVEL_CITIES.map((city) => (
          <button
            key={city.id}
            onClick={() => setSelected(city)}
            className={`card relative overflow-hidden p-5 text-left transition ${
              selected.id === city.id
                ? "border-[#6e6dff] ring-1 ring-[#6e6dff]"
                : "hover:border-[rgba(110,109,255,0.3)]"
            }`}
          >
            <span className="text-3xl">{city.flag}</span>
            <p className="mt-3 font-mono text-lg font-bold text-[#f2f5fc]">
              {city.name}
            </p>
            <p className="text-sm text-[#8e98b2]">
              {city.country} · {city.currency}
            </p>
          </button>
        ))}
      </div>

      <div className="card mt-8 p-6">
        <h2 className="font-mono text-xl font-bold text-[#f2f5fc]">
          {selected.flag} {selected.name}
        </h2>

        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <div>
            <label className="text-xs uppercase tracking-widest text-[#8e98b2]">
              Количество дней
            </label>
            <input
              type="range"
              min={1}
              max={30}
              value={days}
              onChange={(e) => setDays(parseInt(e.target.value))}
              className="mt-2 w-full accent-[#6e6dff]"
            />
            <p className="mt-1 font-mono text-2xl text-[#f2f5fc]">{days} дней</p>
          </div>

          <div>
            <label className="text-xs uppercase tracking-widest text-[#8e98b2]">
              Уровень комфорта
            </label>
            <div className="mt-2 flex gap-2">
              {(["economy", "standard", "luxury"] as const).map((level) => (
                <button
                  key={level}
                  onClick={() => setBudget(level)}
                  className={`rounded-full px-4 py-2 text-sm transition ${
                    budget === level
                      ? "bg-gradient-to-r from-[#5b56ed] to-[#b085ff] text-white"
                      : "border border-[rgba(41,41,75,0.5)] text-[#8e98b2]"
                  }`}
                >
                  {level === "economy"
                    ? "Эконом"
                    : level === "standard"
                      ? "Стандарт"
                      : "Люкс"}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <div className="rounded-[18px] border border-[rgba(41,41,75,0.5)] bg-[rgba(15,14,39,0.6)] p-4">
            <p className="text-xs uppercase tracking-widest text-[#8e98b2]">
              В день
            </p>
            <p className="mt-2 font-mono text-xl text-[#f2f5fc]">
              {dailyLocal.toLocaleString()} {selected.currency}
            </p>
            <p className="text-sm text-[#8e98b2]">
              ≈ {formatMoney(selected.currency === "USD" ? dailyLocal : dailyLocal / rate)}
            </p>
          </div>
          <div className="rounded-[18px] border border-[rgba(41,41,75,0.5)] bg-[rgba(15,14,39,0.6)] p-4">
            <p className="text-xs uppercase tracking-widest text-[#8e98b2]">
              Всего
            </p>
            <p className="mt-2 font-mono text-xl text-[#f2f5fc]">
              {totalLocal.toLocaleString()} {selected.currency}
            </p>
          </div>
          <div className="rounded-[18px] border border-[rgba(41,41,75,0.5)] bg-[rgba(15,14,39,0.6)] p-4">
            <p className="text-xs uppercase tracking-widest text-[#8e98b2]">
              В USD
            </p>
            <p className="mt-2 font-mono text-xl text-[#f2f5fc]">
              {formatMoney(totalUsd)}
            </p>
          </div>
        </div>

        <div className="mt-6 space-y-2 text-sm text-[#8e98b2]">
          <p>🏨 Отель: ~{Math.round(dailyLocal * 0.4).toLocaleString()} {selected.currency}/день</p>
          <p>🍽️ Еда: ~{Math.round(dailyLocal * 0.35).toLocaleString()} {selected.currency}/день</p>
          <p>🚇 Транспорт: ~{Math.round(dailyLocal * 0.15).toLocaleString()} {selected.currency}/день</p>
          <p>🎭 Развлечения: ~{Math.round(dailyLocal * 0.1).toLocaleString()} {selected.currency}/день</p>
        </div>
      </div>
    </div>
  );
}
