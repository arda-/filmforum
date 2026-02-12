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

// Find description - look for "festival" paragraph and split on double newlines
for (const p of rawData.allParagraphs) {
  if (p.toLowerCase().includes('festival') && p.length > 50 && !metadata.description.short) {
    // Split the mega-paragraph on double newlines to get distinct sections
    const sections = p.split('\n\n').map(s => s.trim()).filter(s => s.length > 0);

    // First section is usually the festival description
    if (sections.length > 0) {
      metadata.description.short = sections[0];
    }
    break;
  }
}

// Extract partnership info - look in the split sections
for (const p of rawData.allParagraphs) {
  if (p.includes('Presented in association with')) {
    // Split on double newlines to isolate the partnership section
    const sections = p.split('\n\n').map(s => s.trim());
    const partnershipSection = sections.find(s => s.startsWith('Presented in association with'));

    if (partnershipSection) {
      const match = partnershipSection.match(/Presented in association with (?:the )?([^.]+?)\.\s*(Founded in \d{4}[^]*?)(?=\n|$)/);
      if (match) {
        metadata.partnership = {
          name: match[1].trim(),
          description: match[2] ? match[2].trim().replace(/\s+/g, ' ') : '',
          presentedBy: `Presented in association with ${match[1].trim()}`
        };
      }
    }
    break;
  }
}

// Extract funding - look in split sections
for (const p of rawData.allParagraphs) {
  if (p.includes('presented with support from')) {
    // Split sections and find funding section
    const sections = p.split('\n\n').map(s => s.trim());
    const fundingSection = sections.find(s => s.toLowerCase().includes('presented with support from'));

    if (fundingSection) {
      const fundMatch = fundingSection.match(/[Pp]resented with support from (.+?)\.$/);
      if (fundMatch) {
        const fullText = fundMatch[1];

        // Simple approach: split on " and " but keep track of whether we're in a decade range
        // Look for "The [Name] Fund for [Description]" or "The [Name] Fund for [Desc] of the [decades]"
        const funds = [];
        const parts = fullText.split(' and ');

        let currentFund = '';
        for (let i = 0; i < parts.length; i++) {
          const part = parts[i];
          currentFund += (currentFund ? ' and ' : '') + part;

          // Check if this completes a fund (has "Fund" in it and next part starts with "The")
          if (part.includes('Fund')) {
            const nextPart = parts[i + 1];
            // If next part starts with "The [Name]", this fund is complete
            if (!nextPart || nextPart.match(/^The\s+[A-Z]/)) {
              funds.push(currentFund.trim());
              currentFund = '';
            }
          }
        }

        // If there's remaining text, it's the last fund
        if (currentFund) {
          funds.push(currentFund.trim());
        }

        metadata.funding = {
          credits: funds.map(name => ({
            name: name.replace(/^the /i, 'The '),
            type: 'funding'
          })),
          acknowledgment: fundingSection
        };
      }
    }
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

// Extract community engagement - look for DISCOUNT OFFER in full paragraph
metadata.communityEngagement = {
  discounts: {},
  specialtyTours: []
};

for (const p of rawData.allParagraphs) {
  if (p.includes('DISCOUNT OFFER')) {
    // Extract ticket holder offer
    const ticketMatch = p.match(/Festival ticket-buyers can get ([^*]+?)(?:\*|\()/);
    if (ticketMatch) {
      metadata.communityEngagement.discounts.ticketHolders = {
        offer: ticketMatch[1].trim(),
        howToRedeem: p.match(/Festival ticket-buyers can get[^.]+\./)?.[0] || ''
      };
    }

    // Extract member pricing
    const memberMatch = p.match(/(Film Forum Members can purchase[^.]+\.)/);
    if (memberMatch) {
      metadata.communityEngagement.discounts.members = {
        offer: memberMatch[1].trim(),
        howToRedeem: 'Present Film Forum membership for special pricing'
      };
    }

    // Extract specialty tours - handle curly quotes (\u201c, \u201d)
    const tourMatches = [...p.matchAll(/[\u201c\u201d"]([^\u201c\u201d"]+)[\u201c\u201d"]\s*\(([^)]+)\)[,:]?\s*([^.;]*)/g)];
    for (const match of tourMatches) {
      const [, name, dates, desc] = match;
      metadata.communityEngagement.specialtyTours.push({
        name: name.trim(),
        dates: dates.split('&').map(d => d.trim()),
        description: desc.trim()
      });
    }
    break;
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
