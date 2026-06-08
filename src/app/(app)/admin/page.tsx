import { redirect } from "next/navigation";
import AdminClient from "@/components/AdminClient";
import { getSession } from "@/lib/auth";

export default async function AdminPage() {
  const user = await getSession();
  if (!user || user.role !== "ADMIN") redirect("/");

  return (
    <div>
      <p className="font-mono text-xs uppercase tracking-[0.25em] text-[#8e98b2]">
        Администрирование
      </p>
      <h1 className="mt-2 font-mono text-4xl font-bold text-[#f2f5fc] md:text-5xl">
        Панель <span className="gradient-text">админа</span>
      </h1>
      <p className="mt-3 text-base text-[#8e98b2]">
        Управление пользователями и сообщениями оператору
      </p>

      <AdminClient />
    </div>
  );
}
