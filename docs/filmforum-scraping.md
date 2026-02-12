# Film Forum Data Scraping Strategy

## Overview

Film Forum (filmforum.org) is a nonprofit cinema in NYC. Their legacy RSS feeds are defunct, so we need to scrape their website directly.

## Data Sources

### Primary: Website Scraping

| URL Pattern | Content | Data Format |
|-------------|---------|-------------|
| `/now_playing` | Current films list | JSON-LD + HTML |
| `/coming_soon` | Upcoming films | JSON-LD + HTML |
| `/film/{slug}` | Individual film details | JSON-LD + HTML |
| `/events` | Special events | HTML |
| `/series/{slug}` | Film series (retrospectives, etc.) | JSON-LD + HTML |

### Known Series

| Series | URL | Description |
|--------|-----|-------------|
| Tenement Stories | `/series/tenement-stories` | Repertory series (~59 films) |
| Film Forum Jr. | `/series/film-forum-jr.-series-page` | Family/kids programming |

**Note:** Film slugs often include the series suffix (e.g., `mean-streets-tenement-stories`, `the-kid-ffjr-2026`).

### Secondary: PDF Calendar

Film Forum publishes printable calendars:
- Pattern: `/do-not-enter-or-modify-or-erase/client-uploads/FF_{Month-Range}_{Year}_PrinterFriendly_v{N}.pdf`
- Example: `FF_Jan-March_2026_PrinterFriendly_v5.pdf`

### Defunct Sources

| URL | Status |
|-----|--------|
| `/rss/today.xml` | Returns empty (0 bytes) |
| `/rss/nowplaying.xml` | Stale since Jan 2014 |
| `boxoffice.printtixusa.com/rss/2454.xml` | 404 Not Found |

## JSON-LD Structure

Film Forum embeds schema.org structured data in their pages.

### Collection Page (`/now_playing`)

```json
{
  "@context": "http://schema.org",
  "@type": "CollectionPage",
  "name": "Now Playing",
  "mainEntity": {
    "@type": "ItemList",
    "numberOfItems": "6",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": "1",
        "item": {
          "@type": "ScreeningEvent",
          "name": "FILM TITLE",
          "image": "https://filmforum.org/.../thumbnail.png",
          "url": "https://filmforum.org/film/slug",
          "startDate": "",  // Often empty
          "endDate": ""     // Often empty
        }
      }
    ]
  }
}
```

### Film Page (`/film/{slug}`)

```json
{
  "@context": "http://schema.org",
  "@type": "ScreeningEvent",
  "name": "FILM TITLE",
  "image": "...",
  "url": "https://filmforum.org/film/slug",
  "startDate": "",  // Often empty - need to parse HTML
  "endDate": "",
  "offers": [
    {
      "@type": "Offer",
      "url": "https://my.filmforum.org/events/slug"
    }
  ],
  "workPresented": {
    "@type": "Movie",
    "name": "FILM TITLE",
    "director": "",
    "dateCreated": ""
  }
}
```

**Note:** The JSON-LD often has empty `startDate`/`endDate` fields. Actual showtimes must be parsed from HTML.

### Series Page (`/series/{slug}`)

```json
{
  "@context": "http://schema.org",
  "@type": "CollectionPage",
  "name": "TENEMENT STORIES",
  "mainEntity": {
    "@type": "ItemList",
    "url": "https://filmforum.org/series/tenement-stories",
    "numberOfItems": "59",
    "itemListOrder": "Ascending",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": "1",
        "item": {
          "@type": "ScreeningEvent",
          "name": "LONESOME",
          "image": "https://filmforum.org/.../LONESOME_thumbnail.png",
          "offers": [
            {
              "@type": "Offer",
              "url": "https://my.filmforum.org/events/lonesome"
            }
          ],
          "workPresented": {
            "@type": "Movie",
            "name": "LONESOME"
          }
        }
      }
      // ... more films
    ]
  }
}
```

**Series pages are valuable** - they provide a complete list of films in a retrospective/series with direct ticketing links.

## Series-Level Metadata

In addition to individual film data, series pages contain rich metadata about the series itself. This includes curatorial descriptions, partnership information, funding credits, and visual assets.

### What to Scrape from Series Pages

**Visual Assets:**
- Hero/slideshow images (typically 4 key images from featured films)
- Partnership logos (e.g., Tenement Museum)
- Located at: `/do-not-enter-or-modify-or-erase/client-uploads/_1000w/{FILM}_slideshow.png`

**Textual Content:**
- Curatorial introduction/series description
- Partnership details (associated organizations, their mission)
- Funding credits (grant/fund acknowledgments)
- Special programming notes (live music, post-film Q&As, special guests)
- Community engagement info (member discounts, special tours)

### Metadata Schema

Series metadata is stored as JSON in `/public/series-metadata/{series-id}.json`:

