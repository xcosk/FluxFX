import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
import { prisma } from "@/lib/prisma";
import { getAuthErrorMessage, logApiError } from "@/lib/api-errors";
import {
  buildSessionUser,
  createToken,
  hashPassword,
  setSessionCookie,
} from "@/lib/auth";
import { createInitialWallet } from "@/lib/wallets";

export async function POST(request: Request) {
  try {
    const { email, password, name } = await request.json();

    if (!email || !password || !name) {
      return NextResponse.json(
        { error: "Заполните все поля" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Пароль минимум 6 символов" },
        { status: 400 }
      );
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { error: "Email уже зарегистрирован" },
        { status: 400 }
      );
    }

    const hashed = await hashPassword(password);
    const isAdmin =
      email === (process.env.ADMIN_EMAIL || "admin@fluxfx.com");

    const user = await prisma.user.create({
      data: {
        email,
        password: hashed,
        name,
        role: isAdmin ? "ADMIN" : "USER",
      },
    });

    await createInitialWallet(user.id);

    const sessionUser = await buildSessionUser(user.id);
    const token = await createToken(sessionUser!);
    await setSessionCookie(token);

    return NextResponse.json({ user: sessionUser });
  } catch (error) {
    logApiError("auth/register", error);
    return NextResponse.json(
      { error: getAuthErrorMessage(error) },
      { status: 500 }
    );
  }
}
