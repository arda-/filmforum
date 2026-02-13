/**
 * Integration test: View mode toggle → Calendar render changes
 * Tests that switching between Timeline and Grid modes re-renders correctly,
 * and that detail toggles affect tile content.
 */

import { test, expect } from '@playwright/test';

const CALENDAR_URL = '/s/tenement-stories/calendar';

test.describe('View Mode Integration: Timeline ↔ Grid rendering', () => {
  test('should render timeline elements in default timeline mode', async ({ page }) => {
    await page.goto(CALENDAR_URL);
    await page.waitForSelector('.movie');

    const timelineMovies = page.locator('.movie--timeline');
    expect(await timelineMovies.count()).toBeGreaterThan(0);
  });

  test('should remove timeline styling when switching to grid mode', async ({ page }) => {
    await page.goto(CALENDAR_URL);
    await page.waitForSelector('.movie');

    const gridBtn = page.locator('button[data-view="grid"]');
    await gridBtn.click();
    await page.waitForTimeout(300);

    // In grid mode, movies should not have timeline class
    const timelineMovies = page.locator('.movie--timeline');
    expect(await timelineMovies.count()).toBe(0);

    // But movies should still exist
    const allMovies = page.locator('.movie');
    expect(await allMovies.count()).toBeGreaterThan(0);
  });

  test('should preserve movie count when switching view modes', async ({ page }) => {
    await page.goto(CALENDAR_URL);
    await page.waitForSelector('.movie');

    const countTimeline = await page.locator('.movie').count();

    // Switch to grid
    await page.locator('button[data-view="grid"]').click();
    await page.waitForTimeout(300);
    const countGrid = await page.locator('.movie').count();

    // Switch back to timeline
    await page.locator('button[data-view="timeline"]').click();
    await page.waitForTimeout(300);
    const countBack = await page.locator('.movie').count();

    expect(countGrid).toBe(countTimeline);
    expect(countBack).toBe(countTimeline);
  });

  test('should preserve filters when switching view modes', async ({ page }) => {
    await page.goto(CALENDAR_URL);
    await page.waitForSelector('.movie');

    // Disable weekends filter
    await page.locator('button[data-time="weekends"]').click();
    await page.waitForTimeout(300);
    const filteredCount = await page.locator('.movie').count();

    // Switch to grid
    await page.locator('button[data-view="grid"]').click();
    await page.waitForTimeout(300);
    const gridFiltered = await page.locator('.movie').count();

    expect(gridFiltered).toBe(filteredCount);
  });
});

test.describe('View Mode Integration: Detail options → Body classes', () => {
  test('should add show-year-director class when detail toggle enabled', async ({ page }) => {
    await page.goto(CALENDAR_URL);

    const detailBtn = page.locator('button[data-detail="year-director"]');
    await detailBtn.click();

    const hasClass = await page.evaluate(() =>
      document.body.classList.contains('show-year-director')
    );
    expect(hasClass).toBe(true);
  });

  test('should add show-runtime class when detail toggle enabled', async ({ page }) => {
    await page.goto(CALENDAR_URL);

    await page.locator('button[data-detail="runtime"]').click();

    const hasClass = await page.evaluate(() =>
      document.body.classList.contains('show-runtime')
    );
    expect(hasClass).toBe(true);
  });

  test('should add show-image class when detail toggle enabled', async ({ page }) => {
    await page.goto(CALENDAR_URL);

    await page.locator('button[data-detail="image"]').click();

    const hasImage = await page.evaluate(() =>
      document.body.classList.contains('show-image')
    );
    expect(hasImage).toBe(true);
  });

  test('should remove body class when detail toggle disabled', async ({ page }) => {
    await page.goto(CALENDAR_URL);

    const detailBtn = page.locator('button[data-detail="year-director"]');

    // Enable
    await detailBtn.click();
    let hasClass = await page.evaluate(() =>
      document.body.classList.contains('show-year-director')
    );
    expect(hasClass).toBe(true);

    // Disable
    await detailBtn.click();
    hasClass = await page.evaluate(() =>
      document.body.classList.contains('show-year-director')
    );
    expect(hasClass).toBe(false);
  });
});

test.describe('View Mode Integration: Week start → Calendar reorganization', () => {
  test('should add monday-start class by default', async ({ page }) => {
    await page.goto(CALENDAR_URL);

    const hasClass = await page.evaluate(() =>
      document.body.classList.contains('monday-start')
    );
    expect(hasClass).toBe(true);
  });

  test('should remove monday-start class when switching to Sunday', async ({ page }) => {
    await page.goto(CALENDAR_URL);

    // Open gear popover
    await page.locator('#view-settings-btn').click();

    // Switch to Sunday
    await page.locator('button[data-weekstart="sun"]').click();
    await page.waitForTimeout(300);

    const hasClass = await page.evaluate(() =>
      document.body.classList.contains('monday-start')
    );
    expect(hasClass).toBe(false);
  });
});
