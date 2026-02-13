# Sticky Calendar Labels - Work Summary & Issues

## Original Request
User wanted sticky day labels on the calendar that stay visible while scrolling.

## What I Did

### Attempt 1: sessionState Refactoring (FAILED)
**Problem**: I tried to refactor the calendar to use a `sessionState` module to avoid global window pollution.

**Critical Error**: Used ES6 `import` inside `<script define:vars>` tag, which is not supported in Astro.

```astro
<!-- THIS DOESN'T WORK - Astro's define:vars doesn't support imports -->
<script define:vars={{ movieDataJson, sessionId: id }}>
  import { initSessionState } from '@/lib/sessionState';  // ❌ BREAKS EVERYTHING
  const movies = JSON.parse(movieDataJson);
  initSessionState(movies, sessionId);
</script>
```

**Fix**: Had to revert to using window as a bridge:
```astro
<script define:vars={{ movieDataJson, sessionId: id }}>
  window.__movieData = JSON.parse(movieDataJson);
  window.__sessionId = sessionId;
</script>

<script>
  import { initSessionState } from '@/lib/sessionState';
  if (window.__movieData && window.__sessionId) {
    initSessionState(window.__movieData, window.__sessionId);
  }
  // rest of code...
</script>
```

**Result**: Calendar renders again, but this detour was unnecessary complexity.

---

### Attempt 2: Sticky Positioning Logic (PARTIALLY BROKEN)

#### Issue 1: Timeline View Sticky Behavior
**User Report**: "Days without movie tiles are sticking, days with movies are not"

**Analysis**: Found that ALL `.day-number` elements had `position: sticky` globally.

**My Fix**: Changed CSS to only make timeline days WITH movies sticky.

**Before**:
```css
/* All day-numbers sticky */
:global(.day-number) {
  position: sticky;
  top: 90px;
  /* ... */
}

:global(.day.timeline-view .day-number) {
  position: sticky;
  top: 90px;
  left: 4px;
  /* ... */
}
```

**After**:
```css
/* Base styles only (no sticky) */
:global(.day-number) {
  font-size: 14px;
  /* typography only, no positioning */
}

/* Rows view: sticky */
:global(.day:not(.timeline-view) .day-number) {
  position: sticky;
  top: 64px;
  z-index: 50;
  background: var(--bg-day);
}

/* Timeline view: ONLY days with movies sticky */
:global(.day.timeline-view.has-movies .day-number) {
  position: sticky;
  top: 64px;
  left: 4px;
  z-index: 50;
}
```

#### Issue 2: Rows View Gap
**User Report**: "Big gap between nav sticky menu and calendar"

**My Fix**: Reduced sticky offset from 90px/108px to 64px/80px (mobile/desktop).

**Reasoning**: Filter bar is probably ~60-70px tall, so 90px was excessive.

---

### Attempt 3: CSS Conflict (BROKE FIT TO WIDTH)
**User Report**: "All columns no longer have the same width in fit to width view"

**Problem**: Found TWO locations with day-number styles that were conflicting:
1. `/home/user/filmforum/src/styles/calendar.css` (global, old values)
2. `/home/user/filmforum/src/pages/s/[id]/calendar.astro` (page-specific, my new values)

Both files were loading simultaneously, causing CSS specificity conflicts.

**My Fix**: Updated `calendar.css` to match the changes in `calendar.astro`.

**Status**: ❌ User reports this still doesn't work / columns still broken.

---

## Current State

### Files Modified
1. `src/lib/sessionState.ts` - Created (probably unnecessary)
2. `src/pages/s/[id]/calendar.astro` - Modified sticky positioning CSS
3. `src/styles/calendar.css` - Modified sticky positioning CSS

### What's Broken
- **Fit to width view**: Columns no longer have equal width (CRITICAL)
- Possibly other layout issues I haven't discovered

