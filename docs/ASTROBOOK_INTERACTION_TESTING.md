# Astrobook Interaction Testing Guide

## Overview

This guide documents the recommended approach for testing interactive component behavior in Astrobook stories. Astrobook supports a limited subset of Component Story Format (CSF3) features designed for static rendering and visual inspection, but does not support play functions for automated interaction testing.

## Astrobook Capabilities

### Supported Features
- **args**: Pass component props to render different visual states
- **decorators**: Wrap components with custom styling or layout
- **Single-story hoisting**: Automatically hoist single stories up to replace parent

### Limitations
- ❌ **No play functions**: Unlike Storybook, Astrobook does not support `play()` functions for automating interactions
- ❌ **No client-side test execution**: Astrobook stories are server-rendered to HTML and don't execute test code
- ❌ **No test status reporting**: No built-in mechanisms to report test results within stories

## Recommended Approach: Playwright for Interaction Testing

Since Astrobook is designed for visual documentation rather than interaction testing, we use **Playwright** for all automated interaction tests. This approach offers:

- Full browser automation and user interaction simulation
- Comprehensive assertions for DOM state, CSS, and accessibility
- Integration with CI/CD pipelines
- Better separation of concerns (stories for documentation, tests for behavior)

## Testing Patterns

### 1. Story Structure: Static Visual States

Stories should show all possible visual states of a component using `args`:

```typescript
// Toggle.stories.ts
import Toggle from './Toggle.astro';

export default {
  component: Toggle,
};

// Visual state: default unchecked
export const Default = {
  args: { id: 'toggle-1', label: 'After 6 PM' },
};

// Visual state: checked
export const Pressed = {
  args: { id: 'toggle-2', label: 'After 6 PM', pressed: true },
};

// Visual state: disabled
export const Disabled = {
  args: { id: 'toggle-3', label: 'Unavailable', disabled: true },
};
```

### 2. Playwright Tests: Interactive Behavior

Create `.spec.ts` files in the `tests/components` directory to test actual interactions:

```typescript
// tests/components/toggle.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Toggle', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to a demo page showing the toggle story
    await page.goto('/demo/toggle');
  });

  test('should toggle state on click', async ({ page }) => {
    const toggle = page.locator('[data-testid="toggle-default"]');

    // Initial state
    await expect(toggle).toHaveAttribute('aria-pressed', 'false');

    // Click to toggle
    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-pressed', 'true');

    // Click again to toggle back
    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-pressed', 'false');
  });

  test('should activate with keyboard (Space)', async ({ page }) => {
    const toggle = page.locator('[data-testid="toggle-default"]');

    await toggle.focus();
    await page.keyboard.press('Space');

    await expect(toggle).toHaveAttribute('aria-pressed', 'true');
  });

  test('should not toggle when disabled', async ({ page }) => {
    const toggle = page.locator('[data-testid="toggle-disabled"]');

    await toggle.click();
    // State should not change
    await expect(toggle).toHaveAttribute('disabled', '');
  });
});
```

## Implementation Strategy

### Phase 1: Stories as Visual Documentation
1. Stories remain simple documentation tools
2. Use `args` to show all visual states and variations
3. Include meaningful state labels to guide readers

### Phase 2: Playwright Tests as Behavior Verification
1. Create comprehensive Playwright tests for interactive components
2. Test user interactions: clicks, keyboard input, focus management
3. Verify state changes, accessibility attributes, and side effects
4. Run tests in CI/CD before merging

### Phase 3: Demo Pages as Live Examples
1. Create demo pages (e.g., `/demo/toggle`) that showcase components
2. Use test-ids to enable reliable Playwright test selectors
3. Ensure demo pages load all variations needed by tests

## Component Testing Examples

### Toggle Component

**Story File** (`Toggle.stories.ts`):
```typescript
export default {
  component: Toggle,
};

export const Default = {
  args: { id: 'toggle-1', label: 'After 6 PM' },
};

export const Pressed = {
  args: { id: 'toggle-2', label: 'After 6 PM', pressed: true },
};

export const Disabled = {
  args: { id: 'toggle-3', label: 'Unavailable', disabled: true },
};
```

**Playwright Test** (`tests/components/toggle.spec.ts`):
```typescript
test.describe('Toggle', () => {
  test('should toggle state on click', async ({ page }) => {
    const btn = page.locator('[data-testid="toggle-default"]');

    await btn.click();
    await expect(btn).toHaveAttribute('aria-pressed', 'true');
  });

  test('should be disabled when disabled prop is true', async ({ page }) => {
    const btn = page.locator('[data-testid="toggle-disabled"]');
    await expect(btn).toBeDisabled();
  });
});
```

### Dialog Component

