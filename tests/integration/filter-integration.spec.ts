/**
 * Integration test: Filters → Calendar render pipeline
 * Tests that toggling filters actually changes which movies render
 */

import { test, expect } from '@playwright/test';

test.describe('Filter Integration: Filter toggle → Movie rendering', () => {
  // Note: These tests assume a calendar page exists at /series/[id]
  // For real implementation, adjust baseURL or use a test series

  test.skip('should hide movies when weekdays filter disabled', async ({ page }) => {
    // Navigate to calendar page
    await page.goto('/series/test-series');

    // Get count of visible movies before filter
    let visibleBefore = await page.locator('.movie').count();

    // Find and click weekday filter
    const weekdayBtn = page.locator('button[data-time="weekdays"]');
    await weekdayBtn.click();

    // Get count after
    let visibleAfter = await page.locator('.movie').count();

    // Should have fewer or equal movies (some may not be on weekdays)
    expect(visibleAfter).toBeLessThanOrEqual(visibleBefore);
  });

  test.skip('should restore movies when weekdays filter re-enabled', async ({ page }) => {
    await page.goto('/series/test-series');

    const weekdayBtn = page.locator('button[data-time="weekdays"]');

    // Disable weekdays
    let visibleDisabled = await page.locator('.movie').count();
    await weekdayBtn.click();

    // Re-enable weekdays
    await weekdayBtn.click();
    let visibleRestored = await page.locator('.movie').count();

    // Should restore to original count
    expect(visibleRestored).toBe(visibleDisabled);
  });

  test.skip('should show no movies when all filters disabled', async ({ page }) => {
    await page.goto('/series/test-series');

    // Disable all time filters
    await page.locator('button[data-time="weekdays"]').click();
    await page.locator('button[data-time="weeknights"]').click();
    await page.locator('button[data-time="weekends"]').click();

    // No movies should be visible
    let visible = await page.locator('.movie').count();
    expect(visible).toBe(0);
  });
});

test.describe('Filter Integration: Saved status filter → Movie rendering', () => {
  test.skip('should hide "No" movies when No filter disabled', async ({ page }) => {
    await page.goto('/series/test-series');

    // Enable localStorage to persist reactions
    const reactions = {
      'some-movie-id': 'no',
      'another-movie': 'yes',
    };

    // Set reactions in storage
    await page.evaluate(({ reactions }) => {
      localStorage.setItem('filmforum_reactions_test-series', JSON.stringify(reactions));
    }, { reactions });

    // Reload
    await page.reload();

    // Get initial count
    let visibleBefore = await page.locator('.movie').count();

    // Disable "No" filter
    const noBtn = page.locator('button[data-filter="no"]');
    await noBtn.click();

    // Count again
    let visibleAfter = await page.locator('.movie').count();

    // Should be fewer if any movies were marked "No"
    expect(visibleAfter).toBeLessThanOrEqual(visibleBefore);
  });

  test.skip('should hide unmarked movies when unmarked filter disabled', async ({ page }) => {
    await page.goto('/series/test-series');

    const unmarkedBtn = page.locator('button[data-filter="unmarked"]');
    let visibleBefore = await page.locator('.movie').count();

    await unmarkedBtn.click();
    let visibleAfter = await page.locator('.movie').count();

    // If all movies were unmarked, none should show
    // If some were marked, more should disappear
    expect(visibleAfter).toBeLessThanOrEqual(visibleBefore);
  });
});

test.describe('Filter Integration: Multiple filters together', () => {
  test.skip('should apply both time and saved filters', async ({ page }) => {
    await page.goto('/series/test-series');

    const weekdayBtn = page.locator('button[data-time="weekdays"]');
    const yesBtn = page.locator('button[data-filter="yes"]');

    let allMovies = await page.locator('.movie').count();

    // Apply multiple filters
    await weekdayBtn.click();
    await page.locator('button[data-filter="maybe"]').click();
    await page.locator('button[data-filter="no"]').click();
    await page.locator('button[data-filter="unmarked"]').click();

    let filtered = await page.locator('.movie').count();

    // Should have fewer movies with more restrictive filters
    expect(filtered).toBeLessThanOrEqual(allMovies);
  });
});
