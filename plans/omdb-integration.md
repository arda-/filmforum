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
tenement-stories-full.json (existing movie data)
    ↓
[fetch_omdb.py] — query OMDb API for each film
    ↓
omdb-cache.json (cached API responses)
    ↓
[enrich_with_omdb.py] — merge scores into movie data
    ↓
tenement-stories-full.json (enriched with scores)
    ↓
App displays scores in modal
```

## Data Model Changes

Add fields to existing Movie interface:

```typescript
interface Movie {
  // ... existing fields ...

  // OMDb enrichment
  imdb_id?: string;           // "tt1234567" - for reliable lookups
  imdb_rating?: string;       // "7.9"
  rotten_tomatoes?: string;   // "97%"
  metacritic?: string;        // "82"
  omdb_plot?: string;         // Short plot summary
}
```

## New Files

```
data-processing/
├── fetch_omdb.py        # Query OMDb API, save to cache
├── enrich_with_omdb.py  # Merge cache into movie data
└── omdb-cache.json      # Cached API responses (committed to repo)

.env                     # OMDB_API_KEY (gitignored)
```

## Implementation Details

### 1. API Key Setup

- Get free API key from http://www.omdbapi.com/apikey.aspx
- Store in `.env` file as `OMDB_API_KEY=xxxxxxxx`
- Add `.env` to `.gitignore`

### 2. fetch_omdb.py

Responsibilities:
- Load existing movie data from `tenement-stories-full.json`
- For each film, query OMDb by title + year
- Save full API response to `omdb-cache.json`
- Rate limit: ~1 request/second (respect free tier)
- Skip films already in cache (idempotent re-runs)
- Log any films that fail to match

OMDb API call:
```
GET http://www.omdbapi.com/?apikey=KEY&t=MovieTitle&y=1931
```

### 3. enrich_with_omdb.py

Responsibilities:
- Load `tenement-stories-full.json`
- Load `omdb-cache.json`
- Match films by title (normalized) or IMDB ID if available
- Extract and copy: `imdbRating`, `Ratings` array (RT, Meta), `Plot`
- Write updated `tenement-stories-full.json`

### 4. Matching Strategy

1. **Primary:** Match by title + year (auto)
2. **Fallback:** Manually add `imdb_id` to movie data for edge cases that don't match
3. **Normalization:** Lowercase, strip punctuation, handle "The" prefix

### 5. Cache Strategy

- Commit `omdb-cache.json` to repo
- Small file size (~few KB per film)
- Enables development without API key
- Re-run fetch script only when adding new films

### 6. UI Changes

**Location:** Modal only — tiles stay clean.

**Layout (above/below fold):**
- Above the fold: Film Forum description (primary)
- Below the fold (on scroll): OMDb plot excerpt (secondary)

**Scores display:**
```
IMDB 7.9  ·  RT 97%  ·  Metacritic 82
```

**No match handling:** Show succinct message like "Ratings unavailable" when OMDb has no data for a film.

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
2. Load movies from `public/tenement-stories-full.json`
3. For each unique film title:
   - Check if already in `omdb-cache.json` → skip
   - Query OMDb: `GET /?apikey=KEY&t=TITLE&y=YEAR`
   - Save response to cache
   - Sleep 1 second (rate limit)
4. Log any failures (no match found)

### Phase 3: Create Enrichment Script

1. Create `data-processing/enrich_with_omdb.py`
2. Load `tenement-stories-full.json` and `omdb-cache.json`
3. For each movie, find matching cache entry by title
4. Extract and add: `imdb_id`, `imdb_rating`, `rotten_tomatoes`, `metacritic`, `omdb_plot`
5. Write updated JSON back

### Phase 4: Update UI

1. Update `MovieModal.astro` to display scores
2. Add scores row (IMDB · RT · Metacritic)
3. Add OMDb plot section below the fold
4. Handle missing data with "Ratings unavailable"

### Phase 5: Test & Commit

1. Run fetch script: `python data-processing/fetch_omdb.py`
2. Run enrich script: `python data-processing/enrich_with_omdb.py`
3. Verify JSON has new fields
4. Test modal displays correctly
5. Commit `omdb-cache.json` and updated movie data

---

## Affected Files

| File | Type | Changes |
|------|------|---------|
| `data-processing/fetch_omdb.py` | New | Script to query OMDb API |
| `data-processing/enrich_with_omdb.py` | New | Script to merge cache into movie data |
| `data-processing/omdb-cache.json` | New | Cached API responses |
| `.env` | New | API key storage (gitignored) |
| `.gitignore` | Edit | Add `.env` |
| `public/tenement-stories-full.json` | Edit | Add OMDb fields to movie objects |
| `src/components/MovieModal.astro` | Edit | Display scores + OMDb plot |
| `src/components/MovieModal.css` (if exists) | Edit | Style scores row + below-fold section |

---

## Future Considerations

- Could add Letterboxd data if API access is ever granted
- Could link IMDB ID to IMDB page for "more info"
- Could show score badges on calendar tiles for highly-rated films
