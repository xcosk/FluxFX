# FluxFX — Currency Studio

Валютная студия на Next.js с живыми курсами, обменом валют, калькулятором поездок и помощником.

## Возможности

- **Авторизация** — вход и регистрация, имя пользователя в приветствии
- **Кабинет** — баланс, быстрый конвертер, избранные валюты, история обменов
- **Курсы** — 37 валют с живым обновлением каждые 5 минут
- **Обмен** — конвертация с сохранением в историю
- **Поездки** — калькулятор бюджета по городам
- **Помощник** — ответы на популярные вопросы + связь с оператором
- **Админ-панель** — управление пользователями, блокировка, смена паролей, сообщения оператору
- **Мультивалютный баланс** — после обмена валюта появляется на счёте (USD → EUR и т.д.)

## Запуск

### 1. PostgreSQL

```bash
# Через Docker
docker run --name fluxfx-db -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=fluxfx -p 5432:5432 -d postgres:16

# Или используйте существующий PostgreSQL и обновите DATABASE_URL в .env
```

### 2. Установка

```bash
npm install
npx prisma db push
npm run db:seed
npm run dev
```

Откройте [http://localhost:3000](http://localhost:3000) — сначала появится страница входа/регистрации.

## Переменные окружения

Скопируйте `.env.example` в `.env`:

```
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/fluxfx?schema=public"
JWT_SECRET="your-secret-key"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
ADMIN_EMAIL="admin@fluxfx.com"
ADMIN_PASSWORD="admin123"
```

Для Vercel укажите в Project Settings -> Environment Variables строку подключения
к удаленной PostgreSQL базе. Поддерживаются `DATABASE_URL`, `POSTGRES_PRISMA_URL`,
`POSTGRES_URL_NON_POOLING` и `POSTGRES_URL`. Локальный `localhost` URL на Vercel
не работает.

Для Vercel в `vercel.json` уже задана build command:

```bash
npm run vercel-build
```

Скрипт выполнит `prisma db push`, чтобы создать таблицы перед сборкой.

## Админ-панель

После `npm run db:seed` создаётся администратор:
- Email: `admin@fluxfx.com`
- Пароль: `admin123`
- Панель: `/admin`

В админке можно:
- Просматривать всех пользователей и их балансы по валютам
- Менять пароли
- Блокировать / разблокировать
- Читать и отвечать на сообщения оператору

## Стек

- Next.js 16, React 19, Tailwind CSS 4
- PostgreSQL + Prisma
- Курсы: open.er-api.com + frankfurter.app
- JWT-авторизация
