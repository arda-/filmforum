# Apple Card Shadow/Border-Radius Popping Fix

**Status**: In Progress
**Branch**: `claude/apple-card-expansion-P8LyD`

## Problem

The shadow and border-radius "pop" visually at the start and end of FLIP animations in demos 2A, 2B, 2C, 2D.

## Root Cause

Mismatch between CSS properties and Web Animations API keyframes:

- **Collapsed card CSS**: `border-radius: 16px`, small shadow
- **Expanded card CSS**: `border-radius: 24px`, larger shadow
- **Animation keyframes**: Were using `round 16px` and not animating shadow

When `.expanded` class is added, the CSS border-radius and shadow change **instantly**, but the animation wasn't transitioning them smoothly.

## Solution Attempt

**2B was initially thought to work**, but it has multiple issues:

```javascript
// Open animation
{
  transform: `translate(${dx}px, ${dy}px) scale(${scale})`,
  clipPath: `inset(0px 0px ${bodyClip}px 0px round 16px)`,
  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.25), 0 8px 24px rgba(0, 0, 0, 0.15)'
},
{
  transform: 'translate(0px, 0px) scale(1)',
  clipPath: 'inset(0px 0px 0px 0px round 24px)',  // <- animates to 24px
  boxShadow: '0 25px 80px rgba(0, 0, 0, 0.5)'      // <- animates to large shadow
}
```

## Issues by Demo

### 2A (Desktop+Body)
- Shadow/border-radius popping during FLIP animation

### 2B (Floating Bottom)
- ❌ Image clip-path radii don't match up (border-radius mismatch again)
- ❌ Alignment issue: bottom-aligned always (good for mobile, **wrong for 640+** - should be **fully centered** at larger viewports)
- ❌ Background shadow disappears during transition (present when closed, present when open, but missing during animation)
- ❌ Not scroll-aware (unlike 2C)

### 2C (Scroll-Aware)
- ❌ Image clip-path radii don't match up (same as 2B)
- ❌ Alignment issue at 640+ (same as 2B)
- ❌ Background shadow disappears during transition (same as 2B)
- ✅ **Has scroll-aware swipe detection** (only allows dismiss when scrolled to top - this is the ONE difference from 2B)

### 2D (Attempted Fix)
- ⚠️ **Introduces more regressions** - worse than others
- Attempted to fix shadow but made things worse

## Current Status

**2B and 2C have the same core issues.** 2C = 2B + scroll-aware feature. Neither is really "better" - they both need the same fixes.

### Completed
- ✅ Created 2D demo (but it's worse, not better)
- ❌ Attempted various shadow fixes that didn't work

### Still TODO
- [ ] Fix shadow/border-radius popping in 2C specifically (best demo to preserve)
- [ ] Fix 2B alignment issue (should center at 640+, not stay bottom-aligned)
- [ ] Fix 2B shadow disappearing during transition
- [ ] Fix 2B clip-path radii matching
- [ ] Make 2B scroll-aware like 2C
- [ ] OR: Add 2B's centering behavior to 2C

## Next Steps (Priority Order)

### Core issues to fix (apply to either 2B or 2C):
1. **Shadow disappearing during transition**
   - Figure out why shadow is visible when closed/open but not during animation
   - Possibly need to animate boxShadow property in keyframes

2. **Clip-path radii mismatch**
   - Image clip-path doesn't match card border-radius
   - Need to animate clipPath from `round 16px` to `round 24px`

3. **Alignment at 640+**
   - Currently bottom-aligned at all sizes
   - Should be **fully centered** at 640+ viewport widths
   - Keep bottom-aligned on mobile

4. **Border-radius popping**
   - Related to clip-path issue above
   - Need smooth transition in animation keyframes

### Then decide:
- Fix 2B and add scroll-aware behavior from 2C?
- Or fix 2C (which already has scroll-aware)?
- Or start fresh as 2E?

## Files Modified
- `src/pages/demo/apple-card/2d.astro` - New demo with fix (partial)
- `src/components/AppleCardDemoNav.astro` - Added 2D to dropdown

## Key Insights

1. **Shadow scaling**: Shadow and border-radius SHOULD scale with the transform - that's correct and desired. The issue is that we weren't **animating** these properties smoothly in the keyframes, causing instant visual jumps.

2. **The real problem**: CSS properties on `.expanded` class change instantly when class is added, but animation keyframes weren't transitioning them. Need to animate boxShadow and clipPath border-radius in keyframes.

3. **Previous attempts failed**: Multiple attempts to fix this (including 2D) made things worse or introduced new regressions.

4. **2B and 2C both need work**: They have the same core visual issues. 2C just adds scroll-aware behavior on top.

## Questions to Answer Next Time

- Why does the shadow disappear during 2B's transition specifically?
- What's the cleanest way to animate shadow without popping?
- Should we use `box-shadow` or `filter: drop-shadow()` in animations?
- Can we keep 2C's scroll-aware behavior while fixing the visual issues?

---

## PR Review Summary

**PR**: [#12](https://github.com/arda-/filmforum/pull/12) | **Status**: NEEDS CHANGES

### Critical Issues to Fix
- **⚠️ Pointer capture leak** in 2C and 2D (`pointerup` and `pointercancel` handlers)
  - `isPointerCaptured` set to `false` before checking it to call `releasePointerCapture`
  - Fix: Call `releasePointerCapture` before resetting the flag
- **⚠️ Test artifact committed**: `test-results/.last-run.json` should be removed and gitignored

### Other Findings
- **2000ms animation duration** - intentionally slow for debugging/observation (OK for demos)
- **Massive code duplication** - 8 demos share ~80% code (~5,500 lines total)
  - Acceptable for demo/experiment pages
  - Consider extracting if any variant goes to production
- **Movie data duplicated 9x** - could extract to shared data file
- **llm-best-practices folder** - 3,000+ line general-purpose docs, consider if belongs in this repo

### Positives
- ✅ Excellent FLIP animation engineering (proper timing, safety timeouts, cleanup)
- ✅ Strong accessibility (tabindex, ARIA labels, keyboard support, reduced motion)
- ✅ Progressive enhancement across variants
- ✅ Clean build (25 pages, 962ms, zero errors)

**Full review**: https://github.com/arda-/filmforum/pull/12#issuecomment-3867729989
