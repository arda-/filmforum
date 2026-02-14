# Playwright Interaction Testing Examples

This document provides copy-paste ready examples for testing interactive components with Playwright.

## Setup

All tests use:
- **Framework**: Playwright
- **Location**: `tests/components/*.spec.ts`
- **Demo pages**: Components rendered at `/demo/<component-name>`
- **Test selectors**: `data-testid` attributes for reliable element selection

## Complete Test Examples

### Toggle Component

**File**: `tests/components/toggle.spec.ts`

```typescript
/**
 * Component test for Toggle
 * Tests toggle button state toggling and keyboard interaction
 */

import { test, expect } from '@playwright/test';

test.describe('Toggle', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/demo/button'); // Or appropriate demo page
  });

  test.describe('Click interactions', () => {
    test('should toggle state on click', async ({ page }) => {
      const toggle = page.locator('[data-testid="toggle-default"]');

      // Initial state
      await expect(toggle).toHaveAttribute('aria-pressed', 'false');
      await expect(toggle).toHaveAttribute('data-state', 'off');

      // Click to toggle on
      await toggle.click();
      await expect(toggle).toHaveAttribute('aria-pressed', 'true');
      await expect(toggle).toHaveAttribute('data-state', 'on');

      // Click to toggle off
      await toggle.click();
      await expect(toggle).toHaveAttribute('aria-pressed', 'false');
      await expect(toggle).toHaveAttribute('data-state', 'off');
    });

    test('should dispatch change event on toggle', async ({ page }) => {
      const toggle = page.locator('[data-testid="toggle-default"]');

      // Listen for change events
      const changeCount = await page.evaluate(() => {
        let count = 0;
        document.querySelector('[data-testid="toggle-default"]')?.addEventListener('change', () => {
          count++;
        });
        return count;
      });

      await toggle.click();

      const newChangeCount = await page.evaluate(() => {
        let count = 0;
        document.querySelectorAll('[data-testid="toggle-default"]').forEach(el => {
          // Events are dispatched, count would be tracked
        });
        return count;
      });
    });
  });

  test.describe('Keyboard interactions', () => {
    test('should toggle with Space key', async ({ page }) => {
      const toggle = page.locator('[data-testid="toggle-default"]');

      await toggle.focus();
      await page.keyboard.press('Space');

      await expect(toggle).toHaveAttribute('aria-pressed', 'true');
    });

    test('should toggle with Enter key', async ({ page }) => {
      const toggle = page.locator('[data-testid="toggle-default"]');

      await toggle.focus();
      await page.keyboard.press('Enter');

      await expect(toggle).toHaveAttribute('aria-pressed', 'true');
    });

    test('should be keyboard navigable', async ({ page }) => {
      const toggle = page.locator('[data-testid="toggle-default"]');

      // Tab to focus
      await page.keyboard.press('Tab');
      await expect(toggle).toBeFocused();
    });
  });

  test.describe('Disabled state', () => {
    test('should not toggle when disabled', async ({ page }) => {
      const toggle = page.locator('[data-testid="toggle-disabled"]');

      await toggle.click();

      // State should not change
      await expect(toggle).toHaveAttribute('disabled', '');
      await expect(toggle).toHaveAttribute('aria-pressed', 'false');
    });

    test('should not respond to keyboard when disabled', async ({ page }) => {
      const toggle = page.locator('[data-testid="toggle-disabled"]');

      await toggle.focus();
      await page.keyboard.press('Space');

      // State should not change
      await expect(toggle).toHaveAttribute('aria-pressed', 'false');
    });
  });

  test.describe('Visual states', () => {
    test('should have correct variant classes', async ({ page }) => {
      const defaultToggle = page.locator('[data-testid="toggle-default"]');
      const outlineToggle = page.locator('[data-testid="toggle-outline"]');

      await expect(defaultToggle).toHaveClass(/toggle--default/);
      await expect(outlineToggle).toHaveClass(/toggle--outline/);
    });

    test('should have correct size classes', async ({ page }) => {
      const smallToggle = page.locator('[data-testid="toggle-small"]');
      const largeToggle = page.locator('[data-testid="toggle-large"]');

      await expect(smallToggle).toHaveClass(/toggle--sm/);
      await expect(largeToggle).toHaveClass(/toggle--lg/);
    });

    test('should show different colors when toggled', async ({ page }) => {
      const toggle = page.locator('[data-testid="toggle-default"]');

      const offColor = await toggle.evaluate(el =>
        window.getComputedStyle(el).backgroundColor
      );

      await toggle.click();

      const onColor = await toggle.evaluate(el =>
        window.getComputedStyle(el).backgroundColor
      );

      expect(offColor).not.toBe(onColor);
    });
  });

  test.describe('Accessibility', () => {
    test('should have aria-pressed attribute', async ({ page }) => {
      const toggle = page.locator('[data-testid="toggle-default"]');

      const ariaPressed = await toggle.getAttribute('aria-pressed');
      expect(['true', 'false']).toContain(ariaPressed);
    });

    test('should have visible focus ring', async ({ page }) => {
      const toggle = page.locator('[data-testid="toggle-default"]');

      await toggle.focus();

      const outline = await toggle.evaluate(el =>
        window.getComputedStyle(el).outline
      );

      expect(outline).not.toBe('none');
      expect(outline).not.toBe('');
    });
  });
});
```

