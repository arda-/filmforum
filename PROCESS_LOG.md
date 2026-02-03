# Film Forum Scraping Process Log

**Date:** February 3, 2026
**Source:** https://filmforum.org/series/tenement-stories
**Series:** "Tenement Stories: From Immigrants to Bohemians" (Feb 6-26, 2026)

---

## Step 1: Fetch and Save HTML

Downloaded the Film Forum series page locally for processing.

```bash
curl -s "https://filmforum.org/series/tenement-stories" -o tenement-stories.html
```

**Output:** `tenement-stories.html` (194KB)

---

## Step 2: Parse Showtimes with Python

Created a Python script to extract movie titles, dates, times, and ticket URLs from the HTML.

**Script:** `parse_showtimes.py`

```python
import re
import csv
import html as html_lib

# Read the HTML file
with open('/Users/ardaungun/code/filmforum/tenement-stories.html', 'r') as f:
    html = f.read()

# Find all movie blocks with title, schedule, and ticket link
# Pattern captures: title, schedule, and Buy Tickets URL
pattern = r'<h3 class="title style-c"><a class="blue-type"[^>]*>([^<]+)</a></h3>.*?<div class="details">\s*<p>([^<]*(?:<br />[^<]*)*)</p>.*?<a class="button small blue" href="([^"]+)">Buy Tickets</a>'

matches = re.findall(pattern, html, re.DOTALL)

# Parse each movie and its showtimes
rows = []
for title, schedule_html, ticket_url in matches:
    title = title.strip()
    # Clean up the schedule - split by <br />
    lines = re.split(r'<br\s*/>', schedule_html)
    lines = [l.strip() for l in lines if l.strip()]

    # Parse date-time pairs
    current_date = None
    for line in lines:
        # Clean HTML entities
        line = html_lib.unescape(line).strip()
        if re.match(r'(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)', line):
            current_date = line
        elif re.match(r'\d{1,2}:\d{2}', line) and current_date:
            time = line
            rows.append([title, current_date, time, ticket_url])

# Write CSV
with open('/Users/ardaungun/code/filmforum/tenement-stories.csv', 'w', newline='') as f:
    writer = csv.writer(f)
    writer.writerow(['Movie', 'Date', 'Time', 'Tickets'])
    writer.writerows(rows)

print(f"Extracted {len(rows)} showtimes for {len(set(r[0] for r in rows))} movies")
```

**Run:**
```bash
python3 parse_showtimes.py
# Output: Extracted 97 showtimes for 49 movies
```

**Output:** `tenement-stories.csv`

---

## Step 3: Install qsv (CSV Toolkit)

Installed `qsv` for CSV manipulation in the terminal. This is the maintained fork of `xsv` (by the same author as ripgrep).

```bash
brew install qsv
```

