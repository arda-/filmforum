# Progressive Blur: Findings and Recommendations

An investigation into CSS-based progressive blur effects for overlaying readable text on images, conducted through two interactive demo pages (now archived in `docs/demos/blur/`).

## Summary

We built and tested two approaches to blurring the region behind text overlays on poster cards:

1. **Simple blur** — a single `backdrop-filter: blur()` layer with a `mask-image` gradient fade
2. **Progressive blur** — 7 stacked layers with doubling blur intensities (Apple-style)

After extensive testing across 8 aspect ratios and multiple configurations, **the simple blur with text-relative sizing is the recommended approach** for this project. It produces good-enough results with far less DOM complexity and better performance.

## Technique 1: Simple Blur Fade

One element. One blur value. A mask gradient controls where it's visible.

### CSS

```css
.blur-layer {
  position: absolute;
  inset: 0;
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  mask-image: linear-gradient(to top, black 15%, transparent 50%);
  -webkit-mask-image: linear-gradient(to top, black 15%, transparent 50%);
  pointer-events: none;
}
```

### HTML

```html
<div class="card">
  <img src="poster.jpg" class="background-image" />
  <div class="scrim-layer"></div>
  <div class="blur-layer"></div>
  <div class="text-overlay">
    <h3>Title</h3>
    <p>Subtitle</p>
  </div>
</div>
```

### Trade-offs

- **Pro**: Minimal DOM (1 element), good performance, simple to maintain
- **Con**: Blur intensity is constant — you're fading its opacity, not the blur amount itself
- **In practice**: The visual difference from progressive blur is subtle at the sizes we use

## Technique 2: Progressive Blur (7-Layer)

Seven layers, each with a doubling blur value (1px → 2px → 4px → 8px → 16px → 32px → 64px). Each layer is masked to a different vertical band with ~7% overlap, creating a true gradient from sharp to heavily blurred.

### CSS

```css
.progressive-blur {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.blur-layer {
  position: absolute;
  inset: 0;
}

/* Layer 1 (lightest blur, top of blur zone) */
.layer-1 {
  backdrop-filter: blur(1px);
  -webkit-backdrop-filter: blur(1px);
  mask-image: linear-gradient(to top,
    transparent 65%, black 80%, black 100%);
  -webkit-mask-image: linear-gradient(to top,
    transparent 65%, black 80%, black 100%);
}

/* Layer 2 */
.layer-2 {
  backdrop-filter: blur(2px);
  -webkit-backdrop-filter: blur(2px);
  mask-image: linear-gradient(to top,
    transparent 50%, black 65%, black 85%, transparent 100%);
  -webkit-mask-image: linear-gradient(to top,
    transparent 50%, black 65%, black 85%, transparent 100%);
}

/* Layer 3 */
.layer-3 {
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  mask-image: linear-gradient(to top,
    transparent 35%, black 50%, black 70%, transparent 90%);
  -webkit-mask-image: linear-gradient(to top,
    transparent 35%, black 50%, black 70%, transparent 90%);
}

/* Layer 4 */
.layer-4 {
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  mask-image: linear-gradient(to top,
    transparent 20%, black 35%, black 55%, transparent 75%);
  -webkit-mask-image: linear-gradient(to top,
    transparent 20%, black 35%, black 55%, transparent 75%);
}

/* Layer 5 */
.layer-5 {
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  mask-image: linear-gradient(to top,
    transparent 5%, black 20%, black 40%, transparent 60%);
  -webkit-mask-image: linear-gradient(to top,
    transparent 5%, black 20%, black 40%, transparent 60%);
}

/* Layer 6 */
.layer-6 {
  backdrop-filter: blur(32px);
  -webkit-backdrop-filter: blur(32px);
  mask-image: linear-gradient(to top,
    transparent 0%, black 5%, black 25%, transparent 45%);
  -webkit-mask-image: linear-gradient(to top,
    transparent 0%, black 5%, black 25%, transparent 45%);
}

/* Layer 7 (heaviest blur, bottom of blur zone) */
.layer-7 {
  backdrop-filter: blur(64px);
  -webkit-backdrop-filter: blur(64px);
  mask-image: linear-gradient(to top,
    black 0%, black 10%, transparent 30%);
  -webkit-mask-image: linear-gradient(to top,
    black 0%, black 10%, transparent 30%);
}
```

### HTML

