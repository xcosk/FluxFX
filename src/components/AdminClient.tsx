"use client";

import { useEffect, useState } from "react";
import { CURRENCY_MAP, formatMoney } from "@/lib/currencies";

interface Wallet {
  currency: string;
  amount: number;
}

interface UserRow {
  id: string;
  email: string;
  name: string;
  role: string;
  blocked: boolean;
  createdAt: string;
  totalUsd: number;
  wallets: Wallet[];
  _count: { exchanges: number; operatorMessages: number };
}

interface OperatorMsg {
  id: string;
  message: string;
  status: string;
  adminReply: string | null;
  createdAt: string;
  user: { id: string; name: string; email: string };
}

async function fetchAdminData() {
  const [usersRes, msgsRes] = await Promise.all([
    fetch("/api/admin/users"),
    fetch("/api/admin/messages"),
  ]);

  const users = usersRes.ok ? (await usersRes.json()).users : undefined;
  const messages = msgsRes.ok ? (await msgsRes.json()).messages : undefined;

  return { users, messages };
}

export default function AdminClient() {
  const [tab, setTab] = useState<"users" | "messages">("users");
  const [users, setUsers] = useState<UserRow[]>([]);
  const [messages, setMessages] = useState<OperatorMsg[]>([]);
  const [loading, setLoading] = useState(true);
  const [passwordEdits, setPasswordEdits] = useState<Record<string, string>>({});
  const [replyEdits, setReplyEdits] = useState<Record<string, string>>({});
  const [status, setStatus] = useState("");

  const load = async () => {
    setLoading(true);
    const data = await fetchAdminData();
    if (data.users) setUsers(data.users);
    if (data.messages) setMessages(data.messages);
    setLoading(false);
  };

  useEffect(() => {
    let mounted = true;

    async function loadInitial() {
      const data = await fetchAdminData();
      if (!mounted) return;
      if (data.users) setUsers(data.users);
      if (data.messages) setMessages(data.messages);
      setLoading(false);
    }

    void loadInitial();

    return () => {
      mounted = false;
    };
  }, []);

  const updateUser = async (
    id: string,
    data: { blocked?: boolean; password?: string }
  ) => {
    const res = await fetch(`/api/admin/users/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const result = await res.json();
    if (res.ok) {
      setStatus("Изменения сохранены");
      setPasswordEdits((prev) => ({ ...prev, [id]: "" }));
      load();
    } else {
      setStatus(result.error || "Ошибка");
    }
    setTimeout(() => setStatus(""), 3000);
  };

  const replyMessage = async (id: string) => {
    const reply = replyEdits[id];
    if (!reply?.trim()) return;

    const res = await fetch("/api/admin/messages", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status: "answered", adminReply: reply }),
    });

    if (res.ok) {
      setStatus("Ответ отправлен");
      setReplyEdits((prev) => ({ ...prev, [id]: "" }));
      load();
    }
    setTimeout(() => setStatus(""), 3000);
  };

  if (loading) {
    return <p className="mt-8 text-[#8e98b2]">Загрузка...</p>;
  }

  return (
    <div className="mt-8">
      {status && (
        <p className="mb-4 text-sm text-[#00c470]">{status}</p>
      )}

      <div className="mb-6 flex gap-2">
        <button
          onClick={() => setTab("users")}
          className={`rounded-full px-5 py-2 text-sm transition ${
            tab === "users"
              ? "bg-gradient-to-r from-[#5b56ed] to-[#b085ff] text-white"
              : "border border-[rgba(41,41,75,0.5)] text-[#8e98b2]"
          }`}
        >
          Пользователи ({users.length})
        </button>
        <button
          onClick={() => setTab("messages")}
          className={`rounded-full px-5 py-2 text-sm transition ${
            tab === "messages"
              ? "bg-gradient-to-r from-[#5b56ed] to-[#b085ff] text-white"
              : "border border-[rgba(41,41,75,0.5)] text-[#8e98b2]"
          }`}
        >
          Сообщения оператору (
          {messages.filter((m) => m.status === "pending").length})
        </button>
      </div>

      {tab === "users" && (
        <div className="space-y-4">
          {users.map((u) => (
            <div key={u.id} className="card p-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-mono text-lg font-bold text-[#f2f5fc]">
                      {u.name}
                    </h3>
                    {u.role === "ADMIN" && (
                      <span className="rounded-full bg-[#6e6dff]/20 px-2 py-0.5 text-xs text-[#6e6dff]">
                        ADMIN
                      </span>
                    )}
                    {u.blocked && (
                      <span className="rounded-full bg-[#f22a36]/20 px-2 py-0.5 text-xs text-[#f22a36]">
                        Заблокирован
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-[#8e98b2]">{u.email}</p>
                  <p className="mt-1 text-sm text-[#8e98b2]">
                    Баланс: {formatMoney(u.totalUsd)} · Обменов:{" "}
                    {u._count.exchanges} · Сообщений:{" "}
                    {u._count.operatorMessages}
                  </p>
                  {u.wallets.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {u.wallets.map((w) => (
                        <span
                          key={w.currency}
                          className="rounded-full border border-[rgba(41,41,75,0.5)] bg-[rgba(15,14,39,0.6)] px-3 py-1 font-mono text-xs text-[#f2f5fc]"
                        >
                          {CURRENCY_MAP[w.currency]?.flag ?? ""}{" "}
                          {w.amount.toFixed(2)} {w.currency}
                        </span>
                      ))}
                    </div>
                  )}
                  <p className="mt-1 text-xs text-[#8e98b2]">
                    Регистрация:{" "}
                    {new Date(u.createdAt).toLocaleString("ru-RU")}
                  </p>
                </div>

                <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                  <input
                    type="password"
                    placeholder="Новый пароль"
                    value={passwordEdits[u.id] || ""}
                    onChange={(e) =>
                      setPasswordEdits((prev) => ({
                        ...prev,
                        [u.id]: e.target.value,
                      }))
                    }
                    className="input-field px-3 py-2 text-sm"
                  />
                  <button
                    onClick={() =>
                      passwordEdits[u.id] &&
                      updateUser(u.id, { password: passwordEdits[u.id] })
                    }
                    disabled={!passwordEdits[u.id]}
                    className="rounded-[14px] border border-[rgba(41,41,75,0.5)] px-4 py-2 text-sm text-[#f2f5fc] transition hover:border-[#6e6dff] disabled:opacity-40"
                  >
                    Сменить пароль
                  </button>
                  <button
                    onClick={() => updateUser(u.id, { blocked: !u.blocked })}
                    className={`rounded-[14px] px-4 py-2 text-sm transition ${
                      u.blocked
                        ? "bg-[#00c470] text-[#050517]"
                        : "border border-[#f22a36]/50 text-[#f22a36]"
                    }`}
                  >
                    {u.blocked ? "Разблокировать" : "Заблокировать"}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === "messages" && (
        <div className="space-y-4">
          {messages.length === 0 ? (
            <p className="text-[#8e98b2]">Сообщений пока нет</p>
          ) : (
            messages.map((m) => (
              <div key={m.id} className="card p-5">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <span className="font-mono text-sm font-bold text-[#f2f5fc]">
                      {m.user.name}
                    </span>
                    <span className="ml-2 text-sm text-[#8e98b2]">
                      {m.user.email}
                    </span>
                  </div>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs ${
                      m.status === "pending"
                        ? "bg-[#f22a36]/20 text-[#f22a36]"
                        : "bg-[#00c470]/20 text-[#00c470]"
                    }`}
                  >
                    {m.status === "pending" ? "Ожидает" : "Отвечено"}
                  </span>
                </div>
                <p className="mt-3 text-sm text-[#f2f5fc]">{m.message}</p>
                <p className="mt-1 text-xs text-[#8e98b2]">
                  {new Date(m.createdAt).toLocaleString("ru-RU")}
                </p>

                {m.adminReply && (
                  <div className="mt-3 rounded-[14px] border border-[rgba(41,41,75,0.5)] bg-[rgba(15,14,39,0.4)] p-3">
                    <p className="text-xs uppercase tracking-widest text-[#8e98b2]">
                      Ваш ответ
                    </p>
                    <p className="mt-1 text-sm text-[#f2f5fc]">{m.adminReply}</p>
                  </div>
                )}

                {m.status === "pending" && (
                  <div className="mt-3 flex gap-2">
                    <input
                      type="text"
                      placeholder="Ответ пользователю..."
                      value={replyEdits[m.id] || ""}
                      onChange={(e) =>
                        setReplyEdits((prev) => ({
                          ...prev,
                          [m.id]: e.target.value,
                        }))
                      }
                      className="input-field flex-1 px-3 py-2 text-sm"
                    />
                    <button
                      onClick={() => replyMessage(m.id)}
                      className="btn-primary shrink-0 rounded-[14px] px-4 py-2 text-sm"
                    >
                      Ответить
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
