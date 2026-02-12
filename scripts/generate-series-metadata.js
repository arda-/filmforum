#!/usr/bin/env node

/**
 * Generate series metadata JSON from parsed HTML data
 *
 * Usage: node scripts/generate-series-metadata.js <series-slug>
 * Example: node scripts/generate-series-metadata.js tenement-stories
 *
 * Input: data/parsed/<series-slug>.json (raw parsed data)
 * Output: public/series-metadata/<series-slug>.json (UI-ready metadata)
 */

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

const seriesSlug = process.argv[2];
if (!seriesSlug) {
  console.error('Usage: node scripts/generate-series-metadata.js <series-slug>');
  console.error('Example: node scripts/generate-series-metadata.js tenement-stories');
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
for (const p of rawData.allParagraphs) {
  const dateMatch = p.match(/((?:Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday),?\s+)?(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2}\s*[–-]\s*(?:(?:Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday),?\s+)?(?:(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+)?\d{1,2}/);
  if (dateMatch && !metadata.dateRange) {
    metadata.dateRange = dateMatch[0].trim();
  }
}

// Find description - look for "festival" or substantive description
for (const p of rawData.allParagraphs) {
  if (p.toLowerCase().includes('festival') && p.length > 50 && !metadata.description.short) {
    metadata.description.short = p;
    break;
  }
}

// Extract partnership info
for (const p of rawData.allParagraphs) {
  const match = p.match(/Presented in association with (?:the )?([^.]+?)\.?\s*(Founded[^]*)?$/);
  if (match) {
    metadata.partnership = {
      name: match[1].trim(),
      description: match[2] ? match[2].trim().replace(/\s+/g, ' ') : '',
      presentedBy: p.match(/Presented in association with[^.]+/)?.[0] || ''
    };
    break;
  }
}

// Extract funding
for (const p of rawData.allParagraphs) {
  const fundMatch = p.match(/(?:Select titles )?[Pp]resented with support from (.+?)(?:\.|$)/);
  if (fundMatch) {
    const fullText = fundMatch[1];

    // Parse fund names - look for "The ... Fund" patterns
    // Match up to " and The" or end of string, handling decade ranges
    const fundPattern = /The\s+[\w\s]+?\s+Fund(?:\s+for\s+[^.]+?)?(?:\s+of\s+the\s+[\d',\s]+)?/gi;
    let fundMatches = fullText.match(fundPattern) || [];

    // Clean up fund names - remove trailing " and " or " of the" artifacts
    fundMatches = fundMatches.map(f => {
      // If it ends with decade range, make sure it's complete
      let cleaned = f.trim();
      const decadesMatch = cleaned.match(/(\d{4}s)$/);
      if (decadesMatch) {
        // Check if the original text has more decades after this
        const idx = fullText.indexOf(cleaned);
        const remaining = fullText.substring(idx + cleaned.length);
        const moreDecades = remaining.match(/^,\s*'(\d{2}s)(?:,?\s+and\s+'(\d{2}s))?/);
        if (moreDecades) {
          cleaned += moreDecades[0];
        }
      }
      return cleaned;
    });

    metadata.funding = {
      credits: fundMatches.map(name => ({
        name: name.trim(),
        type: 'funding'
      })),
      acknowledgment: p.match(/[Pp]resented with support from[^.]+/)?.[0] || ''
    };
    break;
  }
}

// Extract special programming (live music)
for (const p of rawData.allParagraphs) {
  const pianoMatch = p.match(/(?:Live piano accompaniment|[Cc]omposer)\s+(?:by\s+)?([A-Z][a-z]+\s+[A-Z][a-z]+)/);
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

// Extract community engagement
metadata.communityEngagement = {
  discounts: {},
  specialtyTours: []
};

for (const p of rawData.allParagraphs) {
  // Buy-one-get-one-free
  if (p.toLowerCase().includes('buy-one-get-one-free')) {
    metadata.communityEngagement.discounts.ticketHolders = {
      offer: 'Buy-one-get-one-free tickets to the Tenement Museum',
      howToRedeem: p.trim()
    };
  }

  // Member pricing
  if (p.toLowerCase().includes('members can purchase')) {
    const match = p.match(/(Members can purchase[^.]*)/i);
    if (match) {
      metadata.communityEngagement.discounts.members = {
        offer: match[1].trim(),
        howToRedeem: 'Special pricing for Film Forum Members'
      };
    }
  }

  // Specialty tours - look for pattern: 'Tour Name' (dates)
  const tourMatches = [...p.matchAll(/'([^']+)'\s*\(([^)]+)\)[,:]?\s*([^.;]*)/g)];
  for (const match of tourMatches) {
    const [, name, dates, desc] = match;
    metadata.communityEngagement.specialtyTours.push({
      name: name.trim(),
      dates: dates.split('&').map(d => d.trim()),
      description: desc.trim()
    });
  }
}

// Clean up empty sections
if (Object.keys(metadata.communityEngagement.discounts).length === 0 &&
    metadata.communityEngagement.specialtyTours.length === 0) {
  metadata.communityEngagement = null;
}

// Process hero images
metadata.heroImages = rawData.images.map(img => {
  const filename = img.src.split('/').pop();
  return {
    filename,
    path: `/series-images/${seriesSlug}/${filename}`,
    alt: img.alt || `${metadata.name} - Film still`,
    sourceUrl: img.fullUrl
  };
});

// Try to get film count from JSON-LD
if (rawData.jsonLd.length > 0) {
  const collectionPage = rawData.jsonLd.find(ld => ld['@type'] === 'CollectionPage');
  if (collectionPage?.mainEntity?.numberOfItems) {
    metadata.stats.filmCount = parseInt(collectionPage.mainEntity.numberOfItems, 10);
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
console.log(`  - Subtitle: ${metadata.subtitle || '(none)'}`);
console.log(`  - Date range: ${metadata.dateRange || '(not found)'}`);
console.log(`  - Hero images: ${metadata.heroImages.length}`);
console.log(`  - Partnership: ${metadata.partnership ? 'Yes' : 'No'}`);
console.log(`  - Funding: ${metadata.funding ? 'Yes' : 'No'}`);
console.log(`  - Special programming: ${metadata.specialProgramming ? 'Yes' : 'No'}`);
console.log(`  - Community engagement: ${metadata.communityEngagement ? 'Yes' : 'No'}`);
console.log(`  - Film count: ${metadata.stats.filmCount}`);