```html
<div class="card">
  <img src="poster.jpg" class="background-image" />
  <div class="scrim-layer"></div>
  <div class="progressive-blur">
    <div class="blur-layer layer-1"></div>
    <div class="blur-layer layer-2"></div>
    <div class="blur-layer layer-3"></div>
    <div class="blur-layer layer-4"></div>
    <div class="blur-layer layer-5"></div>
    <div class="blur-layer layer-6"></div>
    <div class="blur-layer layer-7"></div>
  </div>
  <div class="text-overlay">
    <h3>Title</h3>
    <p>Subtitle</p>
  </div>
</div>
```

### Trade-offs

- **Pro**: True blur intensity gradient — visually the most natural result
- **Con**: 7 DOM elements per card, GPU-intensive, complex to maintain
- **Con**: Multiplied across many cards on a page, the performance cost is significant

### Why Doubling Blur Values?

Blur perception is logarithmic. The sequence 1 → 2 → 4 → 8 → 16 → 32 → 64 produces even perceptual steps. Linear increments (1 → 10 → 20 → 30) would create unnatural acceleration.

### Layer Overlap

Each layer needs ~7% overlap with its neighbors to prevent visible banding:

```
         TOP (clear image)
         ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
Layer 1: ░░░░░░░░░░░░░░░░░░░░░░████████  (1px, top of zone)
Layer 2: ░░░░░░░░░░░░░░░░████████░░░░░░  (2px)
Layer 3: ░░░░░░░░░░████████░░░░░░░░░░░░  (4px)
...
Layer 7: ████████░░░░░░░░░░░░░░░░░░░░░░  (64px, bottom of zone)
         BOTTOM (text overlay here)
```

## Scrim Layer (Darkening Overlay)

Both techniques benefit from a scrim — a semi-transparent darkening layer using `mix-blend-mode: darken`. The scrim selectively darkens light areas without over-darkening already dark regions.

### Stacking order matters

The scrim must sit **between the image and the blur** for best results:

1. Background image (crisp original)
2. **Scrim** (`mix-blend-mode: darken`) — darkens the crisp image
3. **Blur layer(s)** (`backdrop-filter`) — softens the darkened result
4. Text content

This order looks more natural because the blur softens the scrim edges. The reverse (blur then scrim) applies darkening to already-fuzzy pixels, producing a muddy look.

### CSS

```css
.scrim-layer {
  position: absolute;
  inset: 0;
  pointer-events: none;
  mix-blend-mode: darken;
  background: linear-gradient(
    to top,
    rgba(10, 10, 10, 0.6) 0%,
    transparent 50%
  );
}
```

## Text-Relative Sizing (Key Finding)

Fixed percentage-based blur boundaries break across different aspect ratios. A blur zone set at "bottom 15% to 50%" looks fine on a 2:3 poster but covers way too much of a 2:1 ultra-wide card.

The solution: **calculate blur boundaries relative to the text overlay's actual height**.

### How it works

Instead of fixed percentages, measure the text overlay's pixel height and express blur boundaries as multipliers of that height:

- `fullBlurMultiplier: 0.35` → full blur extends to 35% of text height from the bottom
- `blurEndMultiplier: 0.95` → blur fades to nothing at 95% of text height

```javascript
const cardHeight = card.offsetHeight;
const textHeight = textOverlay.offsetHeight;

const fullBlurPx = textHeight * fullBlurMultiplier;
const blurEndPx = textHeight * blurEndMultiplier;

const fullBlurPct = (fullBlurPx / cardHeight) * 100;
const blurEndPct = Math.min((blurEndPx / cardHeight) * 100, 100);

blurLayer.style.maskImage = `linear-gradient(
  to top,
  black 0%,
  black ${fullBlurPct}%,
  transparent ${blurEndPct}%
)`;
```

This approach means the blur zone automatically adapts when:
- Text content changes (longer descriptions push the blur higher)
- Card aspect ratio changes
- Viewport/container resizes

## Recommended Production Settings

After testing across all 8 aspect ratios with various text amounts:

| Setting | Value |
|---------|-------|
| Technique | Simple blur (single layer) |
| Sizing mode | Text-relative |
| Blur radius | `1.5rem` (24px) |
| Full blur multiplier | `0.35×` (35% of text height) |
| Blur end multiplier | `0.95×` (95% of text height) |
| Scrim | Enabled, `rgba(10, 10, 10, 0.6)` with `mix-blend-mode: darken` |
| Text shadow | `0 1px 3px rgba(0, 0, 0, 0.5)` on headings |

