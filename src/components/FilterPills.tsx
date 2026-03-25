"use client";

interface FilterBarProps {
  services: string[];
  activeService: string | null;
  activeRating: string | null;
  sort: string;
  onSetService: (service: string | null) => void;
  onSetRating: (rating: string | null) => void;
  onSetSort: (sort: string) => void;
}

const SORT_LABELS: Record<string, string> = {
  newest: "Newest First",
  oldest: "Oldest First",
  highest: "Highest Rated",
  lowest: "Lowest Rated",
  "a-z": "A → Z",
  "z-a": "Z → A",
};

export function FilterBar({
  services,
  activeService,
  activeRating,
  sort,
  onSetService,
  onSetRating,
  onSetSort,
}: FilterBarProps) {
  const selectClass = "px-3 py-2 border border-divider rounded-lg text-sm bg-white outline-none focus:border-brand w-full sm:w-auto";

  return (
    <div className="grid grid-cols-3 sm:flex sm:flex-wrap gap-2 sm:gap-3">
      {/* Streaming service */}
      <select
        value={activeService || ""}
        onChange={(e) => onSetService(e.target.value || null)}
        className={selectClass}
      >
        <option value="">All Services</option>
        {services.map((service) => (
          <option key={service} value={service}>
            {service}
          </option>
        ))}
      </select>

      {/* Rating filter */}
      <select
        value={activeRating || ""}
        onChange={(e) => onSetRating(e.target.value || null)}
        className={selectClass}
      >
        <option value="">All Ratings</option>
        <option value="9">9+</option>
        <option value="8">8+</option>
        <option value="7">7+</option>
        <option value="6">6+</option>
      </select>

      {/* Sort */}
      <select
        value={sort}
        onChange={(e) => onSetSort(e.target.value)}
        className={selectClass}
      >
        {Object.entries(SORT_LABELS).map(([value, label]) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>
    </div>
  );
}
