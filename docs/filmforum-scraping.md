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
