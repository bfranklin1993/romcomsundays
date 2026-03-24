import { kv } from "@vercel/kv";
import { NextRequest, NextResponse } from "next/server";

interface StoredRating {
  fingerprintHash: string;
  score: number;
}

// GET /api/ratings?movieId=xxx
export async function GET(request: NextRequest) {
  const movieId = request.nextUrl.searchParams.get("movieId");
  if (!movieId) {
    return NextResponse.json({ error: "movieId required" }, { status: 400 });
  }

  const ratings: StoredRating[] = (await kv.get(`ratings:${movieId}`)) || [];
  const avg =
    ratings.length > 0
      ? ratings.reduce((sum, r) => sum + r.score, 0) / ratings.length
      : null;

  return NextResponse.json({
    movieId,
    average: avg !== null ? Math.round(avg * 10) / 10 : null,
    count: ratings.length,
  });
}

// POST /api/ratings { movieId, score, fingerprintHash }
export async function POST(request: NextRequest) {
  const body = await request.json();
  const { movieId, score, fingerprintHash } = body;

  if (!movieId || !fingerprintHash || typeof score !== "number") {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  if (score < 1 || score > 10 || !Number.isInteger(score)) {
    return NextResponse.json({ error: "Score must be integer 1-10" }, { status: 400 });
  }

  const key = `ratings:${movieId}`;
  const ratings: StoredRating[] = (await kv.get(key)) || [];

  if (ratings.some((r) => r.fingerprintHash === fingerprintHash)) {
    return NextResponse.json({ error: "Already voted" }, { status: 409 });
  }

  ratings.push({ fingerprintHash, score });
  await kv.set(key, ratings);

  const avg = ratings.reduce((sum, r) => sum + r.score, 0) / ratings.length;

  return NextResponse.json({
    movieId,
    average: Math.round(avg * 10) / 10,
    count: ratings.length,
  });
}
