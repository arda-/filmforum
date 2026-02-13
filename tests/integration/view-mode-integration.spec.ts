/**
 * Integration test: View mode toggle → Calendar render changes
 * Tests that switching between Timeline and Grid modes re-renders correctly,
 * and that detail toggles affect tile content.
 */

import { test, expect } from '@playwright/test';

const CALENDAR_URL = '/s/tenement-stories/calendar';

test.describe('View Mode Integration: Timeline <-> Grid rendering', () => {
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
    await expect(gridBtn).toHaveClass(/active/);

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
    const gridBtn = page.locator('button[data-view="grid"]');
    await gridBtn.click();
    await expect(gridBtn).toHaveClass(/active/);
    const countGrid = await page.locator('.movie').count();

    // Switch back to timeline
    const timelineBtn = page.locator('button[data-view="timeline"]');
    await timelineBtn.click();
    await expect(timelineBtn).toHaveClass(/active/);
    const countBack = await page.locator('.movie').count();

    expect(countGrid).toBe(countTimeline);
    expect(countBack).toBe(countTimeline);
  });

  test('should preserve filters when switching view modes', async ({ page }) => {
    await page.goto(CALENDAR_URL);
    await page.waitForSelector('.movie');

    // Disable weekends filter
    const weekendBtn = page.locator('button[data-time="weekends"]');
    await weekendBtn.click();
    await expect(weekendBtn).not.toHaveClass(/active/);

    const filteredCount = await page.locator('.movie').count();

    // Switch to grid
    const gridBtn = page.locator('button[data-view="grid"]');
    await gridBtn.click();
    await expect(gridBtn).toHaveClass(/active/);

    const gridFiltered = await page.locator('.movie').count();

    expect(gridFiltered).toBe(filteredCount);
  });
});

test.describe('View Mode Integration: Detail options → Body classes', () => {
  test('should add show-year-director class when detail toggle enabled', async ({ page }) => {
    await page.goto(CALENDAR_URL);

    const detailBtn = page.locator('button[data-detail="year-director"]');
    await detailBtn.click();

    await expect(page.locator('body')).toHaveClass(/show-year-director/);
  });

  test('should add show-runtime class when detail toggle enabled', async ({ page }) => {
    await page.goto(CALENDAR_URL);

    await page.locator('button[data-detail="runtime"]').click();

    await expect(page.locator('body')).toHaveClass(/show-runtime/);
  });

  test('should add show-image class when detail toggle enabled', async ({ page }) => {
    await page.goto(CALENDAR_URL);

    await page.locator('button[data-detail="image"]').click();

    await expect(page.locator('body')).toHaveClass(/show-image/);
  });

  test('should remove body class when detail toggle disabled', async ({ page }) => {
    await page.goto(CALENDAR_URL);

    const detailBtn = page.locator('button[data-detail="year-director"]');

    // Enable
    await detailBtn.click();
    await expect(page.locator('body')).toHaveClass(/show-year-director/);

    // Disable
    await detailBtn.click();
    await expect(page.locator('body')).not.toHaveClass(/show-year-director/);
  });
});

test.describe('View Mode Integration: Week start → Calendar reorganization', () => {
  test('should add monday-start class by default', async ({ page }) => {
    await page.goto(CALENDAR_URL);

    await expect(page.locator('body')).toHaveClass(/monday-start/);
  });

  test('should remove monday-start class when switching to Sunday', async ({ page }) => {
    await page.goto(CALENDAR_URL);

    // Open gear popover
    await page.locator('#view-settings-btn').click();

    // Switch to Sunday
    const sunBtn = page.locator('button[data-weekstart="sun"]');
    await sunBtn.click();
    await expect(sunBtn).toHaveClass(/active/);

    await expect(page.locator('body')).not.toHaveClass(/monday-start/);
  });
});
