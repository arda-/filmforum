# Astrobook Interaction Testing Research Summary

## Executive Summary

This document summarizes the research conducted to determine the best approach for testing interactive component behavior in Astrobook stories for the FilmForum project.

**Conclusion**: Astrobook v0.11.2 does **NOT support play functions** or interactive testing. The recommended approach is to use **Playwright for all interaction tests**, keeping stories as static visual documentation.

---

## Research Findings

### 1. Astrobook v0.11.2 Capabilities

**Astrobook is a minimal UI component playground with limited CSF3 support.**

#### Supported Features
✅ **args** - Pass component props to render different visual states
✅ **decorators** - Wrap components with styling/layout
✅ **Single-story hoisting** - Automatically hoist single stories
✅ **Multiple framework support** - React, Vue, Astro, Svelte, etc.

#### Not Supported
❌ **play() functions** - No automation/interaction testing
❌ **test() functions** - No test assertions in stories
❌ **Client-side test execution** - Stories are server-rendered to HTML
❌ **Test status reporting** - No mechanism to show test results

**Source**: Astrobook documentation and TypeScript types in `@astrobook/types`

### 2. Type System Analysis

Reviewed the TypeScript definitions for Astrobook stories:

```typescript
// From @astrobook/types/lib/types.d.ts

export interface StoryNamedExport {
  /**
   * The decorators to apply to the story.
   */
  decorators?: StoryDecorator[] | null | undefined

  /**
   * The arguments to pass to the story.
   */
  args?: object | null | undefined
}
```

**Only two properties supported**: `decorators` and `args`. No `play` or test-related properties.

### 3. Current Testing Architecture

The FilmForum project already has a well-established testing setup:

- **Playwright**: For component and integration tests
- **Vitest**: For unit tests
- **Test Location**: `/tests/components/` and `/tests/integration/`
- **Existing Pattern**: Demo pages at `/demo/<component>` serve as test targets

**Example**: `tests/components/reaction-buttons.spec.ts` contains comprehensive interaction tests with:
- Click interactions
- Keyboard navigation
- Accessibility attributes
- CSS computed styles
- Color verification

### 4. Component Analysis

Analyzed three interactive components:

#### Toggle Component
- **File**: `src/components/Toggle.astro`
- **Interactions**: Click to toggle, Space/Enter keyboard
- **State**: `data-state` attribute, `aria-pressed`
- **Events**: Dispatches custom `change` event

#### Dialog Component
- **File**: `src/components/Dialog.astro`
- **Interactions**: Open/close, backdrop click, close button, Escape key
- **State**: `data-open` attribute
- **API**: Global `window.openDialog()` and `window.closeDialog()` functions

#### ReactionButtons Component
- **File**: `src/components/session/ReactionButtons.astro`
- **Interactions**: Click to toggle, Space/Enter keyboard
- **State**: `.active` class, `aria-pressed` attribute
- **Behavior**: Buttons toggle independently

All three components use event listeners and state attributes, making them testable with Playwright.

---

## Decision Matrix

| Approach | Pros | Cons | Verdict |
|----------|------|------|---------|
| **Astrobook play functions** | Would be nice if supported | NOT SUPPORTED in v0.11.2 | ❌ Not viable |
| **Storybook (switch tools)** | Has play functions | Major refactor, different tool | ❌ Overkill |
| **Playwright (recommended)** | Already in use, stable, full automation, CI ready | Separate from stories | ✅ Best fit |
| **Manual testing** | Simplest setup | Not automated, unreliable | ❌ Poor practice |

---

## Recommended Implementation

### Stories Role: Visual Documentation

Stories should focus on showing all visual states using `args`:

