#!/usr/bin/env node

/**
 * Parse Film Forum series HTML and extract raw structured data
 *
 * This is step 2 in the data pipeline: after raw HTML is fetched (step 1),
 * this script extracts meaningful content from the HTML soup and organizes
 * it into a structured JSON format. It uses Readability for main article
 * extraction (removing navigation, ads, etc.) and Cheerio for targeted
 * scraping of specific elements like images and JSON-LD metadata.
 *
 * WHY: Film Forum's HTML is complex with navigation, ads, and UI chrome.
 * We need clean, structured data for the frontend to render series pages.
 * This script bridges the gap between messy HTML and clean JSON.
 *
 * Usage: node scripts/parse-series-html.js <series-slug>
 * Example: node scripts/parse-series-html.js tenement-stories
 *
 * Input: data/raw-html/<series-slug>.html
 * Output: data/parsed/<series-slug>.json (raw parsed data)
 */

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { JSDOM } from 'jsdom';
import { Readability } from '@mozilla/readability';
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

// Parse with JSDOM to get proper DOM tree
const url = `https://filmforum.org/series/${seriesSlug}`;
const dom = new JSDOM(html, { url });
const document = dom.window.document;

// Use Readability to extract main article content
const reader = new Readability(document.cloneNode(true));
const article = reader.parse();

// Also use cheerio for specific extractions (images, JSON-LD, etc.)
const $ = cheerio.load(html);

// Build structured data from the clean article content
const rawData = {
  meta: {
    slug: seriesSlug,
    url,
    scrapedAt: new Date().toISOString()
  },
  title: {
    h1: article?.title || $('h1').first().text().trim(),
    pageTitle: $('title').text().trim(),
    seriesName: $('title').text().match(/·\s*(.+?)(?:Film Forum|$)/)?.[1].trim() || ''
  },
  // Main article content extracted by Readability
  article: {
    title: article?.title || '',
    byline: article?.byline || '',
    excerpt: article?.excerpt || '',
    textContent: article?.textContent || '',
    htmlContent: article?.content || '',
    length: article?.length || 0
  },
  // Parse the article content into structured sections
  content: parseArticleContent(article?.content || '', $),
  jsonLd: []
};

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

/**
 * Parse article HTML content into structured sections
 *
 * WHY: Readability gives us a clean HTML blob, but we need granular access
 * to specific content types (paragraphs, headings, links) for flexible
 * frontend rendering. This function breaks down the article into discrete
 * pieces that can be displayed differently based on context.
 *
 * @param {string} htmlContent - Clean HTML from Readability
 * @param {object} $fallback - Cheerio instance for fallback (unused currently)
 * @returns {object} Structured content with paragraphs, headings by level, and links
 */
function parseArticleContent(htmlContent, $fallback) {
  if (!htmlContent) return { paragraphs: [], headings: {}, links: [] };

  const $article = cheerio.load(htmlContent);

  const content = {
    paragraphs: [],
    headings: { h1: [], h2: [], h3: [], h4: [], h5: [], h6: [] },
    links: []
  };

  // Extract paragraphs (clean, content-only text)
  $article('p').each((i, el) => {
    const text = $article(el).text().trim();
    // Skip navigation-like text, very short paragraphs
    if (text.length > 20 && !isNavigationText(text)) {
      content.paragraphs.push(text);
    }
  });

  // Extract headings
  ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].forEach(tag => {
    $article(tag).each((i, el) => {
      const text = $article(el).text().trim();
      if (text) {
        content.headings[tag].push(text);
      }
    });
  });

  // Extract meaningful links (skip navigation)
  $article('a').each((i, el) => {
    const text = $article(el).text().trim();
    const href = $article(el).attr('href');
    if (text && href && text.length > 3 && !isNavigationText(text)) {
      content.links.push({ text, href });
    }
  });

  return content;
}

/**
 * Detect navigation/UI text that shouldn't be in content
 *
 * WHY: Even after Readability cleans the HTML, some UI chrome leaks through
 * (button labels, phone numbers, prices). These aren't article content and
 * would clutter the parsed output. This filter prevents them from being
 * included in paragraphs or links.
 *
 * @param {string} text - Text snippet to check
 * @returns {boolean} True if text appears to be navigation/UI rather than content
 */
function isNavigationText(text) {
  const navPatterns = [
    /^skip to/i,
    /^buy tickets?$/i,
    /^map and directions?$/i,
    /^\d{3}[-.]?\d{3}[-.]?\d{4}$/, // Phone numbers
    /^tickets?:?$/i,
    /^member$/i,
    /^regular$/i,
    /^\$\d+\.\d{2}$/  // Prices
  ];

  return navPatterns.some(pattern => pattern.test(text));
}

// Write raw parsed data
const outputDir = join(process.cwd(), 'data', 'parsed');
mkdirSync(outputDir, { recursive: true });

const outputPath = join(outputDir, `${seriesSlug}.json`);
writeFileSync(outputPath, JSON.stringify(rawData, null, 2) + '\n');

console.log(`✓ Raw parsed data written to: ${outputPath}`);
console.log('\nSummary:');
console.log(`  - Title: ${rawData.title.h1}`);
console.log(`  - Article length: ${rawData.article.length} chars`);
console.log(`  - Content paragraphs: ${rawData.content.paragraphs.length}`);
console.log(`  - Hero images: ${rawData.images.length}`);
console.log(`  - JSON-LD blocks: ${rawData.jsonLd.length}`);
