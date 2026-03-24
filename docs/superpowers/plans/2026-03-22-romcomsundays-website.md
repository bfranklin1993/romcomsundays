# Rom Com Sundays Website — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a clean, poster-focused movie collection website where visitors can browse rated rom-coms, submit ratings, and suggest movies — powered by Google Sheets as the CMS.

**Architecture:** Next.js App Router with static generation. Google Sheets API provides movie data at build time. User ratings stored in Vercel KV via API routes. Tailwind CSS for styling. Revalidation via cron + on-demand webhook.

**Tech Stack:** Next.js 15, Tailwind CSS, Google Sheets API, Vercel KV, TMDB API (posters), Vercel hosting

**Spec:** `docs/superpowers/specs/2026-03-22-romcomsundays-website-design.md`

---

## File Structure

```
romcomsundays/
├── src/
│   ├── app/
│   │   ├── layout.tsx              # Root layout: fonts, nav, metadata
│   │   ├── page.tsx                # Collection home page (movie grid)
│   │   ├── suggest/
│   │   │   └── page.tsx            # Suggest a Movie form page
│   │   ├── about/
│   │   │   └── page.tsx            # About page
│   │   └── api/
│   │       ├── ratings/
│   │       │   └── route.ts        # GET/POST user ratings (Vercel KV)
│   │       ├── suggest/
│   │       │   └── route.ts        # POST movie suggestions to Google Sheets
│   │       └── revalidate/
│   │           └── route.ts        # On-demand revalidation webhook
│   ├── components/
│   │   ├── Navbar.tsx              # Top navigation bar
│   │   ├── MovieCard.tsx           # Individual movie card in grid
│   │   ├── MovieGrid.tsx           # Responsive grid container with search/filters
│   │   ├── MovieModal.tsx          # Detail modal with rating widget
│   │   ├── SearchBar.tsx           # Search input
│   │   ├── FilterPills.tsx         # Streaming service / rating filter pills
│   │   └── RatingWidget.tsx        # 1-10 rating selector for users
│   ├── lib/
│   │   ├── sheets.ts              # Google Sheets API client (fetch movies)
│   │   ├── tmdb.ts                # TMDB API client (fetch poster URLs)
│   │   ├── fingerprint.ts         # Browser fingerprint generation (client-side)
│   │   └── types.ts               # Shared TypeScript types (Movie, Rating, etc.)
│   └── styles/
│       └── globals.css            # Tailwind directives + custom font imports
├── public/
│   └── (static assets if needed)
├── tailwind.config.ts
├── next.config.ts
├── package.json
├── tsconfig.json
├── vercel.json                    # Cron config for periodic revalidation
├── .env.local.example             # Template for env vars
└── .gitignore
```

---

### Task 1: Project Scaffolding & Configuration

**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.ts`, `tailwind.config.ts`, `src/styles/globals.css`, `src/app/layout.tsx`, `.env.local.example`, `.gitignore`, `vercel.json`

- [ ] **Step 1: Initialize Next.js project**

Run:
```bash
cd /Users/brianfranklin/Documents/romcomsundays
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --use-npm
```

Accept defaults. This creates the full project scaffold.

- [ ] **Step 2: Install additional dependencies**

Run:
```bash
npm install googleapis @vercel/kv
```

- [ ] **Step 3: Create environment variable template**

Create `.env.local.example`:
```env
# Google Sheets
GOOGLE_SHEETS_ID=your_sheet_id_here
GOOGLE_SERVICE_ACCOUNT_EMAIL=your_service_account@project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# TMDB (for poster images)
TMDB_API_KEY=your_tmdb_api_key

# Vercel KV (auto-populated by Vercel when KV is linked)
KV_REST_API_URL=
KV_REST_API_TOKEN=

