#!/usr/bin/env node
/**
 * Generate OpenGraph images (1200x630 PNG)
 */

import sharp from 'sharp';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC_DIR = path.join(__dirname, '../public');

const images = [
  {
    path: 'og-default.jpg',
    title: 'FilmForum',
    subtitle: 'Interactive Film Series Explorer',
  },
  {
    path: 'og-images/home.jpg',
    title: 'FilmForum',
    subtitle: 'Discover and Plan Your Film Series',
  },
  {
    path: 'og-images/series/tenement-stories.jpg',
    title: 'TENEMENT STORIES',
    subtitle: 'From Immigrants to Bohemians',
  },
  {
    path: 'og-images/calendar/tenement-stories.jpg',
    title: 'Tenement Stories',
    subtitle: 'Interactive Calendar',
  },
  {
    path: 'og-images/list/tenement-stories.jpg',
    title: 'Tenement Stories',
    subtitle: 'Movie List',
  },
  {
    path: 'og-images/shared-list.jpg',
    title: 'Shared Movie List',
    subtitle: 'Check out my film picks!',
  },
  {
    path: 'og-images/compare-lists.jpg',
    title: 'Compare Movie Lists',
    subtitle: 'Find what we both want to see',
  },
];

async function generateImage(config) {
  const { path: imagePath, title, subtitle } = config;
  const fullPath = path.join(PUBLIC_DIR, imagePath);

  // Create SVG with text
  const svg = `
    <svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
      <rect width="1200" height="630" fill="#0a0a0a"/>
      <text x="600" y="260" font-family="Arial, sans-serif" font-size="72" font-weight="bold" fill="#ffffff" text-anchor="middle">${title}</text>
      <text x="600" y="340" font-family="Arial, sans-serif" font-size="36" fill="#999999" text-anchor="middle">${subtitle}</text>
      <text x="600" y="420" font-family="Arial, sans-serif" font-size="24" fill="#666666" text-anchor="middle">filmforum.org</text>
    </svg>
  `;

  // Convert SVG to PNG
  await sharp(Buffer.from(svg))
    .png()
    .toFile(fullPath);

  console.log(`✓ Generated: ${imagePath}`);
}

async function main() {
  console.log('Generating OpenGraph images...\n');

  for (const config of images) {
    await generateImage(config);
  }

  console.log('\n✅ All OG images generated!');
}

main().catch(console.error);
