# Animated Timeline ↔ Row View Transition

## Problem

When toggling between Timeline and Row view, the entire day cell content is destroyed (`innerHTML = ''`) and rebuilt from scratch. CSS transitions can't animate this because there's no persistent element to interpolate — the browser sees a completely new layout, not a changed property.

**Current flow** (calendar.astro `renderAllDays` → per-day loop):
1. `dayCell.innerHTML = ''` — wipes everything
2. Recreate day-number div
3. If timeline: set `dayCell.style.height = ${computed}px`, add `timeline-view` class, create absolutely-positioned movie tiles
4. If row: clear `dayCell.style.height`, remove `timeline-view` class, create stacked movie tiles

## Goal

Smooth height animation on day cells when switching views. Movie tiles crossfade or morph between layouts.

## Approach: FLIP + Retained DOM

### Phase 1: Animate day cell height (medium effort)

The day cell height is the most visually jarring change. Animate it without touching movie tile DOM:

1. **Before render**: Snapshot all `.day` cell heights via `getBoundingClientRect()`
2. **Render normally** (current `innerHTML = ''` approach — content still rebuilds)
3. **After render**: Read new heights, apply old height as inline style, force reflow, then set new height with `transition: height 0.2s cubic-bezier(0.25, 0.1, 0.25, 1)`
4. **On `transitionend`**: Remove inline height (let CSS own it again)

```js
// Pseudocode
function animatedRenderAllDays() {
  // FIRST: capture current heights
  const cells = document.querySelectorAll('.day[data-date]');
  const firstRects = new Map();
  cells.forEach(cell => firstRects.set(cell, cell.getBoundingClientRect().height));

  // Render (destructive — rebuilds content)
  renderAllDays();

  // LAST: read new heights, INVERT, PLAY
  cells.forEach(cell => {
    const oldH = firstRects.get(cell);
    const newH = cell.getBoundingClientRect().height;
    if (oldH === newH) return;

    cell.style.transition = 'none';
    cell.style.height = `${oldH}px`;
    cell.style.overflow = 'hidden';

    requestAnimationFrame(() => {
      cell.style.transition = 'height 0.2s cubic-bezier(0.25, 0.1, 0.25, 1)';
      cell.style.height = `${newH}px`;
    });
  });
}
```

**Cleanup**: Listen for `transitionend` on each cell, then clear inline `height` and `transition` styles so CSS rules take over again.

**Reduced motion**: Check `matchMedia('(prefers-reduced-motion: reduce)')` — if true, skip animation entirely (already handled by global CSS `transition-duration: 0.01ms !important`).

### Phase 2: Crossfade movie tiles (higher effort, optional)

Instead of hard-swapping tile content, fade old out and new in:

1. Before render: snapshot old content as a temporary clone, position it absolutely
2. Render new content with `opacity: 0`
3. Fade old clone out, new content in (150ms crossfade)
4. Remove clone on completion

This requires **not** using `innerHTML = ''` — instead, build new content off-DOM, swap via `replaceChildren()` after positioning the clone.

### Phase 3: Full retained DOM (large effort, probably not worth it)

Keep movie tile elements alive across view switches. Reposition them with FLIP instead of destroying/recreating. This would require:
- Keying tiles by movie ID + showtime
- Diffing old vs new tile lists
- Animating position changes (top/left/width/height)
- Handling tiles that appear/disappear (enter/exit animations)

This is essentially building a layout animation engine. Probably overkill unless the calendar becomes the primary interaction surface.

## Files to Modify

- `src/pages/s/[id]/calendar.astro` — wrap `renderAllDays()` call in timeline toggle handler with FLIP logic
- `src/styles/calendar.css` — ensure `.day` has `overflow: hidden` during animation (prevent content flash)

## Scope Recommendation

**Phase 1 alone** gives 80% of the visual improvement for 20% of the effort. The height animation is the main thing users notice. Movie tiles rebuilding is fast enough that it's imperceptible during the height transition.

Phase 2 is a nice-to-have. Phase 3 is not recommended.

## Verification

- Toggle Timeline ↔ Row: day cells animate height smoothly
- Toggle with `prefers-reduced-motion`: instant swap, no animation
- Performance: no jank on calendar with 30+ day cells (budget: < 16ms for FLIP setup)
- Filter changes (time/saved) still render instantly (no animation — those are content updates, not view switches)
