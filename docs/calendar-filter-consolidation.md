# Calendar Filter Consolidation

## Goal

Consolidate the 11 calendar view controls into a compact toolbar. Reduce visual weight, push the calendar closer to the top of the page, and group controls by usage frequency.

## Files Considered

- `src/pages/s/[id]/calendar.astro` — page template, all control markup and event handlers
- `src/components/ToggleGroup.astro` — radio-style button group (used for Availability, Single showings)
- `src/components/CheckboxGroup.astro` — multi-select checkboxes (used for Saved movies)
- `src/components/Switch.astro` — on/off toggle switch (used for Timeline, Fit to width, Week start, Highlight alternate)
- `src/components/Toggle.astro` — stateful toggle button (used for tile display: Year/Dir, Runtime, Actors, Image)
- `src/utils/calendarUrlState.ts` — URL persistence for all controls
- `src/utils/calendarFilters.ts` — filter logic (hours, saved status)
- `src/constants.ts` — filter mode enums
- `src/styles/global.css` — shared control styles (.controls, .control-group)

## Current State: 11 Controls in 3 Groups

```
┌─ CALENDAR DISPLAY ──────────────────────────────────────────────┐
│  [*] Start week on Monday         (Switch)                      │
│  [*] Timeline mode                (Switch)                      │
│  [*] Fit to width                 (Switch)                      │
├─ MOVIE TILE DISPLAY ────────────────────────────────────────────┤
│  Show: [Year/Dir] [Runtime] [Actors] [Image]   (Toggle buttons) │
│        ~~~~~~~~~ grayed out when Fit to Width is ON ~~~~~~~~~~  │
├─ FILTERING ─────────────────────────────────────────────────────┤
│  Availability:   [All] [After 5pm & wknd] [Weekends only]      │
│  Single showing: [Off] [* Highlight]      [Only show unique]   │
│  Saved movies:   [v Yes] [? Maybe] [x No] [_ Unmarked]        │
│  [ ] Highlight alternate showtimes on hover  (desktop only)     │
└─────────────────────────────────────────────────────────────────┘
                              |
                    +------- CALENDAR ------+
                    |  Mon  Tue  Wed ...    |
                    |  ...                  |
                    +----------------------+
```

### Problems

1. **11 controls visible at once** — pushes the calendar below the fold
2. **"Tile Display" is disabled 90% of the time** (Fit to Width is on by default) — dead space
3. **Coupling is hidden** — Fit to Width gates Tile Display, bridged by a confirmation dialog. Confusing
4. **"Highlight alternate" is orphaned** — interaction setting mixed into Filtering
5. **Three control paradigms** (switches, toggle buttons, checkboxes) in one panel — visual noise
6. **Filters and display settings are at same level** — but filters are frequent, display settings are set-once

### Control Inventory

| Control | Type | Group | URL param | Used frequently? |
|---------|------|-------|-----------|-----------------|
| Start week on Monday | Switch | Calendar Display | `week-start` | Set once |
| Timeline mode | Switch | Calendar Display | `timeline` | Set once |
| Fit to width | Switch | Calendar Display | `fit-width` | Set once |
| Year/Director | Toggle | Tile Display | `year-director` | Rarely |
| Runtime | Toggle | Tile Display | `runtime` | Rarely |
| Actors | Toggle | Tile Display | `actors` | Rarely |
| Image | Toggle | Tile Display | `image` | Rarely |
| Availability | ToggleGroup | Filtering | `hours` | Frequently |
| Single showings | ToggleGroup | Filtering | `single` | Sometimes |
| Saved movies | CheckboxGroup | Filtering | `saved` | Sometimes |
| Highlight alternate | Switch | Filtering | (not persisted) | Rarely, desktop only |

### Interdependencies

- **Fit to Width ON** disables all 4 Tile Display toggles (grayed out)
- Clicking a disabled Tile Display toggle opens a confirmation dialog to disable Fit to Width
- **Image toggle ON** enables `body.scrim-enabled` and `body.blur-enabled`
- **Saved movies filter** is meaningless when user has no reactions (code already detects this via `hasAnyReactions()`)
- **Highlight alternate** requires pointer device (hidden on touch)

## Rejected Approaches

