#!/usr/bin/env node

/**
 * Generate series metadata JSON from parsed HTML data
 *
 * This script transforms raw Readability-parsed HTML data into structured,
 * UI-ready metadata for film series pages. It extracts semantic information
 * (titles, dates, partnerships, funding) from unstructured paragraph text,
 * making it accessible to the frontend without client-side parsing overhead.
 *
 * Pipeline position: Step 2 of the series data flow
 * 1. parse-series-html.js → raw parsed HTML + Readability output
 * 2. THIS SCRIPT → structured metadata with semantic fields
 * 3. Frontend consumes clean JSON for series detail pages
 *
 * Why this exists: Film Forum series pages contain rich metadata embedded in
 * prose paragraphs. This script uses pattern matching to extract structured
 * data (partnerships, funding credits, special programming) that would be
 * expensive to parse client-side and difficult to query from raw HTML.
 *
 * Usage: node scripts/generate-series-metadata.js <series-slug>
 * Example: node scripts/generate-series-metadata.js tenement-stories
 *
 * Input: data/parsed/<series-slug>.json (raw parsed data)
 * Output: public/series-metadata/<series-slug>.json (UI-ready metadata)
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const seriesSlug = process.argv[2];
if (!seriesSlug) {
  console.error('Usage: node scripts/generate-series-metadata.js <series-slug>');
  console.error('Example: node scripts/generate-series-metadata.js tenement-stories');
  process.exit(1);
}

// Slug must be lowercase alphanumeric with hyphens only.
// Prevents path traversal (e.g., "../../etc/passwd") since the slug is
// interpolated into file paths like data/parsed/<slug>.json.
if (!/^[a-z0-9-]+$/.test(seriesSlug)) {
  console.error(`Invalid slug "${seriesSlug}": must contain only lowercase letters, numbers, and hyphens`);
  process.exit(1);
}

// Read the parsed data
const parsedPath = join(process.cwd(), 'data', 'parsed', `${seriesSlug}.json`);
console.log(`Reading: ${parsedPath}`);

let rawData;
try {
  rawData = JSON.parse(readFileSync(parsedPath, 'utf-8'));
} catch (e) {
  console.error(`Error reading file: ${e.message}`);
  console.error(`Run: node scripts/parse-series-html.js ${seriesSlug}`);
  process.exit(1);
}

// Use content.paragraphs from the Readability-parsed output
const paragraphs = rawData.content?.paragraphs || [];

// Collect link texts so we can strip them from paragraph content
const linkTexts = (rawData.content?.links || []).map(l => l.text);

/**
 * Strip known link texts from a paragraph string
 *
 * Why: Readability-parsed paragraphs often contain inline link text that
 * clutters descriptions when displayed in the UI. We collect all link texts
 * upfront and remove them to get clean prose suitable for display.
 *
 * @param {string} text - Raw paragraph text potentially containing link text
 * @returns {string} Cleaned text with link texts and surrounding whitespace removed
 */
function stripLinkText(text) {
  let cleaned = text;
  for (const linkText of linkTexts) {
    // Remove the link text and any surrounding whitespace
    cleaned = cleaned.replace(new RegExp(`\\s*${escapeRegex(linkText)}\\s*`), ' ');
  }
  return cleaned.trim();
}

/**
 * Escape special regex characters for use in RegExp constructor
 *
 * Why: Link texts may contain regex metacharacters (parentheses, brackets, etc.)
 * that would break pattern matching. We escape them to treat the link text as
 * a literal string match.
 *
 * @param {string} str - String that may contain regex special characters
 * @returns {string} String with all regex metacharacters escaped
 */
function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Strip HTML tags from a string
 *
 * Why: Image alt texts from Readability sometimes contain residual HTML tags
 * (likely from <em>, <i>, etc. in the original markup). We strip these to
 * produce clean alt text suitable for accessibility and display.
 *
 * @param {string} str - String potentially containing HTML tags
 * @returns {string} Plain text with all HTML tags removed
 */
function stripHtmlTags(str) {
  return str.replace(/<[^>]+>/g, '').trim();
}

// Extract structured fields from raw data
const metadata = {
  id: seriesSlug,
  name: '',
  subtitle: '',
  dateRange: '',
  seriesUrl: rawData.meta.url,
  venueName: 'Film Forum',
  description: {},
  heroImages: [],
  partnership: null,
  funding: null,
  specialProgramming: null,
  communityEngagement: null,
  stats: {
    filmCount: 0,
    screeningCount: 0
  }
};

// Parse title from seriesName extraction (format: "NAME: SUBTITLE")
const seriesName = rawData.title.seriesName || rawData.title.h1;
const titleMatch = seriesName.match(/^([^:]+)(?::\s*(.+))?$/);
if (titleMatch) {
  metadata.name = titleMatch[1].trim();
  metadata.subtitle = titleMatch[2] ? titleMatch[2].trim() : '';
}

