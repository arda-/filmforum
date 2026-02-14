/**
 * Component test for Button stories in Astrobook
 * Verifies that button stories render with correct text content
 */

import { test, expect } from '@playwright/test';

test.describe('Button Stories Rendering', () => {
  test.beforeEach(async ({ page }) => {
    // Note: When astrobook is deployed, navigate to /astrobook/button/primary
    // For now, we're testing the basic Button component on the demo page
    await page.goto('/demo/button');
  });

  test.describe('Variants Section', () => {
    test('should render all variant buttons with text', async ({ page }) => {
      const variantsSection = page.locator('text=Variants').locator('..').locator('..').first();

      // Check for each variant button
      await expect(variantsSection.locator('button:has-text("Primary")')).toBeVisible();
      await expect(variantsSection.locator('button:has-text("Secondary")')).toBeVisible();
      await expect(variantsSection.locator('button:has-text("Outline")')).toBeVisible();
      await expect(variantsSection.locator('button:has-text("Ghost")')).toBeVisible();
      await expect(variantsSection.locator('button:has-text("Danger")')).toBeVisible();
      await expect(variantsSection.locator('button:has-text("Link")')).toBeVisible();
    });
  });

  test.describe('Sizes Section', () => {
    test('should render size variant buttons with text', async ({ page }) => {
      const sizesSection = page.locator('text=Sizes').locator('..').locator('..').first();

      await expect(sizesSection.locator('button:has-text("Small")')).toBeVisible();
      await expect(sizesSection.locator('button:has-text("Default")')).toBeVisible();
      await expect(sizesSection.locator('button:has-text("Large")')).toBeVisible();
    });
  });

  test.describe('Disabled Section', () => {
    test('should render disabled buttons with text', async ({ page }) => {
      const disabledSection = page.locator('text=Disabled').locator('..').locator('..').first();

      // Find disabled buttons
      const buttons = disabledSection.locator('button[disabled]');
      expect(await buttons.count()).toBeGreaterThan(0);

      // Verify they have text content
      const primaryDisabled = disabledSection.locator('button[disabled]:has-text("Primary")');
      await expect(primaryDisabled).toBeVisible();
    });
  });

  test('buttons should have proper styling applied', async ({ page }) => {
    const primaryButton = page.locator('text=Variants').locator('..').locator('..').locator('button').first();

    // Verify button has the btn class
    await expect(primaryButton).toHaveClass(/btn/);

    // Verify it's not disabled initially
    const disabled = await primaryButton.isDisabled();
    expect(disabled).toBe(false);
  });
});