```typescript
// Toggle.stories.ts
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

### Tests Role: Behavior Verification

Playwright tests verify interactions against demo pages:

```typescript
// tests/components/toggle.spec.ts
test('should toggle state on click', async ({ page }) => {
  const toggle = page.locator('[data-testid="toggle-default"]');

  await toggle.click();
  await expect(toggle).toHaveAttribute('aria-pressed', 'true');
});
```

### Separation of Concerns

| Layer | Tool | Purpose | Location |
|-------|------|---------|----------|
| **Static States** | Astrobook | Show visual variations | `src/components/*.stories.ts` |
| **Interactions** | Playwright | Test user behavior | `tests/components/*.spec.ts` |
| **Demo/Showcase** | Astro pages | Live examples | `src/pages/demo/*.astro` |

---

## Action Items Completed

### 1. Documentation
- ✅ Created `docs/ASTROBOOK_INTERACTION_TESTING.md`
  - Comprehensive guide on testing philosophy
  - Why Astrobook doesn't support play functions
  - How to use Playwright effectively
  - Best practices and patterns

- ✅ Created `docs/PLAYWRIGHT_INTERACTION_EXAMPLES.md`
  - Copy-paste ready test examples
  - Complete test suites for three interactive components
  - Common patterns and troubleshooting

### 2. Story Enhancements
- ✅ Updated `src/components/Toggle.stories.ts`
  - Added JSDoc comments explaining interaction testing approach
  - Documented that tests live in `tests/components/toggle.spec.ts`
  - Added meaningful export descriptions

- ✅ Updated `src/components/Dialog.stories.ts`
  - Added JSDoc explaining dialog-specific testing
  - Documented the `window.openDialog()` / `window.closeDialog()` API
  - Added notes about static rendering in Astrobook

- ✅ Updated `src/components/session/ReactionButtons.stories.ts`
  - Added JSDoc with links to test file
  - Documented expected behavior and test coverage
  - Added meaningful export descriptions

### 3. Research Summary
- ✅ Created this document with findings and recommendations

---

## Future Considerations

### If Astrobook Adds Play Functions
If Astrobook v0.12+ adds play function support in the future:
1. Review updated type definitions
2. Evaluate whether stories should include play functions
3. Determine if stories could replace some Playwright tests
4. Update documentation accordingly

### Alternative Approaches
If play functions become critical requirement:
- **Storybook migration**: Switch from Astrobook to Storybook (major change)
- **Custom testing framework**: Build play function support (not recommended)
- **Hybrid approach**: Keep Astrobook + Playwright (current approach)

### Enhancements to Current Setup
1. Add more demo pages to `/demo/` directory
2. Standardize `data-testid` usage across all interactive components
3. Create snapshot tests for component rendering
4. Add visual regression testing with Playwright

---

## References

### Astrobook
- [Astrobook GitHub](https://github.com/ocavue/astrobook)
- [Astrobook Documentation](https://astrobook.pages.dev/)
- [Component Story Format (CSF3)](https://storybook.js.org/docs/api/csf)

### Testing
- [Playwright Documentation](https://playwright.dev/)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
- [ARIA Testing Best Practices](https://www.w3.org/WAI/test-evaluate/)

### FilmForum Project
- `astro.config.mjs` - Astrobook configuration
- `package.json` - Dependencies and scripts
- `tests/components/reaction-buttons.spec.ts` - Example test
- `ROADMAP.md` - Project roadmap

---

## Questions Answered

### Q: Does Astrobook have play functions like Storybook?
**A**: No. Astrobook is designed as a minimal playground for visual development, not automated testing.

### Q: Should we switch to Storybook?
**A**: No. Storybook is overkill for this project. Astrobook is lightweight and fits the needs well. Using Playwright for tests is the appropriate separation of concerns.

### Q: How do we test interactive behavior?
**A**: Use Playwright tests with demo pages. This is the recommended approach and already in use in this project.

### Q: Can we add play functions to our stories?
**A**: Not with Astrobook. You could switch to Storybook, but that's a major change. Playwright is a better solution.

### Q: Where should test code live?
**A**: In `tests/components/*.spec.ts` files, separate from story files. Stories are for documentation; tests are for verification.

### Q: How do we know our components work?
**A**: Through Playwright tests that simulate real user interactions and verify behavior with assertions.

---

## Conclusion

The FilmForum project is well-positioned to test interactive components effectively:

1. **Astrobook** provides visual documentation through static stories
2. **Playwright** provides comprehensive interaction testing
3. **Separation of concerns** keeps code organized and maintainable
4. **Existing patterns** in the project (demo pages, test structure) support this approach

The recommended approach is documented in:
- `docs/ASTROBOOK_INTERACTION_TESTING.md` - Philosophy and guidance
- `docs/PLAYWRIGHT_INTERACTION_EXAMPLES.md` - Practical examples
- Enhanced story files with clear documentation

This approach provides clarity for developers on how to test interactive behavior while keeping the Astrobook stories focused on visual documentation.
