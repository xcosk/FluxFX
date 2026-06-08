export function logApiError(scope: string, error: unknown) {
  console.error(`[${scope}]`, error);
}

export function getAuthErrorMessage(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);

  if (message.includes("Database connection string is missing")) {
    return "Не задана строка подключения к базе данных";
  }

  if (
    message.includes("does not exist") ||
    message.includes("relation") ||
    message.includes("table")
  ) {
    return "Таблицы базы данных еще не созданы";
  }

  return "Ошибка сервера при работе с базой данных";
}
