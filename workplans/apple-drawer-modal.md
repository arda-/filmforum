# Plan: Apple-Style Drawer Modal

## Context

### What Exists

The current movie modal uses the `DialogRoot` component at `src/components/Dialog/DialogRoot.astro` wrapped in `src/components/MovieModal.astro`. It is a standard centered dialog that appears over a backdrop. The modal is opened via `(window as any).openDialog('movie-modal')` and closed via click-outside or close button.

The plan at `plans/apple-drawer-modal.md` is unusually detailed -- it includes CSS, a full `DrawerController` class in JavaScript, snap point logic, background scaling, scroll lock handling, and keyboard viewport adjustments. Three implementation options are evaluated: Vanilla JS (recommended), Web Component, or js-bottomsheet library.

### What We're Building

A reusable Drawer component that replaces the centered dialog with an iOS-style bottom sheet featuring: slide-up animation with iOS cubic-bezier easing, drag handle, swipe-to-dismiss with velocity detection, damping on overdrag, scroll-then-drag behavior, backdrop overlay, and optional background scaling. The MovieModal will be rebuilt inside this drawer with a full-bleed hero image layout.

### Key Constraints

- No React, no framework-specific drawer libraries
- Must work on both mouse and touch (pointer events)
- Must support keyboard dismiss (Escape)
- Accessibility: `aria-modal`, focus trapping
- Desktop: could show as centered modal on wider screens, drawer on mobile only (responsive)
- The plan recommends Vanilla JS (Option 1) over Web Component or js-bottomsheet
- This is marked as "Future enhancement -- not blocking OMDb integration" in the plan

## Components

1. **Drawer CSS Foundation** -- Positioning, animation curves, drag handle, overlay. Medium complexity.
2. **DrawerController JS** -- Pointer event handling, velocity calculation, snap/close decisions, damping, scroll lock. High complexity.
3. **Drawer Astro Component** -- Astro wrapper exposing slots and props. Low complexity.
4. **MovieModal Redesign** -- Rebuild modal content with full-bleed poster layout inside drawer. Medium complexity.
5. **Background Scaling** -- Optional: scale the page content behind the drawer for depth effect. Low complexity (additive).
6. **Desktop Fallback** -- On wider screens, optionally show as centered modal instead of bottom sheet. Low-medium complexity.

## Dependencies

```
Drawer CSS (1) --+--> Drawer Component (3) --> MovieModal Redesign (4)
                 |
DrawerController (2) --+
                       |
Background Scaling (5) -- optional, parallel to (4)
Desktop Fallback (6) -- optional, parallel to (4)
```

- CSS (1) and JS (2) can be built in parallel, then combined in the component (3)
- MovieModal Redesign (4) depends on the working drawer
- Background Scaling (5) and Desktop Fallback (6) are optional polish items

## Execution Plan

### Phase 1: Drawer Foundation (parallel tracks)

**Track A: CSS**

- [ ] **1A.1: Create drawer CSS**
  - Create `src/styles/drawer.css` (or inline in the component)
  - `.drawer-modal`: fixed bottom positioning, `transform: translateY(100%)` closed state, `border-radius: 16px 16px 0 0`
  - `.drawer-modal.open`: `transform: translateY(0)`
  - `.drawer-modal.dragging`: `transition: none` (disable during drag)
  - Transition: `transform 0.5s cubic-bezier(0.32, 0.72, 0, 1)` -- the iOS easing curve from Vaul
  - `.drawer-overlay`: semi-transparent backdrop
  - `.drawer-handle`: centered pill, `40px x 4px`, `border-radius: 2px`
  - `.drawer-content`: scrollable content area
  - `.drawer-footer`: sticky bottom with optional `backdrop-filter: blur(10px)`
  - `max-height: 90vh` on the drawer

**Track B: DrawerController JavaScript**

- [ ] **1B.1: Create DrawerController class**
  - Create `src/lib/drawer/DrawerController.ts`
  - Constructor: takes drawer element, configures thresholds (`CLOSE_THRESHOLD = 0.25`, `VELOCITY_THRESHOLD = 0.5`, `SCROLL_LOCK_TIMEOUT = 100`)
  - `onPointerDown`: ignore if `scrollTop > 0` (Vaul behavior), ignore `select` and `[data-no-drag]` elements, capture pointer
  - `onPointerMove`: track delta, apply `translateY` for downward drag, apply damping (`Math.sqrt(value) * 4`) for upward overdrag
  - `onPointerUp`: calculate velocity (`pixels / ms`), close if past threshold or flicked, snap back otherwise
  - `open()` / `close()`: add/remove `.open` class
  - Body scroll lock: prevent background scrolling when drawer is open
  - Escape key handler

- [ ] **1B.2: Add scroll lock during drag**
  - Track scroll events on `.drawer-content`
  - Set `scrollLockActive = true` during scroll, clear after 100ms timeout
  - Prevent drag initiation while `scrollLockActive`