### Approach 1: Collapsible panel (rejected — too menu-heavy)

Split controls into a visible "Filters" section and a collapsible "View Settings" panel behind a gear icon. Rejected: a full toggle menu is overkill for set-once settings.

### Approach 2: Single toolbar (rejected — no spatial separation)

All 11 controls crammed into one or two rows. Rejected: doesn't differentiate between frequent filters and set-once display settings. Also too dense on mobile.

## Proposed Direction: Three-Zone Layout

Distribute controls across three spatial zones based on usage pattern:

1. **Sticky top bar** — filters you change while scrolling (frequent)
2. **Inline toolbar** — view settings at top of calendar area (set-once)
3. **Sticky bottom bar** — navigation and primary actions

### Existing App Patterns

The app already uses these bar patterns:

| Pattern | Example | Styling |
|---------|---------|---------|
| Sticky top bar | `ListToolbar.astro` on list page | `position: sticky; top: 0`, frosted glass (`backdrop-filter: blur(12px)`), `z-index: var(--z-drawer-bg)` |
| Fixed bottom bar | `BottomToolbar.astro` on list page | `position: fixed; bottom: 0`, frosted glass, safe-area padding, `z-index: var(--z-drawer-bg)` |
| Static header | `Header.astro` on calendar | Normal flow, centered text, not sticky |

The calendar page currently uses **none** of these — all 11 controls are in a static `.controls` block above the calendar. Adding sticky top + fixed bottom would bring the calendar page in line with the list page's UX patterns.

### Zone 1: Sticky Filter Bar (top)

Filters the user changes frequently while browsing the calendar. Stays visible while scrolling.

```
┌─────────────────────────────────────────────────────────────────────────┐
│  [All|Eve+Wknd|Wknd]   [Off|★ Highlight|Only]   [✓|?|✗|_]           │
│  ~~~~ Availability ~~   ~~~~ Unique films ~~~~   ~~ Saved ~~          │
└─────────────────────────────────────────────────────────────────────────┘
```

**Controls (3 filter groups, 10 options total):**
- Availability: `[All] [After 5pm & wknd] [Weekends only]` — ToggleGroup (radio)
- Single showings: `[Off] [★ Highlight] [Only unique]` — ToggleGroup (radio)
- Saved movies: `[✓ Yes] [? Maybe] [✗ No] [_ Unmarked]` — CheckboxGroup (multi-select)

**Styling:** Match `ListToolbar.astro` — frosted glass, sticky top, border-bottom.

**Behavior:**
- Saved filter auto-hides when user has no reactions (already detected via `hasAnyReactions()`)
- Status links ("3 hidden") appear inline next to the filter that hides them
- On mobile: rows wrap naturally, each filter group on its own line

### Zone 2: Inline View Toolbar (above calendar, below header)

Set-once display settings. Not sticky — you configure these once and scroll away.

```
┌─────────────────────────────────────────────────────────────────────────┐
│  [≡ Timeline | ⊞ Grid]   [↔ Fit to width]   [Mon|Sun]   [⚙]         │
└─────────────────────────────────────────────────────────────────────────┘
                                                              │
                                                   ┌──────────┴──────────┐
                                                   │  Tile Display       │
                                                   │  [Year/Dir] [Rtm]  │
                                                   │  [Actors]   [Img]  │
                                                   │                     │
                                                   │  [ ] Highlight alt  │
                                                   │  (desktop only)     │
                                                   └─────────────────────┘
```

**Controls (8 controls, 4 visible + 5 in popover):**
- Timeline / Grid: segmented toggle (replaces Switch)
- Fit to width: compact toggle button (replaces Switch)
- Week start: `[Mon|Sun]` segmented toggle (replaces Switch)
- Gear button → popover with:
  - 4 tile display toggles (Year/Dir, Runtime, Actors, Image)
  - Highlight alternate showtimes checkbox (desktop only)

**Key simplification:** The Fit-to-Width ↔ Tile Display coupling becomes natural. Fit to Width is visible in the toolbar; tile options are behind the gear. When Fit to Width is ON, the gear popover shows the tile toggles as disabled with a note. No more surprise confirmation dialog — the user can see both controls in context.

### Zone 3: Sticky Bottom Bar (fixed)

