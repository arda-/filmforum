# Film Forum Data Pipeline

This document describes how Film Forum showtime data is scraped, processed, and rendered in the Tenement Stories calendar application.

## Pipeline Overview

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐     ┌──────────────────┐
│  Data Sources   │ ──▶ │  HTML Scraping   │ ──▶ │  Processing     │ ──▶ │  Astro Frontend  │
│                 │     │                  │     │                 │     │                  │
│ • Schedule TXT  │     │ • Download pages │     │ • Parse HTML    │     │ • Calendar grid  │
│ • Film Forum    │     │ • Save to        │     │ • Extract meta  │     │ • Timeline view  │
│   website       │     │   movie-pages/   │     │ • Download      │     │ • Filtering      │
│                 │     │                  │     │   posters       │     │ • Modal details  │
└─────────────────┘     └──────────────────┘     └─────────────────┘     └──────────────────┘
```

## Directory Structure

```
filmforum/
├── data-processing/           # Scraping and processing scripts
│   ├── movie-pages/           # Downloaded HTML files (one per film)
│   ├── movie-urls.txt         # URLs to scrape
│   ├── tenement-stories-schedule.txt   # Manual schedule input
│   ├── tenement-stories.csv   # Parsed showtimes (raw)
│   ├── tenement-stories-evenings.csv   # Filtered showtimes
│   ├── tenement-stories-evenings.json  # JSON with metadata
│   ├── parse_showtimes.py     # HTML → CSV parser
│   ├── extract_and_download_posters.sh  # Poster downloader (bash)
│   └── process_posters.py     # Comprehensive poster processor
├── public/
│   ├── posters/               # Downloaded poster images
│   ├── tenement-stories-full.json  # Final JSON for frontend
│   └── tenement-stories-evenings.json
└── src/
    ├── pages/index.astro      # Main calendar page
    └── components/            # UI components
```

## Step 1: Data Input

### Manual Schedule Entry

The schedule is manually transcribed to `tenement-stories-schedule.txt`:

```
Friday, February 6
  6:10  STREET SCENE  https://my.filmforum.org/events/street-scene
  8:00  THE WINDOW  https://my.filmforum.org/events/the-window-tene

Saturday, February 7
  12:40  THREE ON A MATCH  https://my.filmforum.org/events/three-on-a-match
  ...
```

Format:
- Date headers: `{Day}, {Month} {Date}`
- Showtime lines: `  {Time}  {TITLE}  {ticket_url}`
- FF Jr. shows: `  11:00 – FF Jr.  THE KID  {url}`

### Film URLs

`movie-urls.txt` contains Film Forum URLs to scrape:

```
https://filmforum.org/film/street-scene-tenement-stories
https://filmforum.org/film/the-window-tenement-stories
...
```

## Step 2: HTML Scraping

### Download Film Pages

Film pages are downloaded and saved to `movie-pages/`:

```bash
# Example: Download all URLs
while read url; do
  slug=$(basename "$url")
  curl -sL "$url" -o "movie-pages/${slug}.html"
done < movie-urls.txt
```

Each HTML file contains:
- `og:image` meta tag → poster URL
- `<link rel="canonical">` → film URL
- Film metadata in page content

## Step 3: Data Processing

### Parse Showtimes (`parse_showtimes.py`)

Extracts showtimes from a downloaded HTML page:

```python
# Pattern matches: title, schedule, ticket URL
pattern = r'<h3 class="title style-c"><a class="blue-type"[^>]*>([^<]+)</a></h3>.*?'
          r'<div class="details">\s*<p>([^<]*(?:<br />[^<]*)*)</p>.*?'
          r'<a class="button small blue" href="([^"]+)">Buy Tickets</a>'
