# Plan: Calendar UI Polish

## Context

### What Exists

The calendar schedule view is rendered in `src/pages/index.astro` with styles in `src/styles/calendar.css`, `src/styles/global.css`, and `src/components/MovieTile/styles.css`. The ToggleGroup component is at `src/components/ToggleGroup.astro`.

### What We're Building

Three independent UI polish items from `TODO.md`:
1. Fix ToggleGroup border colors in dark mode (too high contrast)
2. Dim past day cells in the calendar grid
3. Make calendar color theme programmatic (support multiple primary colors per month)

### Key Constraints

- Pure CSS/JS changes -- no new dependencies
- Must not break existing light mode appearance
- `pnpm build` must pass

## Components

1. **ToggleGroup Dark Mode Fix** -- CSS variable adjustment. Trivial complexity.
2. **Past Day Cell Dimming** -- JS to mark past dates + CSS for dimmed appearance. Low complexity.
3. **Programmatic Color Themes** -- CSS custom properties per month + JS to assign month-based classes. Medium complexity.

## Dependencies

All three items are fully independent and can be built in any order or in parallel.

## Execution Plan

### Phase 1: Independent Fixes (all parallel)

**Track A: ToggleGroup Dark Mode Borders**

- [ ] **1A.1: Fix border contrast**
  - Modify `src/components/ToggleGroup.astro`
  - In the dark mode media query, use a subtler border color (e.g., `var(--w-color-primary-40)` instead of current value, or a custom CSS variable)
  - Test in both light and dark modes to ensure the border is visible but not harsh

**Track B: Past Day Cell Dimming**

- [ ] **1B.1: Add past-date detection**
  - Modify the calendar rendering logic (currently in `src/pages/index.astro` inline script, or in `src/lib/schedule/calendarRenderer.ts` if migration has happened)
  - In `createDayCell()` or `renderAllDays()`: compare each date to today, add `.past` class to day cells with dates before today

- [ ] **1B.2: Add CSS for dimmed past cells**
  - Modify `src/styles/calendar.css`
  - `.day.past`: reduce opacity (e.g., `opacity: 0.5`), or desaturate via `filter: saturate(0.5) opacity(0.6)`
  - `.day.past .day-number`: dimmer text color
  - Ensure movie tiles within past days are also visually subdued but still clickable

**Track C: Programmatic Color Themes**

- [ ] **1C.1: Design the color theme system**
  - Create `src/config/colorThemes.ts` (or add to existing constants)
  - Define a mapping: month number to primary accent color
  - Example: `{ 2: '#0891b2', 3: '#dc2626' }` (blue for Feb, red for March)
  - Export as `MONTH_COLORS` or similar

- [ ] **1C.2: Apply month-based CSS variables**
  - In the calendar rendering logic: when creating day cells, determine the month of each date
  - Add a `data-month` attribute or `.month-{N}` class to each day cell
  - In CSS: define `--accent` overrides per month class
  - The `MovieTile` component already uses `var(--accent)` for highlighting, so the color change should cascade automatically

- [ ] **1C.3: Handle series spanning multiple months**
  - The current series (Tenement Stories) runs Feb 6-26, only one month
  - For future series spanning Feb-March: each day cell gets its month's color
  - The header/controls area uses the first month's color by default
  - Test with sample dates across month boundaries

### Phase 2: Verification

- [ ] **2.1: Visual verification**
  - Check all three changes in light mode and dark mode
  - Verify past days are visibly dimmed but functional
  - Verify ToggleGroup borders are appropriately subtle in dark mode
  - If color themes are testable (series crosses month boundary), verify different colors per month section
  - Run `pnpm build`

## Quality Gates

- [ ] `pnpm build` passes with zero errors
- [ ] ToggleGroup borders visible but not harsh in dark mode
- [ ] Past day cells visually distinguished from current/future cells
- [ ] Past day cells still functional (clickable movie tiles)
- [ ] Color theme system does not break existing single-month display
- [ ] Light mode appearance unchanged or improved

## Risks & Open Questions

1. **"Past" definition**: Should "past" mean before today's date, or before the current time (so today's morning showtime is past but evening is not)? Recommendation: use date-level granularity (before today = past, today and future = current) for simplicity.

2. **Color theme testing**: With only one series that spans a single month, the programmatic color theme cannot be fully tested with real data. Consider creating a test fixture with multi-month dates for the demo page, or defer the feature until a multi-month series exists.

3. **Dimming vs. hiding past dates**: The TODO says "dim" which implies visual reduction, not removal. Past showtimes have already occurred but users may still want to see what they missed.

4. **Interaction with Route Migration**: If Route Migration happens first, the inline script modifications in Track B and Track C target the extracted modules rather than `index.astro` directly. Adjust file paths accordingly.

---

Written by Claude Opus 4.6 (claude-opus-4-6) at 2026-02-06
