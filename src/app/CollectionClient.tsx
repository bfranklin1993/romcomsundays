"use client";

import { useState, useEffect } from "react";
import type { MovieWithRatings } from "@/lib/types";
import { MovieGrid } from "@/components/MovieGrid";
import { MovieModal } from "@/components/MovieModal";

export function CollectionClient({ movies: initialMovies }: { movies: MovieWithRatings[] }) {
  const [movies, setMovies] = useState(initialMovies);
  const [selectedMovie, setSelectedMovie] = useState<MovieWithRatings | null>(null);

  useEffect(() => {
    async function fetchRatings() {
      const updated = await Promise.all(
        initialMovies.map(async (movie) => {
          try {
            const res = await fetch(`/api/ratings?movieId=${movie.id}`);
            if (!res.ok) return movie;
            const data = await res.json();
            return {
              ...movie,
              userRatingAvg: data.average,
              userRatingCount: data.count,
            };
          } catch {
            return movie;
          }
        })
      );
      setMovies(updated);
    }

    fetchRatings();
  }, [initialMovies]);

  return (
    <div className="max-w-6xl mx-auto px-3 sm:px-6 py-4 sm:py-8">
      <MovieGrid movies={movies} onMovieClick={setSelectedMovie} />
      {selectedMovie && (
        <MovieModal movie={selectedMovie} onClose={() => setSelectedMovie(null)} />
      )}
    </div>
  );
}