These settings produce good readability across aspect ratios from 2:1 (ultra-wide) to 1:2 (tall banner) without the performance cost of 7-layer progressive blur.

## Lessons Learned

### 1. Blur direction must match text position

If text is at the bottom, the gradient must go `to top` (opaque at bottom, transparent toward top). Getting this backwards is easy and produces invisible blur.

### 2. Label controls by what they do, not how they work

- Bad: "Mask start: 50%" — too technical, unclear reference
- Good: "100% blur until: 15%" — clear that the bottom 15% is fully blurred
- Good: "Blur ends at: 50%" — clear that blur reaches nothing at the 50% mark

### 3. Store values directly, don't invert

If the UI says "15%", store `15`, not `85` (100 - 15). Direct mapping between display and storage reduces bugs.

### 4. CSS gradient percentages measure from the gradient origin

`linear-gradient(to top, ...)` means 0% is at the **bottom** and 100% is at the **top**. This is a persistent source of confusion when building directional controls.

### 5. Test all 4 directions if you support them

Math and positioning break in subtle ways when blur direction changes. The demos support bottom/top/left/right and each required careful testing.

### 6. Test across aspect ratios

We tested 8 ratios: 2:1, 16:9, 4:3, 1:1, 3:4, 2:3, 9:16, 1:2. Wide ratios stress-test blur zones because there's less vertical space — settings that look good on 2:3 may cover too much on 16:9.

### 7. URL parameter persistence is invaluable for demos

Every control in both demos persisted to URL params, enabling shareable configurations, bookmarkable presets, and reproducible testing. Pattern:

```javascript
const params = new URLSearchParams(window.location.search);
let blurAmount = parseInt(params.get('blur') || '16');

function updateURL() {
  const newParams = new URLSearchParams(window.location.search);
  if (blurAmount !== 16) newParams.set('blur', String(blurAmount));
  else newParams.delete('blur');
  // Only write non-default values for cleaner URLs
  const url = newParams.toString()
    ? `${window.location.pathname}?${newParams}`
    : window.location.pathname;
  history.replaceState({}, '', url);
}
```

### 8. Debug visualizations accelerate iteration

Colored overlay lines showing gradient boundaries (where blur starts, where it ends) saved significant time when tuning values. Worth building into any visual-effect demo.

## Safari Compatibility

Always include `-webkit-` prefixes for both `backdrop-filter` and `mask-image`. Safari actually has the best `backdrop-filter` performance of any browser.

## 5-Layer Performance Variant

If progressive blur is needed, a 5-layer variant (1px, 4px, 16px, 32px, 64px) produces nearly identical visual results with 30% fewer DOM elements:

```css
.layer-1 { backdrop-filter: blur(1px);  mask-image: linear-gradient(to bottom, transparent 0%, black 10%, black 20%, transparent 30%); }
.layer-2 { backdrop-filter: blur(4px);  mask-image: linear-gradient(to bottom, transparent 20%, black 30%, black 45%, transparent 55%); }
.layer-3 { backdrop-filter: blur(16px); mask-image: linear-gradient(to bottom, transparent 45%, black 55%, black 70%, transparent 80%); }
.layer-4 { backdrop-filter: blur(32px); mask-image: linear-gradient(to bottom, transparent 70%, black 80%, black 90%, transparent 100%); }
.layer-5 { backdrop-filter: blur(64px); mask-image: linear-gradient(to bottom, transparent 90%, black 100%); }
```

## Archived Demo Code

The original interactive demo pages are preserved in `docs/demos/blur/`:
- `blur-simple.astro` — single-layer technique with percentage and text-relative controls
- `blur-progressive.astro` — 7-layer technique with per-layer toggles and side-by-side comparison

These are standalone Astro page files that were previously served at `/demo/blur-simple` and `/demo/blur-progressive`.

## References

- [Progressive blur in CSS](https://kennethnym.com/blog/progressive-blur-in-css/) — original multi-layer technique
- [Josh Comeau: Backdrop-filter](https://www.joshwcomeau.com/css/backdrop-filter/) — deep dive on mask-image behavior
- [Apple HIG: Materials](https://developer.apple.com/design/human-interface-guidelines/materials) — design inspiration
