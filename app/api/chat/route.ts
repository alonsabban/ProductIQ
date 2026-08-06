import { NextResponse } from "next/server";
import { queryKnowledgeBase } from "@/lib/bedrock";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const message: string = body.message?.trim();
    const sessionId: string | undefined = body.sessionId || undefined;

    if (!message) {
      return NextResponse.json({ error: "message is required" }, { status: 400 });
    }

    const result = await queryKnowledgeBase(message, sessionId);
    return NextResponse.json(result);
  } catch (err) {
    const msg = err instanceof Error ? `${err.name}: ${err.message}` : String(err);
    console.error("[/api/chat]", err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
