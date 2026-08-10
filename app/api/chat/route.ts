import { NextResponse } from "next/server";
import { queryKnowledgeBase } from "@/lib/bedrock";
import { logUnansweredQuestion } from "@/lib/unanswered-questions";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const message: string = body.message?.trim();
    const sessionId: string | undefined = body.sessionId || undefined;
    const userId: string = body.userId ?? "anonymous";

    if (!message) {
      return NextResponse.json({ error: "message is required" }, { status: 400 });
    }

    const result = await queryKnowledgeBase(message, sessionId);

    if (result.sources.length === 0) {
      logUnansweredQuestion({
        question: message,
        userId,
        sessionId: result.sessionId,
      });
    }

    return NextResponse.json(result);
  } catch (err) {
    console.error("[/api/chat]", err);
    return NextResponse.json(
      { error: "Failed to query knowledge base. Please try again." },
      { status: 500 }
    );
  }
}