// Find date range in paragraphs
for (const p of paragraphs) {
  const dateMatch = p.match(/((?:Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday),?\s+)?(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2}\s*[–-]\s*(?:(?:Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday),?\s+)?(?:(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+)?\d{1,2}/);
  if (dateMatch && !metadata.dateRange) {
    metadata.dateRange = dateMatch[0].trim();
  }
}

// Find description - the paragraph mentioning "festival"
for (const p of paragraphs) {
  if (p.toLowerCase().includes('festival') && p.length > 50 && !metadata.description.short) {
    metadata.description.short = stripLinkText(p);
    break;
  }
}

// Extract partnership info - paragraph starting with "Presented in association"
for (const p of paragraphs) {
  if (p.includes('Presented in association with')) {
    const match = p.match(/Presented in association with (?:the )?([^.]+?)\.\s*(.*)/s);
    if (match) {
      metadata.partnership = {
        name: match[1].trim(),
        description: match[2] ? match[2].trim().replace(/\s+/g, ' ') : '',
        presentedBy: `Presented in association with ${match[1].trim()}`
      };
    }
    break;
  }
}

// Extract funding - paragraph with "presented with support from"
for (const p of paragraphs) {
  if (p.includes('presented with support from')) {
    const fundMatch = p.match(/[Pp]resented with support from (.+?)\.?\s*$/);
    if (fundMatch) {
      const fullText = fundMatch[1];

      // Split on " and " but keep decade ranges together (e.g. "1930s, '40s, and '50s")
      const funds = [];
      const parts = fullText.split(' and ');

      let currentFund = '';
      for (let i = 0; i < parts.length; i++) {
        const part = parts[i];
        currentFund += (currentFund ? ' and ' : '') + part;

        // A fund is complete when it contains "Fund" and the next part starts a new fund name
        if (part.includes('Fund')) {
          const nextPart = parts[i + 1];
          if (!nextPart || nextPart.match(/^The\s+[A-Z]/)) {
            funds.push(currentFund.trim());
            currentFund = '';
          }
        }
      }

      if (currentFund) {
        funds.push(currentFund.trim());
      }

      metadata.funding = {
        credits: funds.map(name => ({
          name: name.replace(/^the /i, 'The '),
          type: 'funding'
        })),
        acknowledgment: p
      };
    }
    break;
  }
}

// Extract special programming (live music, conversations, etc.)
for (const p of paragraphs) {
  const pianoMatch = p.match(/(?:Live piano accompaniment|[Pp]ianist|piano by)\s+(?:by\s+)?([A-Z][a-z]+\s+[A-Z][a-z]+)/);
  if (pianoMatch) {
    metadata.specialProgramming = {
      livePiano: {
        enabled: true,
        artist: pianoMatch[1].trim(),
        description: p.trim()
      }
    };
    break;
  }
}

// Extract community engagement - paragraph with DISCOUNT OFFER
for (const p of paragraphs) {
  if (p.includes('DISCOUNT OFFER')) {
    const engagement = {
      discounts: {},
      specialtyTours: []
    };

    // Extract ticket holder offer
    const ticketMatch = p.match(/(Festival ticket-buyers can get[^.]+\.)/);
    if (ticketMatch) {
      engagement.discounts.ticketHolders = {
        offer: ticketMatch[1].trim()
      };
    }

    // Extract member pricing
    const memberMatch = p.match(/(Film Forum Members can purchase[^.]+\.)/);
    if (memberMatch) {
      engagement.discounts.members = {
        offer: memberMatch[1].trim()
      };
    }

    // Extract specialty tours - handle curly quotes (\u201c, \u201d)
    const tourMatches = [...p.matchAll(/[\u201c\u201d"]([^\u201c\u201d"]+)[\u201c\u201d"]\s*\(([^)]+)\)[,:]?\s*([^.;]*)/g)];
    for (const match of tourMatches) {
      const [, name, dates, desc] = match;
      engagement.specialtyTours.push({
        name: name.trim(),
        dates: dates.split('&').map(d => d.trim()),
        description: desc.trim()
      });
    }

    if (Object.keys(engagement.discounts).length > 0 || engagement.specialtyTours.length > 0) {
      metadata.communityEngagement = engagement;
    }
    break;
  }
}

// Process hero images - strip HTML from alt text
metadata.heroImages = rawData.images.map(img => {
  const filename = img.src.split('/').pop();
  const cleanAlt = img.alt ? stripHtmlTags(img.alt) : '';
  return {
    filename,
    path: `/series-images/${seriesSlug}/${filename}`,
    alt: cleanAlt || `${metadata.name} - Film still`,
    sourceUrl: img.fullUrl
  };
});

// Load stats from existing film data if available
const filmDataPath = join(process.cwd(), 'public', `${seriesSlug}-full.json`);
if (existsSync(filmDataPath)) {
  try {
    const filmData = JSON.parse(readFileSync(filmDataPath, 'utf-8'));
    const uniqueMovies = new Set(filmData.map(f => f.Movie));
    metadata.stats.filmCount = uniqueMovies.size;
    metadata.stats.screeningCount = filmData.length;
  } catch (e) {
    console.warn(`Warning: Could not read film data from ${filmDataPath}: ${e.message}`);
  }
}

// Write metadata to public folder
const outputDir = join(process.cwd(), 'public', 'series-metadata');
mkdirSync(outputDir, { recursive: true });

const outputPath = join(outputDir, `${seriesSlug}.json`);
writeFileSync(outputPath, JSON.stringify(metadata, null, 2) + '\n');

console.log(`✓ Metadata written to: ${outputPath}`);
console.log('\nGenerated metadata:');
console.log(`  - Name: ${metadata.name}`);
console.log(`  - Subtitle: ${metadata.subtitle || '(not found)'}`);
console.log(`  - Date range: ${metadata.dateRange || '(not found)'}`);
console.log(`  - Description: ${metadata.description.short ? metadata.description.short.slice(0, 80) + '...' : '(not found)'}`);
console.log(`  - Hero images: ${metadata.heroImages.length}`);
console.log(`  - Partnership: ${metadata.partnership ? metadata.partnership.name : 'No'}`);
console.log(`  - Funding: ${metadata.funding ? `${metadata.funding.credits.length} credits` : 'No'}`);
console.log(`  - Special programming: ${metadata.specialProgramming ? 'Yes' : 'No'}`);
console.log(`  - Community engagement: ${metadata.communityEngagement ? 'Yes' : 'No'}`);
console.log(`  - Stats: ${metadata.stats.filmCount} films, ${metadata.stats.screeningCount} screenings`);
