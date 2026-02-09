#!/usr/bin/env node
/**
 * Build-time SEO validation
 * Validates meta tags, OpenGraph, and structured data in static HTML files
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIST_DIR = path.join(__dirname, '../dist');

// ANSI colors for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

const results = {
  passed: 0,
  failed: 0,
  warnings: 0,
};

/**
 * Extract meta tag content from HTML
 * Note: Uses two patterns to handle attribute ordering (attribute-first or content-first).
 * This assumes attributes are space-separated and doesn't handle all possible variations.
 */
function getMetaContent(html, attribute, value) {
  const regex = new RegExp(`<meta\\s+${attribute}=["']${value}["']\\s+content=["']([^"']+)["']`, 'i');
  const altRegex = new RegExp(`<meta\\s+content=["']([^"']+)["']\\s+${attribute}=["']${value}["']`, 'i');

  const match = html.match(regex) || html.match(altRegex);
  return match ? match[1] : null;
}

/**
 * Extract canonical URL from HTML
 */
function getCanonical(html) {
  const match = html.match(/<link\s+rel=["']canonical["']\s+href=["']([^"']+)["']/i);
  return match ? match[1] : null;
}

/**
 * Extract page title from HTML
 */
function getTitle(html) {
  const match = html.match(/<title>([^<]+)<\/title>/i);
  return match ? match[1] : null;
}

/**
 * Extract all JSON-LD structured data
 */
function getStructuredData(html) {
  const regex = /<script\s+type=["']application\/ld\+json["']>([\s\S]+?)<\/script>/gi;
  const matches = [];
  let match;

  while ((match = regex.exec(html)) !== null) {
    try {
      matches.push(JSON.parse(match[1]));
    } catch (e) {
      console.error(`${colors.red}✗${colors.reset} Failed to parse JSON-LD:`, match[1]);
    }
  }

  return matches;
}

/**
 * Test helper functions
 */
function assert(condition, message) {
  if (condition) {
    results.passed++;
    console.log(`${colors.green}✓${colors.reset} ${message}`);
  } else {
    results.failed++;
    console.log(`${colors.red}✗${colors.reset} ${message}`);
  }
  return condition;
}

function warn(condition, message) {
  if (!condition) {
    results.warnings++;
    console.log(`${colors.yellow}⚠${colors.reset} ${message}`);
  }
}

/**
 * Validate basic SEO tags
 */
function validateBasicSEO(html, route) {
  console.log(`\n${colors.cyan}Testing: ${route}${colors.reset}`);

  const title = getTitle(html);
  const description = getMetaContent(html, 'name', 'description');
  const canonical = getCanonical(html);

  assert(title && title.length > 0, `Has <title> tag: "${title}"`);
  assert(description && description.length > 0, `Has meta description: "${description?.substring(0, 60)}..."`);
  assert(canonical && canonical.length > 0, `Has canonical URL: ${canonical}`);

  if (description) {
    warn(description.length >= 50, `Description is at least 50 chars (${description.length} chars)`);
    warn(description.length <= 160, `Description is no more than 160 chars (${description.length} chars)`);
  }

  return { title, description, canonical };
}

/**
 * Validate OpenGraph tags
 */
function validateOpenGraph(html) {
  const ogTitle = getMetaContent(html, 'property', 'og:title');
  const ogDescription = getMetaContent(html, 'property', 'og:description');
  const ogImage = getMetaContent(html, 'property', 'og:image');
  const ogUrl = getMetaContent(html, 'property', 'og:url');
  const ogType = getMetaContent(html, 'property', 'og:type');
  const ogSiteName = getMetaContent(html, 'property', 'og:site_name');

  assert(ogTitle, `Has og:title: "${ogTitle}"`);
  assert(ogDescription, `Has og:description`);
  // og:image is optional - some pages don't have images (home, shared-list, compare-lists)
  // Only warn if missing rather than fail, as this is valid for text-only sharing
  warn(ogImage, `Has og:image: ${ogImage || '(not set - will share as text-only)'}`);
  assert(ogUrl, `Has og:url: ${ogUrl}`);
  assert(ogType, `Has og:type: ${ogType}`);

  // Dynamically derive expected siteName from og:url (matches SEO.astro's behavior)
  // SEO.astro uses `new URL(siteUrl).host` which gives us the hostname (e.g., "localhost:4321", "filmforum.example.com")
  const expectedSiteName = ogUrl ? new URL(ogUrl).host : null;
  assert(ogSiteName === expectedSiteName, `Has og:site_name: ${ogSiteName} (expected: ${expectedSiteName})`);
}

/**
 * Validate Twitter Card tags
 */
function validateTwitterCard(html) {
  const twitterCard = getMetaContent(html, 'name', 'twitter:card');
  const twitterTitle = getMetaContent(html, 'name', 'twitter:title');
  const twitterDescription = getMetaContent(html, 'name', 'twitter:description');
  const twitterImage = getMetaContent(html, 'name', 'twitter:image');

  assert(twitterCard, `Has twitter:card: ${twitterCard}`);
  assert(twitterTitle, `Has twitter:title`);
  assert(twitterDescription, `Has twitter:description`);
  // twitter:image is optional (follows og:image availability)
  warn(twitterImage, `Has twitter:image: ${twitterImage || '(not set - matches missing og:image)'}`);
}

/**
 * Validate robots directive
 */
function validateRobots(html, expectedNoindex) {
  const robots = getMetaContent(html, 'name', 'robots');

  if (expectedNoindex) {
    assert(robots && robots.includes('noindex'), `Has noindex: ${robots}`);
  } else {
    assert(!robots || !robots.includes('noindex'), `No noindex directive (indexable)`);
  }
}

/**
 * Validate structured data
 */
function validateStructuredData(html, expectedTypes) {
  const data = getStructuredData(html);

  if (expectedTypes && expectedTypes.length > 0) {
    assert(data.length > 0, `Has structured data (${data.length} schemas)`);

    for (const expectedType of expectedTypes) {
      const found = data.find(d => d['@type'] === expectedType);
      assert(found, `Has ${expectedType} schema`);

      if (found) {
        assert(found['@context'] === 'https://schema.org', `${expectedType} has @context`);
      }
    }
  }
}

/**
 * Test a single HTML file
 */
function testHTMLFile(filePath, route, options = {}) {
  const html = fs.readFileSync(filePath, 'utf-8');

  validateBasicSEO(html, route);
  validateOpenGraph(html);
  validateTwitterCard(html);

  if (options.noindex !== undefined) {
    validateRobots(html, options.noindex);
  }

  if (options.structuredData) {
    validateStructuredData(html, options.structuredData);
  }
}

/**
 * Test robots.txt
 */
function testRobotsTxt() {
  console.log(`\n${colors.cyan}Testing: /robots.txt${colors.reset}`);

  const robotsPath = path.join(DIST_DIR, 'robots.txt');

  if (!fs.existsSync(robotsPath)) {
    assert(false, 'robots.txt exists');
    return;
  }

  const content = fs.readFileSync(robotsPath, 'utf-8');

  assert(content.includes('User-agent: *'), 'Has User-agent: *');
  assert(content.includes('Allow: /'), 'Allows main site');
  assert(content.includes('Disallow: /demo/'), 'Disallows /demo/');
  assert(content.includes('Disallow: /s/*/list/saved'), 'Disallows shared lists');
  assert(content.includes('Disallow: /s/*/compare/'), 'Disallows compare pages');
  assert(content.includes('Sitemap:'), 'Has sitemap reference');
}

/**
 * Test sitemap
 */
function testSitemap() {
  console.log(`\n${colors.cyan}Testing: /sitemap-index.xml${colors.reset}`);

  const sitemapPath = path.join(DIST_DIR, 'sitemap-index.xml');

  if (!fs.existsSync(sitemapPath)) {
    assert(false, 'sitemap-index.xml exists');
    return;
  }

  const content = fs.readFileSync(sitemapPath, 'utf-8');

  assert(content.includes('<?xml version="1.0"'), 'Is valid XML');
  assert(content.includes('<sitemapindex'), 'Has sitemapindex tag');
  assert(content.includes('<sitemap>'), 'Has sitemap entries');
}

/**
 * Main test runner
 */
function runTests() {
  console.log(`${colors.blue}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
  console.log(`${colors.blue}  SEO & OpenGraph Validation${colors.reset}`);
  console.log(`${colors.blue}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);

  // Check if dist directory exists
  if (!fs.existsSync(DIST_DIR)) {
    console.error(`${colors.red}Error: dist/ directory not found. Run 'pnpm build' first.${colors.reset}`);
    process.exit(1);
  }

  // Home page
  testHTMLFile(
    path.join(DIST_DIR, 'index.html'),
    '/',
    { noindex: false }
  );

  // Series landing page
  testHTMLFile(
    path.join(DIST_DIR, 's/tenement-stories/index.html'),
    '/s/tenement-stories/',
    {
      noindex: false,
      structuredData: ['EventSeries']
    }
  );

  // Calendar view
  testHTMLFile(
    path.join(DIST_DIR, 's/tenement-stories/calendar/index.html'),
    '/s/tenement-stories/calendar',
    { noindex: false }
  );

  // Movie list
  testHTMLFile(
    path.join(DIST_DIR, 's/tenement-stories/list/index.html'),
    '/s/tenement-stories/list',
    {
      noindex: false,
      structuredData: ['ItemList']
    }
  );

  // Shared list (noindex)
  testHTMLFile(
    path.join(DIST_DIR, 's/tenement-stories/list/saved/index.html'),
    '/s/tenement-stories/list/saved',
    { noindex: true }
  );

  // Compare view (noindex)
  testHTMLFile(
    path.join(DIST_DIR, 's/tenement-stories/compare/placeholder/index.html'),
    '/s/tenement-stories/compare/placeholder',
    { noindex: true }
  );

  // Demo pages (noindex)
  const demoPages = [
    'demo/index.html',
    'demo/button/index.html',
    'demo/dialog/index.html',
    'demo/apple-card/index.html',
  ];

  for (const demoPage of demoPages) {
    const demoPath = path.join(DIST_DIR, demoPage);
    if (fs.existsSync(demoPath)) {
      testHTMLFile(demoPath, `/${demoPage.replace('/index.html', '')}`, { noindex: true });
    }
  }

  // Infrastructure
  testRobotsTxt();
  testSitemap();

  // Summary
  console.log(`\n${colors.blue}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
  console.log(`${colors.blue}  Test Results${colors.reset}`);
  console.log(`${colors.blue}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
  console.log(`${colors.green}✓ Passed:${colors.reset}   ${results.passed}`);
  console.log(`${colors.red}✗ Failed:${colors.reset}   ${results.failed}`);
  console.log(`${colors.yellow}⚠ Warnings:${colors.reset} ${results.warnings}`);
  console.log(`${colors.blue}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}\n`);

  if (results.failed > 0) {
    console.error(`${colors.red}SEO validation failed with ${results.failed} error(s).${colors.reset}`);
    process.exit(1);
  } else {
    console.log(`${colors.green}All SEO validations passed!${colors.reset}\n`);
    process.exit(0);
  }
}

runTests();
