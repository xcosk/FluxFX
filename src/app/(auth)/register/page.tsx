"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error || "Ошибка регистрации");
      return;
    }

    router.push("/");
    router.refresh();
  };

  return (
    <div className="card relative overflow-hidden p-8">
      <div className="card-glow absolute inset-0" />
      <div className="relative">
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-[18px] bg-gradient-to-br from-[#5b56ed] to-[#b085ff] text-2xl font-bold text-white shadow-[0_10px_40px_-10px_rgba(110,109,255,0.45)]">
            ₣
          </div>
          <div>
            <h1 className="font-mono text-xl font-bold text-[#f2f5fc]">FluxFX</h1>
            <p className="text-xs uppercase tracking-widest text-[#8e98b2]">
              currency studio
            </p>
          </div>
        </div>

        <h2 className="font-mono text-2xl font-bold text-[#f2f5fc]">
          Создать <span className="gradient-text">аккаунт</span>
        </h2>
        <p className="mt-2 text-sm text-[#8e98b2]">
          Укажите имя — оно появится в приветствии на главной
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <div>
            <label className="mb-1.5 block text-xs uppercase tracking-widest text-[#8e98b2]">
              Имя
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input-field w-full px-4 py-3 text-sm"
              placeholder="Ваше имя"
              required
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs uppercase tracking-widest text-[#8e98b2]">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-field w-full px-4 py-3 text-sm"
              placeholder="you@example.com"
              required
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs uppercase tracking-widest text-[#8e98b2]">
              Пароль
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field w-full px-4 py-3 text-sm"
              placeholder="Минимум 6 символов"
              minLength={6}
              required
            />
          </div>

          {error && (
            <p className="text-sm text-[#f22a36]">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full py-3 text-sm font-medium disabled:opacity-50"
          >
            {loading ? "Регистрация..." : "Зарегистрироваться →"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-[#8e98b2]">
          Уже есть аккаунт?{" "}
          <Link href="/login" className="text-[#6e6dff] hover:underline">
            Войти
          </Link>
        </p>
      </div>
    </div>
  );
}
