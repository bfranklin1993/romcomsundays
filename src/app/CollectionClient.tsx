"use client";

import { useState } from "react";
import type { MovieWithRatings } from "@/lib/types";
import { MovieGrid } from "@/components/MovieGrid";
import { MovieModal } from "@/components/MovieModal";

export function CollectionClient({ movies }: { movies: MovieWithRatings[] }) {
  const [selectedMovie, setSelectedMovie] = useState<MovieWithRatings | null>(null);

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      <MovieGrid movies={movies} onMovieClick={setSelectedMovie} />
      {selectedMovie && (
        <MovieModal movie={selectedMovie} onClose={() => setSelectedMovie(null)} />
      )}
    </div>
  );
}
