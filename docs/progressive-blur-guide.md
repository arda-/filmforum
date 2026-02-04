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

## Demo Pages

See the live demos in this project:
- `/demo/blur-simple` - Single-layer technique with controls
- `/demo/blur-progressive` - 7-layer technique with layer toggles

## References

- [Progressive blur in CSS](https://kennethnym.com/blog/progressive-blur-in-css/) - Original technique
- [Josh Comeau: Backdrop-filter](https://www.joshwcomeau.com/css/backdrop-filter/) - Deep dive on mask-image behavior
- [Apple Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/materials) - Design inspiration
