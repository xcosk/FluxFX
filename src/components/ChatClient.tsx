"use client";

import { useRef, useState } from "react";
import { SUGGESTED_QUESTIONS } from "@/lib/chat-constants";

interface Message {
  role: "user" | "assistant" | "operator";
  content: string;
  time: string;
}

function formatMessage(text: string) {
  return text
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\n/g, "<br/>");
}

export default function ChatClient() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Привет! Я помощник FluxFX — помогу с валютами. Спроси курс или напиши «500 USD в EUR».",
      time: new Date().toLocaleTimeString("ru-RU", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    },
  ]);
  const [input, setInput] = useState("");
  const [operatorInput, setOperatorInput] = useState("");
  const [showOperator, setShowOperator] = useState(false);
  const [loading, setLoading] = useState(false);
  const [operatorLoading, setOperatorLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const scrollDown = () => {
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
  };

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return;

    const time = new Date().toLocaleTimeString("ru-RU", {
      hour: "2-digit",
      minute: "2-digit",
    });

    setMessages((prev) => [...prev, { role: "user", content: text, time }]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });
      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data.response,
          time: new Date().toLocaleTimeString("ru-RU", {
            hour: "2-digit",
            minute: "2-digit",
          }),
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Произошла ошибка. Попробуйте ещё раз.",
          time: new Date().toLocaleTimeString("ru-RU", {
            hour: "2-digit",
            minute: "2-digit",
          }),
        },
      ]);
    }

    setLoading(false);
    scrollDown();
  };

  const sendToOperator = async () => {
    if (!operatorInput.trim() || operatorLoading) return;

    setOperatorLoading(true);
    const time = new Date().toLocaleTimeString("ru-RU", {
      hour: "2-digit",
      minute: "2-digit",
    });

    try {
      const res = await fetch("/api/operator", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: operatorInput }),
      });
      const data = await res.json();

      if (res.ok) {
        setMessages((prev) => [
          ...prev,
          {
            role: "operator",
            content: `📩 ${operatorInput}\n\n${data.message}`,
            time,
          },
        ]);
        setOperatorInput("");
        setShowOperator(false);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Не удалось отправить сообщение оператору.",
          time,
        },
      ]);
    }

    setOperatorLoading(false);
    scrollDown();
  };

  return (
    <div className="card mt-8 flex max-h-[70vh] flex-col overflow-hidden">
      <div className="flex-1 space-y-4 overflow-y-auto p-6">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
          >
            {msg.role !== "user" && (
              <div
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-[14px] text-sm ${
                  msg.role === "operator"
                    ? "bg-[#00c470]/20 text-[#00c470]"
                    : "bg-[rgba(15,14,39,0.8)] text-[#6e6dff]"
                }`}
              >
                {msg.role === "operator" ? "👤" : "✦"}
              </div>
            )}
            <div
              className={`max-w-[80%] rounded-[22px] px-4 py-3 ${
                msg.role === "user"
                  ? "rounded-br-[10px] bg-gradient-to-r from-[#5b56ed] to-[#b085ff] text-white"
                  : msg.role === "operator"
                    ? "rounded-bl-[10px] border border-[#00c470]/30 bg-[rgba(0,196,112,0.08)] text-[#f2f5fc]"
                    : "rounded-bl-[10px] bg-[rgba(15,14,39,0.6)] text-[#f2f5fc]"
              }`}
            >
              <div
                className="text-sm leading-relaxed"
                dangerouslySetInnerHTML={{
                  __html: formatMessage(msg.content),
                }}
              />
              <p className="mt-1 text-xs opacity-50">{msg.time}</p>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-[14px] bg-[rgba(15,14,39,0.8)] text-[#6e6dff]">
              ✦
            </div>
            <div className="rounded-[22px] rounded-bl-[10px] bg-[rgba(15,14,39,0.6)] px-4 py-3 text-sm text-[#8e98b2]">
              Печатает...
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="border-t border-[rgba(41,41,75,0.5)] p-4">
        <div className="mb-3 flex flex-wrap gap-2">
          {SUGGESTED_QUESTIONS.map((q) => (
            <button
              key={q}
              onClick={() => sendMessage(q)}
              className="rounded-full border border-[rgba(41,41,75,0.5)] bg-[rgba(15,14,39,0.6)] px-3 py-1.5 text-xs text-[#8e98b2] transition hover:border-[#6e6dff] hover:text-[#f2f5fc]"
            >
              {q}
            </button>
          ))}
          <button
            onClick={() => setShowOperator(!showOperator)}
            className="rounded-full border border-[#00c470]/40 bg-[rgba(0,196,112,0.08)] px-3 py-1.5 text-xs text-[#00c470] transition hover:bg-[rgba(0,196,112,0.15)]"
          >
            👤 Связаться с оператором
          </button>
        </div>

        {showOperator && (
          <div className="mb-3 rounded-[18px] border border-[#00c470]/30 bg-[rgba(0,196,112,0.05)] p-4">
            <p className="mb-2 text-xs uppercase tracking-widest text-[#00c470]">
              Сообщение оператору
            </p>
            <textarea
              value={operatorInput}
              onChange={(e) => setOperatorInput(e.target.value)}
              placeholder="Опишите ваш вопрос — оператор ответит в ближайшее время..."
              className="input-field w-full resize-none px-4 py-3 text-sm"
              rows={3}
            />
            <div className="mt-2 flex gap-2">
              <button
                onClick={sendToOperator}
                disabled={operatorLoading || !operatorInput.trim()}
                className="rounded-[14px] bg-[#00c470] px-4 py-2 text-sm font-medium text-[#050517] disabled:opacity-50"
              >
                {operatorLoading ? "Отправка..." : "Отправить оператору"}
              </button>
              <button
                onClick={() => setShowOperator(false)}
                className="rounded-[14px] border border-[rgba(41,41,75,0.5)] px-4 py-2 text-sm text-[#8e98b2]"
              >
                Отмена
              </button>
            </div>
          </div>
        )}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            sendMessage(input);
          }}
          className="flex gap-3"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Напишите запрос…"
            className="input-field flex-1 px-4 py-3 text-sm"
          />
          <button
            type="submit"
            disabled={loading}
            className="btn-primary shrink-0 rounded-[18px] px-6 py-3 text-sm disabled:opacity-50"
          >
            Отправить
          </button>
        </form>
      </div>
    </div>
  );
}
