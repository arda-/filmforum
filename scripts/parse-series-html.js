#!/usr/bin/env node

/**
 * Parse Film Forum series HTML and extract raw structured data
 *
 * Usage: node scripts/parse-series-html.js <series-slug>
 * Example: node scripts/parse-series-html.js tenement-stories
 *
 * Input: data/raw-html/<series-slug>.html
 * Output: data/parsed/<series-slug>.json (raw parsed data)
 */

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import * as cheerio from 'cheerio';

const seriesSlug = process.argv[2];
if (!seriesSlug) {
  console.error('Usage: node scripts/parse-series-html.js <series-slug>');
  console.error('Example: node scripts/parse-series-html.js tenement-stories');
  process.exit(1);
}

// Read the saved HTML file
const htmlPath = join(process.cwd(), 'data', 'raw-html', `${seriesSlug}.html`);
console.log(`Reading: ${htmlPath}`);

let html;
try {
  html = readFileSync(htmlPath, 'utf-8');
} catch (e) {
  console.error(`Error reading file: ${e.message}`);
  console.error(`Run: ./scripts/fetch-series-html.sh ${seriesSlug}`);
  process.exit(1);
}

const $ = cheerio.load(html);

// Extract all text content by section for manual review
const rawData = {
  meta: {
    slug: seriesSlug,
    url: `https://filmforum.org/series/${seriesSlug}`,
    scrapedAt: new Date().toISOString()
  },
  title: {
    h1: $('h1').first().text().trim(),
    pageTitle: $('title').text().trim(),
    // Extract series name from page title (format: "Film Forum · SERIES NAME")
    seriesName: $('title').text().match(/·\s*(.+?)(?:Film Forum|$)/)?.[1].trim() || ''
  },
  allParagraphs: [],
  allHeadings: {},
  linkTexts: [],
  jsonLd: []
};

// Extract all paragraphs
$('p').each((i, el) => {
  const text = $(el).text().trim();
  if (text.length > 10) {
    rawData.allParagraphs.push(text);
  }
});

// Extract all headings
['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].forEach(tag => {
  rawData.allHeadings[tag] = [];
  $(tag).each((i, el) => {
    const text = $(el).text().trim();
    if (text) {
      rawData.allHeadings[tag].push(text);
    }
  });
});

// Extract link texts (for finding special tours, etc.)
$('a').each((i, el) => {
  const text = $(el).text().trim();
  const href = $(el).attr('href');
  if (text && text.length > 5) {
    rawData.linkTexts.push({ text, href });
  }
});

// Extract JSON-LD structured data
$('script[type="application/ld+json"]').each((i, el) => {
  try {
    const jsonLd = JSON.parse($(el).html());
    rawData.jsonLd.push(jsonLd);
  } catch (e) {
    console.warn('Failed to parse JSON-LD:', e.message);
  }
});

// Extract images (hero/slideshow images)
rawData.images = [];
$('img').each((i, el) => {
  const src = $(el).attr('src');
  const alt = $(el).attr('alt');
  if (src && (src.includes('slideshow') || src.includes('_1000w'))) {
    rawData.images.push({
      src,
      alt: alt || '',
      fullUrl: src.startsWith('http') ? src : `https://filmforum.org${src}`
    });
  }
});

// Write raw parsed data
const outputDir = join(process.cwd(), 'data', 'parsed');
mkdirSync(outputDir, { recursive: true });

const outputPath = join(outputDir, `${seriesSlug}.json`);
writeFileSync(outputPath, JSON.stringify(rawData, null, 2) + '\n');

console.log(`✓ Raw parsed data written to: ${outputPath}`);
console.log('\nSummary:');
console.log(`  - Title: ${rawData.title.h1}`);
console.log(`  - Paragraphs: ${rawData.allParagraphs.length}`);
console.log(`  - Hero images: ${rawData.images.length}`);
console.log(`  - JSON-LD blocks: ${rawData.jsonLd.length}`);
