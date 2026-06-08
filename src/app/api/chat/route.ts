import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
import { getChatResponse } from "@/lib/chatbot";

export async function POST(request: Request) {
  try {
    const { message } = await request.json();
    const response = await getChatResponse(message || "");
    return NextResponse.json({ response });
  } catch {
    return NextResponse.json(
      { error: "Ошибка обработки запроса" },
      { status: 500 }
    );
  }
}