- [ ] **1B.3: Focus trapping**
  - On open: find all focusable elements, trap Tab/Shift+Tab within drawer
  - On close: restore focus to previously focused element
  - Set `aria-modal="true"` and `role="dialog"` on the drawer element

### Phase 2: Drawer Component (sequential)

- [ ] **2.1: Create Drawer.astro**
  - Create `src/components/Drawer.astro`
  - Props: `id` (string), `maxHeight` (string, default `90vh`)
  - Slots: default slot for content, named `footer` slot for sticky footer
  - Renders: overlay, drawer container with handle, scrollable content area, footer
  - `<script>`: imports and instantiates DrawerController
  - Expose global `openDrawer(id)` / `closeDrawer(id)` functions on window (matching existing dialog pattern)

- [ ] **2.2: Create demo page**
  - Create `src/pages/demo/drawer.astro`
  - Add to demo index at `src/pages/demo/index.astro`
  - Button to open a test drawer with sample content
  - Verify: slide-up animation, swipe-to-dismiss, scroll-then-drag, escape key

### Phase 3: MovieModal Redesign (sequential)

- [ ] **3.1: Rebuild MovieModal with drawer**
  - Modify `src/components/MovieModal.astro`
  - Replace `DialogRoot` wrapper with new `Drawer` component
  - Full-bleed poster: remove padding/border-radius on poster, `width: 100%`, `object-fit: cover`
  - Content sections below poster with standard padding
  - Sticky footer with Buy Tickets and Add to Calendar buttons
  - Drag handle visible above the poster

- [ ] **3.2: Update modal open/close calls**
  - Modify `src/pages/index.astro` (or migrated route) and `src/lib/schedule/movieModal.ts` (if extracted)
  - Replace `openDialog('movie-modal')` with `openDrawer('movie-modal')`
  - Ensure movie data population still works (same DOM IDs or updated selectors)

- [ ] **3.3: OMDb sections (if OMDb integration is complete)**
  - Add scores row and OMDb plot section to the new drawer layout
  - If OMDb is not yet implemented, leave placeholder structure

### Phase 4: Optional Polish (parallel)

- [ ] **4.1: Background scaling**
  - Add `[data-drawer-wrapper]` to main page wrapper
  - In DrawerController: during drag, scale wrapper to `1 - (dragPercent * 0.05)` with proportional border-radius
  - Reset on close

- [ ] **4.2: Desktop responsive behavior**
  - At wider breakpoints (e.g., `min-width: 768px`), optionally render as centered modal instead of bottom sheet
  - Media query to override positioning and max-width
  - Keep drawer behavior on mobile

- [ ] **4.3: Keyboard viewport handling**
  - Use Visual Viewport API to detect software keyboard
  - Adjust drawer `bottom` offset when keyboard is visible (`heightDelta > 60px`)

## Quality Gates

- [ ] `pnpm build` passes with zero errors
- [ ] Drawer opens with iOS-feel slide-up animation (500ms, cubic-bezier)
- [ ] Swipe-to-dismiss works on both pointer (mouse) and touch devices
- [ ] Content inside drawer scrolls; once at `scrollTop === 0`, drag begins
- [ ] Escape key closes the drawer
- [ ] Focus is trapped within the drawer when open
- [ ] Poster image is full-bleed (edge-to-edge, no padding)
- [ ] Dark mode and light mode both render correctly
- [ ] Demo page demonstrates the drawer in isolation

## Risks & Open Questions

1. **Scroll-then-drag is tricky**: The transition from scrolling content to dragging the drawer (when `scrollTop === 0`) is the hardest behavior to get right. Vaul handles this with careful scroll lock timeouts. The vanilla JS implementation may need iteration to feel smooth. This is the highest-risk interaction.

2. **Pointer vs. Touch events**: The plan uses Pointer Events API, which unifies mouse and touch. This is correct for modern browsers but needs testing on iOS Safari where pointer event support has historically had quirks.

3. **Replacing Dialog pattern**: The current modal uses `(window as any).openDialog()` / `closeDialog()` which are global functions registered by `DialogRoot`. The drawer needs its own global API (`openDrawer` / `closeDrawer`) or needs to reuse the same naming convention. Existing code that calls `openDialog('movie-modal')` must be updated.

4. **Impact on Session List Page workplan**: The session list page workplan (already in progress) plans its own Vaul-style drawer for "More Info Modal" and "Saved List Drawer." If this standalone drawer is built first, the session list page should reuse it rather than building a second one. Coordinate to avoid duplication.

5. **Implementation option decision**: The plan evaluates three options (Vanilla JS, Web Component, js-bottomsheet library). The plan recommends Vanilla JS but does not make a final call. The implementer should confirm this choice before starting. js-bottomsheet adds ~15-20KB but saves significant implementation time.

---

Written by Claude Opus 4.6 (claude-opus-4-6) at 2026-02-06
