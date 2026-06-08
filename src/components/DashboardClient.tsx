"use client";

import Link from "next/link";
import { useState } from "react";
import MiniChart from "./MiniChart";
import { CURRENCY_MAP, formatMoney } from "@/lib/currencies";

interface Wallet {
  currency: string;
  amount: number;
}

interface Exchange {
  id: string;
  fromCurrency: string;
  toCurrency: string;
  fromAmount: number;
  toAmount: number;
  rate: number;
  createdAt: string | Date;
}

interface DashboardClientProps {
  initialWallets: Wallet[];
  totalUsd: number;
  rates: Record<string, number>;
  eurRate: number;
  eurChange: number;
  jpyRate: number;
  gbpRate: number;
  favorites: string[];
  exchanges: Exchange[];
  totalVolume: number;
  exchangeCount: number;
}

const PERIODS = [
  { key: "1D", label: "1Д", multiplier: 1 },
  { key: "1W", label: "1Н", multiplier: 2.5 },
  { key: "1M", label: "1М", multiplier: 5 },
  { key: "3M", label: "3М", multiplier: 8 },
  { key: "1Y", label: "1Г", multiplier: 15 },
] as const;

export default function DashboardClient({
  initialWallets,
  totalUsd,
  rates,
  eurRate,
  eurChange,
  jpyRate,
  gbpRate,
  favorites,
  exchanges,
  totalVolume,
  exchangeCount,
}: DashboardClientProps) {
  const [wallets, setWallets] = useState(initialWallets);
  const [depositAmount, setDepositAmount] = useState("100");
  const [depositCurrency, setDepositCurrency] = useState("USD");
  const [quickAmount, setQuickAmount] = useState("100");
  const [period, setPeriod] = useState<string>("1M");

  const selectedPeriod = PERIODS.find((p) => p.key === period) ?? PERIODS[2];
  const periodChange = eurChange * (selectedPeriod.multiplier / 5);
  const isPositive = periodChange >= 0;

  const handleBalance = async (action: "deposit" | "withdraw") => {
    const amount = parseFloat(depositAmount);
    if (!amount || amount <= 0) return;

    const res = await fetch("/api/balance", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount, action, currency: depositCurrency }),
    });

    const data = await res.json();
    if (res.ok) setWallets(data.wallets);
  };

  const quickEur = (parseFloat(quickAmount) || 0) * eurRate;

  return (
    <div className="space-y-6">
      <div className="card relative overflow-hidden p-6">
        <div className="card-glow absolute inset-0" />
        <div className="relative">
          <p className="text-xs uppercase tracking-widest text-[#8e98b2]">
            Текущий баланс
          </p>
          <p className="font-mono text-4xl font-bold text-[#f2f5fc]">
            {formatMoney(totalUsd)}
          </p>
          <p className="mt-1 text-sm text-[#8e98b2]">эквивалент в USD</p>

          {wallets.length > 0 ? (
            <div className="mt-4 flex flex-wrap gap-2">
              {wallets.map((w) => {
                const info = CURRENCY_MAP[w.currency];
                return (
                  <div
                    key={w.currency}
                    className="rounded-[18px] border border-[rgba(41,41,75,0.5)] bg-[rgba(15,14,39,0.6)] px-4 py-3"
                  >
                    <span className="text-lg">{info?.flag}</span>
                    <span className="ml-2 font-mono text-lg font-bold text-[#f2f5fc]">
                      {w.amount.toFixed(2)}
                    </span>
                    <span className="ml-1 text-sm text-[#8e98b2]">
                      {w.currency}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="mt-4 text-sm text-[#8e98b2]">Баланс пуст</p>
          )}

          <p className="mt-3 text-sm text-[#8e98b2]">
            ≈ {formatMoney(totalUsd * eurRate, "EUR")} · ¥
            {(totalUsd * jpyRate).toLocaleString()} ·{" "}
            {formatMoney(totalUsd * gbpRate, "GBP")}
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <select
              value={depositCurrency}
              onChange={(e) => setDepositCurrency(e.target.value)}
              className="rounded-[18px] border border-[rgba(41,41,75,0.5)] bg-[rgba(15,14,39,0.6)] px-3 py-3 text-sm text-[#f2f5fc] outline-none"
            >
              {["USD", "EUR", "GBP", "JPY", "RUB"].map((c) => (
                <option key={c} value={c}>
                  {CURRENCY_MAP[c]?.flag} {c}
                </option>
              ))}
            </select>
            <div className="flex items-center gap-2 rounded-[18px] border border-[rgba(41,41,75,0.5)] bg-[rgba(15,14,39,0.6)] px-4 py-3">
              <input
                type="number"
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
                className="w-24 bg-transparent font-mono text-sm text-[#f2f5fc] outline-none"
              />
            </div>
            <button
              onClick={() => handleBalance("deposit")}
              className="rounded-[18px] bg-[#00c470] px-5 py-3 text-sm font-medium text-[#050517] transition hover:opacity-90"
            >
              + Пополнить
            </button>
            <button
              onClick={() => handleBalance("withdraw")}
              className="rounded-[18px] border border-[rgba(41,41,75,0.5)] px-5 py-3 text-sm text-[#f2f5fc] transition hover:border-[rgba(110,109,255,0.4)]"
            >
              − Вывести
            </button>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-4">
        <div className="card relative overflow-hidden p-5 lg:col-span-2">
          <div className="card-glow absolute inset-0 opacity-50" />
          <div className="relative">
            <p className="text-xs uppercase tracking-widest text-[#8e98b2]">
              Топ пара
            </p>
            <div className="mt-3 flex items-center gap-2 font-mono text-lg">
              <span>🇺🇸 USD</span>
              <span className="text-[#8e98b2]">→</span>
              <span>🇪🇺 EUR</span>
            </div>
            <p className="mt-2 font-mono text-3xl font-bold text-[#f2f5fc]">
              {eurRate.toFixed(4)}
            </p>
            <p
              className={`mt-1 text-sm ${isPositive ? "text-[#00c470]" : "text-[#f22a36]"}`}
            >
              {isPositive ? "▲" : "▼"} {Math.abs(periodChange).toFixed(2)}% за{" "}
              {selectedPeriod.label}
            </p>
            <div className="mt-4">
              <MiniChart positive={isPositive} />
            </div>
            <div className="mt-4 flex gap-2">
              {PERIODS.map((p) => (
                <button
                  key={p.key}
                  type="button"
                  onClick={() => setPeriod(p.key)}
                  className={`cursor-pointer rounded-full border px-3 py-1 text-xs transition ${
                    period === p.key
                      ? "border-[#6e6dff] bg-gradient-to-r from-[#5b56ed] to-[#b085ff] text-white"
                      : "border-[rgba(41,41,75,0.5)] text-[#8e98b2] hover:border-[#6e6dff] hover:text-[#f2f5fc]"
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="card p-5">
          <p className="text-xs uppercase tracking-widest text-[#8e98b2]">
            Объём обменов
          </p>
          <p className="mt-2 font-mono text-3xl font-bold text-[#f2f5fc]">
            {formatMoney(totalVolume)}
          </p>
          <p className="mt-1 text-sm text-[#8e98b2]">
            {exchangeCount} операций всего
          </p>
          <div className="mt-4 flex h-16 items-end gap-1">
            {[0.4, 0.48, 0.56, 0.64, 0.72, 0.8, 0.88].map((h, i) => (
              <div
                key={i}
                className="flex-1 rounded-t bg-gradient-to-t from-[#5b56ed] to-[#b085ff]"
                style={{ height: `${h * 100}%`, opacity: 0.4 + i * 0.08 }}
              />
            ))}
          </div>
        </div>

        <div className="card p-5">
          <p className="text-xs uppercase tracking-widest text-[#8e98b2]">
            Быстрый конверт
          </p>
          <div className="mt-3 space-y-2">
            <input
              type="number"
              value={quickAmount}
              onChange={(e) => setQuickAmount(e.target.value)}
              className="input-field w-full px-3 py-2 font-mono text-sm"
            />
            <p className="text-xs text-[#8e98b2]">USD</p>
            <div className="input-field px-3 py-2 font-mono text-sm text-[#f2f5fc]">
              {quickEur.toFixed(2)}
            </div>
            <p className="text-xs text-[#8e98b2]">EUR</p>
          </div>
          <Link
            href="/exchange"
            className="mt-3 inline-block text-sm text-[#6e6dff] hover:underline"
          >
            Открыть полный обмен →
          </Link>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card p-5">
          <div className="flex items-center justify-between">
            <p className="text-xs uppercase tracking-widest text-[#8e98b2]">
              Избранные валюты
            </p>
            <Link href="/rates" className="text-sm text-[#6e6dff] hover:underline">
              Все курсы →
            </Link>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {(favorites.length > 0
              ? favorites
              : ["EUR", "GBP", "JPY", "CHF"]
            )
              .slice(0, 4)
              .map((code) => {
                const info = CURRENCY_MAP[code];
                const rate = rates[code] ?? 0;
                return (
                  <div
                    key={code}
                    className="rounded-[18px] border border-[rgba(41,41,75,0.5)] bg-[rgba(15,14,39,0.6)] p-4"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-lg">
                        {info?.flag} {code}
                      </span>
                      <span className="text-[#6e6dff]">★</span>
                    </div>
                    <p className="mt-2 font-mono text-lg text-[#f2f5fc]">
                      {rate.toFixed(4)}
                    </p>
                  </div>
                );
              })}
          </div>
        </div>

        <div className="card p-5">
          <p className="text-xs uppercase tracking-widest text-[#8e98b2]">
            Последние обмены
          </p>
          {exchanges.length === 0 ? (
            <p className="mt-4 text-sm text-[#8e98b2]">
              Пока нет обменов.{" "}
              <Link href="/exchange" className="text-[#6e6dff] hover:underline">
                Сделать первый →
              </Link>
            </p>
          ) : (
            <div className="mt-4 space-y-3">
              {exchanges.map((ex) => (
                <div
                  key={ex.id}
                  className="flex items-center justify-between rounded-[14px] border border-[rgba(41,41,75,0.5)] bg-[rgba(15,14,39,0.4)] px-4 py-3"
                >
                  <div>
                    <span className="font-mono text-sm text-[#f2f5fc]">
                      {ex.fromAmount} {ex.fromCurrency} →{" "}
                      {ex.toAmount.toFixed(2)} {ex.toCurrency}
                    </span>
                    <p className="text-xs text-[#8e98b2]">
                      {new Date(ex.createdAt).toLocaleString("ru-RU")}
                    </p>
                  </div>
                  <span className="font-mono text-xs text-[#8e98b2]">
                    {ex.rate.toFixed(4)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
