import { NextResponse } from "next/server";
import { listUnansweredQuestions } from "@/lib/unanswered-questions";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const items = await listUnansweredQuestions();
    return NextResponse.json(items);
  } catch (err) {
    console.error("[/api/unanswered]", err);
    return NextResponse.json(
      { error: "Failed to load unanswered questions." },
      { status: 500 }
    );
  }
}
