# OMDb Integration Plan

## Goal

Add critic/audience scores (Rotten Tomatoes, Metacritic, IMDB) and a short plot blurb to film data using the free OMDb API.

## Why OMDb

| Source | API Access | What You Get | Cost |
|--------|------------|--------------|------|
| OMDb | Free tier (1,000 req/day) | RT score, Metacritic, IMDB rating, plot | Free |
| Rotten Tomatoes | Enterprise only | Same data, direct | ~$65K/year |
| TMDB | Free | Only TMDB user ratings (not RT/Meta) | Free |

OMDb is the only free way to get recognizable critic scores (RT, Metacritic).

## Data Flow

```
tenement-stories-full.json          omdb-data.json
(Film Forum data - unchanged)       (OMDb data - separate)
            ↓                              ↓
            └──────────┬───────────────────┘
                       ↓
              UI joins by title+year
                       ↓
              Modal displays both sources
```

**Key principle:** Film Forum data pipeline stays isolated. OMDb is a parallel data source joined at display time.

## Data Model Changes

**Film Forum Movie interface:** Unchanged.

**New OMDb interface (separate file):**

```typescript
interface OMDbEntry {
  // Lookup key
  title: string;              // Normalized title for matching
  year: string;               // "1931"

  // Scores
  imdb_id: string;            // "tt0022448"
  imdb_rating: string | null; // "7.2" or null if unavailable
  rotten_tomatoes: string | null; // "88%" or null
  metacritic: string | null;  // "70" or null

  // Content
  plot: string | null;        // Short plot summary
}

// omdb-data.json structure: keyed by "title::year" for fast lookup
type OMDbData = Record<string, OMDbEntry>;
```

**Lookup example:**
```typescript
const key = `${movie.Movie.toLowerCase()}::${movie.year}`;
const omdb = omdbData[key]; // may be undefined
```

## New Files

```
data-processing/
└── fetch_omdb.py        # Query OMDb API, output to public/omdb-data.json

public/
└── omdb-data.json       # OMDb data (committed, loaded by UI)

.env                     # OMDB_API_KEY (gitignored)
```

## Implementation Details

### 1. API Key Setup

- Get free API key from http://www.omdbapi.com/apikey.aspx
- Store in `.env` file as `OMDB_API_KEY=xxxxxxxx`
- Add `.env` to `.gitignore`

### 2. fetch_omdb.py

Responsibilities:
- Load movie list from `public/tenement-stories-full.json` (read-only)
- Extract unique title+year combinations
- For each film, query OMDb by title + year
- Transform response into `OMDbEntry` format
- Write to `public/omdb-data.json` (keyed by `title::year`)
- Rate limit: ~1 request/second (respect free tier)
- Skip films already in output file (idempotent re-runs)
- Log any films that fail to match

OMDb API call:
```
GET http://www.omdbapi.com/?apikey=KEY&t=MovieTitle&y=1931
```

### 3. Matching Strategy

1. **Primary:** Query OMDb with `?t={title}&y={year}`
2. **Retry:** If no match, try `?t={title}` without year
3. **Normalization:** Lowercase, strip punctuation, handle "The" prefix
4. **Manual overrides:** Script maintains a dict of known problem titles → IMDB IDs
5. **Failures:** Log unmatched films for manual review

### 4. Data Storage

- Commit `public/omdb-data.json` to repo
- Small file size (~few KB per film)
- Enables development without API key
- Re-run fetch script only when adding new films
- Film Forum data never touched

### 5. UI Changes

**Location:** Modal only — tiles stay clean.

**No match handling:** Show succinct message like "Ratings unavailable" when OMDb has no data for a film.

#### Modal Wireframe

```
┌─────────────────────────────────────────┐
│                   ✕                     │  ← close button
├─────────────────────────────────────────┤
│  ┌───────────────────────────────────┐  │
│  │                                   │  │
│  │         [POSTER IMAGE]            │  │
│  │                                   │  │
│  └───────────────────────────────────┘  │
│                                         │
│  Street Scene                           │  ← title
│  1931 · King Vidor · 80 min             │  ← meta (year, director, runtime)
│  Sylvia Sidney, William Collier Jr.     │  ← actors
│                                         │
│  ╭───────────────────────────────────╮  │
│  │ "A slice-of-life drama set on a  │  │  ← Film Forum description
│  │  single New York City block..."  │  │     (primary)
│  ╰───────────────────────────────────╯  │
│                                    — FF │
│                                         │
│ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ │  ← fold (scroll to see below)
│                                         │
│  ┌───────────────────────────────────┐  │
│  │ IMDB 7.2  ·  RT 88%  ·  Meta 70   │  │  ← NEW: scores row
│  └───────────────────────────────────┘  │
│                                         │
│  ┌───────────────────────────────────┐  │
│  │ A symphony of life on a single   │  │  ← NEW: OMDb plot
│  │ street in New York City...       │  │     (secondary)
│  └───────────────────────────────────┘  │
│                                    — OMDb│
│                                         │
│  [ View on IMDB ↗ ]                     │  ← NEW: external link
│  [ View on Film Forum ↗ ]               │  ← existing link (moved here)
│                                         │
├─────────────────────────────────────────┤
│  ┌─────────────────────────────────────┐│
│  │         [ Buy Tickets ]             ││  ← sticky footer
│  │         [ Add to Calendar ]         ││
│  └─────────────────────────────────────┘│
└─────────────────────────────────────────┘
```

