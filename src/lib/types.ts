export interface Movie {
  id: string;
  title: string;
  year: number;
  score: number;
  dateWatched: string; // ISO date string
  streamingService: string;
  posterUrl: string | null;
}

export interface Rating {
  fingerprintHash: string;
  score: number;
}

export interface MovieWithRatings extends Movie {
  userRatingAvg: number | null;
  userRatingCount: number;
}

export interface Suggestion {
  title: string;
  reason: string;
  submittedAt: string;
}
