# Storybook: Immediate Next Steps

## Context

Our demo pages (`/demo/*`) serve as component showcases but lack interactivity wiring, making it hard to test interactive behavior in isolation. Storybook would give us proper isolated component testing with built-in interaction support.

## Challenge

Astro components (`.astro` files) are server-rendered templates, not JS framework components. Storybook doesn't have native Astro support. We need to understand what's possible before committing to an approach.

## Next Steps

1. **Research: Storybook + Astro compatibility**
   - What is the current state of `@storybook/astro` or community adapters?
   - Can we use Storybook with our client-side `<script>` logic without a framework adapter?
   - What do other Astro projects use for component-level testing?

2. **Research: What components actually need Storybook?**
   - Audit which components have client-side interactivity (e.g., ReactionButtons, CalendarFilterBar, ViewToolbar)
   - Which are purely server-rendered templates with no JS?
   - Only interactive components benefit from Storybook

3. **Evaluate alternatives if Storybook doesn't fit**
   - Enhanced demo pages with shared toggle/interaction scripts
   - Playwright component testing (already partially in use)
   - Storybook for just the JS logic, not the Astro templates

4. **If viable: install and configure**
   - `pnpm add -D storybook @storybook/html` (or appropriate adapter)
   - Add `storybook` and `build-storybook` scripts to package.json
   - Create first story for ReactionButtons as proof of concept

5. **Migrate one demo page to a story**
   - Pick ReactionButtons (simplest interactive component)
   - Verify interaction testing works (click toggle, keyboard, aria-pressed)
   - Compare DX with current Playwright component tests
