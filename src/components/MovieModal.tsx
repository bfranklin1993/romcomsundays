"use client";

import { useState, useEffect, useCallback } from "react";
import type { MovieWithRatings } from "@/lib/types";
import { RatingWidget } from "./RatingWidget";
import { generateFingerprint, hasVoted, markVoted } from "@/lib/fingerprint";

interface MovieModalProps {
  movie: MovieWithRatings;
  onClose: () => void;
}

export function MovieModal({ movie, onClose }: MovieModalProps) {
  const [ratingAvg, setRatingAvg] = useState<number | null>(movie.userRatingAvg);
  const [ratingCount, setRatingCount] = useState(movie.userRatingCount);
  const [voted, setVoted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setVoted(hasVoted(movie.id));

    fetch(`/api/ratings?movieId=${movie.id}`)
      .then((r) => r.json())
      .then((data) => {
        setRatingAvg(data.average);
        setRatingCount(data.count);
      })
      .catch(() => {});
  }, [movie.id]);

  // Lock body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  const handleRatingSubmit = useCallback(
    async (score: number) => {
      setSubmitting(true);
      try {
        const fingerprintHash = await generateFingerprint();
        const res = await fetch("/api/ratings", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ movieId: movie.id, score, fingerprintHash }),
        });

        if (res.ok) {
          const data = await res.json();
          setRatingAvg(data.average);
          setRatingCount(data.count);
          markVoted(movie.id);
          setVoted(true);
        }
      } catch {
        // Silently fail — non-critical feature
      }
      setSubmitting(false);
    },
    [movie.id]
  );

  const formattedDate = new Date(movie.dateWatched).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 sm:p-4"
      onClick={onClose}
    >
      <div
        className="bg-white sm:rounded-xl w-full sm:max-w-2xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto rounded-t-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile drag handle */}
        <div className="sm:hidden flex justify-center pt-2 pb-1">
          <div className="w-10 h-1 bg-gray-300 rounded-full" />
        </div>

        <div className="relative w-full bg-gray-200 sm:rounded-t-xl overflow-hidden">
          {movie.posterUrl ? (
            <img
              src={movie.posterUrl}
              alt={movie.title}
              className="w-full max-h-[300px] sm:max-h-[500px] object-contain bg-gray-100"
            />
          ) : (
            <div className="w-full h-36 sm:h-48 flex items-center justify-center text-6xl">
              🎬
            </div>
          )}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 w-8 h-8 bg-black/50 text-white rounded-full flex items-center justify-center text-sm hover:bg-black/70"
          >
            ✕
          </button>
        </div>

        <div className="p-4 sm:p-5">
          <h2 className="text-lg sm:text-xl font-bold mb-1">{movie.title}</h2>
          <p className="text-sm text-text-secondary mb-4">
            {movie.year} · {movie.streamingService}
          </p>

          <div className="flex gap-6 mb-5">
            <div>
              <p className="text-xs text-text-secondary mb-1">My Score</p>
              <p className="text-2xl sm:text-3xl font-bold text-brand">
                {movie.score.toFixed(1)}
              </p>
            </div>
            <div>
              <p className="text-xs text-text-secondary mb-1">User Average</p>
              {ratingAvg !== null ? (
                <>
                  <p className="text-2xl sm:text-3xl font-bold text-text-primary">
                    {ratingAvg.toFixed(1)}
                  </p>
                  <p className="text-[10px] text-text-muted">
                    from {ratingCount} rating{ratingCount !== 1 ? "s" : ""}
                  </p>
                </>
              ) : (
                <p className="text-sm text-text-muted">No ratings yet</p>
              )}
            </div>
          </div>

          <div className="mb-4 pt-4 border-t border-divider">
            <RatingWidget
              movieId={movie.id}
              hasVoted={voted}
              onSubmit={handleRatingSubmit}
              submitting={submitting}
            />
          </div>

          <p className="text-xs text-text-muted">Watched {formattedDate}</p>
        </div>
      </div>
    </div>
  );
}
