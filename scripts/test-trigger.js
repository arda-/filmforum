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

const { execSync, spawnSync } = require('child_process');

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
      .flatMap(line => {
        // Strip 2-char status + space prefix (e.g. " M ", "?? ", "A  ")
        const path = line.slice(3);
        // Renames/copies show "old -> new"; return both paths
        if (path.includes(' -> ')) {
          return path.split(' -> ').map(p => p.trim());
        }
        return [path.trim()];
      })
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
 * Run a test command via spawnSync. Returns true if exit code is 0.
 */
function runCommand(cmd, args) {
  const result = spawnSync(cmd, args, {
    stdio: 'inherit',
    cwd: process.cwd(),
    shell: true,
  });
  return result.status === 0;
}

/** Run vitest for Tier 1 unit tests */
function runTier1() {
  console.log('\n📋 Running Tier 1: Unit tests...\n');
  const passed = runCommand('pnpm', ['vitest', 'run']);
  console.log(passed ? '\n✅ Tier 1 tests passed\n' : '\n❌ Tier 1 tests failed\n');
  return passed;
}

/** Run Playwright component tests for Tier 2 */
function runTier2() {
  console.log('\n🎨 Running Tier 2: Component tests...\n');
  const passed = runCommand('pnpm', ['playwright', 'test', 'tests/components']);
  console.log(passed ? '\n✅ Tier 2 tests passed\n' : '\n❌ Tier 2 tests failed\n');
  return passed;
}

/** Run Playwright integration tests for Tier 3 */
function runTier3() {
  console.log('\n🔗 Running Tier 3: Integration tests...\n');
  const passed = runCommand('pnpm', ['playwright', 'test', 'tests/integration']);
  console.log(passed ? '\n✅ Tier 3 tests passed\n' : '\n❌ Tier 3 tests failed\n');
  return passed;
}

/**
 * Main entry point
 */
function main() {
  const tier = flags.get('tier');
  const runAll = flags.get('all');

  let tiersToRun = [];

  if (runAll) {
    tiersToRun = ['tier1', 'tier2', 'tier3'];
  } else if (tier) {
    if (!['1', '2', '3'].includes(tier)) {
      console.error(`Invalid tier: ${tier}. Valid values: 1, 2, 3`);
      process.exit(1);
    }
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
    results.push({ tier: 'Tier 1 (Unit)', passed: runTier1() });
  }

  if (tiersToRun.includes('tier2')) {
    results.push({ tier: 'Tier 2 (Component)', passed: runTier2() });
  }

  if (tiersToRun.includes('tier3')) {
    results.push({ tier: 'Tier 3 (Integration)', passed: runTier3() });
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

main();
