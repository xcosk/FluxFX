import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
import { prisma } from "@/lib/prisma";
import { getAuthErrorMessage, logApiError } from "@/lib/api-errors";
import {
  buildSessionUser,
  createToken,
  setSessionCookie,
  verifyPassword,
} from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Введите email и пароль" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !(await verifyPassword(password, user.password))) {
      return NextResponse.json(
        { error: "Неверный email или пароль" },
        { status: 401 }
      );
    }

    if (user.blocked) {
      return NextResponse.json(
        { error: "Аккаунт заблокирован. Обратитесь к администратору." },
        { status: 403 }
      );
    }

    const sessionUser = await buildSessionUser(user.id);
    const token = await createToken(sessionUser!);
    await setSessionCookie(token);

    return NextResponse.json({ user: sessionUser });
  } catch (error) {
    logApiError("auth/login", error);
    return NextResponse.json(
      { error: getAuthErrorMessage(error) },
      { status: 500 }
    );
  }
}