```json
{
  "id": "tenement-stories",
  "name": "Tenement Stories",
  "subtitle": "From Immigrants to Bohemians",
  "dateRange": "Feb 6–26, 2026",
  "seriesUrl": "https://filmforum.org/series/tenement-stories",
  "venueName": "Film Forum",
  "description": {
    "short": "Brief one-line description",
    "curatorial": "Full curatorial text about the series theme"
  },
  "heroImages": [
    {
      "filename": "west-side-story-slideshow.png",
      "path": "/series-images/tenement-stories/west-side-story-slideshow.png",
      "alt": "West Side Story - The iconic musical about tenement life"
    }
  ],
  "partnership": {
    "name": "Partner Organization Name",
    "description": "Full description of the partner and their mission",
    "presentedBy": "Presented in association with..."
  },
  "funding": {
    "credits": [
      {
        "name": "Fund Name",
        "type": "funding"
      }
    ],
    "acknowledgment": "Full funding acknowledgment text"
  },
  "specialProgramming": {
    "livePiano": {
      "enabled": true,
      "artist": "Musician Name",
      "description": "Details about live accompaniment"
    },
    "events": [
      {
        "type": "post-film-conversation",
        "description": "Details about special events"
      }
    ]
  },
  "communityEngagement": {
    "discounts": {
      "ticketHolders": {
        "offer": "Discount details",
        "howToRedeem": "Redemption instructions"
      }
    },
    "specialtyTours": [
      {
        "name": "Tour Name",
        "dates": ["Feb 8", "Feb 13"],
        "description": "Tour description"
      }
    ]
  }
}
```

### Series Configuration

Series are registered in `src/config/series.ts`:

```typescript
export const SERIES: Record<string, SeriesConfig> = {
  'tenement-stories': {
    id: 'tenement-stories',
    name: 'Tenement Stories',
    subtitle: 'From Immigrants to Bohemians',
    seriesUrl: 'https://filmforum.org/series/tenement-stories',
    venueName: 'Film Forum',
    dateRange: 'Feb 6–26, 2026',
    dataFile: '/tenement-stories-full.json',  // Individual film showings
    metadataFile: '/series-metadata/tenement-stories.json',  // Series-level metadata
    active: true,
  },
};
```

### Build-Time Validation

The build process validates:
1. Metadata file exists and is valid JSON
2. Required fields (id, name) are present
3. Metadata ID matches series config ID
4. All referenced hero images exist in `/public/series-images/`

Validation output during build:
```
✓ Validated 98 movies have poster images
✓ Validated 1 series metadata file(s) with 4 hero image(s)
```

See `src/config/seriesMetadata.ts` for validation implementation.

## Ticketing System

- URL: `my.filmforum.org`
- Protected by Incapsula/Imperva WAF (blocks automated requests)
- Not a viable scraping target

## Recommended Approach

### 1. Daily Scrape Pipeline

```
1. Fetch /now_playing
2. Extract JSON-LD for film list
3. For each film, fetch /film/{slug}
4. Parse HTML for:
   - Run dates (e.g., "Wed, Feb 5 - Tue, Feb 18")
   - Showtimes (e.g., "1:00, 3:15, 5:30, 7:45, 10:00")
   - Director, year, runtime
   - Description/synopsis
5. Store in database
```

### 2. Email Newsletter as Trigger

- Subscribe to Film Forum newsletter
- When email arrives, trigger a scrape
- Useful for catching new programming announcements

### 3. PDF Calendar Monitoring

- Check for new PDF uploads monthly
- Parse PDF for complete schedule
- Good for advance planning data

## HTML Parsing Targets

Key elements to extract from `/film/{slug}` pages:

- Film title
- Run dates
- Daily showtimes
- Theater/screen number
- Director, year, country, runtime
- Synopsis/description
- Trailer link (if available)

## Important: Page Lifecycle

**Film Forum aggressively removes film pages after their showtimes pass.** Individual `/film/{slug}` pages return 404 once the screening dates are over. This means:

- Scrape film metadata **as early as possible** after pages go live
- Cache/store descriptions, runtimes, and other metadata locally - don't rely on being able to re-fetch later
- Series pages (`/series/{slug}`) also get culled over time, though they tend to persist longer than individual film pages
- For the Tenement Stories series, ~10 out of 49 film pages were already 404 by mid-February 2026

## Implementation Notes

### Headers

```
User-Agent: Mozilla/5.0 (compatible; FilmForumBot/1.0)
Accept: text/html,application/xhtml+xml
```

### Rate Limiting

- Max 1 request per second
- Scrape during off-peak hours (2-4am EST)
- Cache responses aggressively

### Error Handling

- Retry with exponential backoff on 5xx errors
- Log and alert on structure changes (missing JSON-LD, etc.)

## URL Discovery Strategy

To find all series and content:

1. **Scrape navigation links** from homepage, `/now_playing`, `/coming_soon`
2. **Look for `/series/` pattern** in all page links
3. **Extract film slugs** - they often encode series membership:
   - `mean-streets-tenement-stories` → belongs to Tenement Stories
   - `the-kid-ffjr-2026` → belongs to Film Forum Jr. 2026
4. **Monitor `/events`** for special screenings and Q&As

## Open Questions

- [x] What data is available on `/series/` pages? **Answer: Full JSON-LD with film lists**
- [ ] How often does Film Forum update their schedule?
- [ ] Is there a pattern to when new films are announced?
- [ ] Can we extract screen/theater assignments?
- [ ] Are there other series pages beyond "Tenement Stories" and "Film Forum Jr."?
- [ ] How do we discover new series when they're announced?
