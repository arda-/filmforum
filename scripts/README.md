# SEO Validation Script

Lightweight build-time validation for SEO meta tags, OpenGraph, and structured data. No browser dependencies required!

## Quick Start

```bash
# Run after build
pnpm build
pnpm test:seo

# Or validate as part of build
pnpm build:verify
```

## What Gets Validated

### ✅ **Validation Coverage**

The script validates essential SEO tags, social sharing metadata, structured data, and crawl directives across all routes:

- **Basic SEO** (title, description, canonical)
- **OpenGraph** (og:title, og:description, og:image, og:url, og:type, og:site_name)
- **Twitter Cards** (twitter:card, twitter:title, twitter:description, twitter:image)
- **Robots directives** (noindex on user-generated & demo pages)
- **Structured data** (EventSeries, ItemList JSON-LD schemas)
- **Infrastructure** (robots.txt, sitemap-index.xml)

## Routes Tested

- `/` - Home page
- `/s/tenement-stories/` - Series landing (+ EventSeries schema)
- `/s/tenement-stories/calendar` - Calendar view
- `/s/tenement-stories/list` - Movie list (+ ItemList schema)
- `/s/tenement-stories/list/saved` - Shared list (noindex)
- `/s/tenement-stories/compare/placeholder` - Compare (noindex)
- `/demo/*` - Demo pages (noindex)
- `/robots.txt` - Crawler directives
- `/sitemap-index.xml` - Sitemap structure

## How It Works

The script:
1. Reads static HTML files from `dist/` directory
2. Parses HTML with regex (no dependencies!)
3. Validates meta tags against expectations
4. Checks JSON-LD structured data
5. Exits with code 1 if any validations fail

## CI/CD Integration

### GitHub Actions

```yaml
# .github/workflows/test.yml
name: Test

on: [push, pull_request]

jobs:
  seo-validation:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install

      - name: Build and validate SEO
        run: pnpm build:verify
```

### Exit Codes

- `0` - All validations passed
- `1` - One or more validations failed (build should fail)

## Output Example

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  SEO & OpenGraph Validation
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Testing: /
✓ Has <title> tag: "FilmForum - Discover and Plan Your Film Series"
✓ Has meta description: "Explore curated film series..."
✓ Has canonical URL: https://filmforum.org/
✓ Has og:title: "FilmForum - Discover and Plan Your Film Series"
✓ Has og:description
✓ Has og:image: https://filmforum.org/og-images/home.jpg
✓ Has og:url: https://filmforum.org/
✓ Has og:type: website
✓ Has og:site_name: FilmForum
✓ Has twitter:card: summary_large_image
✓ Has twitter:title
✓ Has twitter:description
✓ Has twitter:image
✓ No noindex directive (indexable)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Test Results
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✓ Passed:   135
✗ Failed:   0
⚠ Warnings: 0
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

All SEO validations passed!
```

## Advantages

### vs. Playwright/Browser Testing
- ✅ **Zero dependencies** - Pure Node.js, no browser binaries
- ✅ **Fast** - Runs in ~1 second
- ✅ **Lightweight** - No browser download (100MB+ saved)
- ✅ **CI-friendly** - No headless Chrome issues
- ✅ **Build-time** - Validates static HTML directly

### What It Validates
- ✅ All meta tags (name and property attributes)
- ✅ JSON-LD structured data with schema validation
- ✅ Canonical URLs and robots directives
- ✅ robots.txt and sitemap.xml content
- ✅ Description length warnings (SEO best practices)

## Extending the Script

### Add New Route

Edit `scripts/validate-seo.js`:

```javascript
// Add to runTests() function
testHTMLFile(
  path.join(DIST_DIR, 'new-route/index.html'),
  '/new-route',
  {
    noindex: false,
    structuredData: ['SchemaType'] // optional
  }
);
```

### Add New Validation

```javascript
function validateCustomTag(html) {
  const customTag = getMetaContent(html, 'name', 'custom-tag');
  assert(customTag === 'expected', 'Has correct custom tag');
}

// Add to testHTMLFile()
validateCustomTag(html);
```

## Troubleshooting

### "dist/ directory not found"
**Solution:** Run `pnpm build` first

### Failed validation
1. Check the failed assertion in the output
2. Inspect the HTML file in `dist/`
3. Verify the SEO component props in the route file

### Missing structured data
1. Check JSON-LD is rendered in HTML: `cat dist/path/index.html | grep "application/ld+json"`
2. Verify `structuredData` prop is passed to Layout
3. Test JSON syntax with a validator

## Manual Validation Tools

After automated tests pass, you can manually verify with:

- [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/)
- [Twitter Card Validator](https://cards-dev.twitter.com/validator)
- [Google Rich Results Test](https://search.google.com/test/rich-results)
- [Schema.org Validator](https://validator.schema.org/)

## Pre-Push Hook (Optional)

Validate SEO before every push:

```bash
# .git/hooks/pre-push
#!/bin/bash
pnpm build:verify || exit 1
```

## Performance

- **Build time:** ~8 seconds
- **Validation time:** ~1 second
- **Total:** ~9 seconds (vs 30+ with Playwright)

---

**No browser required. No npm packages. Just pure Node.js validation!** 🚀
