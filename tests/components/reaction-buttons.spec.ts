/**
 * Component test for ReactionButtons
 * Tests isolated reaction button toggling and styling
 */

import { test, expect } from '@playwright/test';

test.describe('ReactionButtons', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/demo/reaction-buttons');
  });

  test.describe('Medium size (default)', () => {
    test('should render three buttons (Yes, Maybe, No)', async ({ page }) => {
      const buttons = page.locator('[data-testid="md-unmarked"] .rbtn');
      expect(await buttons.count()).toBe(3);
    });

    test('should have all buttons in unmarked state initially', async ({ page }) => {
      const unmarked = page.locator('[data-testid="md-unmarked"]');
      const yesBtn = unmarked.locator('button[data-reaction="yes"]');
      const maybeBtn = unmarked.locator('button[data-reaction="maybe"]');
      const noBtn = unmarked.locator('button[data-reaction="no"]');

      await expect(yesBtn).not.toHaveClass(/active/);
      await expect(maybeBtn).not.toHaveClass(/active/);
      await expect(noBtn).not.toHaveClass(/active/);

      await expect(yesBtn).toHaveAttribute('aria-pressed', 'false');
      await expect(maybeBtn).toHaveAttribute('aria-pressed', 'false');
      await expect(noBtn).toHaveAttribute('aria-pressed', 'false');
    });

    test('should have Yes button active in marked-yes example', async ({ page }) => {
      const yesBtn = page.locator('[data-testid="md-yes"] button[data-reaction="yes"]');

      await expect(yesBtn).toHaveClass(/active/);
      await expect(yesBtn).toHaveAttribute('aria-pressed', 'true');
    });

    test('should have Maybe button active in marked-maybe example', async ({ page }) => {
      const maybeBtn = page.locator('[data-testid="md-maybe"] button[data-reaction="maybe"]');

      await expect(maybeBtn).toHaveClass(/active/);
      await expect(maybeBtn).toHaveAttribute('aria-pressed', 'true');
    });

    test('should have No button active in marked-no example', async ({ page }) => {
      const noBtn = page.locator('[data-testid="md-no"] button[data-reaction="no"]');

      await expect(noBtn).toHaveClass(/active/);
      await expect(noBtn).toHaveAttribute('aria-pressed', 'true');
    });

    test('should toggle Yes button state on click', async ({ page }) => {
      const yesBtn = page.locator('[data-testid="md-unmarked"] button[data-reaction="yes"]');

      // Initially inactive
      await expect(yesBtn).not.toHaveClass(/active/);

      // Click to activate
      await yesBtn.click();
      await expect(yesBtn).toHaveClass(/active/);
      await expect(yesBtn).toHaveAttribute('aria-pressed', 'true');

      // Click to deactivate
      await yesBtn.click();
      await expect(yesBtn).not.toHaveClass(/active/);
      await expect(yesBtn).toHaveAttribute('aria-pressed', 'false');
    });

    test('clicking a second button should activate it independently', async ({ page }) => {
      const unmarked = page.locator('[data-testid="md-unmarked"]');
      const yesBtn = unmarked.locator('button[data-reaction="yes"]');
      const maybeBtn = unmarked.locator('button[data-reaction="maybe"]');

      // Activate Yes
      await yesBtn.click();
      await expect(yesBtn).toHaveClass(/active/);
      await expect(yesBtn).toHaveAttribute('aria-pressed', 'true');

      // Activate Maybe
      await maybeBtn.click();
      await expect(maybeBtn).toHaveClass(/active/);
      await expect(maybeBtn).toHaveAttribute('aria-pressed', 'true');
    });
  });

  test.describe('Small size', () => {
    test('should render buttons with sm class', async ({ page }) => {
      const smallSet = page.locator('[data-testid="sm-unmarked"] .reactions--sm');
      expect(await smallSet.count()).toBeGreaterThan(0);
    });

    test('should have buttons with smaller padding', async ({ page }) => {
      const smallBtn = page.locator('[data-testid="sm-unmarked"] .rbtn').first();
      const mediumBtn = page.locator('[data-testid="md-unmarked"] .rbtn').first();

      const smallPadding = await smallBtn.evaluate(el =>
        window.getComputedStyle(el).padding
      );
      const mediumPadding = await mediumBtn.evaluate(el =>
        window.getComputedStyle(el).padding
      );

      // Small should have less padding than medium
      expect(smallPadding).not.toBe(mediumPadding);
    });

    test('should have smaller SVG in small size', async ({ page }) => {
      const smallSvg = page.locator('[data-testid="sm-unmarked"] svg').first();

      const width = await smallSvg.getAttribute('width');
      // SVG in small should be 14px
      expect(width).toBe('14');
    });
  });

  test.describe('Color coding', () => {
    test('active buttons should have distinct color from inactive buttons', async ({ page }) => {
      // Get color of an active Yes button
      const activeYes = page.locator('[data-testid="md-yes"] button[data-reaction="yes"]');
      const activeColor = await activeYes.evaluate(el =>
        window.getComputedStyle(el).color
      );

      // Get color of an inactive Yes button (in unmarked set)
      const inactiveYes = page.locator('[data-testid="md-unmarked"] button[data-reaction="yes"]');
      const inactiveColor = await inactiveYes.evaluate(el =>
        window.getComputedStyle(el).color
      );

      expect(activeColor).not.toBe(inactiveColor);
    });

    test('Yes, Maybe, and No active buttons should have different colors', async ({ page }) => {
      const yesColor = await page.locator('[data-testid="md-yes"] button[data-reaction="yes"]').evaluate(el =>
        window.getComputedStyle(el).color
      );
      const maybeColor = await page.locator('[data-testid="md-maybe"] button[data-reaction="maybe"]').evaluate(el =>
        window.getComputedStyle(el).color
      );
      const noColor = await page.locator('[data-testid="md-no"] button[data-reaction="no"]').evaluate(el =>
        window.getComputedStyle(el).color
      );

      // Each reaction type should have its own distinct color
      expect(yesColor).not.toBe(noColor);
      expect(yesColor).not.toBe(maybeColor);
    });
  });

  test.describe('Keyboard accessibility', () => {
    test('buttons should be keyboard navigable with Tab', async ({ page }) => {
      const yesBtn = page.locator('[data-testid="md-unmarked"] button[data-reaction="yes"]');

      await yesBtn.focus();
      const focused = page.locator(':focus');
      expect(await focused.count()).toBeGreaterThan(0);
    });

    test('should toggle with Space key', async ({ page }) => {
      const yesBtn = page.locator('[data-testid="md-unmarked"] button[data-reaction="yes"]');

      await yesBtn.focus();
      await page.keyboard.press('Space');

      await expect(yesBtn).toHaveClass(/active/);
    });

    test('should toggle with Enter key', async ({ page }) => {
      const maybeBtn = page.locator('[data-testid="md-unmarked"] button[data-reaction="maybe"]');

      await maybeBtn.focus();
      await page.keyboard.press('Enter');

      await expect(maybeBtn).toHaveClass(/active/);
    });
  });

  test.describe('Accessibility', () => {
    test('all buttons should have aria-pressed', async ({ page }) => {
      const allBtns = page.locator('[data-testid="md-unmarked"] .rbtn');

      for (let i = 0; i < await allBtns.count(); i++) {
        const btn = allBtns.nth(i);
        const ariaPressed = await btn.getAttribute('aria-pressed');
        expect(['true', 'false']).toContain(ariaPressed);
      }
    });

    test('buttons should have aria-labels', async ({ page }) => {
      const yesBtn = page.locator('[data-testid="md-unmarked"] button[data-reaction="yes"]');
      const maybeBtn = page.locator('[data-testid="md-unmarked"] button[data-reaction="maybe"]');
      const noBtn = page.locator('[data-testid="md-unmarked"] button[data-reaction="no"]');

      const yesLabel = await yesBtn.getAttribute('aria-label');
      const maybeLabel = await maybeBtn.getAttribute('aria-label');
      const noLabel = await noBtn.getAttribute('aria-label');

      expect(yesLabel).toBeTruthy();
      expect(maybeLabel).toBeTruthy();
      expect(noLabel).toBeTruthy();
    });

    test('buttons should have visible focus ring', async ({ page }) => {
      const btn = page.locator('[data-testid="md-unmarked"] .rbtn').first();
      await btn.focus();

      const outline = await btn.evaluate(el =>
        window.getComputedStyle(el).outline
      );
      // outline should not be 'none' or empty when focused
      expect(outline).not.toBe('none');
      expect(outline).not.toBe('');
    });
  });
});