```

Output: `tenement-stories.csv`
```csv
Movie,Date,Time,Tickets
STREET SCENE,Friday February 6,6:10,https://my.filmforum.org/events/street-scene
```

### Download Posters (`process_posters.py`)

1. **Extract poster URLs** from `og:image` meta tags
2. **Download images** to `public/posters/`
3. **Update JSON** with local poster paths

```python
# Extract from HTML
poster_match = re.search(r'property="og:image"\s+content="([^"]+)"', content)
film_url_match = re.search(r'<link rel="canonical" href="([^"]+)"', content)
```

### Final JSON Structure

`public/tenement-stories-full.json`:

```json
[
  {
    "Movie": "STREET SCENE",
    "Date": "Friday, February 6",
    "Time": "6:10",
    "Tickets": "https://my.filmforum.org/events/street-scene",
    "Datetime": "2026-02-06T18:10:00",
    "country": "U.S.",
    "year": "1931",
    "director": "King Vidor",
    "actors": "Sylvia Sidney, William Collier Jr., ...",
    "runtime": "80 minutes",
    "description": "The film depicts life at a working-class...",
    "film_url": "https://filmforum.org/film/street-scene-tenement-stories",
    "poster_url": "/posters/street-scene.png"
  }
]
```

### Required Fields

| Field | Source | Description |
|-------|--------|-------------|
| `Movie` | Schedule TXT | Film title (uppercase) |
| `Date` | Schedule TXT | Human-readable date |
| `Time` | Schedule TXT | Showtime (e.g., "6:10") |
| `Tickets` | Schedule TXT | Ticketing URL |
| `Datetime` | Computed | ISO 8601 datetime |
| `year` | Film page | Release year |
| `director` | Film page | Director name |
| `actors` | Film page | Cast list |
| `runtime` | Film page | Duration in minutes |
| `description` | Film page | Synopsis |
| `film_url` | Film page | Film Forum page URL |
| `poster_url` | Film page | Local poster path |

## Step 4: Frontend Rendering

### Astro Application

The Astro app (`src/pages/index.astro`) fetches JSON client-side:

```javascript
fetch('/tenement-stories-full.json')
  .then(res => res.json())
  .then((movies) => {
    // Group by date
    movies.forEach(movie => {
      const date = movie.Datetime.split('T')[0];
      moviesByDate[date].push(movie);
    });
    renderAllDays();
  });
```

### View Modes

1. **List View**: Movies listed chronologically within each day
2. **Timeline View**: Movies positioned by time, scaled to runtime

### Filtering Options

- **Availability**: All / After 5pm & weekends / Weekends only
- **Single Showtimes**: Off / Highlight unique / Only show unique

### Time Parsing

```javascript
function parseTimeToMins(timeStr) {
  const match = timeStr.match(/(\d{1,2}):(\d{2})/);
  let h = parseInt(match[1]);
  const m = parseInt(match[2]);
  // FF Jr. shows are morning (AM)
  const isMorning = timeStr.includes('FF Jr');
  // 12:XX is always noon (PM), 1-11 without FF Jr are PM
  if (!isMorning && h !== 12 && h < 12) h += 12;
  return h * 60 + m;
}
```

## Running the Pipeline

### Full Refresh

```bash
# 1. Download film pages (if URLs changed)
cd data-processing
while read url; do
  slug=$(basename "$url")
  curl -sL "$url" -o "movie-pages/${slug}.html"
  sleep 1
done < movie-urls.txt

# 2. Process posters and update JSON
python3 process_posters.py

# 3. Copy final JSON to public
cp tenement-stories-evenings.json ../public/tenement-stories-full.json

# 4. Build and preview
cd ..
pnpm build
pnpm preview
```

### Incremental Update

For schedule changes only (no new films):

1. Update `tenement-stories-schedule.txt`
2. Re-run `parse_showtimes.py`
3. Merge new showtimes with existing metadata
4. Copy to `public/`

## Data Validation

### Checklist

- [ ] All showtimes have valid ISO datetime
- [ ] All films have poster images downloaded
- [ ] No duplicate showtimes (same film, same datetime)
- [ ] Ticket URLs are valid
- [ ] Runtime is in "XX minutes" format

### Common Issues

| Issue | Cause | Fix |
|-------|-------|-----|
| Missing poster | og:image not found | Check HTML structure |
| Wrong time (AM/PM) | FF Jr. detection failed | Check time string format |
| Broken ticket link | URL truncated | Check schedule TXT |

## Future Improvements

- [ ] Automate scraping from Film Forum website
- [ ] Add JSON schema validation
- [ ] Implement incremental poster downloads
- [ ] Add data freshness timestamps
- [ ] Support multiple series (not just Tenement Stories)
