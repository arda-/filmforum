/**
 * Component test for CalendarViewToolbar
 * Tests isolated toolbar state, gear popover, and detail toggles
 */

import { test, expect } from '@playwright/test';

test.describe('CalendarViewToolbar', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/demo/view-toolbar');
  });

  test.describe('View mode toggle', () => {
    test('should have Timeline active by default', async ({ page }) => {
      const timelineBtn = page.locator('button[data-view="timeline"]');
      const gridBtn = page.locator('button[data-view="grid"]');

      await expect(timelineBtn).toHaveClass(/active/);
      await expect(gridBtn).not.toHaveClass(/active/);
      await expect(timelineBtn).toHaveAttribute('aria-checked', 'true');
      await expect(gridBtn).toHaveAttribute('aria-checked', 'false');
    });

    test('should switch to Grid view on click', async ({ page }) => {
      const timelineBtn = page.locator('button[data-view="timeline"]');
      const gridBtn = page.locator('button[data-view="grid"]');

      await gridBtn.click();
      await expect(gridBtn).toHaveClass(/active/);
      await expect(timelineBtn).not.toHaveClass(/active/);
      await expect(gridBtn).toHaveAttribute('aria-checked', 'true');
      await expect(timelineBtn).toHaveAttribute('aria-checked', 'false');
    });

    test('should switch back to Timeline view', async ({ page }) => {
      const timelineBtn = page.locator('button[data-view="timeline"]');
      const gridBtn = page.locator('button[data-view="grid"]');

      await gridBtn.click();
      await timelineBtn.click();
      await expect(timelineBtn).toHaveClass(/active/);
      await expect(gridBtn).not.toHaveClass(/active/);
    });
  });

  test.describe('Gear popover', () => {
    test('should have popover closed by default', async ({ page }) => {
      const popover = page.locator('.view-settings-popover');
      const hasOpenClass = await popover.evaluate(el => el.classList.contains('open'));
      expect(hasOpenClass).toBe(false);
    });

    test('should open popover on gear button click', async ({ page }) => {
      const gearBtn = page.locator('#view-settings-btn');
      const popover = page.locator('.view-settings-popover');

      await gearBtn.click();
      await expect(popover).toHaveClass(/open/);
      await expect(gearBtn).toHaveAttribute('aria-expanded', 'true');
    });

    test('should close popover on second gear button click', async ({ page }) => {
      const gearBtn = page.locator('#view-settings-btn');
      const popover = page.locator('.view-settings-popover');

      await gearBtn.click();
      await expect(popover).toHaveClass(/open/);

      await gearBtn.click();
      const hasOpenClass = await popover.evaluate(el => el.classList.contains('open'));
      expect(hasOpenClass).toBe(false);
      await expect(gearBtn).toHaveAttribute('aria-expanded', 'false');
    });

    test('should close popover on Escape key', async ({ page }) => {
      const gearBtn = page.locator('#view-settings-btn');
      const popover = page.locator('.view-settings-popover');

      await gearBtn.click();
      await expect(popover).toHaveClass(/open/);

      await page.keyboard.press('Escape');
      const hasOpenClass = await popover.evaluate(el => el.classList.contains('open'));
      expect(hasOpenClass).toBe(false);
      await expect(gearBtn).toHaveAttribute('aria-expanded', 'false');
    });

    test('should close popover on outside click', async ({ page }) => {
      const gearBtn = page.locator('#view-settings-btn');
      const popover = page.locator('.view-settings-popover');
      const h1 = page.locator('h1').first();

      await gearBtn.click();
      await expect(popover).toHaveClass(/open/);

      await h1.click();
      const hasOpenClass = await popover.evaluate(el => el.classList.contains('open'));
      expect(hasOpenClass).toBe(false);
    });
  });

  test.describe('Week start selector', () => {
    test('should have Monday selected by default', async ({ page }) => {
      const gearBtn = page.locator('#view-settings-btn');
      await gearBtn.click();

      const monBtn = page.locator('button[data-weekstart="mon"]');
      const sunBtn = page.locator('button[data-weekstart="sun"]');

      await expect(monBtn).toHaveClass(/active/);
      await expect(sunBtn).not.toHaveClass(/active/);
      await expect(monBtn).toHaveAttribute('aria-checked', 'true');
      await expect(sunBtn).toHaveAttribute('aria-checked', 'false');
    });

    test('should switch to Sunday start', async ({ page }) => {
      const gearBtn = page.locator('#view-settings-btn');
      await gearBtn.click();

      const sunBtn = page.locator('button[data-weekstart="sun"]');
      await sunBtn.click();

      await expect(sunBtn).toHaveClass(/active/);
      await expect(sunBtn).toHaveAttribute('aria-checked', 'true');
    });
  });

  test.describe('Detail toggle buttons', () => {
    test('should have all detail buttons inactive by default', async ({ page }) => {
      const yearDirBtn = page.locator('button[data-detail="year-director"]');
      const runtimeBtn = page.locator('button[data-detail="runtime"]');
      const castBtn = page.locator('button[data-detail="cast"]');
      const imageBtn = page.locator('button[data-detail="image"]');

      await expect(yearDirBtn).not.toHaveClass(/active/);
      await expect(runtimeBtn).not.toHaveClass(/active/);
      await expect(castBtn).not.toHaveClass(/active/);
      await expect(imageBtn).not.toHaveClass(/active/);
    });

    test('should toggle detail button state on click', async ({ page }) => {
      const yearDirBtn = page.locator('button[data-detail="year-director"]');

      // Initially inactive
      await expect(yearDirBtn).not.toHaveClass(/active/);
      await expect(yearDirBtn).toHaveAttribute('aria-pressed', 'false');

      // Click to activate
      await yearDirBtn.click();
      await expect(yearDirBtn).toHaveClass(/active/);
      await expect(yearDirBtn).toHaveAttribute('aria-pressed', 'true');

      // Click to deactivate
      await yearDirBtn.click();
      await expect(yearDirBtn).not.toHaveClass(/active/);
      await expect(yearDirBtn).toHaveAttribute('aria-pressed', 'false');
    });

    test('should allow multiple detail options to be active', async ({ page }) => {
      const yearDirBtn = page.locator('button[data-detail="year-director"]');
      const runtimeBtn = page.locator('button[data-detail="runtime"]');

      await yearDirBtn.click();
      await runtimeBtn.click();

      await expect(yearDirBtn).toHaveClass(/active/);
      await expect(runtimeBtn).toHaveClass(/active/);
    });
  });

  test.describe('Keyboard accessibility', () => {
    test('view mode buttons should be keyboard navigable', async ({ page }) => {
      const timelineBtn = page.locator('button[data-view="timeline"]');

      await timelineBtn.focus();
      const focused = page.locator(':focus');
      expect(await focused.count()).toBeGreaterThan(0);
    });

    test('gear button should be keyboard accessible', async ({ page }) => {
      const gearBtn = page.locator('#view-settings-btn');

      await gearBtn.focus();
      await page.keyboard.press('Enter');

      const popover = page.locator('.view-settings-popover');
      await expect(popover).toHaveClass(/open/);
    });
  });

  test.describe('ARIA attributes', () => {
    test('should have radiogroup role for view mode', async ({ page }) => {
      const roleElements = page.locator('[role="radiogroup"]');
      // Should have at least one radiogroup (for view mode)
      expect(await roleElements.count()).toBeGreaterThanOrEqual(1);
    });

    test('detail buttons should have aria-pressed', async ({ page }) => {
      const detailBtns = page.locator('button[data-detail]');

      for (let i = 0; i < await detailBtns.count(); i++) {
        const btn = detailBtns.nth(i);
        const ariaPressed = await btn.getAttribute('aria-pressed');
        expect(['true', 'false']).toContain(ariaPressed);
      }
    });
  });
});
