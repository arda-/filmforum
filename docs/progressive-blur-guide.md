# Progressive Blur in CSS

A guide to implementing Apple-style progressive blur effects using stacked `backdrop-filter` layers.

## The Problem

When overlaying text on images, you need to ensure readability. Common approaches:

1. **Solid overlay** - Works but obscures the image
2. **Gradient overlay** - Better, but sharp transition or washed-out image
3. **Single blur layer** - Uniform blur, can look artificial
4. **Progressive blur** - Blur intensity increases gradually, most natural look

## Two Techniques

### 1. Simple Blur Fade (Single Layer)

Uses one `backdrop-filter: blur()` with a `mask-image` gradient to fade it out.

```css
.blur-layer {
  position: absolute;
  inset: 0;
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);

  /* Blur at BOTTOM where text overlay lives */
  /* Gradient goes from bottom (opaque/blurred) to top (transparent/clear) */
  mask-image: linear-gradient(
    to top,
    black 15%,        /* full blur at bottom 15% */
    transparent 50%   /* no blur above 50% */
  );
  -webkit-mask-image: linear-gradient(
    to top,
    black 15%,
    transparent 50%
  );
}
```

**Pros:** Simple, single DOM element, good performance
**Cons:** Blur intensity is constant — you're just fading its opacity

### 2. Progressive Blur (Multi-Layer)

Stacks multiple blur layers with increasing intensity, each masked to a different region.

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

/* 7 layers with doubling blur values */
/* Blur increases toward BOTTOM where text overlay lives */
/* Layer 1 (lightest) at top of blur zone, Layer 7 (heaviest) at bottom */

.layer-1 {
  backdrop-filter: blur(1px);
  -webkit-backdrop-filter: blur(1px);
  mask-image: linear-gradient(to top,
    transparent 79%, black 86%, black 93%, transparent 100%);
  -webkit-mask-image: linear-gradient(to top,
    transparent 79%, black 86%, black 93%, transparent 100%);
}

.layer-2 {
  backdrop-filter: blur(2px);
  -webkit-backdrop-filter: blur(2px);
  mask-image: linear-gradient(to top,
    transparent 65%, black 72%, black 79%, transparent 86%);
  -webkit-mask-image: linear-gradient(to top,
    transparent 65%, black 72%, black 79%, transparent 86%);
}

.layer-3 {
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  mask-image: linear-gradient(to top,
    transparent 51%, black 58%, black 65%, transparent 72%);
  -webkit-mask-image: linear-gradient(to top,
    transparent 51%, black 58%, black 65%, transparent 72%);
}

.layer-4 {
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  mask-image: linear-gradient(to top,
    transparent 36%, black 43%, black 51%, transparent 58%);
  -webkit-mask-image: linear-gradient(to top,
    transparent 36%, black 43%, black 51%, transparent 58%);
}

.layer-5 {
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  mask-image: linear-gradient(to top,
    transparent 22%, black 29%, black 36%, transparent 43%);
  -webkit-mask-image: linear-gradient(to top,
    transparent 22%, black 29%, black 36%, transparent 43%);
}

.layer-6 {
  backdrop-filter: blur(32px);
  -webkit-backdrop-filter: blur(32px);
  mask-image: linear-gradient(to top,
    transparent 8%, black 15%, black 22%, transparent 29%);
  -webkit-mask-image: linear-gradient(to top,
    transparent 8%, black 15%, black 22%, transparent 29%);
}

.layer-7 {
  backdrop-filter: blur(64px);
  -webkit-backdrop-filter: blur(64px);
  mask-image: linear-gradient(to top,
    black 0%, black 8%, transparent 15%);
  -webkit-mask-image: linear-gradient(to top,
    black 0%, black 8%, transparent 15%);
}
```

**Pros:** True intensity gradient, Apple-style polish
**Cons:** 7 DOM elements, GPU-intensive, complex CSS

## HTML Structure

```html
<div class="card">
  <img src="poster.jpg" class="background-image" />

  <!-- For simple blur -->
  <div class="blur-layer"></div>

  <!-- OR for progressive blur -->
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

## Key Concepts

### Why Doubling Blur Values?

Blur values double (1 → 2 → 4 → 8 → 16 → 32 → 64) because blur perception is logarithmic. Equal increments (1 → 2 → 3 → 4) would make the transition appear to accelerate unnaturally.

### Layer Overlap

Each layer needs ~7% overlap with adjacent layers to prevent visible banding. Layers are positioned from the BOTTOM (where text lives):

