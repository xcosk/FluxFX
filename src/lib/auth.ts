import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { prisma } from "./prisma";
import { getTotalUsdBalance } from "./wallets";

const SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "fluxfx-dev-secret"
);

export const COOKIE_NAME = "fluxfx-session";

export interface SessionUser {
  id: string;
  email: string;
  name: string;
  role: string;
  blocked: boolean;
  balance: number;
}

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export async function buildSessionUser(userId: string): Promise<SessionUser | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, name: true, role: true, blocked: true },
  });
  if (!user) return null;

  const { totalUsd } = await getTotalUsdBalance(userId);

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    blocked: user.blocked,
    balance: totalUsd,
  };
}

export async function createToken(user: SessionUser) {
  return new SignJWT({
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    blocked: user.blocked,
    balance: user.balance,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("7d")
    .sign(SECRET);
}

export async function getSession(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, SECRET);
    const user = await buildSessionUser(payload.id as string);
    if (!user || user.blocked) return null;
    return user;
  } catch {
    return null;
  }
}

export async function requireAdmin(): Promise<SessionUser | null> {
  const user = await getSession();
  if (!user || user.role !== "ADMIN") return null;
  return user;
}

export async function setSessionCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });
}

export async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}