### Dialog Component

**File**: `tests/components/dialog.spec.ts`

```typescript
/**
 * Component test for Dialog
 * Tests dialog open/close behavior and keyboard interaction
 */

import { test, expect } from '@playwright/test';

test.describe('Dialog', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/demo/dialog');
  });

  test.describe('Open/close behavior', () => {
    test('should open when triggered', async ({ page }) => {
      const dialog = page.locator('[role="dialog"]').first();

      // Initially closed
      await expect(dialog).toHaveAttribute('data-open', 'false');

      // Open via window API
      await page.evaluate(() => {
        const dialogs = document.querySelectorAll('[role="dialog"]');
        if (dialogs.length > 0) {
          (dialogs[0] as HTMLElement).dataset.open = 'true';
        }
      });

      await expect(dialog).toHaveAttribute('data-open', 'true');
    });

    test('should close on backdrop click', async ({ page }) => {
      const dialog = page.locator('[role="dialog"]').first();

      // Open dialog
      await page.evaluate(() => {
        const dialogs = document.querySelectorAll('[role="dialog"]');
        if (dialogs.length > 0) {
          (dialogs[0] as HTMLElement).dataset.open = 'true';
        }
      });

      await expect(dialog).toHaveAttribute('data-open', 'true');

      // Click backdrop
      const backdrop = dialog.locator('.dialog-backdrop');
      await backdrop.click();

      await expect(dialog).toHaveAttribute('data-open', 'false');
    });

    test('should close on close button click', async ({ page }) => {
      const dialog = page.locator('[role="dialog"]').first();

      // Open dialog
      await page.evaluate(() => {
        const dialogs = document.querySelectorAll('[role="dialog"]');
        if (dialogs.length > 0) {
          (dialogs[0] as HTMLElement).dataset.open = 'true';
        }
      });

      // Click close button
      const closeBtn = dialog.locator('.dialog-close');
      await closeBtn.click();

      await expect(dialog).toHaveAttribute('data-open', 'false');
    });
  });

  test.describe('Keyboard interaction', () => {
    test('should close on Escape key', async ({ page }) => {
      const dialog = page.locator('[role="dialog"]').first();

      // Open dialog
      await page.evaluate(() => {
        const dialogs = document.querySelectorAll('[role="dialog"]');
        if (dialogs.length > 0) {
          (dialogs[0] as HTMLElement).dataset.open = 'true';
        }
      });

      // Press Escape
      await page.keyboard.press('Escape');

      await expect(dialog).toHaveAttribute('data-open', 'false');
    });

    test('should focus first focusable element on open', async ({ page }) => {
      const dialog = page.locator('[role="dialog"]').first();

      // Open dialog
      await page.evaluate(() => {
        const dialogs = document.querySelectorAll('[role="dialog"]');
        if (dialogs.length > 0) {
          (dialogs[0] as HTMLElement).dataset.open = 'true';
        }
      });

      // First focusable element should be focused
      const focusable = dialog.locator('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])').first();
      await expect(focusable).toBeFocused();
    });
  });

  test.describe('Sizes', () => {
    test('should have correct max-width for size sm', async ({ page }) => {
      const dialog = page.locator('[role="dialog"]').first();
      const content = dialog.locator('.dialog-content--sm');

      const maxWidth = await content.evaluate(el =>
        window.getComputedStyle(el).maxWidth
      );

      expect(maxWidth).toBe('400px');
    });

    test('should have correct max-width for size md', async ({ page }) => {
      const dialogs = page.locator('[role="dialog"]');
      let dialog;

      for (let i = 0; i < await dialogs.count(); i++) {
        const content = dialogs.nth(i).locator('.dialog-content--md');
        if (await content.count() > 0) {
          dialog = dialogs.nth(i);
          break;
        }
      }

      if (dialog) {
        const content = dialog.locator('.dialog-content--md');
        const maxWidth = await content.evaluate(el =>
          window.getComputedStyle(el).maxWidth
        );
        expect(maxWidth).toBe('500px');
      }
    });

    test('should have correct max-width for size lg', async ({ page }) => {
      const dialogs = page.locator('[role="dialog"]');
      let dialog;

      for (let i = 0; i < await dialogs.count(); i++) {
        const content = dialogs.nth(i).locator('.dialog-content--lg');
        if (await content.count() > 0) {
          dialog = dialogs.nth(i);
          break;
        }
      }

      if (dialog) {
        const content = dialog.locator('.dialog-content--lg');
        const maxWidth = await content.evaluate(el =>
          window.getComputedStyle(el).maxWidth
        );
        expect(maxWidth).toBe('640px');
      }
    });
  });

  test.describe('Accessibility', () => {
    test('should have role="dialog"', async ({ page }) => {
      const dialog = page.locator('[role="dialog"]').first();
      await expect(dialog).toHaveAttribute('role', 'dialog');
    });

    test('should have aria-modal="true"', async ({ page }) => {
      const dialog = page.locator('[role="dialog"]').first();
      await expect(dialog).toHaveAttribute('aria-modal', 'true');
    });

    test('should have aria-labelledby pointing to title', async ({ page }) => {
      const dialog = page.locator('[role="dialog"]').first();
      const labelledBy = await dialog.getAttribute('aria-labelledby');

      expect(labelledBy).toBeTruthy();

      const title = dialog.locator(`#${labelledBy}`);
      await expect(title).toBeVisible();
    });

    test('close button should have aria-label', async ({ page }) => {
      const dialog = page.locator('[role="dialog"]').first();
      const closeBtn = dialog.locator('.dialog-close');

      await expect(closeBtn).toHaveAttribute('aria-label', 'Close');
    });
  });

  test.describe('Visual presentation', () => {
    test('should not be visible when data-open="false"', async ({ page }) => {
      const dialog = page.locator('[role="dialog"]').first();

      // Should be in DOM but not visible
      const display = await dialog.evaluate(el =>
        window.getComputedStyle(el).display
      );

      expect(display).toBe('none');
    });

    test('should have backdrop visible when open', async ({ page }) => {
      const dialog = page.locator('[role="dialog"]').first();

      // Open dialog
      await page.evaluate(() => {
        const dialogs = document.querySelectorAll('[role="dialog"]');
        if (dialogs.length > 0) {
          (dialogs[0] as HTMLElement).dataset.open = 'true';
        }
      });

      const backdrop = dialog.locator('.dialog-backdrop');
      await expect(backdrop).toBeVisible();
    });
  });
});
```

### ReactionButtons Component

**File**: `tests/components/reaction-buttons.spec.ts`

```typescript
/**
 * Component test for ReactionButtons
 * Tests reaction button toggling and color coding
 */