**Note:** `xsv` was deprecated in April 2025. Alternatives:
- **qsv** (https://github.com/dathere/qsv) - recommended, feature-rich
- **xan** (https://github.com/medialab/xan) - research-focused alternative

**Usage:**
```bash
qsv table file.csv      # Pretty print
qsv select cols file    # Select columns
qsv sort -s col file    # Sort by column
qsv luau filter '...'   # Filter with Lua expressions
qsv tojsonl file.csv    # Convert to JSON Lines
```

---

## Step 4: Filter Weekday Showtimes Before 5pm

Created a filtered version keeping only:
- All weekend (Saturday/Sunday) showtimes
- Weekday showtimes at 5pm or later

```bash
qsv luau filter '
  local day = col.Date:match("^(%w+)")
  local hour = tonumber(col.Time:match("^(%d+)"))
  local weekdays = {Monday=true, Tuesday=true, Wednesday=true, Thursday=true, Friday=true}

  if not weekdays[day] then
    return true  -- weekend, keep all
  else
    return hour >= 5 and hour < 12  -- weekday evening (5pm+)
  end
' tenement-stories.csv > tenement-stories-evenings.csv
```

**Result:** 97 → 57 showtimes

---

## Step 5: Add ISO Datetime and Convert to JSON

Added proper ISO datetime for sorting, handling 12-hour time format:
- FF Jr. screenings at 11:00 = 11 AM
- 12:xx = 12 PM (noon)
- 1:xx - 10:xx = PM (add 12 for 24-hour format)

```bash
qsv luau map Datetime '
  local day = tonumber(col.Date:match("February (%d+)"))
  local hour = tonumber(col.Time:match("^(%d+)"))
  local min = tonumber(col.Time:match(":(%d+)"))
  local is_ffjr = col.Time:match("FF Jr")

  -- Convert to 24h
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

---

## Step 6: Fix Data Inconsistency

The source HTML had inconsistent date formatting ("Sunday February 15" vs "Sunday, February 15"). Fixed with sed:

```bash
sed -i '' 's/Sunday February 15/Sunday, February 15/g' tenement-stories-evenings.csv tenement-stories-evenings.json tenement-stories.csv
```

---

## Step 7: Generate Grouped Schedule

Created a human-readable schedule grouped by day with blank lines between days:

```bash
jq -rs 'sort_by(.Datetime) | to_entries | reduce .[] as $e (
  {last: "", out: []};
  if .last == $e.value.Date then
    .out += ["  " + ($e.value.Time[0:15] | gsub(" +$";"")) + "  " + $e.value.Movie + "  " + $e.value.Tickets]
  else
    .out += ["", $e.value.Date, "  " + ($e.value.Time[0:15] | gsub(" +$";"")) + "  " + $e.value.Movie + "  " + $e.value.Tickets] | .last = $e.value.Date
  end
) | .out | join("\n")' tenement-stories-evenings.json > tenement-stories-schedule.txt
```

**Output:** `tenement-stories-schedule.txt`

---

## Step 8: Extract Movie Page URLs

Extracted all unique film detail page URLs from the HTML:

```bash
grep -oE 'https://filmforum.org/film/[^"]+tenement-stories' tenement-stories.html | sort -u > movie-urls.txt
```

**Result:** 51 unique movie URLs

---

## Step 9: Scrape Movie Details (Parallel Agents)

Scraped each movie's detail page to extract:
- Country
- Year
- Director
- Actors
- Runtime
- Description

Used 5 parallel background agents, each processing ~10 URLs:

```
Batch 1: a-raisin-in-the-sun through hester-street (10 movies)
Batch 2: his-people through mean-streets (10 movies)
Batch 3: mixed-blood through something-wild (10 movies)
Batch 4: speedy through the-crowd (10 movies)
Batch 5: the-godfather-part-ii through west-side-story (11 movies)
```

Each agent used `WebFetch` to scrape pages and saved results as JSONL.

---

## Step 10: Merge Movie Details into Showtimes

Merged the scraped movie details into the showtimes JSON by matching movie titles:

```bash
jq -s '
  # Load movie details as a lookup by uppercase title
  (.[1] | map({key: (.title | ascii_upcase | gsub("\\s+$"; "")), value: .}) | from_entries) as $details |

  # Enrich each showtime with movie details
  .[0] | map(
    . as $show |
    ($show.Movie | ascii_upcase | gsub("\\s+$"; "")) as $key |
    if $details[$key] then
      . + {
        country: $details[$key].country,
        year: $details[$key].year,
        director: $details[$key].director,
        actors: $details[$key].actors,
        runtime: $details[$key].runtime,
        description: $details[$key].description,
        film_url: $details[$key].url
      }
    else . end
  )
' <(jq -s '.' tenement-stories-evenings.json) <(jq -s '.' movie-details-all.jsonl) | jq -c '.[]' > tenement-stories-evenings.json
```

**Result:** All 57 showtimes enriched with full movie metadata

---

## Step 11: Create HTML Calendar View

Generated an interactive HTML calendar displaying all 57 filtered showtimes for February 2026. The calendar provides a visual day-by-day grid layout making it easy to browse showtimes by date.

**Features:**
- Pure HTML/CSS calendar grid (no JavaScript frameworks)
- All 57 filtered showtimes organized by date
- Clickable ticket links for each showtime
- Movie metadata displayed: year, director, runtime
- Responsive grid layout adapting to different screen sizes
- Dark theme for easy viewing
- Static HTML/CSS only - lightweight and fast

**Output:** `calendar.html`

---

## Final Output Files

| File | Description | Size |
|------|-------------|------|
| `tenement-stories.html` | Original scraped HTML | 194KB |
| `tenement-stories.csv` | All 97 showtimes (basic) | 9KB |
| `tenement-stories-evenings.csv` | Filtered 57 showtimes | 6KB |
| `tenement-stories-evenings.json` | **Enriched JSON with movie details** | 40KB |
| `tenement-stories-schedule.txt` | Human-readable grouped schedule | 5KB |
| `parse_showtimes.py` | Python HTML parser | 2KB |
| `movie-urls.txt` | List of 51 movie page URLs | 3KB |
| `calendar.html` | Interactive HTML calendar grid | ~50KB |

---

## JSON Schema (tenement-stories-evenings.json)

Each line is a JSON object with:

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
  "film_url": "https://filmforum.org/film/street-scene-tenement-stories"
}
```

---

## Useful Commands

**View schedule grouped by day:**
```bash
jq -rs 'sort_by(.Datetime) | to_entries | reduce .[] as $e (
  {last: "", out: []};
  if .last == $e.value.Date then
    .out += ["  " + $e.value.Time[0:15] + "  " + $e.value.Movie]
  else
    .out += ["", $e.value.Date, "  " + $e.value.Time[0:15] + "  " + $e.value.Movie] | .last = $e.value.Date
  end
) | .out | join("\n")' tenement-stories-evenings.json
```

**Filter by director:**
```bash
jq -s '[.[] | select(.director | test("Scorsese"))]' tenement-stories-evenings.json
```

**List unique movies with year:**
```bash
jq -rs '[.[] | {movie: .Movie, year: .year, director: .director}] | unique_by(.movie)' tenement-stories-evenings.json
```

**Pretty print CSV:**
```bash
qsv table tenement-stories-evenings.csv
```

---

## Tools Used

- **curl** - Download HTML
- **python3** - Parse HTML with regex
- **qsv** - CSV manipulation (filter, sort, convert)
- **jq** - JSON manipulation (merge, group, filter)
- **sed** - Fix data inconsistencies
- **grep** - Extract URLs from HTML

---

## Notes

- Times are in 12-hour format; FF Jr. screenings (11:00 AM) are morning kids' shows
- Some movies are double features (e.g., "Pull My Daisy / George Kuchar's Bronx")
- The series runs Feb 6-26, 2026 at Film Forum, NYC
