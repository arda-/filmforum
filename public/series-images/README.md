# Series Images

This directory stores hero and slideshow images downloaded from filmforum.org for each series.

## Purpose

These images are used in the frontend UI for series detail pages and promotional content. They are organized by series slug for easy reference and validated at build time.

## How Files Get Here

Images are downloaded and organized by the build script:
```bash
node scripts/generate-series-metadata.js
```

This script downloads images referenced in the parsed HTML data and saves them to subdirectories named by series slug.

## Directory Structure

```
series-images/
├── tenement-stories/
│   ├── hero.jpg
│   └── slide-1.jpg
└── noir-city/
    ├── hero.jpg
    └── slide-1.jpg
```

## Validation

Image paths are referenced in the series metadata JSON files (`public/series-metadata/*.json`) and validated at build time.
