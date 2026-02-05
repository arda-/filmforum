# Apple-Style Drawer Modal

## Goal

Redesign the MovieModal as an iOS-style bottom sheet with full-bleed hero image, drag handle, and slide-up animation.

## Current State

Standard centered dialog modal with padded poster image.

## Proposed Design

### Wireframe

```
┌─────────────────────────────────────────┐
│              ───────────                │  ← drag handle (pill)
│┌───────────────────────────────────────┐│
││                                       ││
││                                       ││
││       [POSTER - FULL BLEED]           ││  ← edge-to-edge, no padding
││                                       ││
││                                       ││
│└───────────────────────────────────────┘│
│                                         │
│  Street Scene                           │  ← title (padded content starts)
│  1931 · King Vidor · 80 min             │
│  Sylvia Sidney, William Collier Jr.     │
│                                         │
│  ╭───────────────────────────────────╮  │
│  │ "A slice-of-life drama set on a  │  │  ← Film Forum description
│  │  single New York City block..."  │  │
│  ╰───────────────────────────────────╯  │
│                                    — FF │
│                                         │
│  ┌───────────────────────────────────┐  │
│  │ IMDB 7.2  ·  RT 88%  ·  Meta 70   │  │  ← scores row
│  └───────────────────────────────────┘  │
│                                         │
│  ┌───────────────────────────────────┐  │
│  │ A symphony of life on a single   │  │  ← OMDb plot
│  │ street in New York City...       │  │
│  └───────────────────────────────────┘  │
│                                    — OMDb│
│                                         │
│  [ View on IMDB ↗ ]                     │
│  [ View on Film Forum ↗ ]               │
│                                         │
├─────────────────────────────────────────┤
│  [ Buy Tickets ]    [ Add to Calendar ] │  ← sticky footer
└─────────────────────────────────────────┘
```

### Key Visual Elements

| Element | Description |
|---------|-------------|
| Drag handle | Centered pill shape, ~40px wide, subtle gray |
| Full-bleed poster | Edge-to-edge, no border-radius on top corners |
| Content padding | Standard padding resumes below poster |
| Sticky footer | Fixed at bottom, background blur optional |
| Rounded corners | Top corners only (bottom flush with screen edge) |

## Reference: Vaul by Emil Kowalski

