/**
 * Integration test: URL state serialization and deserialization
 * Tests that URL parameters correctly restore and persist view/filter state.
 */

import { test, expect } from '@playwright/test';

const CALENDAR_URL = '/s/tenement-stories/calendar';

test.describe('URL State Integration: Parameter persistence', () => {
  test('should encode timeline=0 in URL when switching to grid mode', async ({ page }) => {
    await page.goto(CALENDAR_URL);

    const gridBtn = page.locator('button[data-view="grid"]');
    await gridBtn.click();
    await expect(gridBtn).toHaveClass(/active/);

    const url = page.url();
    expect(url).toContain('timeline=0');
  });

  test('should encode week-start=0 in URL when switching to Sunday', async ({ page }) => {
    await page.goto(CALENDAR_URL);

    await page.locator('#view-settings-btn').click();
    const sunBtn = page.locator('button[data-weekstart="sun"]');
    await sunBtn.click();
    await expect(sunBtn).toHaveClass(/active/);

    const url = page.url();
    expect(url).toContain('week-start=0');
  });

  test('should encode time filters in URL when changed', async ({ page }) => {
    await page.goto(CALENDAR_URL);

    // Disable weekends
    const weekendBtn = page.locator('button[data-time="weekends"]');
    await weekendBtn.click();
    await expect(weekendBtn).not.toHaveClass(/active/);

    const url = page.url();
    expect(url).toContain('times=');
    // Should contain the remaining enabled categories
    expect(url).toContain('weekdays');
    expect(url).toContain('weeknights');
  });
});

test.describe('URL State Integration: Parameter restoration', () => {
  test('should restore grid mode from URL', async ({ page }) => {
    await page.goto(CALENDAR_URL + '?timeline=0');

    const gridBtn = page.locator('button[data-view="grid"]');
    await expect(gridBtn).toHaveClass(/active/);

    const timelineBtn = page.locator('button[data-view="timeline"]');
    await expect(timelineBtn).not.toHaveClass(/active/);
  });

  test('should restore Sunday week start from URL', async ({ page }) => {
    await page.goto(CALENDAR_URL + '?week-start=0');

    // Open gear to check
    await page.locator('#view-settings-btn').click();

    const sunBtn = page.locator('button[data-weekstart="sun"]');
    await expect(sunBtn).toHaveClass(/active/);

    const monBtn = page.locator('button[data-weekstart="mon"]');
    await expect(monBtn).not.toHaveClass(/active/);
  });

  test('should restore time filters from URL', async ({ page }) => {
    await page.goto(CALENDAR_URL + '?times=weekdays,weeknights');

    const weekdayBtn = page.locator('button[data-time="weekdays"]');
    const weeknightBtn = page.locator('button[data-time="weeknights"]');
    const weekendBtn = page.locator('button[data-time="weekends"]');

    await expect(weekdayBtn).toHaveClass(/active/);
    await expect(weeknightBtn).toHaveClass(/active/);
    await expect(weekendBtn).not.toHaveClass(/active/);
  });

  test('should restore multiple view options from URL', async ({ page }) => {
    await page.goto(CALENDAR_URL + '?timeline=0&week-start=0&image=1&year-director=1');

    const gridBtn = page.locator('button[data-view="grid"]');
    const imageBtn = page.locator('button[data-detail="image"]');
    const yearDirBtn = page.locator('button[data-detail="year-director"]');

    await expect(gridBtn).toHaveClass(/active/);
    await expect(imageBtn).toHaveClass(/active/);
    await expect(yearDirBtn).toHaveClass(/active/);

    // Open gear to check week start
    await page.locator('#view-settings-btn').click();
    const sunBtn = page.locator('button[data-weekstart="sun"]');
    await expect(sunBtn).toHaveClass(/active/);
  });

  test('should restore saved filter from URL', async ({ page }) => {
    await page.goto(CALENDAR_URL + '?saved=yes,maybe');

    const yesBtn = page.locator('button[data-filter="yes"]');
    const maybeBtn = page.locator('button[data-filter="maybe"]');
    const noBtn = page.locator('button[data-filter="no"]');
    const unmarkedBtn = page.locator('button[data-filter="unmarked"]');

    await expect(yesBtn).toHaveClass(/active/);
    await expect(maybeBtn).toHaveClass(/active/);
    await expect(noBtn).not.toHaveClass(/active/);
    await expect(unmarkedBtn).not.toHaveClass(/active/);
  });
});

test.describe('URL State Integration: Round-trip', () => {
  test('should survive page reload with URL params', async ({ page }) => {
    await page.goto(CALENDAR_URL);

    // Switch to grid mode
    const gridBtn = page.locator('button[data-view="grid"]');
    await gridBtn.click();
    await expect(gridBtn).toHaveClass(/active/);

    // Grab the URL
    const urlAfterClick = page.url();
    expect(urlAfterClick).toContain('timeline=0');

    // Reload the page
    await page.reload();

    // Grid mode should still be active
    await expect(page.locator('button[data-view="grid"]')).toHaveClass(/active/);
  });
});
