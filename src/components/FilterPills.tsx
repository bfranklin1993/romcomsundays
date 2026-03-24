"use client";

interface FilterPillsProps {
  services: string[];
  activeServices: string[];
  activeRating: string | null;
  activeYear: string | null;
  years: string[];
  onToggleService: (service: string) => void;
  onSetRating: (rating: string | null) => void;
  onSetYear: (year: string | null) => void;
}

export function FilterPills({
  services,
  activeServices,
  activeRating,
  activeYear,
  years,
  onToggleService,
  onSetRating,
  onSetYear,
}: FilterPillsProps) {
  const noFilters = activeServices.length === 0 && !activeRating && !activeYear;

  function pillClass(active: boolean) {
    return `px-3 py-1.5 rounded-pill text-xs font-medium transition-colors ${
      active
        ? "bg-brand text-white"
        : "bg-pill-inactive text-brand hover:bg-brand/10"
    }`;
  }

  return (
    <div className="flex gap-2 flex-wrap">
      <button
        onClick={() => {
          onToggleService("all");
          onSetRating(null);
          onSetYear(null);
        }}
        className={pillClass(noFilters)}
      >
        All
      </button>

      {services.map((service) => (
        <button
          key={service}
          onClick={() => onToggleService(service)}
          className={pillClass(activeServices.includes(service))}
        >
          {service}
        </button>
      ))}

      {["9+", "8+", "7+"].map((rating) => (
        <button
          key={rating}
          onClick={() => onSetRating(activeRating === rating ? null : rating)}
          className={pillClass(activeRating === rating)}
        >
          {rating}
        </button>
      ))}

      {years.map((year) => (
        <button
          key={year}
          onClick={() => onSetYear(activeYear === year ? null : year)}
          className={pillClass(activeYear === year)}
        >
          {year}
        </button>
      ))}
    </div>
  );
}