```
         TOP (clear image)
         ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
Layer 1: ░░░░░░░░░░░░░░░░░░░░░░████████  (1px blur, ~79-100% from bottom)
Layer 2: ░░░░░░░░░░░░░░░░████████░░░░░░  (2px blur, ~65-86%)
Layer 3: ░░░░░░░░░░████████░░░░░░░░░░░░  (4px blur, ~51-72%)
...
Layer 7: ████████░░░░░░░░░░░░░░░░░░░░░░  (64px blur, ~0-15%)
         BOTTOM (text overlay here)
```

The gradient goes: `transparent → black → black → transparent`, creating a soft-edged "band" where that blur level is active.

### Combining with Scrim (Darkening Layer)

For enhanced text readability, combine blur with a scrim layer using `mix-blend-mode: darken`. The scrim darkens light areas of the image without affecting already-dark areas.

**Important: Stacking Order**

The scrim should be **below** the blur layer for better color mixing:

1. **Background image** (original crisp colors)
2. **Scrim layer** (`mix-blend-mode: darken`) - darkens the crisp image
3. **Blur layer** (`backdrop-filter: blur()`) - softens the darkened result
4. **Text content** - sits on top

This order produces more natural results because:
- The scrim darkens the original sharp colors first
- The blur then softens those transitions, including the darkening edges
- Result: smoother, more integrated look

The alternative (blur → scrim) applies darkening to already-fuzzy pixels, which can look "muddy."

```css
/* Scrim FIRST (::before) - darkens crisp image */
.card::before {
  content: '';
  position: absolute;
  inset: 0;
  mix-blend-mode: darken;
  background: linear-gradient(
    to bottom,
    rgba(15, 15, 15, 0.9) 0%,
    rgba(15, 15, 15, 0.55) 50%,
    transparent 95%
  );
}

/* Blur SECOND (::after) - softens the darkened result */
.card::after {
  content: '';
  position: absolute;
  inset: 0;
  backdrop-filter: blur(0.5rem);
  mask-image: linear-gradient(to bottom, black 0%, transparent 90%);
}
```

### Safari Compatibility

Always include `-webkit-` prefixes:
- `-webkit-backdrop-filter`
- `-webkit-mask-image`

Safari actually has the best `backdrop-filter` support and performance.

## Performance Considerations

1. **GPU Memory**: Each blur layer uses GPU memory. 7 layers × many cards = significant memory
2. **Repaints**: Scrolling triggers repaints on all blur layers
3. **Mobile**: Test on lower-end devices; consider disabling on mobile

### Optimization Strategies

```css
/* Only apply on hover */
.card .progressive-blur {
  display: none;
}
.card:hover .progressive-blur {
  display: block;
}

/* Or use will-change for smoother animations */
.blur-layer {
  will-change: backdrop-filter;
}

/* Reduce layers for better performance */
/* 5 layers (1, 4, 16, 32, 64) still looks good */
```

## Reduced Layer Version (5 Layers)

For better performance with nearly identical visual results:

```css
/* 5 layers: 1px, 4px, 16px, 32px, 64px */
.layer-1 { backdrop-filter: blur(1px);  mask-image: linear-gradient(to bottom, transparent 0%, black 10%, black 20%, transparent 30%); }
.layer-2 { backdrop-filter: blur(4px);  mask-image: linear-gradient(to bottom, transparent 20%, black 30%, black 45%, transparent 55%); }
.layer-3 { backdrop-filter: blur(16px); mask-image: linear-gradient(to bottom, transparent 45%, black 55%, black 70%, transparent 80%); }
.layer-4 { backdrop-filter: blur(32px); mask-image: linear-gradient(to bottom, transparent 70%, black 80%, black 90%, transparent 100%); }
.layer-5 { backdrop-filter: blur(64px); mask-image: linear-gradient(to bottom, transparent 90%, black 100%); }
```

## Demo Pages (Archived)

Demo source code has been moved to `docs/demos/blur/`:
- `blur-simple.astro` - Single-layer technique with controls
- `blur-progressive.astro` - 7-layer technique with layer toggles

See `docs/progressive-blur-findings.md` for the full writeup of findings.

## Lessons Learned (from building the demos)

Building the demo pages required significant iteration. Common pitfalls to avoid:

### 1. Blur Direction Mismatch
The blur layer must be at the **same edge as the text**. If text is at the bottom, the blur gradient must go `to top` (opaque at bottom, transparent at top). Getting this backwards is an easy mistake.

