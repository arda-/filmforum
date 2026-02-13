/**
 * Integration test: URL state serialization and deserialization
 * Tests that URL parameters correctly restore and persist view/filter state
 */

import { test, expect } from '@playwright/test';

test.describe('URL State Integration: Parameter persistence', () => {
  test.skip('should encode timeline mode in URL', async ({ page }) => {
    await page.goto('/series/test-series');

    // Switch to grid mode
    const gridBtn = page.locator('button[data-view="grid"]');
    await gridBtn.click();

    // Wait for URL update
    await page.waitForURL(/timeline=0/);

    const url = page.url();
    expect(url).toContain('timeline=0');
  });

  test.skip('should encode week-start preference in URL', async ({ page }) => {
    await page.goto('/series/test-series');

    // Open gear, click Sunday
    const gearBtn = page.locator('#view-settings-btn');
    await gearBtn.click();

    const sunBtn = page.locator('button[data-weekstart="sun"]');
    await sunBtn.click();

    // Wait for URL update
    await page.waitForURL(/week-start=0/);

    const url = page.url();
    expect(url).toContain('week-start=0');
  });

  test.skip('should encode time filter in URL', async ({ page }) => {
    await page.goto('/series/test-series');

    // Disable weekends
    const weekendBtn = page.locator('button[data-time="weekends"]');
    await weekendBtn.click();

    // Wait for URL update
    await page.waitForURL(/times=/);

    const url = page.url();
    expect(url).toContain('times=weekdays,weeknights');
  });

  test.skip('should encode saved filter in URL', async ({ page }) => {
    await page.goto('/series/test-series');

    // Disable "No" filter
    const noBtn = page.locator('button[data-filter="no"]');
    await noBtn.click();

    // Wait for URL update
    await page.waitForURL(/saved=/);

    const url = page.url();
    expect(url).toContain('saved=yes,maybe,unmarked');
  });

  test.skip('should not encode default values in URL', async ({ page }) => {
    await page.goto('/series/test-series');

    const url = page.url();

    // All filters enabled = default, should not appear in URL
    expect(url).not.toContain('times=');
    expect(url).not.toContain('saved=');
  });
});

test.describe('URL State Integration: Parameter restoration', () => {
  test.skip('should restore timeline mode from URL', async ({ page }) => {
    // Load with timeline=0 (grid mode)
    await page.goto('/series/test-series?timeline=0');

    const gridBtn = page.locator('button[data-view="grid"]');
    await expect(gridBtn).toHaveClass(/active/);

    const timelineBtn = page.locator('button[data-view="timeline"]');
    await expect(timelineBtn).not.toHaveClass(/active/);
  });

  test.skip('should restore week-start from URL', async ({ page }) => {
    // Load with week-start=0 (Sunday)
    await page.goto('/series/test-series?week-start=0');

    const sunBtn = page.locator('button[data-weekstart="sun"]');
    await expect(sunBtn).toHaveClass(/active/);

    const monBtn = page.locator('button[data-weekstart="mon"]');
    await expect(monBtn).not.toHaveClass(/active/);
  });

  test.skip('should restore time filters from URL', async ({ page }) => {
    // Load with only weekdays and weeknights
    await page.goto('/series/test-series?times=weekdays,weeknights');

    const weekdayBtn = page.locator('button[data-time="weekdays"]');
    const weeknightBtn = page.locator('button[data-time="weeknights"]');
    const weekendBtn = page.locator('button[data-time="weekends"]');

    await expect(weekdayBtn).toHaveClass(/active/);
    await expect(weeknightBtn).toHaveClass(/active/);
    await expect(weekendBtn).not.toHaveClass(/active/);
  });

  test.skip('should restore saved filter from URL', async ({ page }) => {
    // Load with only yes and maybe
    await page.goto('/series/test-series?saved=yes,maybe');

    const yesBtn = page.locator('button[data-filter="yes"]');
    const maybeBtn = page.locator('button[data-filter="maybe"]');
    const noBtn = page.locator('button[data-filter="no"]');
    const unmarkedBtn = page.locator('button[data-filter="unmarked"]');

    await expect(yesBtn).toHaveClass(/active/);
    await expect(maybeBtn).toHaveClass(/active/);
    await expect(noBtn).not.toHaveClass(/active/);
    await expect(unmarkedBtn).not.toHaveClass(/active/);
  });

  test.skip('should restore all view options from URL', async ({ page }) => {
    // Load with multiple options
    await page.goto('/series/test-series?timeline=0&week-start=0&image=1&year-director=1&times=weekdays');

    const gridBtn = page.locator('button[data-view="grid"]');
    const sunBtn = page.locator('button[data-weekstart="sun"]');
    const imageBtn = page.locator('button[data-detail="image"]');
    const yearDirBtn = page.locator('button[data-detail="year-director"]');

    await expect(gridBtn).toHaveClass(/active/);
    await expect(sunBtn).toHaveClass(/active/);
    await expect(imageBtn).toHaveClass(/active/);
    await expect(yearDirBtn).toHaveClass(/active/);
  });
});

test.describe('URL State Integration: Invalid parameter handling', () => {
  test.skip('should ignore invalid time category values', async ({ page }) => {
    // Load with invalid time value
    await page.goto('/series/test-series?times=invalid,weekdays');

    // Should restore only valid values
    const weekdayBtn = page.locator('button[data-time="weekdays"]');
    await expect(weekdayBtn).toHaveClass(/active/);

    // Invalid value should be silently dropped
  });

  test.skip('should ignore invalid saved filter values', async ({ page }) => {
    await page.goto('/series/test-series?saved=yes,invalid,maybe');

    const yesBtn = page.locator('button[data-filter="yes"]');
    const maybeBtn = page.locator('button[data-filter="maybe"]');

    await expect(yesBtn).toHaveClass(/active/);
    await expect(maybeBtn).toHaveClass(/active/);
  });
});