# Revalidation
REVALIDATION_SECRET=your_secret_token_here
```

- [ ] **Step 4: Update `.gitignore`**

Ensure these are included:
```
.env.local
.env*.local
.superpowers/
```

- [ ] **Step 5: Configure Tailwind with design tokens**

Update `tailwind.config.ts`:
```typescript
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: "#38A8F9",
        "card-bg": "#F8F9FA",
        "text-primary": "#222222",
        "text-secondary": "#888888",
        "text-muted": "#BBBBBB",
        "pill-inactive": "#F0F7FF",
        divider: "#F0F0F0",
      },
      fontFamily: {
        damion: ["Damion", "cursive"],
        inter: ["Inter", "sans-serif"],
      },
      borderRadius: {
        card: "8px",
        pill: "16px",
      },
    },
  },
  plugins: [],
};
export default config;
```

- [ ] **Step 6: Set up global styles and fonts**

Update `src/styles/globals.css`:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

- [ ] **Step 7: Set up root layout with fonts and metadata**

Update `src/app/layout.tsx`:
```tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/Navbar";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "Rom Com Sundays",
  description: "A curated collection of romantic comedies, rated and reviewed every Sunday.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Damion&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={`${inter.variable} font-inter bg-white text-text-primary`}>
        <Navbar />
        <main>{children}</main>
      </body>
    </html>
  );
}
```

Note: We load Damion via Google Fonts link since `next/font/google` doesn't always include display/handwriting fonts reliably. Inter is loaded via `next/font/google` for performance.

- [ ] **Step 8: Create Navbar component (placeholder)**

Create `src/components/Navbar.tsx`:
```tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function Navbar() {
  const pathname = usePathname();

  const links = [
    { href: "/", label: "Collection" },
    { href: "/suggest", label: "Suggest" },
    { href: "/about", label: "About" },
  ];

  return (
    <nav className="flex items-center justify-between px-6 py-4 border-b-2 border-divider">
      <Link href="/" className="font-damion text-2xl text-brand">
        Rom Com Sundays
      </Link>
      <div className="flex gap-5 text-sm">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={
              pathname === link.href
                ? "text-brand font-semibold"
                : "text-text-secondary hover:text-text-primary"
            }
          >
            {link.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
```

- [ ] **Step 9: Create placeholder home page**

Update `src/app/page.tsx`:
```tsx
export default function Home() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <h1 className="font-damion text-4xl text-brand">Coming soon...</h1>
    </div>
  );
}
```

- [ ] **Step 10: Create vercel.json for cron**

Create `vercel.json`:
```json
{
  "crons": [
    {
      "path": "/api/revalidate?secret=${REVALIDATION_SECRET}",
      "schedule": "0 * * * *"
    }
  ]
}
```

- [ ] **Step 11: Verify dev server starts**

Run:
```bash
npm run dev
```

Expected: Dev server starts at localhost:3000, shows "Coming soon..." with Damion font and blue brand color. Navbar shows three links.

- [ ] **Step 12: Commit**

```bash
git add -A
git commit -m "feat: scaffold Next.js project with Tailwind, fonts, and nav"
```

---

### Task 2: Types & Google Sheets Data Layer

**Files:**
- Create: `src/lib/types.ts`, `src/lib/sheets.ts`

- [ ] **Step 1: Define shared types**

Create `src/lib/types.ts`:
```typescript
export interface Movie {
  id: string;
  title: string;
  year: number;
  score: number;
  dateWatched: string; // ISO date string
  streamingService: string;
  posterUrl: string | null;
  tmdbId: number | null;
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
```

- [ ] **Step 2: Build Google Sheets client**

Create `src/lib/sheets.ts`:
```typescript
import { google } from "googleapis";
import type { Movie } from "./types";

function getAuth() {
  return new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    },
    scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
  });
}

function getSheetsWriteAuth() {
  return new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    },
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
}

export async function fetchMovies(): Promise<Movie[]> {
  const auth = getAuth();
  const sheets = google.sheets({ version: "v4", auth });

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: process.env.GOOGLE_SHEETS_ID,
    range: "Movies!A2:H",
  });

  const rows = response.data.values;
  if (!rows || rows.length === 0) return [];

  return rows.map((row) => ({
    id: row[0] || "",
    title: row[1] || "",
    year: parseInt(row[2], 10) || 0,
    score: parseFloat(row[3]) || 0,
    dateWatched: row[4] || "",
    streamingService: row[5] || "",
    posterUrl: row[6] || null,
    tmdbId: row[7] ? parseInt(row[7], 10) : null,
  }));
}

