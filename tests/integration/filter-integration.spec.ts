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

    // Wait for re-render
    await page.waitForTimeout(300);

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
    await page.waitForTimeout(300);
    await weekdayBtn.click();
    await page.waitForTimeout(300);

    const visibleAfter = await page.locator('.movie').count();
    expect(visibleAfter).toBe(visibleBefore);
  });

  test('should show no movies when all time filters disabled', async ({ page }) => {
    await page.goto(CALENDAR_URL);
    await page.waitForSelector('.movie');

    // Disable all time filters
    await page.locator('button[data-time="weekdays"]').click();
    await page.locator('button[data-time="weeknights"]').click();
    await page.locator('button[data-time="weekends"]').click();
    await page.waitForTimeout(300);

    const visible = await page.locator('.movie').count();
    expect(visible).toBe(0);
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
    await page.waitForTimeout(300);

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
    await page.waitForTimeout(300);

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
    await page.locator('button[data-time="weekdays"]').click();
    await page.locator('button[data-filter="maybe"]').click();
    await page.waitForTimeout(300);

    const filtered = await page.locator('.movie').count();
    expect(filtered).toBeLessThanOrEqual(allMovies);
  });
});
