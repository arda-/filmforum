# Card Animation Lessons: Apple Card FLIP Expansion

A collection of gotchas and lessons learned while building the Apple Card FLIP expansion animation. This captures technical decisions, unexpected behaviors, and solutions discovered during implementation.

## 1. translate + clip-path alone doesn't work for size-changing FLIPs

When you move an element to an overlay and change its CSS class (e.g., adding `.expanded` which sets `position: fixed; width: 520px`), the element's layout immediately reflows to expanded dimensions. `clip-path` only masks the visual output — it doesn't change the internal layout.

So the content (image, text) is instantly at its full expanded size, just cropped. The image crop, text position, everything is wrong from frame 1.

**Solution:** Use `scale()` for the FLIP. Images are bitmaps — scaling them causes no visual "click" or re-rasterization artifact. The "click" was only ever a problem for text.

## 2. Counter-scale text to prevent re-rasterization "click"

When `scale()` is applied to a container, text inside gets bitmap-scaled and re-rasterizes when the scale changes — causing a visible "snap" or "click." Since the text now lives inside the same DOM element (not a separate dialog), you **can** counter-scale it:

Apply `scale(1/parentScale)` to text containers. This keeps text at native resolution throughout the animation, preventing the re-rasterization snap.

**Example:**
```css
.card-expanded {
  transform: scale(0.8);
}

.card-expanded .text-content {
  transform: scale(1 / 0.8); /* = 1.25 */
}
```

Text stays at 1x resolution while the parent scales down.

## 3. Don't measure FLIP targets while page is scaled

If the page has `transform: scale(0.94)` applied (the iOS-style page scale-down effect), `getBoundingClientRect()` on elements inside the scaled page returns the *scaled-down* positions. But the FLIP animation runs on an element in a fixed overlay (unaffected by page scale), and by the time the animation ends, the page is back at `scale(1)`. So the target is ~6% off.

**Solution:** Save the source rect during `open()` (measured before any page scaling) and reuse it in `close()` as the FLIP target. Don't re-measure on close.

```javascript
// In open():
const sourceRect = sourceCard.getBoundingClientRect(); // Measured now
// ... animate ...

// In close():
// Reuse sourceRect, don't re-measure
```

## 4. clip-path is great for body content reveal

While clip-path alone can't handle the size change, it works perfectly alongside `scale()` to progressively reveal body content below the hero.

In element-local coords (before transforms), clip from the bottom to hide the body, then animate the clip to 0 to reveal it. The scale handles the size transition, the clip handles the content reveal.

**Result:** Hero smoothly scales while body fades in underneath.

## 5. WAAPI fill:'forwards' + cancel() for clean commits

Use `fill: 'forwards'` during the animation to hold the end state, then in `.finished.then()`, commit the final state to inline styles and call `.cancel()` to remove the animation.

```javascript
const anim = element.animate([...], {
  fill: 'forwards',
  duration: 400,
});

anim.finished.then(() => {
  // Commit the final transform to inline styles
  element.style.transform = 'scale(1) translate(0, 0)';
  anim.cancel(); // Clean up
});
```

This prevents any flicker between the animation ending and styles being applied.

## 6. Placeholder pattern for preventing grid reflow

When moving a card from the grid to the overlay, insert a placeholder div with explicit width/height matching the source card. This prevents the grid from collapsing the empty slot and causing layout shift.

**On open:**
```javascript
const placeholder = document.createElement('div');
placeholder.style.width = sourceCard.offsetWidth + 'px';
placeholder.style.height = sourceCard.offsetHeight + 'px';
sourceCard.parentElement.replaceChild(placeholder, sourceCard);
```

**On close:**
```javascript
sourceCard.parentElement.insertBefore(sourceCard, placeholder);
placeholder.remove();
```

## 7. transform-origin: top left simplifies FLIP math

With `transform-origin: top left`, `scale(S)` scales from the element's top-left corner. The FLIP inverse becomes straightforward:

```javascript
const scale = sourceWidth / expandedWidth;
const dx = sourceLeft - expandedLeft;
const dy = sourceTop - expandedTop;
element.style.transform = `translate(${dx}px, ${dy}px) scale(${scale})`;
```

The element's top-left visually lands at the source position, and its visual width = `expandedWidth * scale = sourceWidth`. No complex offset math needed.

## 8. border-radius: 0 during FLIP, let clip-path handle rounding

Set the card's `border-radius` to 0 during the FLIP animation and use `clip-path: inset(... round 16px)` for all visual rounding. This avoids double-rounding artifacts where both `border-radius` and `clip-path` try to round the same corners.

**During FLIP:**
```css
.card-animating {
  border-radius: 0;
  clip-path: inset(0 round 16px);
}

.card-expanded {
  border-radius: 0;
  clip-path: inset(0 round 16px);
}
```

**At rest (not animating):**
```css
.card {
  border-radius: 16px;
  clip-path: none;
}
```

## 9. mix-blend-mode: darken causes compositing issues during transforms

On iOS Safari, combining `transform` + `clip-path` + `mix-blend-mode` on nested elements causes compositing glitches.

**Solution:** Switch to `mix-blend-mode: normal` on the expanded state's scrim, or remove the blend mode entirely during animation. The dark backdrop behind the expanded card provides sufficient visual context without needing blend mode.

## 10. Background color bleeds through anti-aliased rounded corners

If the card element has a light `background` (like `var(--bg-body)`), it shows through at the sub-pixel edges of rounded corners where child content doesn't fully cover. This is especially noticeable against a dark overlay.

**Fix:** Set `background: #000` on the expanded card so the fringe blends with the dark backdrop:

```css
.card-expanded {
  background: #000;
  clip-path: inset(0 round 16px);
}
```

The black background makes any anti-aliased fringe invisible against the dark modal backdrop.

---

## Summary

The biggest insight: **FLIP with scale works where translate + clip-path alone fails.** The scale handles geometry, clip-path handles content reveal, counter-scale handles text quality, and `transform-origin: top left` makes the math simple.

Test on actual iOS Safari early — compositing behavior differs significantly from desktop browsers.
