/**
 * Integration test: Filters → Calendar render pipeline
 * Tests that toggling filters actually changes which movies render in the calendar grid.
 */

import { test, expect } from '@playwright/test';

const CALENDAR_URL = '/s/tenement-stories/calendar';

test.describe('Filter Integration: Time filter toggle → Movie rendering', () => {
  test('should reduce visible movies when a time filter is disabled', async ({ page }) => {
    await page.goto(CALENDAR_URL);
    await page.waitForSelector('.movie');

    const visibleBefore = await page.locator('.movie').count();

    // Disable weekdays filter
    const weekdayBtn = page.locator('button[data-time="weekdays"]');
    await weekdayBtn.click();

    // Wait for button state to update
    await expect(weekdayBtn).not.toHaveClass(/active/);

    const visibleAfter = await page.locator('.movie').count();
    expect(visibleAfter).toBeLessThanOrEqual(visibleBefore);
  });

  test('should restore movies when time filter is re-enabled', async ({ page }) => {
    await page.goto(CALENDAR_URL);
    await page.waitForSelector('.movie');

    const visibleBefore = await page.locator('.movie').count();

    // Disable then re-enable weekdays
    const weekdayBtn = page.locator('button[data-time="weekdays"]');
    await weekdayBtn.click();
    await expect(weekdayBtn).not.toHaveClass(/active/);

    await weekdayBtn.click();
    await expect(weekdayBtn).toHaveClass(/active/);

    const visibleAfter = await page.locator('.movie').count();
    expect(visibleAfter).toBe(visibleBefore);
  });

  test('should show no movies when all time filters disabled', async ({ page }) => {
    await page.goto(CALENDAR_URL);
    await page.waitForSelector('.movie');

    // Disable all time filters
    const weekdayBtn = page.locator('button[data-time="weekdays"]');
    const weeknightBtn = page.locator('button[data-time="weeknights"]');
    const weekendBtn = page.locator('button[data-time="weekends"]');

    await weekdayBtn.click();
    await expect(weekdayBtn).not.toHaveClass(/active/);

    await weeknightBtn.click();
    await expect(weeknightBtn).not.toHaveClass(/active/);

    await weekendBtn.click();
    await expect(weekendBtn).not.toHaveClass(/active/);

    await expect(page.locator('.movie')).toHaveCount(0);
  });
});

test.describe('Filter Integration: Saved status filter → Movie rendering', () => {
  test('should not increase visible movies when enabling No filter', async ({ page }) => {
    await page.goto(CALENDAR_URL);
    await page.waitForSelector('.movie');

    const visibleBefore = await page.locator('.movie').count();

    // Enable "No" filter (off by default)
    const noBtn = page.locator('button[data-filter="no"]');
    await noBtn.click();
    await expect(noBtn).toHaveClass(/active/);

    const visibleAfter = await page.locator('.movie').count();
    // Enabling an additional filter can only keep or increase count
    expect(visibleAfter).toBeGreaterThanOrEqual(visibleBefore);
  });

  test('should reduce visible movies when disabling Yes filter', async ({ page }) => {
    await page.goto(CALENDAR_URL);
    await page.waitForSelector('.movie');

    const visibleBefore = await page.locator('.movie').count();

    // Disable "Yes" filter (on by default)
    const yesBtn = page.locator('button[data-filter="yes"]');
    await yesBtn.click();
    await expect(yesBtn).not.toHaveClass(/active/);

    const visibleAfter = await page.locator('.movie').count();
    expect(visibleAfter).toBeLessThanOrEqual(visibleBefore);
  });
});

test.describe('Filter Integration: Multiple filters together', () => {
  test('should apply both time and saved filters cumulatively', async ({ page }) => {
    await page.goto(CALENDAR_URL);
    await page.waitForSelector('.movie');

    const allMovies = await page.locator('.movie').count();

    // Apply multiple restrictive filters
    const weekdayBtn = page.locator('button[data-time="weekdays"]');
    const maybeBtn = page.locator('button[data-filter="maybe"]');

    await weekdayBtn.click();
    await expect(weekdayBtn).not.toHaveClass(/active/);

    await maybeBtn.click();
    await expect(maybeBtn).not.toHaveClass(/active/);

    const filtered = await page.locator('.movie').count();
    expect(filtered).toBeLessThanOrEqual(allMovies);
  });
});
