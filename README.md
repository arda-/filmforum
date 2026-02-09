# FilmForum

A film discussion and scheduling forum built with Astro and webcoreui.

## Overview

FilmForum is an interactive explorer for repertory film series. It allows users to:

- Browse film schedules by series
- Filter showtimes (after-hours, weekends, etc.)
- Mark films as "Yes", "Maybe", or "No"
- View film details (director, year, runtime, cast)
- Compare showtimes across multiple film series

## 🚀 Quick Start

### Development

```bash
pnpm install
pnpm dev         # Start dev server at localhost:3000
```

### Production Build

```bash
pnpm build       # Build optimized site to ./dist/
pnpm preview     # Preview production build locally
```

## 📁 Project Structure

```
src/
├── components/        # Reusable Astro components
├── pages/            # Page routes (auto-routed by filename)
├── layouts/          # Layout templates
├── config/           # Configuration & data utilities
├── types/            # TypeScript type definitions
├── utils/            # Utility functions
└── assets/
    └── posters/      # Optimized poster images (Astro-managed)

public/posters/      # Raw poster images (for dynamic runtime use)
docs/                # Project documentation
```

## 🎬 Working with Images

FilmForum implements **build-time image optimization** for all poster images:

- **Automatic format conversion**: PNG → WebP/AVIF (75-80% size reduction)
- **Responsive images**: Automatic srcsets for different screen sizes
- **Build-time validation**: Ensures all movie data has corresponding poster images
- **Lazy loading**: Images load only when visible

### Adding New Movies

When adding movies to a series schedule:

1. Add the poster image to `src/assets/posters/movie-title-slug.png`
2. Update the JSON data with matching `poster_url` filename
3. Run `pnpm build` - the build will validate everything

See **[Image Optimization Guide](./docs/image-optimization.md)** for detailed instructions.

## 📚 Documentation

- [Image Optimization Strategy](./docs/image-optimization.md) - How poster images are optimized and validated
- [Data Pipeline](./docs/data-pipeline.md) - How series data is scraped and processed
- [Progressive Blur Guide](./docs/progressive-blur-guide.md) - Technical deep-dive on blur effects
- [Filmforum Scraping](./docs/filmforum-scraping.md) - Web scraping strategy for series data

## 🏗️ Architecture

### Key Technologies

- **Astro 5** - Static site generation with partial hydration
- **Astro Assets** - Build-time image optimization
- **WebCoreUI** - Component library
- **TypeScript** - Type-safe development

### Performance Optimizations

- **Lazy loading** on all poster images
- **Content-visibility** for deferred calendar tile rendering
- **Build-time image optimization** (WebP/AVIF conversion)
- **Responsive image srcsets** for bandwidth optimization

## 🛠️ Commands

| Command | Purpose |
|---------|---------|
| `pnpm dev` | Start development server |
| `pnpm build` | Build optimized production site (includes image validation) |
| `pnpm preview` | Preview production build locally |

## 🔍 Data Management

Film schedules are manually curated from Film Forum's website:

1. Data is scraped and hand-processed into JSON
2. Poster images are sourced and optimized
3. Data is validated at build time
4. Build fails if images or data are incomplete

This manual process ensures data accuracy and quality over automated scraping reliability.

## 📝 Roadmap

See `ROADMAP.md` for planned features and enhancements.

## 🤝 Contributing

When making changes:

- Use atomic commits with clear messages
- Follow existing component patterns
- Test locally with `pnpm dev` and `pnpm build`
- Update documentation if changing workflows

---

**Built with ❤️ for film enthusiasts** | [Astro Docs](https://docs.astro.build) | [WebCoreUI Docs](https://webcoreui.dev)
