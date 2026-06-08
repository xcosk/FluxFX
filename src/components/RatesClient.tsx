"use client";

import { useEffect, useState } from "react";
import MiniChart from "./MiniChart";
import type { CurrencyInfo } from "@/lib/currencies";

interface RatesClientProps {
  currencies: CurrencyInfo[];
  rates: Record<string, number>;
  changes: Record<string, number>;
  favorites: string[];
  updatedAt: string;
}

export default function RatesClient({
  currencies,
  rates: initialRates,
  changes: initialChanges,
  favorites: initialFavorites,
  updatedAt: initialUpdatedAt,
}: RatesClientProps) {
  const [rates, setRates] = useState(initialRates);
  const [changes, setChanges] = useState(initialChanges);
  const [favorites, setFavorites] = useState(initialFavorites);
  const [search, setSearch] = useState("");
  const [showFavorites, setShowFavorites] = useState(false);
  const [updatedAt, setUpdatedAt] = useState(initialUpdatedAt);

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch("/api/rates");
        const data = await res.json();
        setRates(data.rates);
        setChanges(data.changes);
        setUpdatedAt(data.updatedAt);
      } catch {
        // ignore
      }
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const toggleFavorite = async (currency: string) => {
    const res = await fetch("/api/favorites", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currency }),
    });
    const data = await res.json();
    if (data.favorited) {
      setFavorites((prev) => [...prev, currency]);
    } else {
      setFavorites((prev) => prev.filter((c) => c !== currency));
    }
  };

  let filtered = currencies.filter(
    (c) =>
      c.code.toLowerCase().includes(search.toLowerCase()) ||
      c.name.toLowerCase().includes(search.toLowerCase())
  );

  if (showFavorites) {
    filtered = filtered.filter((c) => favorites.includes(c.code));
  }

  return (
    <div className="mt-8">
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <div className="rounded-full border border-[rgba(41,41,75,0.5)] bg-[rgba(15,14,39,0.6)] px-4 py-2 text-sm text-[#f2f5fc]">
          База: 🇺🇸 USD
        </div>
        <input
          type="text"
          placeholder="Поиск валюты…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input-field flex-1 min-w-[200px] rounded-full px-4 py-2 text-sm"
        />
        <button
          onClick={() => setShowFavorites(!showFavorites)}
          className={`rounded-full border px-4 py-2 text-sm transition ${
            showFavorites
              ? "border-[#6e6dff] bg-gradient-to-r from-[#5b56ed] to-[#b085ff] text-white"
              : "border-[rgba(41,41,75,0.5)] bg-[rgba(15,14,39,0.6)] text-[#f2f5fc]"
          }`}
        >
          ★ Избранные
        </button>
        <span className="text-xs text-[#8e98b2]">
          Обновлено: {new Date(updatedAt).toLocaleTimeString("ru-RU")}
        </span>
      </div>

      <div className="card overflow-hidden">
        <div className="grid grid-cols-[1fr_auto_auto_auto_auto] gap-4 border-b border-[rgba(41,41,75,0.5)] px-6 py-4 text-xs uppercase tracking-widest text-[#8e98b2] max-md:hidden">
          <span>Валюта</span>
          <span className="w-24 text-right">Курс</span>
          <span className="w-20 text-right">24ч</span>
          <span className="w-20 text-center">График</span>
          <span className="w-8" />
        </div>

        {filtered.map((currency) => {
          const rate = rates[currency.code] ?? 0;
          const change = changes[currency.code] ?? 0;
          const isFav = favorites.includes(currency.code);
          const positive = change >= 0;

          return (
            <div
              key={currency.code}
              className="grid grid-cols-1 items-center gap-2 border-b border-[rgba(41,41,75,0.3)] px-6 py-4 transition hover:bg-[rgba(15,14,39,0.3)] max-md:gap-3 md:grid-cols-[1fr_auto_auto_auto_auto] md:gap-4"
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">{currency.flag}</span>
                <div>
                  <span className="font-mono font-medium text-[#f2f5fc]">
                    {currency.code}
                  </span>
                  <p className="text-sm text-[#8e98b2]">{currency.name}</p>
                </div>
              </div>
              <span className="font-mono text-[#f2f5fc] md:w-24 md:text-right">
                {rate.toFixed(4)}
              </span>
              <span
                className={`font-mono text-sm md:w-20 md:text-right ${
                  positive ? "text-[#00c470]" : "text-[#f22a36]"
                }`}
              >
                {positive ? "▲" : "▼"} {Math.abs(change).toFixed(2)}%
              </span>
              <div className="md:w-20 md:text-center">
                <MiniChart positive={positive} />
              </div>
              <button
                onClick={() => toggleFavorite(currency.code)}
                className={`text-lg transition md:w-8 ${
                  isFav ? "text-[#6e6dff]" : "text-[#8e98b2] hover:text-[#6e6dff]"
                }`}
              >
                ★
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
