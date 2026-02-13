#!/usr/bin/env node

/**
 * Smart test triggering script.
 * Runs appropriate tests based on which files changed.
 *
 * Usage:
 *   node scripts/test-trigger.js                  # Auto-detect changed files
 *   node scripts/test-trigger.js --all            # Run all tests
 *   node scripts/test-trigger.js --tier=1         # Run Tier 1 only
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const args = process.argv.slice(2);
const flags = new Map(args
  .filter(arg => arg.startsWith('--'))
  .map(arg => {
    const [key, value] = arg.slice(2).split('=');
    return [key, value || true];
  })
);

/**
 * Get changed files from git (unstaged, staged, and untracked).
 * Uses git status --porcelain for a complete picture of all modified files.
 */
function getChangedFiles() {
  try {
    const output = execSync('git status --porcelain', { encoding: 'utf-8' });
    return output
      .trim()
      .split('\n')
      .filter(Boolean)
      .map(line => line.slice(3).trim()) // Strip status prefix (e.g. " M ", "?? ", "A  ")
      .filter(Boolean);
  } catch (e) {
    console.warn('Could not get git status, running all tests');
    return [];
  }
}

/**
 * Map file patterns to test tiers
 */
function getTestTiers(files) {
  const tiers = new Set();

  files.forEach(file => {
    // Tier 1: Unit tests (utilities, pure functions)
    if (file.match(/^src\/(utils|config)\//)) {
      // Core utilities that have unit tests
      if (file.match(/(calendarFilters|calendarUrlState|calendarTime|movieUtils|storageManager)\.ts$/)) {
        tiers.add('tier1');
      }
    }
    if (file.match(/src\/components\/MovieTile\/index\.ts$/)) {
      tiers.add('tier1');
    }

    // Tier 2: Component tests (demo pages, component logic)
    if (file.match(/^src\/components\/(CalendarFilterBar|CalendarViewToolbar|Dialog|MovieModal|SegmentedToggle|session\/ReactionButtons)/)) {
      tiers.add('tier2');
    }
    if (file.match(/^src\/pages\/demo\//)) {
      tiers.add('tier2');
    }

    // Tier 3: Integration tests (full page, render pipeline, state wiring)
    if (file.match(/^src\/pages\/s\/\[id\]\/calendar\.astro/)) {
      tiers.add('tier3');
    }
    if (file.match(/^src\/(utils|components)\/(calendarFilters|calendarTime|calendarUrlState)/) && !file.endsWith('.test.ts')) {
      tiers.add('tier3');
    }
    if (file.match(/^src\/utils\/(movieUtils|storageManager)\.ts$/) && !file.endsWith('.test.ts')) {
      tiers.add('tier3');
    }
  });

  return Array.from(tiers).sort();
}

/**
 * Run vitest for Tier 1 unit tests
 */
async function runTier1() {
  console.log('\n📋 Running Tier 1: Unit tests...\n');
  try {
    execSync('npx vitest run', {
      stdio: 'inherit',
      cwd: process.cwd(),
    });
    console.log('\n✅ Tier 1 tests passed\n');
    return true;
  } catch (e) {
    console.log('\n❌ Tier 1 tests failed\n');
    return false;
  }
}

/**
 * Run Playwright component tests for Tier 2
 */
async function runTier2() {
  console.log('\n🎨 Running Tier 2: Component tests...\n');
  try {
    execSync('npx playwright test tests/components', {
      stdio: 'inherit',
      cwd: process.cwd(),
    });
    console.log('\n✅ Tier 2 tests passed\n');
    return true;
  } catch (e) {
    console.log('\n❌ Tier 2 tests failed (or server not running)\n');
    return false;
  }
}

/**
 * Run Playwright integration tests for Tier 3
 */
async function runTier3() {
  console.log('\n🔗 Running Tier 3: Integration tests...\n');
  try {
    execSync('npx playwright test tests/integration', {
      stdio: 'inherit',
      cwd: process.cwd(),
    });
    console.log('\n✅ Tier 3 tests passed\n');
    return true;
  } catch (e) {
    console.log('\n❌ Tier 3 tests failed (many are skipped until calendar page is available)\n');
    return false;
  }
}

/**
 * Main entry point
 */
async function main() {
  const tier = flags.get('tier');
  const runAll = flags.get('all');

  let tiersToRun = [];

  if (runAll) {
    tiersToRun = ['tier1', 'tier2', 'tier3'];
  } else if (tier) {
    tiersToRun = [`tier${tier}`];
  } else {
    const changedFiles = getChangedFiles();
    if (changedFiles.length === 0) {
      console.log('No changed files detected. Running Tier 1 only.\n');
      tiersToRun = ['tier1'];
    } else {
      tiersToRun = getTestTiers(changedFiles);
      if (tiersToRun.length === 0) {
        console.log('No test-relevant files changed. Skipping tests.\n');
        process.exit(0);
      }
    }
  }

  console.log(`\n🧪 FilmForum Test Trigger\n`);
  console.log(`Running: ${tiersToRun.join(', ')}\n`);
  console.log(`${'─'.repeat(50)}\n`);

  const results = [];

  if (tiersToRun.includes('tier1')) {
    const passed = await runTier1();
    results.push({ tier: 'Tier 1 (Unit)', passed });
  }

  if (tiersToRun.includes('tier2')) {
    const passed = await runTier2();
    results.push({ tier: 'Tier 2 (Component)', passed });
  }

  if (tiersToRun.includes('tier3')) {
    const passed = await runTier3();
    results.push({ tier: 'Tier 3 (Integration)', passed });
  }

  // Summary
  console.log(`${'─'.repeat(50)}\n`);
  console.log('📊 Test Summary:\n');
  results.forEach(({ tier, passed }) => {
    const status = passed ? '✅' : '⚠️ ';
    console.log(`  ${status} ${tier}`);
  });

  const allPassed = results.every(r => r.passed);
  if (allPassed && results.length > 0) {
    console.log('\n🎉 All tests passed!\n');
    process.exit(0);
  } else if (results.length > 0) {
    console.log('\n⚠️  Some tests failed. Check output above.\n');
    process.exit(1);
  } else {
    process.exit(0);
  }
}

main().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
