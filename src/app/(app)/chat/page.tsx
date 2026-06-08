import ChatClient from "@/components/ChatClient";

export default function ChatPage() {
  return (
    <div>
      <p className="font-mono text-xs uppercase tracking-[0.25em] text-[#8e98b2]">
        Помощник
      </p>
      <h1 className="mt-2 font-mono text-4xl font-bold text-[#f2f5fc] md:text-5xl">
        Чат с <span className="gradient-text">помощником</span>
      </h1>
      <p className="mt-3 text-base text-[#8e98b2]">
        Ответы на популярные вопросы или связь с оператором
      </p>

      <ChatClient />
    </div>
  );
}
