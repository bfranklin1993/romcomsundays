"use client";

import { useState, useMemo } from "react";
import type { MovieWithRatings } from "@/lib/types";
import { MovieCard } from "./MovieCard";
import { SearchBar } from "./SearchBar";
import { FilterBar } from "./FilterPills";

type SortOption = "newest" | "oldest" | "highest" | "lowest" | "a-z" | "z-a";

const MOVIES_PER_PAGE = 24;

interface MovieGridProps {
  movies: MovieWithRatings[];
  onMovieClick: (movie: MovieWithRatings) => void;
}

export function MovieGrid({ movies, onMovieClick }: MovieGridProps) {
  const [search, setSearch] = useState("");
  const [activeService, setActiveService] = useState<string | null>(null);
  const [activeRating, setActiveRating] = useState<string | null>(null);
  const [sort, setSort] = useState<SortOption>("newest");
  const [visibleCount, setVisibleCount] = useState(MOVIES_PER_PAGE);

  const services = useMemo(() => {
    const unique = [...new Set(movies.map((m) => m.streamingService))];
    return unique.sort();
  }, [movies]);

  const filtered = useMemo(() => {
    let result = movies;

    if (search) {
      const q = search.toLowerCase();
      result = result.filter((m) => m.title.toLowerCase().includes(q));
    }

    if (activeService) {
      result = result.filter((m) => m.streamingService === activeService);
    }

    if (activeRating) {
      const minScore = parseInt(activeRating, 10);
      result = result.filter((m) => m.score >= minScore);
    }

    result = [...result].sort((a, b) => {
      switch (sort) {
        case "newest":
          return new Date(b.dateWatched).getTime() - new Date(a.dateWatched).getTime();
        case "oldest":
          return new Date(a.dateWatched).getTime() - new Date(b.dateWatched).getTime();
        case "highest":
          return b.score - a.score;
        case "lowest":
          return a.score - b.score;
        case "a-z":
          return a.title.localeCompare(b.title);
        case "z-a":
          return b.title.localeCompare(a.title);
        default:
          return 0;
      }
    });

    return result;
  }, [movies, search, activeService, activeRating, sort]);

  const visible = filtered.slice(0, visibleCount);
  const hasMore = visibleCount < filtered.length;

  return (
    <div>
      <div className="mb-4">
        <SearchBar value={search} onChange={(v) => { setSearch(v); setVisibleCount(MOVIES_PER_PAGE); }} />
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-2">
        <FilterBar
          services={services}
          activeService={activeService}
          activeRating={activeRating}
          sort={sort}
          onSetService={(v) => { setActiveService(v); setVisibleCount(MOVIES_PER_PAGE); }}
          onSetRating={(v) => { setActiveRating(v); setVisibleCount(MOVIES_PER_PAGE); }}
          onSetSort={(v) => setSort(v as SortOption)}
        />
      </div>

      <p className="text-xs text-text-muted mb-4">
        Showing {visible.length} of {filtered.length} movie{filtered.length !== 1 ? "s" : ""}
        {filtered.length !== movies.length && ` (${movies.length} total)`}
      </p>

      {filtered.length === 0 ? (
        <p className="text-center text-text-secondary py-12">No movies found.</p>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {visible.map((movie) => (
              <MovieCard key={movie.id} movie={movie} onClick={() => onMovieClick(movie)} />
            ))}
          </div>

          {hasMore && (
            <div className="text-center mt-8">
              <button
                onClick={() => setVisibleCount((prev) => prev + MOVIES_PER_PAGE)}
                className="px-6 py-2.5 bg-brand text-white font-medium rounded-lg hover:bg-brand/90 transition-colors"
              >
                Load More
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
