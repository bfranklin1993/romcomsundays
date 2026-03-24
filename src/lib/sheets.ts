import type { Movie } from "./types";

const APPS_SCRIPT_URL = process.env.APPS_SCRIPT_URL!;

export async function fetchMovies(): Promise<Movie[]> {
  const res = await fetch(`${APPS_SCRIPT_URL}?action=getMovies`, {
    next: { revalidate: 3600 },
  });

  if (!res.ok) return [];

  const data = await res.json();
  if (!data.movies || !Array.isArray(data.movies)) return [];

  return data.movies.map((row: Record<string, unknown>) => ({
    id: row.id || "",
    title: row.title || "",
    year: Number(row.year) || 0,
    score: Number(row.score) || 0,
    dateWatched: row.dateWatched || "",
    streamingService: row.streamingService || "",
    posterUrl: row.posterUrl || null,
  }));
}

export async function appendSuggestion(title: string, reason: string): Promise<void> {
  await fetch(APPS_SCRIPT_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "addSuggestion", title, reason }),
  });
}
