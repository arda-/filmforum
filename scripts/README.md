# Series Metadata Scraping Scripts

Repeatable pipeline for scraping Film Forum series metadata from their website.

## Pipeline

### 1. Fetch HTML
```bash
./scripts/fetch-series-html.sh <series-slug>
```

Downloads the series page HTML and saves to `data/raw-html/<series-slug>.html`

### 2. Parse HTML to Raw JSON
```bash
node scripts/parse-series-html.js <series-slug>
```

Parses the HTML and extracts all content into structured raw JSON at `data/parsed/<series-slug>.json`

### 3. Generate UI Metadata
```bash
node scripts/generate-series-metadata.js <series-slug>
```

Transforms raw parsed data into clean UI-ready metadata at `public/series-metadata/<series-slug>.json`

## Full Pipeline Example

```bash
# Scrape Tenement Stories series
./scripts/fetch-series-html.sh tenement-stories
node scripts/parse-series-html.js tenement-stories
node scripts/generate-series-metadata.js tenement-stories
```

## Data Flow

```
filmforum.org → data/raw-html/ → data/parsed/ → public/series-metadata/
```