### 2. Confusing Percentage Labels
When building controls, be explicit about what percentages mean:
- ❌ "Mask start: 50%" - too technical, unclear reference point
- ❌ "Blur start: 50%" - ambiguous (start of what?)
- ✅ "100% blur until: 15%" - clear that bottom 15% is fully blurred
- ✅ "Blur ends at: 50%" - clear that blur fades to nothing at 50%

### 3. Inverted Value Storage
Don't store values that require mental math. If the UI shows "15%", store `15`, not `85` (100-15). Direct mapping reduces bugs and confusion.

### 4. Test Multiple Aspect Ratios
Blur effects behave differently across aspect ratios. The demo includes 8 ratios ordered from widest to tallest:
- **2:1** (ultra-wide) - Minimal vertical space for blur
- **16:9** (widescreen) - Common video format
- **4:3** (standard) - Classic photo/video format
- **1:1** (square) - Social media common format
- **3:4** (portrait) - Phone photos
- **2:3** (movie poster) - Standard poster ratio
- **9:16** (vertical video) - Phone video, Stories
- **1:2** (tall banner) - Extreme vertical, stress test

Wide ratios have less vertical real estate, so blur percentages that look good on 2:3 might cover too much on 16:9. Always test your blur settings across ratios.

### 5. URL Parameters for Consistency and Programmability
Every control persists to URL parameters, enabling:
- **Shareable configurations**: Send `?blur=24&full=20&end=60&dir=bottom` to colleagues
- **Bookmarkable presets**: Save specific configurations for reference
- **Reproducible testing**: Return to exact same state after page refresh
- **A/B comparison**: Open two tabs with different parameters to compare

Implementation pattern:
```javascript
const params = new URLSearchParams(window.location.search);
let blurAmount = parseInt(params.get('blur') || '16');
let fullBlur = parseInt(params.get('full') || '15');
let blurEnd = parseInt(params.get('end') || '50');
let direction = params.get('dir') || 'bottom';

function updateURL() {
  const newParams = new URLSearchParams();
  if (blurAmount !== 16) newParams.set('blur', blurAmount);
  if (fullBlur !== 15) newParams.set('full', fullBlur);
  if (blurEnd !== 50) newParams.set('end', blurEnd);
  if (direction !== 'bottom') newParams.set('dir', direction);
  // ... other params
  const url = newParams.toString()
    ? `${window.location.pathname}?${newParams}`
    : window.location.pathname;
  history.replaceState({}, '', url);
}
```

Key practices:
- Only write non-default values to URL (cleaner URLs)
- Use `history.replaceState` instead of `pushState` (don't pollute back button)
- Parse with fallback defaults on page load
- Call `updateURL()` in every control's change handler

### 6. Demo Page UX Matters
For technical demos, invest in good controls:
- Group related controls on same row (e.g., "100% blur until" and "Blur ends at" together)
- Add debug visualizations (colored lines showing gradient boundaries)
- Allow toggling text content levels (title only → + subtitle → + paragraph)
- Include shadow toggle to test readability with/without text shadows

### 7. Gradient Percentages Follow Direction
CSS gradient percentages measure from the **origin** of the gradient direction, not from the viewport edges. This is a common source of confusion:

```css
/* "to top" means: 0% is at BOTTOM, 100% is at TOP */
mask-image: linear-gradient(to top, black 0%, transparent 50%);
/* Result: solid black at bottom edge, fading to transparent at middle */

/* "to bottom" means: 0% is at TOP, 100% is at BOTTOM */
mask-image: linear-gradient(to bottom, black 0%, transparent 50%);
/* Result: solid black at top edge, fading to transparent at middle */
```

When building controls, always measure from the blur origin (where text lives). If text is at the bottom and blur direction is "to top":
- "100% blur until: 15%" means the bottom 15% is fully blurred
- "Blur ends at: 50%" means blur fades to nothing at the 50% mark from bottom

Switching to "to bottom" (text at top) requires re-thinking all percentages from the opposite edge.

### 8. Test All Directions
If supporting multiple blur directions (top/bottom/left/right), test each one. The math and positioning can break in subtle ways when direction changes.

## References

- [Progressive blur in CSS](https://kennethnym.com/blog/progressive-blur-in-css/) - Original technique
- [Josh Comeau: Backdrop-filter](https://www.joshwcomeau.com/css/backdrop-filter/) - Deep dive on mask-image behavior
- [Apple Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/materials) - Design inspiration
