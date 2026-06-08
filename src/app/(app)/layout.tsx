import { redirect } from "next/navigation";
import Header from "@/components/Header";
import TickerBar from "@/components/TickerBar";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSession();
  if (!user) redirect("/login");

  return (
    <>
      <Header
        userName={user.name}
        balance={user.balance}
        isAdmin={user.role === "ADMIN"}
      />
      <main className="mx-auto max-w-[1280px] px-6 pb-24 pt-8">{children}</main>
      <TickerBar />
      <footer className="mx-auto max-w-[1280px] px-6 pb-32 pt-4 text-center text-xs text-[#8e98b2]">
        <p>© 2026 FluxFX · Курсы для информации, не финансовый совет</p>
        <p className="mt-1 font-mono text-[10px] uppercase tracking-widest">
          build · midnight · v1.0
        </p>
      </footer>
    </>
  );
}
