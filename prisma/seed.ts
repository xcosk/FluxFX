import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { PrismaClient } from "../src/generated/prisma/client";
import bcrypt from "bcryptjs";

const databaseUrl =
  process.env.DATABASE_URL ||
  process.env.POSTGRES_PRISMA_URL ||
  process.env.POSTGRES_URL_NON_POOLING ||
  process.env.POSTGRES_URL;

if (!databaseUrl) {
  throw new Error("Database connection string is missing.");
}

const pool = new Pool({ connectionString: databaseUrl });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL || "admin@fluxfx.com";
  const adminPassword = process.env.ADMIN_PASSWORD || "admin123";

  const existing = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (!existing) {
    const hashed = await bcrypt.hash(adminPassword, 10);
    const admin = await prisma.user.create({
      data: {
        email: adminEmail,
        name: "Администратор",
        password: hashed,
        role: "ADMIN",
      },
    });
    await prisma.wallet.create({
      data: { userId: admin.id, currency: "USD", amount: 50000 },
    });
    console.log(`Admin created: ${adminEmail} / ${adminPassword}`);
  }

  const users = await prisma.user.findMany({
    where: { wallets: { none: {} } },
  });

  for (const user of users) {
    await prisma.wallet.create({
      data: { userId: user.id, currency: "USD", amount: 12500 },
    });
    console.log(`Wallet created for ${user.email}`);
  }
}

main()
  .catch(console.error)
  .finally(() => pool.end());
