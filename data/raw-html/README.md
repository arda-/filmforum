# raw-html

This directory stores HTML files downloaded from filmforum.org.

## Why it exists

- Enables the parsing pipeline to run repeatedly without hitting the network
- Provides an audit trail of what was actually scraped
- Acts as the source of truth for the data extraction process

## How files get here

Files are downloaded via the fetch script:

```bash
scripts/fetch-series-html.sh
```

This curl-based script saves HTML pages for each film series, preserving the raw source material before any parsing or transformation occurs.