Navigation and primary actions. The calendar page currently has no bottom bar.

```
┌─────────────────────────────────────────────────────────────────────────┐
│  [← Movie List]                                    [★ Saved (12)]     │
└─────────────────────────────────────────────────────────────────────────┘
```

**Controls:**
- Back to list: navigates to `/s/{id}/list`
- Saved count: navigates to `/s/{id}/list/saved`, shows badge with count

**Styling:** Match `BottomToolbar.astro` — frosted glass, fixed bottom, safe-area padding.

**Note:** This mirrors the list page's `BottomToolbar.astro` but adapted for the calendar context (no "Find Showtimes" since you're already on showtimes).

### Full Page Layout (proposed)

```
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃  STICKY FILTER BAR                                     ┃
┃  [All|Eve+Wknd|Wknd]  [Off|★|Only]  [✓|?|✗|_]        ┃
┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┫
│                                                         │
│  METROGRAPH RETROSPECTIVE                               │
│  Dec 20 - Jan 30                                        │
│                                                         │
│  [≡ Timeline | ⊞ Grid]  [↔ Fit]  [Mon|Sun]  [⚙]       │
│ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ │
│  ┌──────┬──────┬──────┬──────┬──────┬──────┬──────┐     │
│  │ Mon  │ Tue  │ Wed  │ Thu  │ Fri  │ Sat  │ Sun  │     │
│  │      │      │      │      │      │      │      │     │
│  │      │      │      │      │      │      │      │     │
│  ├──────┼──────┼──────┼──────┼──────┼──────┼──────┤     │
│  │      │      │      │      │      │      │      │     │
│  │      │      │      │      │      │      │      │     │
│  └──────┴──────┴──────┴──────┴──────┴──────┴──────┘     │
│                                                         │
┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┫
┃  STICKY BOTTOM BAR                                      ┃
┃  [← Movie List]                        [★ Saved (12)]  ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
```

### Mobile Responsive Behavior

```
MOBILE (< 480px)                    DESKTOP (768px+)
┌───────────────────────┐           ┌─────────────────────────────────────┐
│ [All|Eve+Wknd|Wknd]  │           │ [All|Eve+Wknd|Wknd] [Off|★|Only]  │
│ [Off|★ Highlight|Only]│           │ [✓ Yes|? May|✗ No|_ Un]           │
│ [✓|?|✗|_]            │           └─────────────────────────────────────┘
└───────────────────────┘
```

Filter bar wraps into stacked rows on mobile. Each filter group stays on its own line. Labels can abbreviate further on narrow screens.

### Design Decisions

| Decision | Resolution |
|----------|-----------|
| Timeline/Grid | Segmented toggle in inline toolbar (not a switch) |
| Fit to Width / Tile Detail | Fit to Width visible in toolbar; tiles behind gear popover |
| Saved filter auto-hide | Yes, hide when no reactions (existing `hasAnyReactions()` check) |
| Week start | Inline toolbar as `[Mon\|Sun]` segmented toggle |
| Highlight alternate | Inside gear popover, desktop-only |
| Confirm dialog for disabled tiles | Remove — user can see Fit to Width and gear in same toolbar |

### URL Persistence

All existing URL params preserved. No changes to `calendarUrlState.ts` needed — the controls still fire the same events, just from different DOM locations.

## Implementation Plan

### Phase 1: Sticky Filter Bar
1. Create `CalendarFilterBar.astro` component
2. Move the 3 filter groups (Availability, Single showings, Saved) into it
3. Style as sticky top bar (match `ListToolbar.astro` pattern)
4. Wire up existing event handlers

### Phase 2: Inline View Toolbar
1. Create `CalendarViewToolbar.astro` component
2. Replace Timeline/Fit to Width/Week Start switches with compact toggles
3. Add gear button with popover for tile display + highlight alternate
4. Remove the confirmation dialog — coupling is now visible

### Phase 3: Bottom Bar
1. Extend or adapt `BottomToolbar.astro` for the calendar page
2. Add "Back to list" + "Saved count" navigation

### Phase 4: Cleanup
1. Remove old `.controls` block from `calendar.astro`
2. Remove unused control-group styles if no longer needed
3. Verify all URL persistence still works
4. Test mobile responsive behavior
