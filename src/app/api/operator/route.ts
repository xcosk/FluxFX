import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const user = await getSession();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { message } = await request.json();
  if (!message?.trim()) {
    return NextResponse.json({ error: "Введите сообщение" }, { status: 400 });
  }

  const record = await prisma.operatorMessage.create({
    data: {
      userId: user.id,
      message: message.trim(),
    },
  });

  return NextResponse.json({
    ok: true,
    id: record.id,
    message: "Сообщение отправлено оператору. Мы ответим в ближайшее время.",
  });
}

export async function GET() {
  const user = await getSession();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const messages = await prisma.operatorMessage.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 10,
  });

  return NextResponse.json({ messages });
}
