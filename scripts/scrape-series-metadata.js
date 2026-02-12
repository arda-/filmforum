#!/usr/bin/env node

/**
 * Scrape Film Forum series metadata
 *
 * Usage: node scripts/scrape-series-metadata.js <series-slug>
 * Example: node scripts/scrape-series-metadata.js tenement-stories
 */

import { execSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import * as cheerio from 'cheerio';

const seriesSlug = process.argv[2];
if (!seriesSlug) {
  console.error('Usage: node scripts/scrape-series-metadata.js <series-slug>');
  console.error('Example: node scripts/scrape-series-metadata.js tenement-stories');
  process.exit(1);
}

const url = `https://filmforum.org/series/${seriesSlug}`;
console.log(`Fetching: ${url}`);

// Fetch the page using curl
const html = execSync(`curl -sL "${url}"`, { encoding: 'utf-8' });
const $ = cheerio.load(html);

// Extract series name and subtitle
const pageTitle = $('h1').first().text().trim();
const [name, subtitle] = pageTitle.includes(':')
  ? pageTitle.split(':').map(s => s.trim())
  : [pageTitle, ''];

console.log(`Series: ${name}`);
if (subtitle) console.log(`Subtitle: ${subtitle}`);

// Extract date range (look for common patterns)
let dateRange = '';
$('p, div, span').each((_, el) => {
  const text = $(el).text();
  // Look for patterns like "February 6 – February 26" or "Feb 6-26"
  const dateMatch = text.match(/((?:Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday|Mon|Tue|Wed|Thu|Fri|Sat|Sun),?\s+)?(?:January|February|March|April|May|June|July|August|September|October|November|December|Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{1,2}\s*[–-]\s*(?:(?:January|February|March|April|May|June|July|August|September|October|November|December|Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+)?\d{1,2}/i);
  if (dateMatch && !dateRange) {
    dateRange = dateMatch[0].trim();
  }
});

// Extract description
let description = '';
$('p').each((_, el) => {
  const text = $(el).text().trim();
  // Look for descriptive paragraphs (usually longer than 50 chars)
  if (text.length > 50 && !text.startsWith('Presented') && !description) {
    description = text;
  }
});

// Extract partnership info
let partnership = null;
$('*').each((_, el) => {
  const text = $(el).text();
  const match = text.match(/Presented in association with (?:the )?(.+?)(?:\.|Founded)/i);
  if (match) {
    partnership = {
      name: match[1].trim(),
      presentedBy: text.match(/Presented in association with[^.]+/i)?.[0] || '',
      description: ''
    };

    // Try to find museum/partner description
    const descMatch = text.match(/Founded in \d{4},([^.]+\.)/);
    if (descMatch) {
      partnership.description = ('Founded in ' + text.match(/Founded in \d{4}[^.]+\./)?.[0] || '').trim();
    }
  }
});

// Extract funding credits
const funding = {
  credits: [],
  acknowledgment: ''
};
$('*').each((_, el) => {
  const text = $(el).text();
  const fundMatch = text.match(/(?:Select titles )?[Pp]resented with support from (.+?)(?:\.|$)/);
  if (fundMatch) {
    funding.acknowledgment = text.match(/[Pp]resented with support from[^.]+/)?.[0] || '';

    // Extract individual fund names
    const fundsText = fundMatch[1];
    const fundNames = fundsText.split(/ and | & /);
    funding.credits = fundNames.map(name => ({
      name: name.trim().replace(/^the /i, 'The '),
      type: 'funding'
    }));
  }
});

// Extract special programming
const specialProgramming = {};
$('*').each((_, el) => {
  const text = $(el).text();

  // Look for live music mentions
  const pianoMatch = text.match(/(?:Live piano accompaniment|[Cc]omposer) ([A-Z][a-z]+ [A-Z][a-z]+)(?: provides)?[^.]+/);
  if (pianoMatch) {
    specialProgramming.livePiano = {
      enabled: true,
      artist: pianoMatch[1].trim(),
      description: pianoMatch[0].trim()
    };
  }
});

// Extract community engagement
const communityEngagement = {
  discounts: {},
  specialtyTours: []
};

$('*').each((_, el) => {
  const text = $(el).text();

  // Extract discount info
  if (text.includes('buy-one-get-one-free')) {
    const match = text.match(/[^.]*buy-one-get-one-free[^.]*/i);
    if (match) {
      communityEngagement.discounts.ticketHolders = {
        offer: 'Buy-one-get-one-free tickets to the Tenement Museum',
        howToRedeem: match[0].trim()
      };
    }
  }

  if (text.includes('Members can purchase')) {
    const match = text.match(/Members can purchase[^.]*/i);
    if (match) {
      communityEngagement.discounts.members = {
        offer: match[0].trim(),
        howToRedeem: 'Special pricing for Film Forum Members'
      };
    }
  }

  // Extract specialty tours
  const tourMatch = text.match(/'([^']+)'\s*\(([^)]+)\)[,:]?\s*([^.;]+)/g);
  if (tourMatch) {
    tourMatch.forEach(tour => {
      const [, name, dates, desc] = tour.match(/'([^']+)'\s*\(([^)]+)\)[,:]?\s*([^.;]+)/) || [];
      if (name && dates) {
        communityEngagement.specialtyTours.push({
          name: name.trim(),
          dates: dates.split('&').map(d => d.trim()),
          description: (desc || '').trim()
        });
      }
    });
  }
});

// Build metadata object
const metadata = {
  id: seriesSlug,
  name,
  ...(subtitle && { subtitle }),
  ...(dateRange && { dateRange }),
  seriesUrl: url,
  venueName: 'Film Forum',
  description: {
    short: description
  },
  heroImages: [
    // TODO: Extract hero image URLs from the page
    // These are typically in a slideshow/carousel
  ],
  ...(partnership && { partnership }),
  ...(funding.credits.length > 0 && { funding }),
  ...(Object.keys(specialProgramming).length > 0 && { specialProgramming }),
  ...(Object.keys(communityEngagement.discounts).length > 0 || communityEngagement.specialtyTours.length > 0
    ? { communityEngagement }
    : {}),
  stats: {
    filmCount: 0, // TODO: Count films from JSON-LD or page content
    screeningCount: 0
  }
};

// Write to file
const outputPath = join(process.cwd(), 'public', 'series-metadata', `${seriesSlug}.json`);
writeFileSync(outputPath, JSON.stringify(metadata, null, 2) + '\n');

console.log(`\n✓ Metadata written to: ${outputPath}`);
console.log('\nExtracted data:');
console.log(`  - Name: ${name}`);
console.log(`  - Subtitle: ${subtitle || '(none)'}`);
console.log(`  - Date range: ${dateRange || '(not found)'}`);
console.log(`  - Description: ${description.substring(0, 80)}...`);
console.log(`  - Partnership: ${partnership ? partnership.name : '(none)'}`);
console.log(`  - Funding credits: ${funding.credits.length}`);
console.log(`  - Special programming: ${Object.keys(specialProgramming).length} items`);
console.log(`  - Community engagement: ${Object.keys(communityEngagement.discounts).length} discount(s), ${communityEngagement.specialtyTours.length} tour(s)`);