#### Scores Row Detail

```
┌─────────────────────────────────────────┐
│  IMDB 7.2  ·  RT 88%  ·  Meta 70        │  ← all scores present
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│  IMDB 7.2  ·  RT 88%                    │  ← metacritic missing
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│  Ratings unavailable                    │  ← no OMDb match
└─────────────────────────────────────────┘
```

## Example OMDb Response

```json
{
  "Title": "Street Scene",
  "Year": "1931",
  "imdbID": "tt0022448",
  "imdbRating": "7.2",
  "Ratings": [
    {"Source": "Internet Movie Database", "Value": "7.2/10"},
    {"Source": "Rotten Tomatoes", "Value": "88%"},
    {"Source": "Metacritic", "Value": "70/100"}
  ],
  "Plot": "A symphony of life on a single street in New York City...",
  "Response": "True"
}
```

## Decisions

- [x] **OMDb plot vs description:** Show both. Film Forum description above the fold, OMDb plot below the fold on scroll.
- [x] **Scores location:** Modal only. Tiles stay clean.
- [x] **No OMDb match:** Show succinct "Ratings unavailable" message.

---

## OMDb API Reference

**Documentation:** https://www.omdbapi.com/

### Relevant Endpoints

| Endpoint | Purpose | Example |
|----------|---------|---------|
| `?t={title}&y={year}` | Get by title + year | `?t=Street+Scene&y=1931` |
| `?i={imdbId}` | Get by IMDB ID (more reliable) | `?i=tt0022448` |
| `?s={query}` | Search (returns multiple results) | `?s=Street+Scene` |

### Parameters We'll Use

| Param | Required | Description |
|-------|----------|-------------|
| `apikey` | Yes | Your API key |
| `t` | One of t/i/s | Title to search |
| `i` | One of t/i/s | IMDB ID (preferred for exact match) |
| `y` | No | Year (helps disambiguate titles) |
| `plot` | No | `short` (default) or `full` |
| `r` | No | `json` (default) or `xml` |

### Response Fields We'll Extract

| Field | Maps To | Example |
|-------|---------|---------|
| `imdbID` | `imdb_id` | `"tt0022448"` |
| `imdbRating` | `imdb_rating` | `"7.2"` |
| `Ratings[1].Value` | `rotten_tomatoes` | `"88%"` |
| `Ratings[2].Value` | `metacritic` | `"70/100"` |
| `Plot` | `omdb_plot` | `"A symphony of..."` |

---

## Step-by-Step Setup Guide

### Phase 1: API Setup

1. Go to https://www.omdbapi.com/apikey.aspx
2. Request a free API key (1,000 daily requests)
3. Verify via email
4. Create `.env` in project root:
   ```
   OMDB_API_KEY=your_key_here
   ```
5. Ensure `.env` is in `.gitignore`

### Phase 2: Create Fetch Script

1. Create `data-processing/fetch_omdb.py`
2. Load movies from `public/tenement-stories-full.json` (read-only)
3. Extract unique title+year combinations
4. For each unique film:
   - Check if already in `public/omdb-data.json` → skip
   - Query OMDb: `GET /?apikey=KEY&t=TITLE&y=YEAR`
   - If no match, try without year
   - Transform to `OMDbEntry` format
   - Sleep 1 second (rate limit)
5. Write all entries to `public/omdb-data.json`
6. Log any failures (no match found) for manual review

### Phase 3: Update UI

1. Update `MovieModal.astro` to display scores
2. Add scores row (IMDB · RT · Metacritic)
3. Add OMDb plot section below the fold
4. Handle missing data with "Ratings unavailable"

### Phase 4: Test & Commit

1. Run fetch script: `python data-processing/fetch_omdb.py`
2. Verify `public/omdb-data.json` has entries
3. Test modal displays scores correctly
4. Test "Ratings unavailable" fallback
5. Commit `public/omdb-data.json`

---

## Affected Files

| File | Type | Changes |
|------|------|---------|
| `data-processing/fetch_omdb.py` | New | Script to query OMDb API, output to omdb-data.json |
| `public/omdb-data.json` | New | OMDb data keyed by title::year (committed) |
| `.env` | New | API key storage (gitignored) |
| `.gitignore` | Edit | Add `.env` |
| `src/components/MovieModal.astro` | Edit | Load omdb-data.json, display scores + OMDb plot |
| `src/pages/index.astro` | Edit | Fetch omdb-data.json alongside movie data |

**Unchanged:** `public/tenement-stories-full.json` (Film Forum data stays isolated)

---

## Future Considerations

- Could add Letterboxd data if API access is ever granted
- Could link IMDB ID to IMDB page for "more info"
- Could show score badges on calendar tiles for highly-rated films
- **Apple-style drawer modal** — redesign as bottom sheet with full-bleed poster (see `plans/apple-drawer-modal.md`)