[Vaul](https://github.com/emilkowalski/vaul) is the gold standard for drawer components. It's React-only, but we can recreate its behavior in vanilla JS for Astro.

**Also known as:**
- [shadcn/ui Drawer](https://ui.shadcn.com/docs/components/drawer) — built on Vaul
- Ports exist for Vue (vaul-vue) and Svelte (vaul-svelte)

---

## Implementation

### The iOS Easing Curve

Vaul uses a specific cubic-bezier curve from the Ionic Framework to match iOS Sheet behavior:

```css
/* THE key to feeling native */
transition: transform 0.5s cubic-bezier(0.32, 0.72, 0, 1);
```

| Property | Value | Why |
|----------|-------|-----|
| Duration | `500ms` | Matches iOS Sheet timing |
| Easing | `cubic-bezier(0.32, 0.72, 0, 1)` | Ionic's iOS-matching curve |

### CSS Foundation

```css
.drawer-modal {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  max-height: 90vh;
  border-radius: 16px 16px 0 0;
  overflow: hidden;
  background: var(--bg-surface);

  /* Closed state */
  transform: translateY(100%);

  /* THE iOS curve */
  transition: transform 0.5s cubic-bezier(0.32, 0.72, 0, 1);
}

.drawer-modal.open {
  transform: translateY(0);
}

/* Disable transition during drag for performance */
.drawer-modal.dragging {
  transition: none;
}

.drawer-poster {
  width: 100%;
  aspect-ratio: 16/9;
  object-fit: cover;
}

.drawer-content {
  padding: 0 16px 16px;
  overflow-y: auto;
}

.drawer-footer {
  position: sticky;
  bottom: 0;
  padding: 12px 16px;
  padding-bottom: calc(12px + env(safe-area-inset-bottom));
  background: var(--bg-surface);
  backdrop-filter: blur(10px);
  border-top: 1px solid var(--border);
}

/* Drag handle */
.drawer-handle {
  width: 40px;
  height: 4px;
  background: var(--text-tertiary);
  border-radius: 2px;
  margin: 8px auto;
}
```

### Gesture Handling (Vanilla JS)

```javascript
class DrawerController {
  constructor(el) {
    this.el = el;
    this.isDragging = false;
    this.startY = 0;
    this.currentY = 0;
    this.startTime = 0;

    // Thresholds (Vaul defaults)
    this.CLOSE_THRESHOLD = 0.25;  // 25% of height to close
    this.VELOCITY_THRESHOLD = 0.5; // px/ms to trigger momentum close
    this.SCROLL_LOCK_TIMEOUT = 100; // ms after scroll before drag allowed

    this.bindEvents();
  }

  bindEvents() {
    this.el.addEventListener('pointerdown', this.onPointerDown.bind(this));
    document.addEventListener('pointermove', this.onPointerMove.bind(this));
    document.addEventListener('pointerup', this.onPointerUp.bind(this));
  }

  onPointerDown(e) {
    // Ignore if not scrolled to top (Vaul behavior)
    const scrollable = this.el.querySelector('.drawer-content');
    if (scrollable && scrollable.scrollTop > 0) return;

    // Ignore select elements and [data-vaul-no-drag]
    if (e.target.closest('select, [data-no-drag]')) return;

    this.isDragging = true;
    this.startY = e.clientY;
    this.startTime = Date.now();
    this.el.classList.add('dragging');
    this.el.setPointerCapture(e.pointerId);
  }

  onPointerMove(e) {
    if (!this.isDragging) return;

    const deltaY = e.clientY - this.startY;

    // Only allow dragging down (positive deltaY)
    if (deltaY < 0) {
      // Apply damping when dragging up (Vaul behavior)
      const damped = this.dampenValue(Math.abs(deltaY));
      this.el.style.transform = `translateY(${-damped}px)`;
    } else {
      this.currentY = deltaY;
      this.el.style.transform = `translateY(${deltaY}px)`;
    }
  }

  onPointerUp(e) {
    if (!this.isDragging) return;

    this.isDragging = false;
    this.el.classList.remove('dragging');
    this.el.releasePointerCapture(e.pointerId);

    const height = this.el.offsetHeight;
    const percentDragged = this.currentY / height;
    const timeTaken = Date.now() - this.startTime;
    const velocity = Math.abs(this.currentY) / timeTaken;

    // Close if: dragged past threshold OR flicked with velocity
    if (percentDragged > this.CLOSE_THRESHOLD || velocity > this.VELOCITY_THRESHOLD) {
      this.close();
    } else {
      this.snapBack();
    }

    this.currentY = 0;
    this.el.style.transform = '';
  }

  // Exponential damping for resistance when dragging up
  dampenValue(value) {
    return Math.sqrt(value) * 4;
  }

  open() {
    this.el.classList.add('open');
  }

  close() {
    this.el.classList.remove('open');
  }

  snapBack() {
    // Transform cleared, CSS transition handles snap
  }
}
```

### Snap Points (Optional)

For multi-stop drawers (e.g., half-open, full-open):

```javascript
// Snap points as fractions of viewport height
const SNAP_POINTS = [0.4, 0.9]; // 40% and 90%

function getClosestSnapPoint(currentPercent, velocity) {
  // High velocity = skip to next/prev snap point
  if (velocity > VELOCITY_THRESHOLD) {
    const direction = velocity > 0 ? 1 : -1;
    const currentIndex = SNAP_POINTS.findIndex(p => p >= currentPercent);
    return SNAP_POINTS[currentIndex + direction] ?? (direction > 0 ? 1 : 0);
  }

  // Otherwise, snap to nearest
  return SNAP_POINTS.reduce((prev, curr) =>
    Math.abs(curr - currentPercent) < Math.abs(prev - currentPercent) ? curr : prev
  );
}
```

### Background Scaling (Vaul's `shouldScaleBackground`)

```javascript
// Requires wrapper element with [data-drawer-wrapper]
function updateBackgroundScale(dragPercent) {
  const wrapper = document.querySelector('[data-drawer-wrapper]');
  if (!wrapper) return;

  const scale = 1 - (dragPercent * 0.05); // Scale down to 0.95 at full drag
  const radius = dragPercent * 8; // Up to 8px border radius

  wrapper.style.transform = `scale(${scale})`;
  wrapper.style.borderRadius = `${radius}px`;
}
```

### Scroll Lock During Drag

```javascript
// Prevent drag immediately after scrolling (Vaul's scrollLockTimeout)
let scrollLockActive = false;

scrollableContent.addEventListener('scroll', () => {
  scrollLockActive = true;
  clearTimeout(scrollLockTimer);
  scrollLockTimer = setTimeout(() => {
    scrollLockActive = false;
  }, 100); // 100ms timeout
});

// In onPointerDown:
if (scrollLockActive) return;
```

### Keyboard Handling (Visual Viewport API)

```javascript
// Adjust drawer when keyboard appears
if (window.visualViewport) {
  window.visualViewport.addEventListener('resize', () => {
    const heightDelta = window.innerHeight - visualViewport.height;

    // Keyboard likely open if delta > 60px
    if (heightDelta > 60) {
      drawer.style.bottom = `${heightDelta}px`;
    } else {
      drawer.style.bottom = '0';
    }
  });
}
```

---

## Astro Integration

### Option 1: Vanilla JS (Recommended)

Create `src/components/Drawer.astro` with inline `<script>` using the DrawerController class above. No dependencies.

### Option 2: Web Component

Wrap the logic in a custom element for encapsulation:

```javascript
class MovieDrawer extends HTMLElement {
  connectedCallback() {
    // Initialize DrawerController
  }
}
customElements.define('movie-drawer', MovieDrawer);
```

### Option 3: Use Existing Library

- [side-drawer](https://side-drawer.goulet.dev/) — vanilla web component, zero dependencies
- [js-bottomsheet](https://github.com/timelessco/js-bottomsheet) — pure JS, snappable, scrollable

---

## Key Vaul Behaviors to Replicate

| Behavior | Implementation |
|----------|----------------|
| iOS-feel animation | `cubic-bezier(0.32, 0.72, 0, 1)` at 500ms |
| Momentum close | Check velocity on pointer up |
| Damping on overdrag | Exponential resistance when dragging past bounds |
| Scroll-then-drag | Only allow drag when `scrollTop === 0` |
| Scroll lock timeout | 100ms delay after scroll before drag enabled |
| Multi-touch ignore | Ignore touches after first until release |
| Background scale | Scale wrapper element proportional to drag |

---

## Considerations

- **Backdrop:** Semi-transparent overlay with optional blur
- **Scroll behavior:** Content scrolls, footer stays fixed
- **Accessibility:** Focus trapping, escape key closes, `aria-modal`
- **Desktop:** Show as centered modal on wider screens, drawer on mobile only
- **Performance:** Apply transforms via inline style during drag, not CSS variables

## Status

**Future enhancement** — not blocking OMDb integration. Current modal works fine.

## Sources

- [Vaul GitHub](https://github.com/emilkowalski/vaul) — the reference implementation
- [Building a Drawer Component](https://emilkowal.ski/ui/building-a-drawer-component) — Emil's blog post with implementation details
- [shadcn/ui Drawer](https://ui.shadcn.com/docs/components/drawer) — Vaul wrapped with Tailwind styles
- [side-drawer](https://side-drawer.goulet.dev/) — vanilla web component alternative
- [js-bottomsheet](https://github.com/timelessco/js-bottomsheet) — pure JS alternative

## Related

- `plans/omdb-integration.md` — OMDb data will display in this modal
- `TODO.md` — tracked as UI/Styling item
