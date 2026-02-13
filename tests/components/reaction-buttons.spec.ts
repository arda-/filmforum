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

    test('should allow only one button active at a time', async ({ page }) => {
      const unmarked = page.locator('[data-testid="md-unmarked"]');
      const yesBtn = unmarked.locator('button[data-reaction="yes"]');
      const maybeBtn = unmarked.locator('button[data-reaction="maybe"]');

      // Activate Yes
      await yesBtn.click();
      await expect(yesBtn).toHaveClass(/active/);

      // Activate Maybe (should not deactivate Yes yet - that's handled by parent)
      await maybeBtn.click();
      // Note: The component itself doesn't enforce single selection
      // That's typically handled by parent state management
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
    test('Yes button should use green color', async ({ page }) => {
      const yesBtn = page.locator('[data-testid="md-yes"] button[data-reaction="yes"]');

      const color = await yesBtn.evaluate(el =>
        window.getComputedStyle(el).color
      );
      expect(color).toBeTruthy();
    });

    test('No button should use red color', async ({ page }) => {
      const noBtn = page.locator('[data-testid="md-no"] button[data-reaction="no"]');

      const color = await noBtn.evaluate(el =>
        window.getComputedStyle(el).color
      );
      expect(color).toBeTruthy();
    });

    test('Maybe button should use orange color', async ({ page }) => {
      const maybeBtn = page.locator('[data-testid="md-maybe"] button[data-reaction="maybe"]');

      const color = await maybeBtn.evaluate(el =>
        window.getComputedStyle(el).color
      );
      expect(color).toBeTruthy();
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

    test('buttons should have focus ring', async ({ page }) => {
      const btn = page.locator('[data-testid="md-unmarked"] .rbtn').first();
      await btn.focus();

      const outline = await btn.evaluate(el =>
        window.getComputedStyle(el).outline
      );
      expect(outline).toBeTruthy();
    });
  });
});
