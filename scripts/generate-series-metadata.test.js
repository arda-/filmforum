/**
 * Integration test for the series metadata scraping pipeline.
 *
 * Runs the full pipeline (parse saved HTML → generate UI metadata) and
 * validates the output. This does NOT hit the network — it uses the HTML
 * already saved in data/raw-html/ by fetch-series-html.sh.
 *
 * What this tests:
 *   1. Parser: JSDOM + Readability correctly extract article content,
 *      paragraphs, images, and links from the saved HTML.
 *   2. Generator: Parsed data is correctly transformed into structured
 *      UI metadata with clean text (no HTML tags, no link artifacts).
 *   3. Provenance: Every text field in the output can be traced back to
 *      the source HTML. This catches hallucinated or hardcoded text that
 *      doesn't come from the actual webpage.
 *
 * Prerequisites:
 *   - Saved HTML must exist: ./scripts/fetch-series-html.sh <slug>
 *   - Film data must exist: public/<slug>-full.json (for stats)
 *
 * Run: pnpm vitest run scripts/generate-series-metadata.test.js
 */

import { execSync } from 'node:child_process';
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { describe, it, expect, beforeAll } from 'vitest';

const SERIES_SLUG = 'tenement-stories';
const root = process.cwd();
const parsedPath = join(root, 'data', 'parsed', `${SERIES_SLUG}.json`);
const metadataPath = join(root, 'public', 'series-metadata', `${SERIES_SLUG}.json`);
const htmlPath = join(root, 'data', 'raw-html', `${SERIES_SLUG}.html`);

describe('series metadata pipeline', () => {
  let parsed;
  let metadata;

  beforeAll(() => {
    if (!existsSync(htmlPath)) {
      throw new Error(`Missing saved HTML: ${htmlPath}. Run ./scripts/fetch-series-html.sh ${SERIES_SLUG} first.`);
    }

    // Run the full pipeline against saved HTML (no network)
    execSync(`node scripts/parse-series-html.js ${SERIES_SLUG}`, { cwd: root, stdio: 'pipe' });
    execSync(`node scripts/generate-series-metadata.js ${SERIES_SLUG}`, { cwd: root, stdio: 'pipe' });

    parsed = JSON.parse(readFileSync(parsedPath, 'utf-8'));
    metadata = JSON.parse(readFileSync(metadataPath, 'utf-8'));
  });

  describe('parser output (data/parsed)', () => {
    it('extracts article content via Readability', () => {
      expect(parsed.article.length).toBeGreaterThan(0);
      expect(parsed.article.textContent).toBeTruthy();
    });

    it('extracts content paragraphs', () => {
      expect(parsed.content.paragraphs.length).toBeGreaterThan(0);
    });

    it('extracts hero/slideshow images', () => {
      expect(parsed.images.length).toBeGreaterThan(0);
      for (const img of parsed.images) {
        expect(img.src).toContain('slideshow');
        expect(img.fullUrl).toMatch(/^https?:\/\//);
      }
    });

    it('extracts links from content', () => {
      expect(parsed.content.links.length).toBeGreaterThan(0);
      for (const link of parsed.content.links) {
        expect(link.text).toBeTruthy();
        expect(link.href).toBeTruthy();
      }
    });
  });

  describe('generator output (public/series-metadata)', () => {
    it('has required top-level fields', () => {
      expect(metadata.id).toBe(SERIES_SLUG);
      expect(metadata.name).toBeTruthy();
      expect(metadata.seriesUrl).toContain(SERIES_SLUG);
      expect(metadata.dateRange).toBeTruthy();
    });

    it('has a description without link artifacts', () => {
      // The source HTML has a "Read more." <a> tag inside the description paragraph.
      // The generator should strip it — we want prose, not navigation text.
      expect(metadata.description.short).toBeTruthy();
      expect(metadata.description.short).not.toContain('Read more');
      expect(metadata.description.short).not.toMatch(/<[^>]+>/);
    });

    it('has hero images with clean alt text', () => {
      // Some images in the source have HTML inside their alt attributes
      // (e.g. <em>Title</em> <br>Q&A with...). The generator must strip those.
      expect(metadata.heroImages.length).toBeGreaterThan(0);
      for (const img of metadata.heroImages) {
        expect(img.filename).toBeTruthy();
        expect(img.path).toContain(SERIES_SLUG);
        expect(img.alt).not.toMatch(/<[^>]+>/);
        expect(img.sourceUrl).toMatch(/^https?:\/\//);
      }
    });

    it('has partnership info extracted from source text', () => {
      expect(metadata.partnership).not.toBeNull();
      expect(metadata.partnership.name).toBeTruthy();
      expect(metadata.partnership.description).toContain('Founded in');
    });

    it('has funding credits', () => {
      expect(metadata.funding).not.toBeNull();
      expect(metadata.funding.credits.length).toBeGreaterThanOrEqual(1);
      for (const credit of metadata.funding.credits) {
        expect(credit.name).toContain('Fund');
      }
      // acknowledgment should be the actual source text, not generated
      expect(metadata.funding.acknowledgment).toContain('presented with support from');
    });

    it('has community engagement from source text', () => {
      expect(metadata.communityEngagement).not.toBeNull();
      expect(metadata.communityEngagement.discounts.ticketHolders.offer).toBeTruthy();
      expect(metadata.communityEngagement.discounts.members.offer).toBeTruthy();

      // No hallucinated fields — only fields with data from the source
      if (metadata.communityEngagement.discounts.members.howToRedeem) {
        // If howToRedeem exists, it must appear in the source HTML
        const html = readFileSync(htmlPath, 'utf-8');
        expect(html).toContain(metadata.communityEngagement.discounts.members.howToRedeem);
      }
    });

    it('has populated stats from film data', () => {
      expect(metadata.stats.filmCount).toBeGreaterThan(0);
      expect(metadata.stats.screeningCount).toBeGreaterThan(0);
      expect(metadata.stats.screeningCount).toBeGreaterThanOrEqual(metadata.stats.filmCount);
    });

    it('contains no text that is not in the source HTML', () => {
      // Provenance check: every text field in the metadata must come from
      // the actual webpage. This catches hallucinated, summarized, or
      // hardcoded strings that an AI or bad generator might introduce.
      //
      // How it works:
      //   1. Read the raw HTML and strip all tags + normalize entities,
      //      leaving just the plain text content of the page.
      //   2. For each text field in the metadata, take a 60-char substring
      //      (chars 10-70, skipping edges that may differ due to trimming).
      //   3. Assert that substring exists in the plain text of the page.
      //
      // If the generator ever outputs text like "Present Film Forum
      // membership for special pricing" that was never on the page,
      // this test fails.
      const html = readFileSync(htmlPath, 'utf-8');
      const plainHtml = html
        .replace(/<[^>]+>/g, '')
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/\s+/g, ' ');

      const textFields = [
        metadata.description.short,
        metadata.partnership?.description,
        metadata.funding?.acknowledgment,
        metadata.communityEngagement?.discounts?.ticketHolders?.offer,
        metadata.communityEngagement?.discounts?.members?.offer,
      ].filter(Boolean);

      for (const text of textFields) {
        const normalizedText = text.replace(/\s+/g, ' ');
        const phrase = normalizedText.slice(10, 70);
        expect(plainHtml).toContain(phrase);
      }
    });
  });
});
