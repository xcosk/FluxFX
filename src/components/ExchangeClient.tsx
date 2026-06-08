"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { CurrencyInfo } from "@/lib/currencies";

interface ExchangeClientProps {
  currencies: CurrencyInfo[];
  rates: Record<string, number>;
  changes: Record<string, number>;
}

function convertAmount(
  amount: number,
  from: string,
  to: string,
  rates: Record<string, number>
) {
  const fromRate = rates[from] ?? 1;
  const toRate = rates[to] ?? 1;
  const usd = from === "USD" ? amount : amount / fromRate;
  return to === "USD" ? usd : usd * toRate;
}

export default function ExchangeClient({
  currencies,
  rates: initialRates,
  changes: initialChanges,
}: ExchangeClientProps) {
  const router = useRouter();
  const [rates, setRates] = useState(initialRates);
  const [changes, setChanges] = useState(initialChanges);
  const [fromCurrency, setFromCurrency] = useState("USD");
  const [toCurrency, setToCurrency] = useState("EUR");
  const [fromAmount, setFromAmount] = useState("1000");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [wallets, setWallets] = useState<Record<string, number>>({});

  useEffect(() => {
    fetch("/api/balance")
      .then((r) => r.json())
      .then((d) => {
        const map: Record<string, number> = {};
        for (const w of d.wallets || []) map[w.currency] = w.amount;
        setWallets(map);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch("/api/rates");
        const data = await res.json();
        setRates(data.rates);
        setChanges(data.changes);
      } catch {
        // ignore
      }
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const amount = parseFloat(fromAmount) || 0;
  const toAmount = convertAmount(amount, fromCurrency, toCurrency, rates);
  const rate = convertAmount(1, fromCurrency, toCurrency, rates);
  const change = changes[toCurrency] ?? 0;

  const fromInfo = currencies.find((c) => c.code === fromCurrency);
  const toInfo = currencies.find((c) => c.code === toCurrency);

  const swap = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
  };

  const handleExchange = async () => {
    setLoading(true);
    setMessage("");

    const res = await fetch("/api/exchange", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fromCurrency,
        toCurrency,
        fromAmount: amount,
      }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setMessage(data.error || "Ошибка обмена");
      return;
    }

    const newWallets: Record<string, number> = {};
    for (const w of data.wallets || []) newWallets[w.currency] = w.amount;
    setWallets(newWallets);

    setMessage(
      `Обмен сохранён: ${amount} ${fromCurrency} → ${data.toAmount.toFixed(2)} ${toCurrency}. Проверьте баланс в кабинете.`
    );
    router.refresh();
  };

  return (
    <div className="mt-8 max-w-2xl">
      <div className="card relative overflow-hidden p-6">
        <div className="card-glow absolute inset-0" />

        <div className="relative space-y-4">
          <div className="rounded-[22px] border border-[rgba(41,41,75,0.5)] bg-[rgba(15,14,39,0.6)] p-5">
            <p className="text-xs uppercase tracking-widest text-[#8e98b2]">
              Отдаёте
            </p>
            <input
              type="number"
              value={fromAmount}
              onChange={(e) => setFromAmount(e.target.value)}
              className="mt-2 w-full bg-transparent font-mono text-3xl font-bold text-[#f2f5fc] outline-none"
            />
            <select
              value={fromCurrency}
              onChange={(e) => setFromCurrency(e.target.value)}
              className="mt-3 rounded-[18px] border border-[rgba(41,41,75,0.5)] bg-[rgba(15,14,39,0.8)] px-4 py-2 text-sm text-[#f2f5fc] outline-none"
            >
              {currencies.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.flag} {c.code}
                </option>
              ))}
            </select>
            <p className="mt-1 text-sm text-[#8e98b2]">{fromInfo?.name}</p>
            <p className="mt-2 text-xs text-[#8e98b2]">
              На балансе:{" "}
              <span className="font-mono text-[#f2f5fc]">
                {(wallets[fromCurrency] ?? 0).toFixed(2)} {fromCurrency}
              </span>
            </p>
          </div>

          <div className="flex justify-center">
            <button
              onClick={swap}
              className="flex h-12 w-12 items-center justify-center rounded-full border border-[rgba(41,41,75,0.5)] bg-[rgba(15,14,39,0.6)] text-xl transition hover:border-[#6e6dff]"
            >
              ⇅
            </button>
          </div>

          <div className="rounded-[22px] border border-[rgba(41,41,75,0.5)] bg-[rgba(15,14,39,0.6)] p-5">
            <p className="text-xs uppercase tracking-widest text-[#8e98b2]">
              Получаете
            </p>
            <p className="mt-2 font-mono text-3xl font-bold text-[#f2f5fc]">
              {toAmount.toFixed(2)}
            </p>
            <select
              value={toCurrency}
              onChange={(e) => setToCurrency(e.target.value)}
              className="mt-3 rounded-[18px] border border-[rgba(41,41,75,0.5)] bg-[rgba(15,14,39,0.8)] px-4 py-2 text-sm text-[#f2f5fc] outline-none"
            >
              {currencies.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.flag} {c.code}
                </option>
              ))}
            </select>
            <p className="mt-1 text-sm text-[#8e98b2]">{toInfo?.name}</p>
          </div>

          <div className="flex flex-wrap gap-4 text-sm text-[#8e98b2]">
            <span>
              1 {fromCurrency} ={" "}
              <span className="text-[#f2f5fc]">{rate.toFixed(6)}</span>{" "}
              {toCurrency}
            </span>
            <span className={change >= 0 ? "text-[#00c470]" : "text-[#f22a36]"}>
              {change >= 0 ? "▲" : "▼"} {Math.abs(change).toFixed(2)}% за период
            </span>
          </div>

          {message && (
            <p
              className={`text-sm ${
                message.includes("Ошибка") || message.includes("Недостаточно")
                  ? "text-[#f22a36]"
                  : "text-[#00c470]"
              }`}
            >
              {message}
            </p>
          )}

          <button
            onClick={handleExchange}
            disabled={loading || amount <= 0}
            className="btn-primary w-full rounded-[18px] py-4 text-sm font-medium disabled:opacity-50"
          >
            {loading ? "Конвертация..." : "Конвертировать и сохранить"}
          </button>
        </div>
      </div>
    </div>
  );
}
