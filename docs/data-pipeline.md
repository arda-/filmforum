# Film Forum Data Pipeline

Technical documentation for scraping, processing, and rendering Film Forum showtime data.

## Overview

This project scrapes Film Forum's website to create an interactive calendar for film series (currently "Tenement Stories"). The pipeline extracts showtimes, film metadata, and poster images, then renders them in an Astro-based web application.

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐     ┌──────────────────┐
│  Data Sources   │ ──▶ │  HTML Scraping   │ ──▶ │  Processing     │ ──▶ │  Astro Frontend  │
│                 │     │                  │     │                 │     │                  │
│ • Series page   │     │ • curl/wget      │     │ • Python regex  │     │ • Calendar grid  │
│ • Film pages    │     │ • Save HTML      │     │ • qsv (CSV)     │     │ • Timeline view  │
│                 │     │                  │     │ • jq (JSON)     │     │ • Filtering      │
└─────────────────┘     └──────────────────┘     └─────────────────┘     └──────────────────┘
```

## Directory Structure

```
filmforum/
├── data-processing/
│   ├── movie-pages/                    # Downloaded HTML (one per film)
│   ├── movie-urls.txt                  # Film page URLs to scrape
│   ├── tenement-stories.csv            # All showtimes (97 total)
│   ├── tenement-stories-evenings.csv   # Filtered showtimes (57 evening/weekend)
│   ├── tenement-stories-evenings.json  # Enriched JSON with metadata
│   ├── tenement-stories-schedule.txt   # Human-readable grouped schedule
│   ├── parse_showtimes.py              # HTML → CSV parser
│   ├── extract_and_download_posters.sh # Poster downloader (bash)
│   └── process_posters.py              # Poster processor + JSON updater
├── public/
│   ├── posters/                        # Downloaded poster images
│   └── tenement-stories-full.json      # Final JSON served to frontend
├── src/
│   ├── pages/index.astro               # Main calendar page
│   ├── components/                     # Astro UI components
│   ├── styles/global.css               # Shared styles
│   └── constants/                      # App constants
└── docs/
    ├── data-pipeline.md                # This document
    └── filmforum-scraping.md           # Film Forum website analysis
```

## Tools Required

| Tool | Purpose | Install |
|------|---------|---------|
| **curl** | Download HTML pages | Built-in |
| **python3** | Parse HTML with regex | Built-in |
| **qsv** | CSV manipulation (filter, sort, convert) | `brew install qsv` |
| **jq** | JSON manipulation (merge, group, filter) | `brew install jq` |
| **pnpm** | Package manager for Astro | `npm install -g pnpm` |

> **Note:** `qsv` is the maintained fork of `xsv` (deprecated April 2025). Alternative: `xan` for research-focused use.

## Data Schema

### JSON Structure (`tenement-stories-full.json`)

```json
{
  "Movie": "STREET SCENE",
  "Date": "Friday, February 6",
  "Time": "6:10",
  "Tickets": "https://my.filmforum.org/events/street-scene",
  "Datetime": "2026-02-06T18:10:00",
  "country": "U.S.",
  "year": "1931",
  "director": "King Vidor",
  "actors": "Sylvia Sidney, William Collier Jr., Beulah Bondi...",
  "runtime": "80 minutes",
  "description": "The film depicts life at a working-class...",
  "film_url": "https://filmforum.org/film/street-scene-tenement-stories",
  "poster_url": "/posters/street-scene.png"
}
```

### Field Reference

| Field | Source | Format | Example |
|-------|--------|--------|---------|
| `Movie` | Series page | Uppercase title | `"STREET SCENE"` |
| `Date` | Series page | `{Day}, {Month} {Date}` | `"Friday, February 6"` |
| `Time` | Series page | 12-hour, no AM/PM | `"6:10"` or `"11:00 – FF Jr."` |
| `Tickets` | Series page | Full URL | `"https://my.filmforum.org/..."` |
| `Datetime` | Computed | ISO 8601 | `"2026-02-06T18:10:00"` |
| `year` | Film page | 4-digit year | `"1931"` |
| `director` | Film page | Name(s) | `"King Vidor"` |
| `actors` | Film page | Comma-separated | `"Sylvia Sidney, ..."` |
| `runtime` | Film page | `{N} minutes` | `"80 minutes"` |
| `description` | Film page | Synopsis text | `"The film depicts..."` |
| `film_url` | Film page | Canonical URL | `"https://filmforum.org/film/..."` |
| `poster_url` | Film page | Local path | `"/posters/street-scene.png"` |

## Pipeline Steps

### 1. Download Series Page

```bash
curl -s "https://filmforum.org/series/tenement-stories" -o tenement-stories.html
```

### 2. Parse Showtimes

The `parse_showtimes.py` script extracts movie blocks from HTML:

```python
# Regex pattern for movie blocks
pattern = r'<h3 class="title style-c"><a class="blue-type"[^>]*>([^<]+)</a></h3>.*?' \
          r'<div class="details">\s*<p>([^<]*(?:<br />[^<]*)*)</p>.*?' \
          r'<a class="button small blue" href="([^"]+)">Buy Tickets</a>'
