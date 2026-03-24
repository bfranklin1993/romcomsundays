"use client";

import { useState, useMemo } from "react";
import type { MovieWithRatings } from "@/lib/types";
import { MovieCard } from "./MovieCard";
import { SearchBar } from "./SearchBar";
import { FilterPills } from "./FilterPills";

interface MovieGridProps {
  movies: MovieWithRatings[];
  onMovieClick: (movie: MovieWithRatings) => void;
}

export function MovieGrid({ movies, onMovieClick }: MovieGridProps) {
  const [search, setSearch] = useState("");
  const [activeServices, setActiveServices] = useState<string[]>([]);
  const [activeRating, setActiveRating] = useState<string | null>(null);
  const [activeYear, setActiveYear] = useState<string | null>(null);

  const services = useMemo(() => {
    const unique = [...new Set(movies.map((m) => m.streamingService))];
    return unique.sort();
  }, [movies]);

  const years = useMemo(() => {
    const unique = [...new Set(movies.map((m) => new Date(m.dateWatched).getFullYear().toString()))];
    return unique.sort().reverse();
  }, [movies]);

  const filtered = useMemo(() => {
    let result = movies;

    if (search) {
      const q = search.toLowerCase();
      result = result.filter((m) => m.title.toLowerCase().includes(q));
    }

    if (activeServices.length > 0) {
      result = result.filter((m) => activeServices.includes(m.streamingService));
    }

    if (activeRating) {
      const minScore = parseInt(activeRating, 10);
      result = result.filter((m) => m.score >= minScore);
    }

    if (activeYear) {
      result = result.filter(
        (m) => new Date(m.dateWatched).getFullYear().toString() === activeYear
      );
    }

    return result;
  }, [movies, search, activeServices, activeRating, activeYear]);

  function handleToggleService(service: string) {
    if (service === "all") {
      setActiveServices([]);
      return;
    }
    setActiveServices((prev) =>
      prev.includes(service) ? prev.filter((f) => f !== service) : [...prev, service]
    );
  }

  return (
    <div>
      <div className="mb-4">
        <SearchBar value={search} onChange={setSearch} />
      </div>
      <div className="mb-6">
        <FilterPills
          services={services}
          activeServices={activeServices}
          activeRating={activeRating}
          activeYear={activeYear}
          years={years}
          onToggleService={handleToggleService}
          onSetRating={setActiveRating}
          onSetYear={setActiveYear}
        />
      </div>
      {filtered.length === 0 ? (
        <p className="text-center text-text-secondary py-12">No movies found.</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map((movie) => (
            <MovieCard key={movie.id} movie={movie} onClick={() => onMovieClick(movie)} />
          ))}
        </div>
      )}
    </div>
  );
}