**Story File** (`Dialog.stories.ts`):
```typescript
export default {
  component: Dialog,
};

export const Small = {
  args: { id: 'dialog-sm', title: 'Confirm Action', size: 'sm' },
};

export const Large = {
  args: { id: 'dialog-lg', title: 'Schedule Overview', size: 'lg' },
};

export const NoCloseButton = {
  args: { id: 'dialog-no-close', title: 'Required Action', showCloseButton: false },
};
```

**Playwright Test** (`tests/components/dialog.spec.ts`):
```typescript
test.describe('Dialog', () => {
  test('should open when triggered', async ({ page }) => {
    const dialog = page.locator('[role="dialog"]');

    // Assuming a demo page with a button that opens the dialog
    await page.evaluate(() => window.openDialog('dialog-id'));

    await expect(dialog).toHaveAttribute('data-open', 'true');
  });

  test('should close on escape key', async ({ page }) => {
    await page.evaluate(() => window.openDialog('dialog-id'));

    await page.keyboard.press('Escape');

    const dialog = page.locator('[role="dialog"]');
    await expect(dialog).toHaveAttribute('data-open', 'false');
  });

  test('should close on backdrop click', async ({ page }) => {
    await page.evaluate(() => window.openDialog('dialog-id'));

    const backdrop = page.locator('.dialog-backdrop');
    await backdrop.click();

    const dialog = page.locator('[role="dialog"]');
    await expect(dialog).toHaveAttribute('data-open', 'false');
  });
});
```

### ReactionButtons Component

**Story File** (`ReactionButtons.stories.ts`):
```typescript
export default {
  component: ReactionButtons,
};

export const Default = {
  args: { movieId: 'demo-1' },
};

export const YesSelected = {
  args: { movieId: 'demo-2', reaction: 'yes' },
};

export const MaybeSelected = {
  args: { movieId: 'demo-3', reaction: 'maybe' },
};
```

**Playwright Test** (`tests/components/reaction-buttons.spec.ts`):
```typescript
test.describe('ReactionButtons', () => {
  test('should toggle Yes button on click', async ({ page }) => {
    const yesBtn = page.locator('button[data-reaction="yes"]').first();

    await expect(yesBtn).toHaveAttribute('aria-pressed', 'false');

    await yesBtn.click();

    await expect(yesBtn).toHaveAttribute('aria-pressed', 'true');
  });

  test('should support keyboard activation', async ({ page }) => {
    const yesBtn = page.locator('button[data-reaction="yes"]').first();

    await yesBtn.focus();
    await page.keyboard.press('Space');

    await expect(yesBtn).toHaveAttribute('aria-pressed', 'true');
  });
});
```

## Best Practices

### Story Organization
1. **One component per story file** - `Component.stories.ts`
2. **Multiple story variations** - Use `args` to show different states
3. **Clear naming** - Export names should describe the visual state
4. **Comments for clarity** - Add JSDoc comments explaining complex props

### Test Organization
1. **One component per test file** - `component.spec.ts`
2. **Grouped test suites** - Use `test.describe()` for related tests
3. **Meaningful test names** - Describe user interactions and expected outcomes
4. **Use data-testid** - Add `data-testid` attributes for reliable selectors

### Test Coverage
- ✅ User interactions (click, keyboard, focus)
- ✅ State changes (aria-pressed, data attributes, classes)
- ✅ Accessibility (aria attributes, keyboard navigation)
- ✅ Edge cases (disabled state, multiple interactions)
- ✅ Visual appearance (computed styles if needed)

## Running Tests

### Run all tests
```bash
pnpm test:all
```

### Run only component tests
```bash
pnpm test:component
```

### Run a specific test file
```bash
pnpm test tests/components/toggle.spec.ts
```

### Run tests in watch mode
```bash
pnpm test
```

### Update snapshots
```bash
pnpm test:component -- --update-snapshots
```

## Troubleshooting

### Issue: Playwright tests timeout waiting for elements

**Solution**: Ensure the demo page loads the component with the required `data-testid`:
```astro
<Toggle id="toggle-1" label="Test" data-testid="toggle-default" />
```

### Issue: Interactive tests fail in stories

**Remember**: Astrobook stories are static HTML. Interactions must be tested via Playwright against a running page, not within the story file.

### Issue: Tests pass locally but fail in CI

**Solution**:
- Ensure demo pages are served before running Playwright tests
- Check that all test-ids are present in the component
- Verify browser support in CI environment

## References

- [Astrobook Documentation](https://github.com/ocavue/astrobook)
- [Playwright Testing](https://playwright.dev/)
- [Component Story Format (CSF3)](https://storybook.js.org/docs/api/csf)
- [ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)
