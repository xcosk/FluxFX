"use client";

import { useEffect, useState } from "react";

interface TickerItem {
  pair: string;
  rate: string;
  change: number;
}

export default function TickerBar() {
  const [items, setItems] = useState<TickerItem[]>([]);

  useEffect(() => {
    const fetchRates = async () => {
      try {
        const res = await fetch("/api/rates");
        const data = await res.json();
        const pairs = ["EUR", "GBP", "JPY", "CHF", "CAD", "AUD", "CNY", "RUB", "TRY"];
        const ticker = pairs.map((code) => ({
          pair: `USD/${code}`,
          rate: (data.rates?.[code] ?? 0).toFixed(4),
          change: data.changes?.[code] ?? 0,
        }));
        setItems(ticker);
      } catch {
        setItems([]);
      }
    };

    fetchRates();
    const interval = setInterval(fetchRates, 60000);
    return () => clearInterval(interval);
  }, []);

  if (items.length === 0) return null;

  const doubled = [...items, ...items];

  return (
    <div className="ticker-bar fixed bottom-0 left-0 right-0 z-40 overflow-hidden py-2">
      <div className="ticker-animate flex whitespace-nowrap">
        {doubled.map((item, i) => (
          <span
            key={`${item.pair}-${i}`}
            className="mx-6 font-mono text-xs text-[#8e98b2]"
          >
            <span className="text-[#f2f5fc]">{item.pair}</span>{" "}
            {item.rate}{" "}
            <span className={item.change >= 0 ? "text-[#00c470]" : "text-[#f22a36]"}>
              {item.change >= 0 ? "▲" : "▼"} {Math.abs(item.change).toFixed(2)}%
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}
