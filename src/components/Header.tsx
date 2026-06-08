"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { formatMoney } from "@/lib/currencies";

interface HeaderProps {
  userName: string;
  balance: number;
  isAdmin?: boolean;
}

const NAV = [
  { href: "/", label: "Кабинет", icon: "◐" },
  { href: "/rates", label: "Курсы", icon: "≋" },
  { href: "/exchange", label: "Обмен", icon: "⇄" },
  { href: "/travel", label: "Поездки", icon: "✈" },
  { href: "/chat", label: "Помощник", icon: "✦" },
];

export default function Header({ userName, balance, isAdmin }: HeaderProps) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  };

  const initial = userName.charAt(0).toUpperCase();
  const allNav = isAdmin
    ? [...NAV, { href: "/admin", label: "Админ", icon: "⚙" }]
    : NAV;

  return (
    <header className="sticky top-0 z-50 border-b border-[rgba(41,41,75,0.5)] bg-[rgba(5,5,23,0.85)] backdrop-blur-md">
      <div className="mx-auto flex h-[66px] max-w-[1280px] items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-[18px] bg-gradient-to-br from-[#5b56ed] to-[#b085ff] text-lg font-bold text-white shadow-[0_10px_40px_-10px_rgba(110,109,255,0.45)]">
            ₣
          </div>
          <div>
            <div className="font-mono text-sm font-bold text-[#f2f5fc]">FluxFX</div>
            <div className="text-[10px] uppercase tracking-widest text-[#8e98b2]">
              currency studio
            </div>
          </div>
        </Link>

        <nav className="nav-pill hidden items-center gap-1 px-1.5 py-1.5 md:flex">
          {allNav.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-1.5 px-4 py-2 text-sm transition-all ${
                  active
                    ? "nav-link-active"
                    : "rounded-full text-[#8e98b2] hover:text-[#f2f5fc]"
                }`}
              >
                <span className="opacity-70">{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-3">
          <div className="hidden items-center gap-2 rounded-full border border-[rgba(41,41,75,0.5)] bg-[rgba(15,14,39,0.6)] px-4 py-2 sm:flex">
            <span className="text-[10px] uppercase tracking-widest text-[#8e98b2]">
              Баланс
            </span>
            <span className="font-mono text-sm text-[#f2f5fc]">
              {formatMoney(balance)}
            </span>
          </div>

          <div className="hidden items-center gap-2 rounded-full border border-[rgba(41,41,75,0.5)] bg-[rgba(15,14,39,0.6)] px-3 py-2 sm:flex">
            <span className="h-2 w-2 rounded-full bg-[#00c470] animate-pulse" />
            <span className="text-xs text-[#8e98b2]">LIVE</span>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-2 rounded-full border border-[rgba(41,41,75,0.5)] bg-[rgba(15,14,39,0.6)] px-3 py-2 transition hover:border-[rgba(110,109,255,0.4)]"
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-[#5b56ed] to-[#b085ff] font-mono text-sm text-white">
              {initial}
            </div>
            <span className="hidden text-sm text-[#f2f5fc] sm:inline">{userName}</span>
          </button>
        </div>
      </div>

      <nav className="flex gap-1 overflow-x-auto border-t border-[rgba(41,41,75,0.3)] px-4 py-2 md:hidden">
        {allNav.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`whitespace-nowrap rounded-full px-3 py-1.5 text-xs ${
                active
                  ? "bg-gradient-to-r from-[#5b56ed] to-[#b085ff] text-white"
                  : "text-[#8e98b2]"
              }`}
            >
              {item.icon} {item.label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