export async function appendSuggestion(title: string, reason: string): Promise<void> {
  const auth = getSheetsWriteAuth();
  const sheets = google.sheets({ version: "v4", auth });

  await sheets.spreadsheets.values.append({
    spreadsheetId: process.env.GOOGLE_SHEETS_ID,
    range: "Suggestions!A:C",
    valueInputOption: "USER_ENTERED",
    requestBody: {
      values: [[title, reason, new Date().toISOString()]],
    },
  });
}
```

- [ ] **Step 3: Commit**

```bash
git add src/lib/types.ts src/lib/sheets.ts
git commit -m "feat: add types and Google Sheets data layer"
```

---

### Task 3: TMDB Poster Fetching

**Files:**
- Create: `src/lib/tmdb.ts`
- Modify: `src/lib/sheets.ts` (add poster enrichment)

- [ ] **Step 1: Build TMDB client**

Create `src/lib/tmdb.ts`:
```typescript
const TMDB_BASE = "https://api.themoviedb.org/3";
const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p/w500";

export async function fetchPosterUrl(tmdbId: number): Promise<string | null> {
  const apiKey = process.env.TMDB_API_KEY;
  if (!apiKey) return null;

  try {
    const res = await fetch(`${TMDB_BASE}/movie/${tmdbId}?api_key=${apiKey}`);
    if (!res.ok) return null;

    const data = await res.json();
    return data.poster_path ? `${TMDB_IMAGE_BASE}${data.poster_path}` : null;
  } catch {
    return null;
  }
}
```

- [ ] **Step 2: Add poster enrichment to sheets.ts**

Add this function to `src/lib/sheets.ts`:
```typescript
import { fetchPosterUrl } from "./tmdb";

export async function fetchMoviesWithPosters(): Promise<Movie[]> {
  const movies = await fetchMovies();

  const enriched = await Promise.all(
    movies.map(async (movie) => {
      if (movie.posterUrl) return movie;
      if (!movie.tmdbId) return movie;

      const posterUrl = await fetchPosterUrl(movie.tmdbId);
      return { ...movie, posterUrl };
    })
  );

  return enriched;
}
```

- [ ] **Step 3: Commit**

```bash
git add src/lib/tmdb.ts src/lib/sheets.ts
git commit -m "feat: add TMDB poster fetching and movie enrichment"
```

---

### Task 4: Collection Page — Movie Grid, Search & Filters

**Files:**
- Create: `src/components/SearchBar.tsx`, `src/components/FilterPills.tsx`, `src/components/MovieCard.tsx`, `src/components/MovieGrid.tsx`
- Modify: `src/app/page.tsx`

- [ ] **Step 1: Build SearchBar component**

Create `src/components/SearchBar.tsx`:
```tsx
"use client";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

export function SearchBar({ value, onChange }: SearchBarProps) {
  return (
    <input
      type="text"
      placeholder="Search movies..."
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-4 py-2.5 border-[1.5px] border-divider rounded-lg text-sm bg-gray-50 outline-none focus:border-brand transition-colors"
    />
  );
}
```

- [ ] **Step 2: Build FilterPills component**

Create `src/components/FilterPills.tsx`:
```tsx
"use client";

interface FilterPillsProps {
  services: string[];
  activeServices: string[];
  activeRating: string | null; // "9+", "8+", etc.
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

      {/* Streaming services */}
      {services.map((service) => (
        <button
          key={service}
          onClick={() => onToggleService(service)}
          className={pillClass(activeServices.includes(service))}
        >
          {service}
        </button>
      ))}

      {/* Rating range */}
      {["9+", "8+", "7+"].map((rating) => (
        <button
          key={rating}
          onClick={() => onSetRating(activeRating === rating ? null : rating)}
          className={pillClass(activeRating === rating)}
        >
          {rating}
        </button>
      ))}

