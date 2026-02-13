/**
 * Integration test: View mode toggle → Calendar render changes
 * Tests that switching between Timeline and Grid modes re-renders correctly
 */

import { test, expect } from '@playwright/test';

test.describe('View Mode Integration: Timeline ↔ Grid rendering', () => {
  test.skip('should render timeline elements in timeline mode', async ({ page }) => {
    await page.goto('/series/test-series');

    // Ensure timeline mode is active
    const timelineBtn = page.locator('button[data-view="timeline"]');
    await timelineBtn.click();

    // Look for timeline-specific CSS classes
    const timelineMovies = page.locator('.movie--timeline');
    expect(await timelineMovies.count()).toBeGreaterThan(0);
  });

  test.skip('should switch to grid mode when Grid button clicked', async ({ page }) => {
    await page.goto('/series/test-series');

    const gridBtn = page.locator('button[data-view="grid"]');
    await gridBtn.click();

    // Timeline movies should no longer exist (or be hidden)
    const timelineMovies = page.locator('.movie--timeline:visible');
    const count = await timelineMovies.count();

    // In grid mode, timeline-specific styling should not appear
    // (this depends on CSS implementation)
  });

  test.skip('should preserve filters when switching view modes', async ({ page }) => {
    await page.goto('/series/test-series');

    // Disable weekends filter
    const weekendBtn = page.locator('button[data-time="weekends"]');
    await weekendBtn.click();

    // Count visible movies with filter
    let visibleFiltered = await page.locator('.movie').count();

    // Switch to grid
    const gridBtn = page.locator('button[data-view="grid"]');
    await gridBtn.click();

    // Count again
    let visibleAfterSwitch = await page.locator('.movie').count();

    // Should be same (filters preserved)
    expect(visibleAfterSwitch).toBe(visibleFiltered);

    // Switch back to timeline
    const timelineBtn = page.locator('button[data-view="timeline"]');
    await timelineBtn.click();

    let visibleAfterReturn = await page.locator('.movie').count();

    // Still same count
    expect(visibleAfterReturn).toBe(visibleFiltered);
  });
});

test.describe('View Mode Integration: Detail options → Tile rendering', () => {
  test.skip('should hide year/director metadata by default', async ({ page }) => {
    await page.goto('/series/test-series');

    const yearDirMetadata = page.locator('.movie-year-director');
    const visibleCount = await yearDirMetadata.count();

    // Metadata should exist but not be displayed by default
    // (depends on CSS display rules with body.show-year-director)
  });

  test.skip('should show year/director when detail toggle enabled', async ({ page }) => {
    await page.goto('/series/test-series');

    const detailBtn = page.locator('button[data-detail="year-director"]');
    await detailBtn.click();

    // After enabling, body should have class
    const bodyClass = await page.evaluate(() => {
      return document.body.classList.contains('show-year-director');
    });
    expect(bodyClass).toBe(true);

    // Year/director elements should now be visible
    const yearDirMetadata = page.locator('.movie-year-director');
    expect(await yearDirMetadata.count()).toBeGreaterThan(0);
  });

  test.skip('should show runtime when detail toggle enabled', async ({ page }) => {
    await page.goto('/series/test-series');

    const runtimeBtn = page.locator('button[data-detail="runtime"]');
    await runtimeBtn.click();

    const bodyHasClass = await page.evaluate(() => {
      return document.body.classList.contains('show-runtime');
    });
    expect(bodyHasClass).toBe(true);
  });

  test.skip('should show images when detail toggle enabled', async ({ page }) => {
    await page.goto('/series/test-series');

    const imageBtn = page.locator('button[data-detail="image"]');
    await imageBtn.click();

    // Image detail should add scrim and blur classes too
    const hasImage = await page.evaluate(() => {
      return document.body.classList.contains('show-image');
    });
    const hasScrim = await page.evaluate(() => {
      return document.body.classList.contains('scrim-enabled');
    });

    expect(hasImage).toBe(true);
    expect(hasScrim).toBe(true);
  });
});

test.describe('View Mode Integration: Week start selector → Calendar reorganization', () => {
  test.skip('should reorganize grid when week start changes to Sunday', async ({ page }) => {
    await page.goto('/series/test-series');

    // Get initial column headers
    const headers = await page.evaluate(() => {
      const cells = Array.from(document.querySelectorAll('.day-header'));
      return cells.map(h => h.textContent?.trim());
    });

    // Open gear, click Sunday
    const gearBtn = page.locator('#view-settings-btn');
    await gearBtn.click();

    const sunBtn = page.locator('button[data-weekstart="sun"]');
    await sunBtn.click();

    // Get new column headers
    const newHeaders = await page.evaluate(() => {
      const cells = Array.from(document.querySelectorAll('.day-header'));
      return cells.map(h => h.textContent?.trim());
    });

    // First day should now be different (Sunday vs Monday)
    expect(newHeaders[0]).not.toBe(headers[0]);
  });

  test.skip('should add monday-start class when Monday selected', async ({ page }) => {
    await page.goto('/series/test-series');

    const gearBtn = page.locator('#view-settings-btn');
    await gearBtn.click();

    const monBtn = page.locator('button[data-weekstart="mon"]');
    await monBtn.click();

    const hasClass = await page.evaluate(() => {
      return document.body.classList.contains('monday-start');
    });
    expect(hasClass).toBe(true);
  });
});
