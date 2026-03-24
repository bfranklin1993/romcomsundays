import { appendSuggestion } from "@/lib/sheets";
import { NextRequest, NextResponse } from "next/server";

const RATE_LIMIT_MS = 30_000;
const recentSubmissions = new Map<string, number>();

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { title, reason, honeypot } = body;

  if (honeypot) {
    return NextResponse.json({ success: true });
  }

  if (!title || typeof title !== "string" || title.trim().length === 0) {
    return NextResponse.json({ error: "Movie title is required" }, { status: 400 });
  }

  const ip = request.headers.get("x-forwarded-for") || "unknown";
  const lastSubmission = recentSubmissions.get(ip);
  if (lastSubmission && Date.now() - lastSubmission < RATE_LIMIT_MS) {
    return NextResponse.json(
      { error: "Please wait before submitting again" },
      { status: 429 }
    );
  }

  await appendSuggestion(title.trim(), (reason || "").trim());
  recentSubmissions.set(ip, Date.now());

  return NextResponse.json({ success: true });
}
