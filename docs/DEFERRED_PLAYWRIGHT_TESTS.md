# Deferred: Playwright Integration & Component Tests

**Status:** Deferred for future implementation
**Created:** 2026-02-14
**Related PR:** Astrobook component testing implementation

## Overview

This document captures the Playwright test infrastructure that was built but deferred from the main Astrobook PR to keep the scope focused on visual component documentation.

## What Was Built

### Test Structure

```
tests/
├── components/          # Component-level interaction tests
│   ├── button-stories.spec.ts
│   ├── filter-bar.spec.ts
│   ├── reaction-buttons.spec.ts
│   └── view-toolbar.spec.ts
└── integration/         # Full-page integration tests
    ├── filter-integration.spec.ts
    ├── url-state-integration.spec.ts
    └── view-mode-integration.spec.ts
```

### Component Tests (`tests/components/`)

Tests that verify interactive behavior of individual components, either in Astrobook stories or demo pages:

1. **button-stories.spec.ts**
   - Verifies button stories render with correct text content
   - Tests all variants, sizes, and states
   - Validates accessibility attributes

2. **filter-bar.spec.ts**
   - Tests CalendarFilterBar interaction patterns
   - Validates toggle states (day/nite/weekend, saved filters)
   - Checks aria-pressed attributes and CSS classes

3. **reaction-buttons.spec.ts**
   - Tests ReactionButtons component (Yes/Maybe/No)
   - Validates single-selection behavior
   - Checks state persistence and visual feedback

4. **view-toolbar.spec.ts**
   - Tests CalendarViewToolbar toggles
   - Validates view mode switching (Timeline/Grid)
   - Tests detail toggles (runtime, director, year)
   - Validates highlight modes

### Integration Tests (`tests/integration/`)

End-to-end tests that verify full-page behavior and component interactions:

1. **view-mode-integration.spec.ts**
   - Tests view mode toggle → calendar render changes
   - Validates Timeline vs Grid mode rendering
   - Ensures movie count preservation across mode switches
   - Tests detail toggle effects on tile content

2. **filter-integration.spec.ts**
   - Tests filter interactions → calendar filtering
   - Validates day/nite/weekend filter combinations
   - Tests saved status filters (yes/maybe/no/unmarked)
   - Ensures proper filter state management

3. **url-state-integration.spec.ts**
   - Tests URL parameter synchronization
   - Validates state restoration from URL
   - Tests browser back/forward navigation
   - Ensures URL reflects current filter/view state

## Testing Documentation

Related documentation files created:

- **docs/ASTROBOOK_INTERACTION_TESTING.md**
  - Guidelines for Astrobook vs Playwright testing
  - Explains why Astrobook doesn't support play functions
  - Recommends Playwright for interaction tests
  - Provides testing patterns and examples

- **docs/PLAYWRIGHT_INTERACTION_EXAMPLES.md**
  - Concrete examples of Playwright test patterns
  - Component testing examples
  - Integration testing examples

- **docs/ASTROBOOK_TESTING_RESEARCH.md**
  - Research into Astrobook capabilities
  - CSF3 feature support analysis
  - Testing limitations and workarounds

## Why Deferred

1. **PR Scope Creep**: The main PR focused on Astrobook visual documentation. Adding full Playwright testing expanded scope significantly.

2. **Component Stability**: Some components (like Drawer height demos) have known issues that need fixing before comprehensive testing.

3. **Test Strategy Refinement**: Integration tests are valuable but need clear ownership and maintenance plan.

4. **Unit Tests First**: Unit tests (in `src/**/*.test.ts`) provide good coverage already. Playwright tests add e2e confidence but at higher maintenance cost.

## Next Steps

When ready to implement Playwright tests:

### Phase 1: Component Tests (Lower Priority)

1. **Fix component issues first**
   - Resolve Drawer height prop not working
   - Fix any other Astrobook story rendering issues
   - Ensure all interactive demos work correctly

2. **Start with high-value component tests**
   - **ReactionButtons**: Critical user interaction pattern
   - **CalendarFilterBar**: Complex state management
   - **CalendarViewToolbar**: Many toggle combinations

3. **Test against Astrobook stories**
   ```typescript
   // Navigate to story in Astrobook
   await page.goto('/astrobook/dashboard/button/primary');

   // Verify rendering
   await expect(page.locator('button')).toHaveText('Primary Button');
   ```

4. **Use existing test files as starting point**
   - `tests/components/*.spec.ts` files have been written
   - May need updates for current Astrobook structure
   - Adapt to actual Astrobook URLs and rendering

### Phase 2: Integration Tests (Higher Priority)

1. **Calendar page integration tests are valuable**
   - These test real user workflows
   - Validate complex state interactions
   - Ensure URL state synchronization works

2. **Prioritize critical paths**
   - **Filter integration**: Most common user interaction
   - **URL state**: Essential for sharing/bookmarking
   - **View mode**: Core functionality toggle

3. **Run in CI/CD**
   - Add Playwright to GitHub Actions
   - Run on PR creation and merge to main
   - Consider visual regression testing

### Phase 3: Maintenance

1. **Keep tests synchronized with components**
   - Update tests when component APIs change
   - Add tests for new interactive components
   - Remove tests for deprecated features

2. **Balance coverage vs maintenance**
   - Focus on high-value user interactions
   - Avoid testing trivial or obvious behavior
   - Use unit tests for logic, Playwright for UI/integration

3. **Document test patterns**
   - Create testing guide for new components
   - Standardize test structure and naming
   - Share common test utilities

## Running Tests (When Implemented)

```bash
# Run all Playwright tests
pnpm test:component

# Run specific test file
pnpm exec playwright test tests/integration/filter-integration.spec.ts

# Run in headed mode (see browser)
pnpm exec playwright test --headed

# Debug mode
pnpm exec playwright test --debug
```

## File Locations (When Implemented)

```
tests/
├── components/          # Restore from git history
│   ├── button-stories.spec.ts
│   ├── filter-bar.spec.ts
│   ├── reaction-buttons.spec.ts
│   └── view-toolbar.spec.ts
└── integration/         # Restore from git history
    ├── filter-integration.spec.ts
    ├── url-state-integration.spec.ts
    └── view-mode-integration.spec.ts
```

To restore files:
```bash
# Find the commit where they were removed
git log --oneline --all -- tests/integration/

# Restore from that commit
git checkout <commit-hash> -- tests/integration/
git checkout <commit-hash> -- tests/components/
```

## Related Issues/TODOs

- [ ] Fix Drawer height prop not working in Astrobook stories
- [ ] Decide on test infrastructure ownership (who maintains?)
- [ ] Add Playwright to CI/CD pipeline
- [ ] Create testing guide for contributors
- [ ] Consider visual regression testing (Percy, Chromatic, etc.)
- [ ] Evaluate test coverage thresholds

## References

- **Playwright Docs**: https://playwright.dev/
- **Astrobook**: https://github.com/ocavue/astrobook
- **PR Discussion**: [Link to PR where this was deferred]

---

**Note**: The test files still exist in git history and can be restored when ready to implement. This deferral is about keeping the Astrobook PR focused on visual documentation, not about abandoning testing.
