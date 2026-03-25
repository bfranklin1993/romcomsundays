"use client";

import { useState } from "react";

interface RatingWidgetProps {
  movieId: string;
  hasVoted: boolean;
  onSubmit: (score: number) => void;
  submitting: boolean;
}

export function RatingWidget({ movieId, hasVoted, onSubmit, submitting }: RatingWidgetProps) {
  const [hovered, setHovered] = useState<number | null>(null);
  const [selected, setSelected] = useState<number | null>(null);

  if (hasVoted) {
    return (
      <p className="text-xs text-text-secondary italic">Thanks for rating!</p>
    );
  }

  return (
    <div>
      <p className="text-xs text-text-secondary mb-2">Rate this movie:</p>
      <div className="flex gap-1 sm:gap-1.5 flex-wrap">
        {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
          <button
            key={n}
            onMouseEnter={() => setHovered(n)}
            onMouseLeave={() => setHovered(null)}
            onClick={() => setSelected(n)}
            className={`w-8 h-8 sm:w-9 sm:h-9 rounded text-xs font-semibold transition-colors ${
              (hovered !== null && n <= hovered) || (selected !== null && n <= selected)
                ? "bg-brand text-white"
                : "bg-card-bg text-text-secondary hover:bg-brand/10"
            }`}
          >
            {n}
          </button>
        ))}
      </div>
      {selected && (
        <button
          onClick={() => onSubmit(selected)}
          disabled={submitting}
          className="mt-3 w-full sm:w-auto px-4 py-2 bg-brand text-white text-sm font-medium rounded-lg hover:bg-brand/90 disabled:opacity-50 transition-colors"
        >
          {submitting ? "Submitting..." : `Submit ${selected}/10`}
        </button>
      )}
    </div>
  );
}