```

Run:
```bash
python3 parse_showtimes.py
# Output: Extracted 97 showtimes for 49 movies
```

### 3. Filter Evening/Weekend Showtimes

Keep only accessible showtimes (weekends + weekday evenings):

```bash
qsv luau filter '
  local day = col.Date:match("^(%w+)")
  local hour = tonumber(col.Time:match("^(%d+)"))
  local weekdays = {Monday=true, Tuesday=true, Wednesday=true, Thursday=true, Friday=true}

  if not weekdays[day] then
    return true  -- weekend: keep all
  else
    return hour >= 5 and hour < 12  -- weekday: 5pm+ only
  end
' tenement-stories.csv > tenement-stories-evenings.csv
```

Result: 97 → 57 showtimes

### 4. Add ISO Datetime

Convert 12-hour times to ISO 8601 datetime:

```bash
qsv luau map Datetime '
  local day = tonumber(col.Date:match("February (%d+)"))
  local hour = tonumber(col.Time:match("^(%d+)"))
  local min = tonumber(col.Time:match(":(%d+)"))
  local is_ffjr = col.Time:match("FF Jr")

  -- Convert to 24-hour
  if is_ffjr and hour == 11 then
    -- 11 AM stays 11
  elseif hour == 12 then
    -- noon stays 12
  elseif hour >= 1 and hour <= 10 then
    hour = hour + 12
  end

  return string.format("2026-02-%02dT%02d:%02d:00", day, hour, min)
' tenement-stories-evenings.csv | qsv sort -s Datetime | qsv tojsonl > tenement-stories-evenings.json
```

### 5. Extract Film Page URLs

```bash
grep -oE 'https://filmforum.org/film/[^"]+tenement-stories' tenement-stories.html | sort -u > movie-urls.txt
```

### 6. Download Film Pages

```bash
while read url; do
  slug=$(basename "$url")
  curl -sL "$url" -o "movie-pages/${slug}.html"
  sleep 1