      {/* Year watched */}
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
```

- [ ] **Step 3: Build MovieCard component**

Create `src/components/MovieCard.tsx`:
```tsx
import type { MovieWithRatings } from "@/lib/types";

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
        <span className="absolute top-2 right-2 bg-black/60 text-white px-2 py-0.5 rounded text-[10px] font-semibold">
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
```

- [ ] **Step 4: Build MovieGrid component**

Create `src/components/MovieGrid.tsx`:
```tsx
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
```

- [ ] **Step 5: Wire up Collection page**

Update `src/app/page.tsx`:
```tsx
import { fetchMoviesWithPosters } from "@/lib/sheets";
import { CollectionClient } from "./CollectionClient";

export const revalidate = 3600; // revalidate every hour

export default async function Home() {
  const movies = await fetchMoviesWithPosters();

  // Sort by date watched, newest first
  const sorted = [...movies].sort(
    (a, b) => new Date(b.dateWatched).getTime() - new Date(a.dateWatched).getTime()
  );

  // Ratings will be fetched client-side per movie
  const moviesWithRatings = sorted.map((m) => ({
    ...m,
    userRatingAvg: null,
    userRatingCount: 0,
  }));

  return <CollectionClient movies={moviesWithRatings} />;
}
```

Create `src/app/CollectionClient.tsx`:
```tsx
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
```

Create a placeholder `src/components/MovieModal.tsx` (built fully in Task 6):
```tsx
import type { MovieWithRatings } from "@/lib/types";

interface MovieModalProps {
  movie: MovieWithRatings;
  onClose: () => void;
}

export function MovieModal({ movie, onClose }: MovieModalProps) {
  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl p-6 max-w-lg w-full mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-bold">{movie.title}</h2>
        <p className="text-text-secondary">Modal details coming in Task 6</p>
        <button onClick={onClose} className="mt-4 text-brand font-medium">
          Close
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 6: Verify page renders with mock data**

If you don't have Google Sheets set up yet, temporarily add mock data to `page.tsx` to verify the grid renders correctly. Replace the `fetchMoviesWithPosters()` call with hardcoded movies for local testing.

Run:
```bash
npm run dev
```

Expected: Movie grid renders with cards, search filters by title, filter pills toggle by streaming service.

- [ ] **Step 7: Commit**

```bash
git add src/components/SearchBar.tsx src/components/FilterPills.tsx src/components/MovieCard.tsx src/components/MovieGrid.tsx src/components/MovieModal.tsx src/app/page.tsx src/app/CollectionClient.tsx
git commit -m "feat: build collection page with movie grid, search, and filters"
```

---

### Task 5: Ratings API & Fingerprinting

**Files:**
- Create: `src/lib/fingerprint.ts`, `src/app/api/ratings/route.ts`

- [ ] **Step 1: Build client-side fingerprint utility**

Create `src/lib/fingerprint.ts`:
```typescript
export async function generateFingerprint(): Promise<string> {
  const components = [
    navigator.userAgent,
    screen.width + "x" + screen.height,
    Intl.DateTimeFormat().resolvedOptions().timeZone,
    getOrCreateToken(),
  ];

  const raw = components.join("|");
  const encoder = new TextEncoder();
  const data = encoder.encode(raw);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

function getOrCreateToken(): string {
  const key = "rcs_token";
  let token = localStorage.getItem(key);
  if (!token) {
    token = crypto.randomUUID();
    localStorage.setItem(key, token);
  }
  return token;
}

export function hasVoted(movieId: string): boolean {
  return localStorage.getItem(`rcs_voted_${movieId}`) === "true";
}

export function markVoted(movieId: string): void {
  localStorage.setItem(`rcs_voted_${movieId}`, "true");
}
```

- [ ] **Step 2: Build ratings API route**

Create `src/app/api/ratings/route.ts`:
```typescript
import { kv } from "@vercel/kv";
import { NextRequest, NextResponse } from "next/server";

interface StoredRating {
  fingerprintHash: string;
  score: number;
}

// GET /api/ratings?movieId=xxx
export async function GET(request: NextRequest) {
  const movieId = request.nextUrl.searchParams.get("movieId");
  if (!movieId) {
    return NextResponse.json({ error: "movieId required" }, { status: 400 });
  }

  const ratings: StoredRating[] = (await kv.get(`ratings:${movieId}`)) || [];
  const avg =
    ratings.length > 0
      ? ratings.reduce((sum, r) => sum + r.score, 0) / ratings.length
      : null;

  return NextResponse.json({
    movieId,
    average: avg !== null ? Math.round(avg * 10) / 10 : null,
    count: ratings.length,
  });
}

// POST /api/ratings { movieId, score, fingerprintHash }
export async function POST(request: NextRequest) {
  const body = await request.json();
  const { movieId, score, fingerprintHash } = body;

  if (!movieId || !fingerprintHash || typeof score !== "number") {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  if (score < 1 || score > 10 || !Number.isInteger(score)) {
    return NextResponse.json({ error: "Score must be integer 1-10" }, { status: 400 });
  }

  const key = `ratings:${movieId}`;
  const ratings: StoredRating[] = (await kv.get(key)) || [];

  // Check for duplicate fingerprint
  if (ratings.some((r) => r.fingerprintHash === fingerprintHash)) {
    return NextResponse.json({ error: "Already voted" }, { status: 409 });
  }

  ratings.push({ fingerprintHash, score });
  await kv.set(key, ratings);

  const avg = ratings.reduce((sum, r) => sum + r.score, 0) / ratings.length;

  return NextResponse.json({
    movieId,
    average: Math.round(avg * 10) / 10,
    count: ratings.length,
  });
}
```

- [ ] **Step 3: Commit**

```bash
git add src/lib/fingerprint.ts src/app/api/ratings/route.ts
git commit -m "feat: add ratings API and browser fingerprinting"
```

---

### Task 6: Movie Detail Modal with Rating Widget

**Files:**
- Create: `src/components/RatingWidget.tsx`
- Modify: `src/components/MovieModal.tsx` (replace placeholder)

- [ ] **Step 1: Build RatingWidget component**

Create `src/components/RatingWidget.tsx`:
```tsx
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
      <div className="flex gap-1.5">
        {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
          <button
            key={n}
            onMouseEnter={() => setHovered(n)}
            onMouseLeave={() => setHovered(null)}
            onClick={() => setSelected(n)}
            className={`w-8 h-8 rounded text-xs font-semibold transition-colors ${
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
          className="mt-3 px-4 py-1.5 bg-brand text-white text-sm font-medium rounded-lg hover:bg-brand/90 disabled:opacity-50 transition-colors"
        >
          {submitting ? "Submitting..." : `Submit ${selected}/10`}
        </button>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Build full MovieModal component**

Replace `src/components/MovieModal.tsx`:
```tsx
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

    // Fetch latest ratings
    fetch(`/api/ratings?movieId=${movie.id}`)
      .then((r) => r.json())
      .then((data) => {
        setRatingAvg(data.average);
        setRatingCount(data.count);
      })
      .catch(() => {});
  }, [movie.id]);

  // Close on Escape
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
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Poster */}
        <div className="relative aspect-[2/3] max-h-[300px] w-full bg-gray-200 rounded-t-xl overflow-hidden">
          {movie.posterUrl ? (
            <img
              src={movie.posterUrl}
              alt={movie.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-6xl">
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

        {/* Details */}
        <div className="p-5">
          <h2 className="text-xl font-bold mb-1">{movie.title}</h2>
          <p className="text-sm text-text-secondary mb-4">
            {movie.year} · {movie.streamingService}
          </p>

          {/* Scores */}
          <div className="flex gap-6 mb-5">
            <div>
              <p className="text-xs text-text-secondary mb-1">My Score</p>
              <p className="text-3xl font-bold text-brand">
                {movie.score.toFixed(1)}
              </p>
            </div>
            <div>
              <p className="text-xs text-text-secondary mb-1">User Average</p>
              {ratingAvg !== null ? (
                <>
                  <p className="text-3xl font-bold text-text-primary">
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

          {/* Rating Widget */}
          <div className="mb-4 pt-4 border-t border-divider">
            <RatingWidget
              movieId={movie.id}
              hasVoted={voted}
              onSubmit={handleRatingSubmit}
              submitting={submitting}
            />
          </div>

          {/* Date */}
          <p className="text-xs text-text-muted">Watched {formattedDate}</p>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Verify modal opens and displays correctly**

Run:
```bash
npm run dev
```

Expected: Clicking a movie card opens the modal with poster, scores, rating widget, and streaming service. Escape and click-outside close the modal.

- [ ] **Step 4: Commit**

```bash
git add src/components/RatingWidget.tsx src/components/MovieModal.tsx
git commit -m "feat: build movie detail modal with rating widget"
```

---

### Task 7: Suggest a Movie Page

**Files:**
- Create: `src/app/suggest/page.tsx`, `src/app/api/suggest/route.ts`

- [ ] **Step 1: Build suggestion API route**

Create `src/app/api/suggest/route.ts`:
```typescript
import { appendSuggestion } from "@/lib/sheets";
import { NextRequest, NextResponse } from "next/server";

const RATE_LIMIT_MS = 30_000; // 30 seconds between submissions
const recentSubmissions = new Map<string, number>();

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { title, reason, honeypot } = body;

  // Spam check: honeypot field should be empty
  if (honeypot) {
    return NextResponse.json({ success: true }); // Fake success for bots
  }

  if (!title || typeof title !== "string" || title.trim().length === 0) {
    return NextResponse.json({ error: "Movie title is required" }, { status: 400 });
  }

  // Basic rate limiting by IP
  const ip = request.headers.get("x-forwarded-for") || "unknown";
  const lastSubmission = recentSubmissions.get(ip);
  if (lastSubmission && Date.now() - lastSubmission < RATE_LIMIT_MS) {
    return NextResponse.json(
      { error: "Please wait before submitting again" },
      { status: 429 }
    );
  }

  await appendSuggestion(title.trim(), (reason || "").trim());
  recentSubmissions.set(ip, Date.now());

  return NextResponse.json({ success: true });
}
```

- [ ] **Step 2: Build Suggest page**

Create `src/app/suggest/page.tsx`:
```tsx
"use client";

import { useState } from "react";

export default function SuggestPage() {
  const [title, setTitle] = useState("");
  const [reason, setReason] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("submitting");

    try {
      const res = await fetch("/api/suggest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, reason, honeypot }),
      });

      if (res.ok) {
        setStatus("success");
        setTitle("");
        setReason("");
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  }

  return (
    <div className="max-w-lg mx-auto px-6 py-12">
      <h1 className="font-damion text-3xl text-brand mb-2">Suggest a Movie</h1>
      <p className="text-text-secondary text-sm mb-8">
        Know a rom-com I should watch? Let me know!
      </p>

      {status === "success" ? (
        <div className="bg-green-50 text-green-800 rounded-lg p-4 text-sm">
          Thanks for the suggestion! I&apos;ll check it out.
          <button
            onClick={() => setStatus("idle")}
            className="block mt-2 text-brand font-medium"
          >
            Suggest another
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium mb-1">
              Movie Title <span className="text-red-400">*</span>
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full px-4 py-2.5 border-[1.5px] border-divider rounded-lg text-sm outline-none focus:border-brand transition-colors"
              placeholder="e.g., You've Got Mail"
            />
          </div>

          <div>
            <label htmlFor="reason" className="block text-sm font-medium mb-1">
              Why should I watch it?
            </label>
            <textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              className="w-full px-4 py-2.5 border-[1.5px] border-divider rounded-lg text-sm outline-none focus:border-brand transition-colors resize-none"
              placeholder="Optional — tell me why you love it"
            />
          </div>

          {/* Honeypot — hidden from real users */}
          <input
            type="text"
            value={honeypot}
            onChange={(e) => setHoneypot(e.target.value)}
            className="hidden"
            tabIndex={-1}
            autoComplete="off"
            aria-hidden="true"
          />

          <button
            type="submit"
            disabled={status === "submitting"}
            className="w-full py-2.5 bg-brand text-white font-medium rounded-lg hover:bg-brand/90 disabled:opacity-50 transition-colors"
          >
            {status === "submitting" ? "Sending..." : "Submit Suggestion"}
          </button>

          {status === "error" && (
            <p className="text-red-500 text-sm">
              Something went wrong. Please try again.
            </p>
          )}
        </form>
      )}
    </div>
  );
}
```

- [ ] **Step 3: Verify Suggest page renders and form submits**

Run:
```bash
npm run dev
```

Navigate to `/suggest`. Expected: Clean form with title input, optional reason textarea, submit button. Honeypot field is hidden.

- [ ] **Step 4: Commit**

```bash
git add src/app/suggest/page.tsx src/app/api/suggest/route.ts
git commit -m "feat: add suggest-a-movie page and API route"
```

---

### Task 8: About Page

**Files:**
- Create: `src/app/about/page.tsx`

- [ ] **Step 1: Build About page**

Create `src/app/about/page.tsx`:
```tsx
export default function AboutPage() {
  return (
    <div className="max-w-lg mx-auto px-6 py-12 text-center">
      <h1 className="font-damion text-4xl text-brand mb-4">Rom Com Sundays</h1>
      <p className="text-text-secondary leading-relaxed mb-6">
        Every Sunday, I watch a romantic comedy and rate it. This site is my
        collection — every movie I&apos;ve watched, scored, and cataloged. Think of
        it as a rom-com diary.
      </p>
      <p className="text-text-secondary leading-relaxed mb-8">
        Have a movie I should watch? Head over to the{" "}
        <a href="/suggest" className="text-brand font-medium hover:underline">
          Suggest
        </a>{" "}
        page and let me know.
      </p>
      <a
        href="https://instagram.com/romcomsundays"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-block px-6 py-2.5 bg-brand text-white font-medium rounded-lg hover:bg-brand/90 transition-colors"
      >
        Follow @romcomsundays
      </a>
    </div>
  );
}
```

- [ ] **Step 2: Verify About page renders**

Run: `npm run dev`, navigate to `/about`.
Expected: Centered content with Damion header, description text, link to Suggest page, Instagram button.

- [ ] **Step 3: Commit**

```bash
git add src/app/about/page.tsx
git commit -m "feat: add about page"
```

---

### Task 9: Revalidation Webhook

**Files:**
- Create: `src/app/api/revalidate/route.ts`

- [ ] **Step 1: Build revalidation API route**

Create `src/app/api/revalidate/route.ts`:
```typescript
import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const secret = request.nextUrl.searchParams.get("secret");

  if (secret !== process.env.REVALIDATION_SECRET) {
    return NextResponse.json({ error: "Invalid secret" }, { status: 401 });
  }

  revalidatePath("/");

  return NextResponse.json({ revalidated: true, timestamp: new Date().toISOString() });
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/api/revalidate/route.ts
git commit -m "feat: add on-demand revalidation webhook"
```

---

### Task 10: Polish & Final Verification

**Files:**
- Modify: various (minor tweaks)

- [ ] **Step 1: Add responsive hamburger menu to Navbar**

Update `src/components/Navbar.tsx` to include a mobile hamburger toggle:
```tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function Navbar() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  const links = [
    { href: "/", label: "Collection" },
    { href: "/suggest", label: "Suggest" },
    { href: "/about", label: "About" },
  ];

  return (
    <nav className="px-6 py-4 border-b-2 border-divider">
      <div className="flex items-center justify-between">
        <Link href="/" className="font-damion text-2xl text-brand">
          Rom Com Sundays
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex gap-5 text-sm">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={
                pathname === link.href
                  ? "text-brand font-semibold"
                  : "text-text-secondary hover:text-text-primary"
              }
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden text-text-secondary text-xl"
          aria-label="Toggle menu"
        >
          {menuOpen ? "✕" : "☰"}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden mt-4 flex flex-col gap-3 text-sm">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className={
                pathname === link.href
                  ? "text-brand font-semibold"
                  : "text-text-secondary hover:text-text-primary"
              }
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}
```

- [ ] **Step 2: Run full build to check for errors**

Run:
```bash
npm run build
```

Expected: Build succeeds with no TypeScript or compilation errors.

- [ ] **Step 3: Test all pages in dev mode**

Run:
```bash
npm run dev
```

Manually verify:
- `/` — Grid renders, search works, filters toggle, card click opens modal
- `/suggest` — Form renders, submit works (or shows error gracefully if no Sheets connected)
- `/about` — Content renders, Instagram link works
- Modal — Rating widget displays, Escape closes, click-outside closes
- Mobile — Hamburger menu works, grid goes to 2 columns

- [ ] **Step 4: Final commit**

```bash
git add -A
git commit -m "feat: add responsive nav and final polish"
```

---

## Post-Implementation: Deployment Setup

These steps happen after the code is built and working locally:

1. **Google Cloud Console:** Create a service account, enable Sheets API, download credentials
2. **Google Sheet:** Create the sheet with "Movies" and "Suggestions" tabs, share with service account email
3. **TMDB:** Create free account, get API key
4. **Vercel:** Import repo, add environment variables, link KV store
5. **Revalidation bookmark:** Save `https://your-domain.vercel.app/api/revalidate?secret=YOUR_SECRET` as a browser bookmark for manual refreshes