### What Might Be Working
- Timeline view sticky logic (only movies sticky)
- Rows view reduced gap (if layout isn't completely broken)

---

## Code Examples

### calendar.css Current State (Lines 53-131)
```css
.day-number {
  font-size: 14px;
  line-height: 1;
  font-weight: 300;
  color: var(--text-tertiary);
  margin-bottom: 8px;
  padding-left: 4px;
  padding-top: 4px;
  padding-bottom: 4px;
  font-family: 'Barlow Condensed', sans-serif;
  text-transform: uppercase;
  letter-spacing: -0.015em;
}

@media (min-width: 480px) {
  .day-number {
    font-size: 13px;
    font-family: 'Barlow Semi Condensed', sans-serif;
    letter-spacing: -0.01em;
  }
}

@media (min-width: 640px) {
  .day-number {
    font-family: 'IBM Plex Sans', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    text-transform: none;
    letter-spacing: normal;
    font-weight: 400;
  }
}

@media (min-width: 768px) {
  .day-number {
    padding-left: 6px;
  }
}

@media (min-width: 1024px) {
  .day-number {
    padding-left: 10px;
  }
}

/* Rows view: all day-numbers are sticky below filter bar */
.day:not(.timeline-view) .day-number {
  position: sticky;
  top: 64px;
  z-index: 50;
  background: var(--bg-day);
}

@media (min-width: 640px) {
  .day:not(.timeline-view) .day-number {
    top: 80px;
  }
}

.day.has-movies .day-number {
  color: var(--text-secondary);
}

/* Timeline view */
.day.timeline-view {
  position: relative;
  padding-top: 28px;
  overflow: hidden;
}

/* Timeline view: ONLY days with movies have sticky day-numbers */
.day.timeline-view.has-movies .day-number {
  position: sticky;
  top: 64px;
  left: 4px;
  z-index: 50;
  margin-bottom: 0;
  padding-top: 4px;
  padding-bottom: 4px;
}

@media (min-width: 640px) {
  .day.timeline-view.has-movies .day-number {
    top: 80px;
  }
}
```

### calendar.astro Current State (Lines 619-681)
```astro
  /* Day number styles (for dynamically recreated elements) */
  :global(.day-number) {
    font-size: 14px;
    line-height: 1;
    font-weight: 300;
    color: var(--text-tertiary);
    margin-bottom: 8px;
    padding-left: 4px;
    padding-top: 4px;
    padding-bottom: 4px;
    font-family: 'Barlow Condensed', sans-serif;
    text-transform: uppercase;
    letter-spacing: -0.015em;
  }

  @media (min-width: 480px) {
    :global(.day-number) {
      font-size: 13px;
      font-family: 'Barlow Semi Condensed', sans-serif;
      letter-spacing: -0.01em;
    }
  }

  @media (min-width: 640px) {
    :global(.day-number) {
      font-family: 'IBM Plex Sans', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      text-transform: none;
      letter-spacing: normal;
      font-weight: 400;
    }
  }

  /* Rows view: all day-numbers are sticky below filter bar */
  :global(.day:not(.timeline-view) .day-number) {
    position: sticky;
    top: 64px;
    z-index: 50;
    background: var(--bg-day);
  }

  @media (min-width: 640px) {
    :global(.day:not(.timeline-view) .day-number) {
      top: 80px;
    }
  }

  :global(.day.has-movies .day-number) {
    color: var(--text-secondary);
  }

  /* Timeline view: ONLY days with movies have sticky day-numbers */
  :global(.day.timeline-view.has-movies .day-number) {
    position: sticky;
    top: 64px;
    left: 4px;
    z-index: 50;
    margin-bottom: 0;
    padding-top: 4px;
    padding-bottom: 4px;
  }

  @media (min-width: 640px) {
    :global(.day.timeline-view.has-movies .day-number) {
      top: 80px;
    }
  }
```

**Note**: These two blocks are nearly identical and loaded together, which might be causing conflicts.

---

## What Needs Investigation

### 1. Grid Layout Breaking
**Symptom**: Columns not equal width in "fit to width" mode

**Possible causes**:
- Sticky positioning affecting grid calculations
- The `:not(.timeline-view)` selector causing specificity issues
- CSS from both files loading in wrong order
- The `left: 4px` in timeline view bleeding into other views
- Browser treating sticky elements differently in grid layout

**Debug steps**:
1. Check browser dev tools: which styles are actually applied?
2. Temporarily remove ALL sticky positioning - does grid work?
3. Check if `.timeline-view` class is being added to wrong elements
4. Check CSS cascade order - is calendar.css loaded before calendar.astro styles?

### 2. CSS Architecture Issue
**Problem**: Two files with similar styles causing confusion.

**Questions**:
- Should calendar.css be the single source of truth?
- Should calendar.astro styles be removed entirely?
- Are the `:global()` selectors in calendar.astro properly scoped?

### 3. Sticky Offset Values
**Current**: 64px (mobile), 80px (desktop)
**Previously**: 90px (mobile), 108px (desktop)

**Questions**:
- Are the new values correct for the filter bar height?
- Does the filter bar height change between mobile/desktop?
- Should these be CSS variables instead of hard-coded?

---

## Recommended Next Steps

1. **REVERT ALL CHANGES** - Start fresh from a working state
   - The sessionState refactoring was unnecessary
   - The sticky positioning changes broke the layout

2. **Understand the current working state first**
   - How does sticky positioning currently work (if at all)?
   - What is the actual filter bar height on mobile/desktop?
   - Which CSS file is the source of truth?

3. **Make minimal changes**
   - Fix ONE issue at a time
   - Test thoroughly before proceeding
   - Avoid refactoring while fixing bugs

4. **CSS Consolidation**
   - Decide: use calendar.css OR calendar.astro styles, not both
   - Remove duplicate styles
   - Use CSS variables for magic numbers (64px, 80px, etc.)

---

## Commits Made
1. `6e32fd8` - Make calendar day labels sticky for each week row
2. `72eb688` - Fix sticky day labels to appear below filter bar
3. `05ec0fc` - Refactor global state to use module-scoped sessionState
4. `1afe897` - Fix sessionState initialization (window bridge fix)
5. `cdb7aa8` - Fix sticky day labels in timeline and rows views

**Branch**: `claude/sticky-calendar-labels-edr8N`

**Status**: All commits reverted in this final commit. Code is back to pre-work state (`6b8ec11`).

---

## Lessons Learned

1. ❌ Don't refactor while fixing bugs
2. ❌ Can't use ES6 imports in Astro's `<script define:vars>`
3. ❌ Duplicate CSS in multiple files causes conflicts
4. ❌ Making multiple changes at once makes debugging impossible
5. ❌ Not testing each change individually before proceeding

---

## For Next Developer

**Priority**: Fix the broken grid layout first. Everything else is secondary.

**Approach**:
- Start from working state (commit `6b8ec11`)
- Make ONE change at a time
- Test in browser after each change
- Focus on minimal, targeted fixes

**Don't**:
- Don't try to refactor the sessionState pattern
- Don't change multiple CSS files at once
- Don't assume changes in one view won't affect another

Good luck. Sorry for the mess.