done < movie-urls.txt
```

### 7. Scrape Film Metadata

Extract from each film page:
- `og:image` meta tag → poster URL
- `<link rel="canonical">` → film URL
- Page content → year, director, actors, runtime, description

### 8. Merge Metadata into Showtimes

```bash
jq -s '
  (.[1] | map({key: (.title | ascii_upcase), value: .}) | from_entries) as $details |
  .[0] | map(
    ($details[.Movie | ascii_upcase] // {}) as $d |
    . + {country: $d.country, year: $d.year, director: $d.director,
         actors: $d.actors, runtime: $d.runtime, description: $d.description,
         film_url: $d.url}
  )
' <(jq -s '.' tenement-stories-evenings.json) <(jq -s '.' movie-details.jsonl) \
  | jq -c '.[]' > tenement-stories-evenings.json
```

### 9. Download Posters

```bash
python3 process_posters.py
```

This script:
1. Extracts poster URLs from `og:image` in each HTML file
2. Downloads images to `public/posters/`
3. Updates JSON with local `poster_url` paths

### 10. Deploy to Frontend

```bash
cp tenement-stories-evenings.json ../public/tenement-stories-full.json
pnpm build
```

## Time Handling

Times in the source data are 12-hour format without AM/PM indicators.

| Time Format | Interpretation |
|-------------|----------------|
| `11:00 – FF Jr.` | 11:00 AM (kids' show) |
| `12:xx` | 12:00 PM (noon) |
| `1:xx` - `10:xx` | PM (add 12 for 24-hour) |

Frontend time parsing:
```javascript
function parseTimeToMins(timeStr) {
  const match = timeStr.match(/(\d{1,2}):(\d{2})/);
  let h = parseInt(match[1]);
  const m = parseInt(match[2]);
  const isMorning = timeStr.includes('FF Jr');
  if (!isMorning && h !== 12 && h < 12) h += 12;
  return h * 60 + m;
}
```

## Useful Commands

### View schedule grouped by day
```bash
jq -rs 'sort_by(.Datetime) | group_by(.Date) | .[] |
  "\n" + .[0].Date + "\n" + (map("  " + .Time + "  " + .Movie) | join("\n"))
' tenement-stories-evenings.json
```

### Filter by director
```bash
jq '[.[] | select(.director | test("Scorsese"))]' tenement-stories-full.json
```

### List unique movies
```bash
jq -s '[.[] | {movie: .Movie, year: .year, director: .director}] | unique_by(.movie)' \
  tenement-stories-evenings.json
```

### Pretty print CSV
```bash
qsv table tenement-stories-evenings.csv
```

### Generate human-readable schedule
```bash
jq -rs 'sort_by(.Datetime) | to_entries | reduce .[] as $e (
  {last: "", out: []};
  if .last == $e.value.Date then
    .out += ["  " + $e.value.Time[0:15] + "  " + $e.value.Movie + "  " + $e.value.Tickets]
  else
    .out += ["", $e.value.Date, "  " + $e.value.Time[0:15] + "  " + $e.value.Movie + "  " + $e.value.Tickets]
    | .last = $e.value.Date
  end
) | .out | join("\n")' tenement-stories-evenings.json
```

## Frontend Features

### View Modes
- **List View**: Movies listed chronologically within each day
- **Timeline View**: Movies positioned vertically by time, height scaled to runtime

### Filtering
- **Availability**: All / After 5pm & weekends / Weekends only
- **Single Showtimes**: Off / Highlight unique (★) / Only show unique

### Components

| Component | Purpose |
|-----------|---------|
| `Header.astro` | Series title, venue, date range |
| `CalendarGrid.astro` | 7-column grid with day headers |
| `DayCell.astro` | Day container with date label |
| `MovieModal.astro` | Film detail popup with poster |
| `Switch.astro` | Toggle controls |
| `ToggleGroup.astro` | Radio button groups |

### Typography
- **Primary font**: IBM Plex Sans (excellent small-size rendering)
- **Condensed titles**: Barlow Semi Condensed (mobile)

## Data Validation Checklist

- [ ] All showtimes have valid ISO `Datetime`
- [ ] All films have `poster_url` (downloaded to `public/posters/`)
- [ ] No duplicate showtimes (same film + datetime)
- [ ] Ticket URLs resolve correctly
- [ ] Runtime format is `"XX minutes"`
- [ ] Date format is consistent (`"Day, Month Date"`)

## Important: Film Forum Page Lifecycle

**Film Forum removes individual film pages after their showtimes pass.** `/film/{slug}` URLs will return 404 once the screening run ends. Always scrape and cache film metadata (description, runtime, director, actors) as soon as pages are available. Do not assume you can re-fetch this data later.

## Known Issues

| Issue | Cause | Solution |
|-------|-------|----------|
| Missing poster | `og:image` not in HTML | Check film page structure |
| Wrong AM/PM | FF Jr. detection failed | Verify time string includes "FF Jr" |
| Broken ticket link | URL truncated in source | Check series page HTML |
| Inconsistent dates | Source formatting varies | Run sed fix (see below) |

Fix date inconsistency:
```bash
sed -i '' 's/Sunday February 15/Sunday, February 15/g' *.csv *.json
```

## Notes

- FF Jr. screenings (11:00 AM) are Sunday morning kids' shows
- Some entries are double features (e.g., "Pull My Daisy / George Kuchar's Bronx")
- The ticketing system (`my.filmforum.org`) has bot protection; scraping requires browser headers
