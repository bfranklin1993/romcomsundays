import type { MovieWithRatings } from "@/lib/types";

const SERVICE_COLORS: Record<string, string> = {
  "Netflix": "bg-[#E50914]",
  "Hulu": "bg-[#1CE783]",
  "HBO Max": "bg-[#B835FC]",
  "Disney+": "bg-[#113CCF]",
  "Prime Video": "bg-[#00A8E1]",
  "Apple TV+": "bg-[#555555]",
  "Peacock": "bg-[#F4B400]",
  "Paramount+": "bg-[#0064FF]",
  "Showtime": "bg-[#FF0000]",
  "Tubi": "bg-[#FA382F]",
  "FreeVee": "bg-[#39FF14] text-black",
  "Freevee": "bg-[#39FF14] text-black",
  "DVD": "bg-[#666666]",
};

function getServiceClass(service: string) {
  return SERVICE_COLORS[service] || "bg-black/60";
}

interface MovieCardProps {
  movie: MovieWithRatings;
  onClick: () => void;
}

export function MovieCard({ movie, onClick }: MovieCardProps) {
  const formattedDate = new Date(movie.dateWatched).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div
      onClick={onClick}
      className="rounded-card overflow-hidden bg-card-bg cursor-pointer hover:shadow-md transition-shadow"
    >
      <div className="relative aspect-[2/3] bg-gray-200">
        {movie.posterUrl ? (
          <img
            src={movie.posterUrl}
            alt={movie.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl">
            🎬
          </div>
        )}
        <span className={`absolute top-2 right-2 text-white px-2.5 py-1 rounded-md text-[11px] font-bold ${getServiceClass(movie.streamingService)}`}>
          {movie.streamingService}
        </span>
      </div>
      <div className="p-3">
        <h3 className="text-xs font-semibold mb-1 truncate">{movie.title}</h3>
        <div className="flex justify-between items-center">
          <span className="text-sm font-bold text-brand">{movie.score.toFixed(1)}</span>
          <span className="text-[10px] text-text-secondary">
            {movie.userRatingAvg !== null
              ? `Users: ${movie.userRatingAvg.toFixed(1)}`
              : "No ratings yet"}
          </span>
        </div>
        <p className="text-[10px] text-text-muted mt-1">{formattedDate}</p>
      </div>
    </div>
  );
}
