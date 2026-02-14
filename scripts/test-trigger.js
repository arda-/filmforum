#!/usr/bin/env node

/**
 * Smart test triggering script.
 * Runs appropriate tests based on which files changed.
 *
 * Usage:
 *   node scripts/test-trigger.js                       # Auto-detect changed files
 *   node scripts/test-trigger.js --all                 # Run all tests
 *   node scripts/test-trigger.js --scope=unit          # Run unit tests only
 *   node scripts/test-trigger.js --scope=component     # Run component tests only
 *   node scripts/test-trigger.js --scope=integration   # Run integration tests only
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

const VALID_SCOPES = ['unit', 'component', 'integration'];

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
 * Map file patterns to test scopes
 */
function getTestScopes(files) {
  const scopes = new Set();

  files.forEach(file => {
    // Unit: utilities, pure functions
    if (file.match(/^src\/(utils|config)\//)) {
      if (file.match(/(calendarFilters|calendarUrlState|calendarTime|movieUtils|storageManager)\.ts$/)) {
        scopes.add('unit');
      }
    }
    if (file.match(/src\/components\/MovieTile\/index\.ts$/)) {
      scopes.add('unit');
    }

    // Component: demo pages, component logic
    if (file.match(/^src\/components\/(CalendarFilterBar|CalendarViewToolbar|Dialog|MovieModal|SegmentedToggle|session\/ReactionButtons)/)) {
      scopes.add('component');
    }
    if (file.match(/^src\/pages\/demo\//)) {
      scopes.add('component');
    }

    // Integration: full page, render pipeline, state wiring
    if (file.match(/^src\/pages\/s\/\[id\]\/calendar\.astro/)) {
      scopes.add('integration');
    }
    if (file.match(/^src\/(utils|components)\/(calendarFilters|calendarTime|calendarUrlState)/) && !file.endsWith('.test.ts')) {
      scopes.add('integration');
    }
    if (file.match(/^src\/utils\/(movieUtils|storageManager)\.ts$/) && !file.endsWith('.test.ts')) {
      scopes.add('integration');
    }
  });

  return Array.from(scopes).sort();
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

/** Run vitest unit tests */
function runUnit() {
  console.log('\n📋 Running unit tests...\n');
  const passed = runCommand('pnpm', ['vitest', 'run']);
  console.log(passed ? '\n✅ Unit tests passed\n' : '\n❌ Unit tests failed\n');
  return passed;
}

/** Run Playwright component tests */
function runComponent() {
  console.log('\n🎨 Running component tests...\n');
  const passed = runCommand('pnpm', ['playwright', 'test', 'tests/components']);
  console.log(passed ? '\n✅ Component tests passed\n' : '\n❌ Component tests failed\n');
  return passed;
}

/** Run Playwright integration tests */
function runIntegration() {
  console.log('\n🔗 Running integration tests...\n');
  const passed = runCommand('pnpm', ['playwright', 'test', 'tests/integration']);
  console.log(passed ? '\n✅ Integration tests passed\n' : '\n❌ Integration tests failed\n');
  return passed;
}

/**
 * Main entry point
 */
function main() {
  const scope = flags.get('scope');
  const runAll = flags.get('all');

  let scopesToRun = [];

  if (runAll) {
    scopesToRun = VALID_SCOPES;
  } else if (scope) {
    if (!VALID_SCOPES.includes(scope)) {
      console.error(`Invalid scope: ${scope}. Valid values: ${VALID_SCOPES.join(', ')}`);
      process.exit(1);
    }
    scopesToRun = [scope];
  } else {
    const changedFiles = getChangedFiles();
    if (changedFiles.length === 0) {
      console.log('No changed files detected. Running unit tests only.\n');
      scopesToRun = ['unit'];
    } else {
      scopesToRun = getTestScopes(changedFiles);
      if (scopesToRun.length === 0) {
        console.log('No test-relevant files changed. Skipping tests.\n');
        process.exit(0);
      }
    }
  }

  console.log(`\n🧪 FilmForum Test Trigger\n`);
  console.log(`Running: ${scopesToRun.join(', ')}\n`);
  console.log(`${'─'.repeat(50)}\n`);

  const results = [];

  if (scopesToRun.includes('unit')) {
    results.push({ scope: 'Unit', passed: runUnit() });
  }

  if (scopesToRun.includes('component')) {
    results.push({ scope: 'Component', passed: runComponent() });
  }

  if (scopesToRun.includes('integration')) {
    results.push({ scope: 'Integration', passed: runIntegration() });
  }

  // Summary
  console.log(`${'─'.repeat(50)}\n`);
  console.log('📊 Test Summary:\n');
  results.forEach(({ scope, passed }) => {
    const status = passed ? '✅' : '⚠️ ';
    console.log(`  ${status} ${scope}`);
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
