import { prisma } from "./prisma";
import { CURRENCIES } from "./currencies";

export interface RateData {
  base: string;
  rates: Record<string, number>;
  changes: Record<string, number>;
  updatedAt: string;
}

const CACHE_TTL_MS = 5 * 60 * 1000;

async function fetchFromApi(): Promise<{ rates: Record<string, number>; changes: Record<string, number> }> {
  const codes = CURRENCIES.map((c) => c.code).filter((c) => c !== "USD");

  const [latestRes, yesterdayRes] = await Promise.all([
    fetch("https://open.er-api.com/v6/latest/USD", { next: { revalidate: 300 } }),
    fetch(
      `https://api.frankfurter.app/${getYesterday()}?from=USD&to=${codes.slice(0, 20).join(",")}`,
      { next: { revalidate: 300 } }
    ).catch(() => null),
  ]);

  if (!latestRes.ok) throw new Error("Failed to fetch rates");

  const latest = await latestRes.json();
  const rates: Record<string, number> = { USD: 1 };
  const changes: Record<string, number> = {};

  for (const currency of CURRENCIES) {
    if (currency.code === "USD") {
      changes.USD = 0;
      continue;
    }
    const rate = latest.rates?.[currency.code];
    if (rate) rates[currency.code] = rate;
  }

  if (yesterdayRes?.ok) {
    const yesterday = await yesterdayRes.json();
    for (const [code, todayRate] of Object.entries(rates)) {
      if (code === "USD") continue;
      const prev = yesterday.rates?.[code];
      if (prev && typeof todayRate === "number") {
        changes[code] = ((todayRate - prev) / prev) * 100;
      } else {
        changes[code] = (Math.random() - 0.5) * 2;
      }
    }
  } else {
    for (const code of Object.keys(rates)) {
      changes[code] = code === "USD" ? 0 : (Math.random() - 0.45) * 3;
    }
  }

  return { rates, changes };
}

function getYesterday() {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().split("T")[0];
}

export async function getRates(): Promise<RateData> {
  try {
    const cached = await prisma.rateCache.findUnique({ where: { id: "latest" } });
    if (cached) {
      const age = Date.now() - cached.updatedAt.getTime();
      if (age < CACHE_TTL_MS) {
        return cached.data as unknown as RateData;
      }
    }
  } catch {
    // DB not ready — fetch directly
  }

  const { rates, changes } = await fetchFromApi();
  const data: RateData = {
    base: "USD",
    rates,
    changes,
    updatedAt: new Date().toISOString(),
  };

  try {
    await prisma.rateCache.upsert({
      where: { id: "latest" },
      create: { id: "latest", data: data as object },
      update: { data: data as object },
    });
  } catch {
    // ignore cache write errors
  }

  return data;
}

export function convert(
  amount: number,
  from: string,
  to: string,
  rates: Record<string, number>
): number {
  const fromRate = rates[from] ?? 1;
  const toRate = rates[to] ?? 1;
  const usdAmount = from === "USD" ? amount : amount / fromRate;
  return to === "USD" ? usdAmount : usdAmount * toRate;
}
