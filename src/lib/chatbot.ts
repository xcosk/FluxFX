import { CURRENCIES } from "./currencies";
import { convert, getRates } from "./rates";

const FAQ: { patterns: RegExp[]; answer: string | ((msg: string) => Promise<string>) }[] = [
  {
    patterns: [/привет/i, /здравств/i, /hello/i, /hi\b/i],
    answer: "Привет! Я помощник **FluxFX** — помогу с валютами. Спроси курс или напиши «500 USD в EUR».",
  },
  {
    patterns: [/какие валюты самые сильные/i, /сильн.*валют/i],
    answer:
      "Самые сильные валюты по курсу к USD: **KWD** (кувейтский динар), **BHD**, **OMR**, **JOD**, **GBP**, **EUR**, **CHF**. FluxFX отслеживает 37 основных валют в реальном времени.",
  },
  {
    patterns: [/как работает/i, /что такое fluxfx/i, /помощь/i, /help/i],
    answer:
      "FluxFX — валютная студия. Здесь вы можете:\n• Смотреть **живые курсы** 37 валют\n• **Конвертировать** и сохранять обмены\n• Планировать **бюджет поездок**\n• Спрашивать меня о курсах!",
  },
  {
    patterns: [/комисси/i, /сколько стоит обмен/i],
    answer: "В FluxFX обмены **без комиссии** — вы получаете курс по рынку. Курсы обновляются каждые 5 минут из открытых источников.",
  },
  {
    patterns: [/избранн/i, /favorite/i, /звездочк/i],
    answer: "Нажмите ★ рядом с валютой на странице **Курсы**, чтобы добавить в избранное. Избранные отображаются в кабинете.",
  },
  {
    patterns: [/баланс/i, /пополн/i, /вывест/i],
    answer: "Баланс отображается в **Кабинете**. Кнопки «+ Пополнить» и «− Вывести» позволяют управлять средствами (демо-режим).",
  },
  {
    patterns: [
      /(\d+(?:[.,]\d+)?)\s*(usd|eur|gbp|jpy|rub|try|chf|cad|aud|cny)\s*(?:в|to|→|->)\s*(usd|eur|gbp|jpy|rub|try|chf|cad|aud|cny)/i,
      /конвертир\w*\s+(\d+(?:[.,]\d+)?)\s*(usd|eur|gbp|jpy|rub|try|chf|cad|aud|cny)\s*(?:в|to)\s*(usd|eur|gbp|jpy|rub|try|chf|cad|aud|cny)/i,
      /сколько\s+(\d+(?:[.,]\d+)?)\s*(usd|eur|gbp|jpy|rub|try|chf|cad|aud|cny)\s*(?:в|to)\s*(usd|eur|gbp|jpy|rub|try|chf|cad|aud|cny)/i,
    ],
    answer: async (msg: string) => {
      const match = msg.match(
        /(\d+(?:[.,]\d+)?)\s*(usd|eur|gbp|jpy|rub|try|chf|cad|aud|cny|hkd|sgd|sek|nok)\s*(?:в|to|→|->)\s*(usd|eur|gbp|jpy|rub|try|chf|cad|aud|cny|hkd|sgd|sek|nok)/i
      );
      if (!match) return "Не удалось распознать сумму. Попробуйте: «500 USD в EUR»";
      const amount = parseFloat(match[1].replace(",", "."));
      const from = match[2].toUpperCase();
      const to = match[3].toUpperCase();
      const rates = await getRates();
      const result = convert(amount, from, to, rates.rates);
      const rate = convert(1, from, to, rates.rates);
      return `**${amount} ${from}** = **${result.toFixed(2)} ${to}**\n\nКурс: 1 ${from} = ${rate.toFixed(6)} ${to}`;
    },
  },
  {
    patterns: [/курс\s+(?:йен|jpy|иен)/i, /йен\w*\s+сегодня/i],
    answer: async () => {
      const rates = await getRates();
      const jpy = rates.rates.JPY;
      const change = rates.changes.JPY ?? 0;
      const arrow = change >= 0 ? "▲" : "▼";
      return `Курс **JPY** сегодня: **${jpy?.toFixed(4)}** за 1 USD\n${arrow} ${Math.abs(change).toFixed(2)}% за 24ч`;
    },
  },
  {
    patterns: [/курс\s+(\w{3})/i, /сколько стоит\s+(\w{3})/i],
    answer: async (msg: string) => {
      const match = msg.match(/курс\s+(\w{3})|сколько стоит\s+(\w{3})/i);
      const code = (match?.[1] || match?.[2])?.toUpperCase();
      if (!code) return "Укажите код валюты, например: «Курс EUR»";
      const info = CURRENCIES.find((c) => c.code === code);
      const rates = await getRates();
      const rate = rates.rates[code];
      if (!rate) return `Валюта **${code}** не найдена. Доступно ${CURRENCIES.length} валют.`;
      const change = rates.changes[code] ?? 0;
      const arrow = change >= 0 ? "▲" : "▼";
      return `${info?.flag ?? ""} **${code}** (${info?.name ?? code}): **${rate.toFixed(4)}** за 1 USD\n${arrow} ${Math.abs(change).toFixed(2)}% за 24ч`;
    },
  },
];

export async function getChatResponse(message: string): Promise<string> {
  const trimmed = message.trim();
  if (!trimmed) return "Напишите ваш вопрос о валютах.";

  for (const faq of FAQ) {
    for (const pattern of faq.patterns) {
      if (pattern.test(trimmed)) {
        if (typeof faq.answer === "function") {
          return faq.answer(trimmed);
        }
        return faq.answer;
      }
    }
  }

  return "Я отвечаю на популярные вопросы о валютах. Попробуйте:\n• «500 USD в EUR»\n• «Курс йены сегодня»\n• «Какие валюты самые сильные?»";
}
