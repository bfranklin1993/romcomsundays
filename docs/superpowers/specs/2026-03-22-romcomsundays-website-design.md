# Rom Com Sundays — Website Design Spec

## Overview

A personal movie collection website for the @romcomsundays Instagram account. Users can browse rated romantic comedies, submit their own ratings, and suggest movies to watch. Content is managed via Google Sheets — the owner adds a row, and the site updates automatically.

## Pages

### 1. Collection (Home Page)

The landing page and primary experience. Displays all watched movies in a responsive card grid.

**Layout:**
- Top navigation: Logo (Damion font, #38A8F9), links to Collection, Suggest, About
- Search bar: text input for filtering movies by title
- Filter pills: horizontal row of toggleable filters
  - By streaming service (Netflix, Hulu, Prime, HBO, etc.)
  - By rating range (9+, 8+, etc.)
  - By year watched
  - "All" pill selected by default
- Movie grid: responsive card layout (4 columns desktop, 3 tablet, 2 mobile)
- Cards sorted by date watched (newest first) by default

**Movie Card:**
- Movie poster image (fetched via TMDB API or stored URL in sheet)
- Movie title
- Owner's score (e.g., "9.2") in #38A8F9 blue
- User average score (e.g., "Users: 8.7") in gray
- Streaming service badge (top-right corner of poster)
- Date watched

### 2. Movie Detail Modal

Opens when a user clicks a movie card. Overlays the collection page.

**Content:**
- Larger poster image
- Movie title and year released
- Owner's score (prominent, #38A8F9)
- User rating section:
  - Current average and vote count
  - Rating input (1-10 whole numbers) for users who haven't voted
  - Confirmation state after voting
- Streaming service (with icon/logo if possible)
- Date watched
- Close button (X) and click-outside-to-close

### 3. Suggest a Movie

Simple form page for visitors to recommend movies.

**Fields:**
- Movie title (required)
- Why you recommend it (optional, text area)
- Submit button

**Behavior:**
- Submissions stored in a separate tab in the same Google Sheet ("Suggestions" tab)
- Success message after submission
- No account required
- Basic spam prevention (honeypot field, rate limiting)

### 4. About

**Content:**
- Brief intro to Rom Com Sundays and the person behind it
- Link to @romcomsundays Instagram
- Optional: photo or logo

**Layout:**
- Simple centered content, minimal design
- Consistent nav with other pages

## User Rating System

**Goal:** Let visitors rate movies on a 1-10 scale without creating accounts.

**Voting mechanism:**
- User selects a whole number 1-10
- One vote per movie per browser
- Enforcement: localStorage flag per movie ID + browser fingerprint hash stored server-side
- If a user has already voted, show their vote and the current average (no re-voting)

**Display:**
- Owner's score: always shown, one decimal place (e.g., 7.4/10)
- User average: calculated from all votes, displayed as one decimal place
- Vote count shown in modal (e.g., "8.3 avg from 24 ratings")

**Storage:**
- Ratings stored in Vercel KV (or equivalent key-value store)
- Key: movie ID, Value: array of {fingerprint_hash, score}
- Fingerprint: hash of user-agent + screen resolution + timezone + localStorage token

## Data Management

### Google Sheets CMS

**Sheet structure (one row per movie):**
| Column | Type | Example |
|--------|------|---------|
| id | string (auto/manual) | "when-harry-met-sally" |
| title | string | "When Harry Met Sally" |
| year | number | 1989 |
| score | number (one decimal) | 9.2 |
| date_watched | date | 2025-01-05 |
| streaming_service | string | "Netflix" |
| poster_url | URL (optional) | TMDB image URL |
| tmdb_id | number (optional) | 639 |

If `poster_url` is empty but `tmdb_id` is provided, the build process fetches the poster from TMDB API.

**Access:** Google Sheets API (read-only, via service account)

### Site Rebuild Strategy

- **Periodic:** Vercel cron job triggers rebuild every 60 minutes
- **On-demand:** Owner can hit a webhook URL (bookmarkable) to trigger immediate rebuild
- **Process:** Next.js ISR (Incremental Static Regeneration) fetches sheet data at build time, generates static pages

## Tech Stack

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| Framework | Next.js (App Router) | Static generation, API routes for ratings, Vercel-native |
| Hosting | Vercel (free tier) | Zero-config Next.js hosting, built-in cron, KV |
| CMS | Google Sheets | Non-technical owner can manage content easily |
| Ratings DB | Vercel KV (Redis) | Simple key-value storage, free tier sufficient |
| Styling | Tailwind CSS | Utility-first, fast to build, easy to maintain |
| Fonts | Google Fonts (Damion + Inter) | Matches existing brand |
| Movie data | TMDB API (optional) | Auto-fetch poster images and metadata (API key stored as Vercel env var) |

## Design Tokens

| Token | Value |
|-------|-------|
| Primary blue | #38A8F9 |
| Background | #FFFFFF |
| Card background | #F8F9FA |
| Text primary | #222222 |
| Text secondary | #888888 |
| Text muted | #BBBBBB |
| Filter pill active bg | #38A8F9 |
| Filter pill inactive bg | #F0F7FF |
| Border/divider | #F0F0F0 |
| Header font | Damion (cursive) |
| Body font | Inter (sans-serif) |
| Border radius (cards) | 8px |
| Border radius (pills) | 16px |

## Responsive Breakpoints

| Breakpoint | Grid Columns | Notes |
|-----------|-------------|-------|
| Desktop (1024px+) | 4 columns | Full nav, search bar visible |
| Tablet (768-1023px) | 3 columns | Slightly condensed |
| Mobile (< 768px) | 2 columns | Hamburger nav, stacked filters |

## Out of Scope

- User accounts / authentication (the owner's "admin" is the Google Sheet itself — no admin panel needed)
- Comments or reviews from users
- Social sharing features
- Stats/analytics page
- Integration with Instagram API for auto-posting
- Transfer portal (ha)