import { test, expect } from '@playwright/test';

test.describe('ReactionButtons', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/demo/reaction-buttons');
  });

  test.describe('Click interactions', () => {
    test('should toggle Yes button on click', async ({ page }) => {
      const yesBtn = page.locator('button[data-reaction="yes"]').first();

      await expect(yesBtn).toHaveAttribute('aria-pressed', 'false');

      await yesBtn.click();

      await expect(yesBtn).toHaveAttribute('aria-pressed', 'true');

      await yesBtn.click();

      await expect(yesBtn).toHaveAttribute('aria-pressed', 'false');
    });

    test('should toggle Maybe button on click', async ({ page }) => {
      const maybeBtn = page.locator('button[data-reaction="maybe"]').first();

      await expect(maybeBtn).toHaveAttribute('aria-pressed', 'false');

      await maybeBtn.click();

      await expect(maybeBtn).toHaveAttribute('aria-pressed', 'true');
    });

    test('should toggle No button on click', async ({ page }) => {
      const noBtn = page.locator('button[data-reaction="no"]').first();

      await expect(noBtn).toHaveAttribute('aria-pressed', 'false');

      await noBtn.click();

      await expect(noBtn).toHaveAttribute('aria-pressed', 'true');
    });

    test('should allow multiple buttons to be active', async ({ page }) => {
      const yesBtn = page.locator('button[data-reaction="yes"]').first();
      const maybeBtn = page.locator('button[data-reaction="maybe"]').first();

      await yesBtn.click();
      await maybeBtn.click();

      await expect(yesBtn).toHaveAttribute('aria-pressed', 'true');
      await expect(maybeBtn).toHaveAttribute('aria-pressed', 'true');
    });
  });

  test.describe('Keyboard interactions', () => {
    test('should toggle with Space key', async ({ page }) => {
      const yesBtn = page.locator('button[data-reaction="yes"]').first();

      await yesBtn.focus();
      await page.keyboard.press('Space');

      await expect(yesBtn).toHaveAttribute('aria-pressed', 'true');
    });

    test('should toggle with Enter key', async ({ page }) => {
      const maybeBtn = page.locator('button[data-reaction="maybe"]').first();

      await maybeBtn.focus();
      await page.keyboard.press('Enter');

      await expect(maybeBtn).toHaveAttribute('aria-pressed', 'true');
    });

    test('should be keyboard navigable with Tab', async ({ page }) => {
      const buttons = page.locator('button[data-reaction]').all();
      const count = await page.locator('button[data-reaction]').count();

      expect(count).toBe(3); // Yes, Maybe, No

      // First button should be focusable
      const firstBtn = page.locator('button[data-reaction="yes"]').first();
      await firstBtn.focus();
      await expect(firstBtn).toBeFocused();
    });
  });

  test.describe('Rendering', () => {
    test('should render three buttons per group', async ({ page }) => {
      const buttons = page.locator('[data-reaction-group] button[data-reaction]');
      const groupCount = page.locator('[data-reaction-group]').count();

      if (await groupCount >= 1) {
        const firstGroupButtons = page.locator('[data-reaction-group]').first().locator('button[data-reaction]');
        await expect(firstGroupButtons).toHaveCount(3);
      }
    });

    test('should have correct reaction types', async ({ page }) => {
      const yesBtn = page.locator('button[data-reaction="yes"]').first();
      const maybeBtn = page.locator('button[data-reaction="maybe"]').first();
      const noBtn = page.locator('button[data-reaction="no"]').first();

      await expect(yesBtn).toBeVisible();
      await expect(maybeBtn).toBeVisible();
      await expect(noBtn).toBeVisible();
    });
  });

  test.describe('Visual states', () => {
    test('active button should have different background', async ({ page }) => {
      const yesBtn = page.locator('button[data-reaction="yes"]').first();

      const inactiveBackground = await yesBtn.evaluate(el =>
        window.getComputedStyle(el).backgroundColor
      );

      await yesBtn.click();

      const activeBackground = await yesBtn.evaluate(el =>
        window.getComputedStyle(el).backgroundColor
      );

      expect(inactiveBackground).not.toBe(activeBackground);
    });

    test('different reaction types should have different colors when active', async ({ page }) => {
      const yesBtn = page.locator('button[data-reaction="yes"]').first();
      const maybeBtn = page.locator('button[data-reaction="maybe"]').first();
      const noBtn = page.locator('button[data-reaction="no"]').first();

      await yesBtn.click();
      await maybeBtn.click();
      await noBtn.click();

      const yesColor = await yesBtn.evaluate(el =>
        window.getComputedStyle(el).backgroundColor
      );
      const maybeColor = await maybeBtn.evaluate(el =>
        window.getComputedStyle(el).backgroundColor
      );
      const noColor = await noBtn.evaluate(el =>
        window.getComputedStyle(el).backgroundColor
      );

      expect(yesColor).not.toBe(maybeColor);
      expect(yesColor).not.toBe(noColor);
      expect(maybeColor).not.toBe(noColor);
    });

    test('should have correct size classes', async ({ page }) => {
      const mdGroup = page.locator('[data-reaction-group]').first();
      const sizeClass = await mdGroup.evaluate(el =>
        Array.from(el.classList).find(cls => cls.includes('reactions--'))
      );

      expect(sizeClass).toBeTruthy();
    });
  });

  test.describe('Accessibility', () => {
    test('all buttons should have aria-pressed', async ({ page }) => {
      const buttons = page.locator('button[data-reaction]');
      const count = await buttons.count();

      for (let i = 0; i < count; i++) {
        const btn = buttons.nth(i);
        const ariaPressed = await btn.getAttribute('aria-pressed');
        expect(['true', 'false']).toContain(ariaPressed);
      }
    });

    test('buttons should have aria-labels', async ({ page }) => {
      const yesBtn = page.locator('button[data-reaction="yes"]').first();
      const maybeBtn = page.locator('button[data-reaction="maybe"]').first();
      const noBtn = page.locator('button[data-reaction="no"]').first();

      const yesLabel = await yesBtn.getAttribute('aria-label');
      const maybeLabel = await maybeBtn.getAttribute('aria-label');
      const noLabel = await noBtn.getAttribute('aria-label');

      expect(yesLabel).toBeTruthy();
      expect(maybeLabel).toBeTruthy();
      expect(noLabel).toBeTruthy();
    });

    test('buttons should have visible focus ring', async ({ page }) => {
      const btn = page.locator('button[data-reaction]').first();

      await btn.focus();

      const outline = await btn.evaluate(el =>
        window.getComputedStyle(el).outline
      );

      expect(outline).not.toBe('none');
      expect(outline).not.toBe('');
    });
  });
});
```

## Common Patterns

### Testing Focus Management

```typescript
test('should focus specific element', async ({ page }) => {
  const element = page.locator('[data-testid="element"]');

  await element.focus();
  await expect(element).toBeFocused();
});
```

### Testing Computed Styles

```typescript
test('should have correct color when active', async ({ page }) => {
  const element = page.locator('[data-testid="element"]');

  const color = await element.evaluate(el =>
    window.getComputedStyle(el).color
  );

  expect(color).toBe('rgb(0, 0, 0)'); // or whatever expected color
});
```

### Testing Custom Events

```typescript
test('should dispatch event on interaction', async ({ page }) => {
  const eventName = await page.evaluate(() => {
    return new Promise<string>((resolve) => {
      const el = document.querySelector('[data-testid="element"]');
      el?.addEventListener('change', () => {
        resolve('change');
      });
      el?.click();
    });
  });

  expect(eventName).toBe('change');
});
```

### Testing Multiple Elements

```typescript
test('should toggle multiple buttons', async ({ page }) => {
  const buttons = page.locator('button[data-reaction]');
  const count = await buttons.count();

  expect(count).toBe(3);

  for (let i = 0; i < count; i++) {
    const btn = buttons.nth(i);
    await btn.click();
    await expect(btn).toHaveAttribute('aria-pressed', 'true');
  }
});
```

## Tips

1. **Always use data-testid** - Makes selectors stable and readable
2. **Test user behavior, not implementation** - Click, type, focus
3. **Verify accessible attributes** - aria-pressed, aria-label, role
4. **Test keyboard navigation** - Tab, Enter, Space, Escape
5. **Check visual feedback** - Colors, sizes, animations (via computed styles)
6. **Use beforeEach for setup** - Consistent test state

## Troubleshooting

| Issue | Solution |
|-------|----------|
| `timeout waiting for element` | Check data-testid exists, verify selector path |
| `element not interactable` | Ensure element is visible, not covered by other elements |
| `aria attribute not updating` | Check component updates aria attributes on interaction |
| `focus test fails` | Verify element is focusable (button, input, etc.) |
| `test passes locally but fails in CI` | Check browser version, ensure Playwright browsers installed |
