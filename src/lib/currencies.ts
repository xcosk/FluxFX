export interface CurrencyInfo {
  code: string;
  name: string;
  flag: string;
  country: string;
}

export const CURRENCIES: CurrencyInfo[] = [
  { code: "USD", name: "US Dollar", flag: "🇺🇸", country: "United States" },
  { code: "EUR", name: "Euro", flag: "🇪🇺", country: "Eurozone" },
  { code: "GBP", name: "British Pound", flag: "🇬🇧", country: "United Kingdom" },
  { code: "JPY", name: "Japanese Yen", flag: "🇯🇵", country: "Japan" },
  { code: "CHF", name: "Swiss Franc", flag: "🇨🇭", country: "Switzerland" },
  { code: "CAD", name: "Canadian Dollar", flag: "🇨🇦", country: "Canada" },
  { code: "AUD", name: "Australian Dollar", flag: "🇦🇺", country: "Australia" },
  { code: "CNY", name: "Chinese Yuan", flag: "🇨🇳", country: "China" },
  { code: "HKD", name: "Hong Kong Dollar", flag: "🇭🇰", country: "Hong Kong" },
  { code: "SGD", name: "Singapore Dollar", flag: "🇸🇬", country: "Singapore" },
  { code: "SEK", name: "Swedish Krona", flag: "🇸🇪", country: "Sweden" },
  { code: "NOK", name: "Norwegian Krone", flag: "🇳🇴", country: "Norway" },
  { code: "DKK", name: "Danish Krone", flag: "🇩🇰", country: "Denmark" },
  { code: "NZD", name: "New Zealand Dollar", flag: "🇳🇿", country: "New Zealand" },
  { code: "KRW", name: "South Korean Won", flag: "🇰🇷", country: "South Korea" },
  { code: "INR", name: "Indian Rupee", flag: "🇮🇳", country: "India" },
  { code: "BRL", name: "Brazilian Real", flag: "🇧🇷", country: "Brazil" },
  { code: "MXN", name: "Mexican Peso", flag: "🇲🇽", country: "Mexico" },
  { code: "ZAR", name: "South African Rand", flag: "🇿🇦", country: "South Africa" },
  { code: "TRY", name: "Turkish Lira", flag: "🇹🇷", country: "Turkey" },
  { code: "RUB", name: "Russian Ruble", flag: "🇷🇺", country: "Russia" },
  { code: "PLN", name: "Polish Zloty", flag: "🇵🇱", country: "Poland" },
  { code: "THB", name: "Thai Baht", flag: "🇹🇭", country: "Thailand" },
  { code: "IDR", name: "Indonesian Rupiah", flag: "🇮🇩", country: "Indonesia" },
  { code: "HUF", name: "Hungarian Forint", flag: "🇭🇺", country: "Hungary" },
  { code: "CZK", name: "Czech Koruna", flag: "🇨🇿", country: "Czech Republic" },
  { code: "ILS", name: "Israeli Shekel", flag: "🇮🇱", country: "Israel" },
  { code: "PHP", name: "Philippine Peso", flag: "🇵🇭", country: "Philippines" },
  { code: "MYR", name: "Malaysian Ringgit", flag: "🇲🇾", country: "Malaysia" },
  { code: "RON", name: "Romanian Leu", flag: "🇷🇴", country: "Romania" },
  { code: "BGN", name: "Bulgarian Lev", flag: "🇧🇬", country: "Bulgaria" },
  { code: "ISK", name: "Icelandic Krona", flag: "🇮🇸", country: "Iceland" },
  { code: "AED", name: "UAE Dirham", flag: "🇦🇪", country: "UAE" },
  { code: "SAR", name: "Saudi Riyal", flag: "🇸🇦", country: "Saudi Arabia" },
  { code: "EGP", name: "Egyptian Pound", flag: "🇪🇬", country: "Egypt" },
  { code: "UAH", name: "Ukrainian Hryvnia", flag: "🇺🇦", country: "Ukraine" },
  { code: "KZT", name: "Kazakhstani Tenge", flag: "🇰🇿", country: "Kazakhstan" },
];

export const CURRENCY_MAP = Object.fromEntries(
  CURRENCIES.map((c) => [c.code, c])
);

export const TRAVEL_CITIES = [
  { id: "tokyo", name: "Токио", country: "Япония", currency: "JPY", flag: "🗼", dailyBudget: 15000 },
  { id: "paris", name: "Париж", country: "Франция", currency: "EUR", flag: "🗼", dailyBudget: 120 },
  { id: "istanbul", name: "Стамбул", country: "Турция", currency: "TRY", flag: "🕌", dailyBudget: 2500 },
  { id: "newyork", name: "Нью-Йорк", country: "США", currency: "USD", flag: "🗽", dailyBudget: 200 },
  { id: "london", name: "Лондон", country: "Великобритания", currency: "GBP", flag: "🏰", dailyBudget: 150 },
  { id: "dubai", name: "Дубай", country: "ОАЭ", currency: "AED", flag: "🏙️", dailyBudget: 500 },
];

export function formatMoney(amount: number, currency = "USD") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatRate(rate: number, decimals = 4) {
  return rate.toFixed(decimals);
}
