# Drawer: Native Footer Slot

## Problem

The sticky footer pattern currently requires consumers to:
1. Override `.drawer-body` internals (`:global(#id .drawer-body) { display: flex; padding-bottom: 0 !important }`)
2. Build their own flex layout with a scroll region nested inside the body
3. Undo the body's padding with negative margins (`margin: 0 -20px`)

This pushes the scroll container two levels deep (`.drawer-body > .drawer-sticky-layout > .drawer-sticky-content`), which broke swipe-to-dismiss because the touch handler checked `body.scrollTop` — always 0 since the body itself never overflows.

We patched the swipe logic (walking up the DOM to find scrolled ancestors), but the root cause is structural: the footer shouldn't live inside the body.

## Goal

Make footer a first-class Drawer feature so `.drawer-body` is always the scroll container.

### Current structure (consumer builds sticky footer inside body)
```
.drawer-container
  .drawer-handle
  .drawer-header
  .drawer-body                      ← has overflow-y: auto, but never overflows
    .drawer-sticky-layout           ← consumer-built flex wrapper
      .drawer-sticky-content        ← actual scroll container
      .drawer-footer-fixed          ← consumer-built footer
```

### Target structure (Drawer owns footer as a sibling)
```
.drawer-container
  .drawer-handle
  .drawer-header
  .drawer-body                      ← always the scroll container
    <slot />
  .drawer-footer                    ← optional, rendered by Drawer when footer slot has content
    <slot name="footer" />
```

## Implementation

### 1. Add a named `footer` slot to Drawer.astro

```astro
---
interface Props {
  id: string;
  title?: string;
  maxHeight?: string;
}

const { id, title, maxHeight = '85vh' } = Astro.props;
const hasFooter = Astro.slots.has('footer');
---

<div id={id} class="drawer" data-open="false" role="dialog" aria-modal="true" aria-labelledby={title ? `${id}-title` : undefined}>
  <div class="drawer-backdrop" data-drawer-close></div>
  <div class="drawer-container" style={`--drawer-max-height: ${maxHeight}`}>
    <div class="drawer-handle-area" data-drawer-handle>
      <div class="drawer-handle"></div>
    </div>
    <div class="drawer-header">
      {title && <h2 id={`${id}-title`} class="drawer-title">{title}</h2>}
      {!title && <div></div>}
      <button class="drawer-close-btn" aria-label="Close">
        <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
          <path d="M11.78 4.03a.5.5 0 00-.71-.71L7.5 6.89 3.93 3.32a.5.5 0 10-.71.71L6.79 7.5l-3.57 3.47a.5.5 0 00.71.71L7.5 8.11l3.57 3.57a.5.5 0 00.71-.71L8.21 7.5l3.57-3.47z" fill="currentColor"/>
        </svg>
      </button>
    </div>
    <div class="drawer-body">
      <slot />
    </div>
    {hasFooter && (
      <div class="drawer-footer">
        <slot name="footer" />
      </div>
    )}
  </div>
</div>
```

### 2. Add `.drawer-footer` styles

```css
.drawer-footer {
  flex-shrink: 0;
  display: flex;
  gap: 8px;
  padding: 12px 20px;
  background: var(--bg-day);
  border-top: 1px solid var(--bg-movie-hover);
}

/* Same safe-area/padding logic as .drawer-body for non-mobile-chrome devices */
@media (hover: hover) and (pointer: fine),
       (pointer: coarse) and (min-width: 768px) and (min-height: 600px) {
  .drawer-footer {
    padding-bottom: 12px;
  }
}
```

When a footer is present, the body no longer needs bottom safe-area padding (the footer handles it). The body's existing `padding-bottom: 2px` base is fine — it just provides the scroll content's bottom edge.

### 3. Simplify the swipe-to-dismiss check

With the footer outside the body, `body.scrollTop` works correctly again for all cases. The `isInsideScrolledContainer` walk is still a good defensive measure (handles arbitrary nested scroll containers consumers might create), so it can stay. But the sticky footer specifically no longer depends on it.

### 4. Migrate the demo page

**Before** (current — consumer-managed layout):
```astro
<Drawer id="drawer-sticky-footer" title="Sticky Footer Example" maxHeight="70vh">
  <div class="drawer-sticky-layout">
    <div class="drawer-sticky-content">
      <h3>Overview</h3>
      <p>Content here...</p>
    </div>
    <div class="drawer-footer-fixed">
      <Button variant="secondary" onclick="closeDrawer('drawer-sticky-footer')">Cancel</Button>
      <Button variant="primary" onclick="closeDrawer('drawer-sticky-footer')">Add to Cart</Button>
    </div>
  </div>
</Drawer>
```

**After** (native slot — just content and a footer):
```astro
<Drawer id="drawer-sticky-footer" title="Sticky Footer Example" maxHeight="70vh">
  <h3>Overview</h3>
  <p>Content here...</p>

  <Fragment slot="footer">
    <Button variant="secondary" onclick="closeDrawer('drawer-sticky-footer')">Cancel</Button>
    <Button variant="primary" onclick="closeDrawer('drawer-sticky-footer')">Add to Cart</Button>
  </Fragment>
</Drawer>
```

### 5. Clean up demo page styles

Remove all of these from `drawer.astro`:
- `:global(#drawer-sticky-footer .drawer-body)` override
- `.drawer-sticky-layout`
- `.drawer-sticky-content` (and its child selectors for `h3`, `p`, `ul`, `li`)
- `.drawer-footer-fixed`

The heading/paragraph styles (`h3`, `p`, `ul`, `li`) used inside the sticky content are likely shared with other drawer demos (`.drawer-content-scroll` has identical styles). If so, consolidate into shared classes or leave the existing per-demo selectors as-is.

## Checklist

- [ ] Add `footer` named slot to `Drawer.astro` with `Astro.slots.has('footer')` conditional
- [ ] Add `.drawer-footer` CSS in `Drawer.astro`
- [ ] Migrate `drawer-sticky-footer` demo to use the new slot
- [ ] Remove consumer-side sticky layout CSS from demo page
- [ ] Verify swipe-to-dismiss works correctly (scroll up in content, swipe down at top to dismiss)
- [ ] `pnpm build` passes
