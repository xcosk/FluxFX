import { Pool, type PoolConfig } from "pg";

export function getDatabaseUrl() {
  const databaseUrl =
    process.env.DATABASE_URL ||
    process.env.POSTGRES_PRISMA_URL ||
    process.env.POSTGRES_URL_NON_POOLING ||
    process.env.POSTGRES_URL;

  if (!databaseUrl) {
    throw new Error(
      "Database connection string is missing. Set DATABASE_URL (or POSTGRES_URL from Vercel Storage) in Vercel Environment Variables for Production, Preview and Development."
    );
  }

  return databaseUrl;
}

function needsSsl(connectionString: string) {
  if (process.env.PGSSLMODE === "disable") return false;

  return (
    process.env.VERCEL === "1" ||
    process.env.NODE_ENV === "production" ||
    /sslmode=require|sslmode=verify-full|ssl=true/i.test(connectionString) ||
    /neon\.tech|supabase|amazonaws|render\.com|railway|prisma\.io|vercel-storage/i.test(
      connectionString
    )
  );
}

export function createPgPoolConfig(): PoolConfig {
  const connectionString = getDatabaseUrl();

  return {
    connectionString,
    ...(needsSsl(connectionString) && {
      ssl: { rejectUnauthorized: false },
    }),
  };
}

export function createPgPool() {
  return new Pool(createPgPoolConfig());
}
