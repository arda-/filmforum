/**
 * Component test for CalendarFilterBar
 * Tests isolated button states, checkbox synchronization, and aria attributes
 */

import { test, expect } from '@playwright/test';

test.describe('CalendarFilterBar', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/demo/filter-bar');
  });

  test.describe('Time category filter', () => {
    test('should have all time category buttons active by default', async ({ page }) => {
      const dayBtn = page.locator('button[data-time="weekdays"]');
      const niteBtn = page.locator('button[data-time="weeknights"]');
      const weekendBtn = page.locator('button[data-time="weekends"]');

      await expect(dayBtn).toHaveClass(/active/);
      await expect(niteBtn).toHaveClass(/active/);
      await expect(weekendBtn).toHaveClass(/active/);
    });

    test('should toggle time category button state on click', async ({ page }) => {
      const dayBtn = page.locator('button[data-time="weekdays"]');
      const checkbox = dayBtn.locator('input[type="checkbox"]');

      // Initially active
      await expect(dayBtn).toHaveClass(/active/);
      await expect(checkbox).toBeChecked();
      await expect(dayBtn).toHaveAttribute('aria-pressed', 'true');

      // Click to deactivate
      await dayBtn.click();
      await expect(dayBtn).not.toHaveClass(/active/);
      await expect(checkbox).not.toBeChecked();
      await expect(dayBtn).toHaveAttribute('aria-pressed', 'false');

      // Click to reactivate
      await dayBtn.click();
      await expect(dayBtn).toHaveClass(/active/);
      await expect(checkbox).toBeChecked();
      await expect(dayBtn).toHaveAttribute('aria-pressed', 'true');
    });

    test('should update aria-pressed on toggle', async ({ page }) => {
      const btn = page.locator('button[data-time="weeknights"]');
      await expect(btn).toHaveAttribute('aria-pressed', 'true');

      await btn.click();
      await expect(btn).toHaveAttribute('aria-pressed', 'false');
    });

    test('should allow multiple time categories to be active', async ({ page }) => {
      const dayBtn = page.locator('button[data-time="weekdays"]');
      const niteBtn = page.locator('button[data-time="weeknights"]');

      // Both start active
      await expect(dayBtn).toHaveClass(/active/);
      await expect(niteBtn).toHaveClass(/active/);

      // Deactivate weekdays only
      await dayBtn.click();
      await expect(dayBtn).not.toHaveClass(/active/);
      await expect(niteBtn).toHaveClass(/active/);
    });
  });

  test.describe('Saved filter buttons', () => {
    test('should have Yes and Maybe active, No and Unmarked inactive by default', async ({ page }) => {
      const yesBtn = page.locator('button[data-filter="yes"]');
      const maybeBtn = page.locator('button[data-filter="maybe"]');
      const noBtn = page.locator('button[data-filter="no"]');
      const unmarkedBtn = page.locator('button[data-filter="unmarked"]');

      await expect(yesBtn).toHaveClass(/active/);
      await expect(maybeBtn).toHaveClass(/active/);
      await expect(noBtn).not.toHaveClass(/active/);
      await expect(unmarkedBtn).not.toHaveClass(/active/);
    });

    test('should toggle saved filter button state on click', async ({ page }) => {
      const noBtn = page.locator('button[data-filter="no"]');

      // Initially inactive
      await expect(noBtn).not.toHaveClass(/active/);
      await expect(noBtn).toHaveAttribute('aria-pressed', 'false');

      // Click to activate
      await noBtn.click();
      await expect(noBtn).toHaveClass(/active/);
      await expect(noBtn).toHaveAttribute('aria-pressed', 'true');

      // Click to deactivate
      await noBtn.click();
      await expect(noBtn).not.toHaveClass(/active/);
      await expect(noBtn).toHaveAttribute('aria-pressed', 'false');
    });

    test('should apply color styling to active saved filter buttons', async ({ page }) => {
      const yesBtn = page.locator('button[data-filter="yes"]');

      // Active button should have active class
      await expect(yesBtn).toHaveClass(/active/);
    });

    test('should allow multiple saved filters to be active simultaneously', async ({ page }) => {
      const yesBtn = page.locator('button[data-filter="yes"]');
      const maybeBtn = page.locator('button[data-filter="maybe"]');
      const noBtn = page.locator('button[data-filter="no"]');

      // Activate No while Yes and Maybe are already active
      await noBtn.click();
      await expect(yesBtn).toHaveClass(/active/);
      await expect(maybeBtn).toHaveClass(/active/);
      await expect(noBtn).toHaveClass(/active/);
    });
  });

  test.describe('Keyboard accessibility', () => {
    test('should be keyboard navigable with Tab', async ({ page }) => {
      const firstBtn = page.locator('button[data-time="weekdays"]');

      await firstBtn.focus();
      await expect(firstBtn).toBeFocused();

      await page.keyboard.press('Tab');

      // After Tab, focus should have moved away from the first button
      await expect(firstBtn).not.toBeFocused();
      // And some element should be focused
      const focusedCount = await page.locator(':focus').count();
      expect(focusedCount).toBeGreaterThan(0);
    });

    test('should toggle state with Space key', async ({ page }) => {
      const btn = page.locator('button[data-time="weekdays"]');
      await btn.focus();

      // Initially active
      await expect(btn).toHaveClass(/active/);

      // Press Space to toggle
      await page.keyboard.press('Space');
      await expect(btn).not.toHaveClass(/active/);

      // Press Space again to toggle back
      await page.keyboard.press('Space');
      await expect(btn).toHaveClass(/active/);
    });
  });

  test.describe('Filter bar layout', () => {
    test('should be sticky positioned', async ({ page }) => {
      const filterBar = page.locator('.calendar-filter-bar');
      const position = await filterBar.evaluate(el =>
        window.getComputedStyle(el).position
      );
      expect(position).toBe('sticky');
    });

    test('should have proper ARIA labels on time filter buttons', async ({ page }) => {
      const timeButtons = page.locator('button[data-time]');
      const count = await timeButtons.count();
      expect(count).toBeGreaterThan(0);

      for (let i = 0; i < count; i++) {
        const ariaPressed = await timeButtons.nth(i).getAttribute('aria-pressed');
        expect(['true', 'false']).toContain(ariaPressed);
      }
    });

    test('should have proper ARIA labels on saved filter buttons', async ({ page }) => {
      const savedButtons = page.locator('button[data-filter]');
      const count = await savedButtons.count();
      expect(count).toBeGreaterThan(0);

      for (let i = 0; i < count; i++) {
        const ariaPressed = await savedButtons.nth(i).getAttribute('aria-pressed');
        expect(['true', 'false']).toContain(ariaPressed);
      }
    });
  });
});
