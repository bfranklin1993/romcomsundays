import { fetchMovies } from "@/lib/sheets";
import { CollectionClient } from "./CollectionClient";

export const revalidate = 3600;

export default async function Home() {
  const movies = await fetchMovies();

  const sorted = [...movies].sort(
    (a, b) => new Date(b.dateWatched).getTime() - new Date(a.dateWatched).getTime()
  );

  const moviesWithRatings = sorted.map((m) => ({
    ...m,
    userRatingAvg: null,
    userRatingCount: 0,
  }));

  return <CollectionClient movies={moviesWithRatings} />;
}
