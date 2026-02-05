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

## Implementation

### CSS Approach

```css
.drawer-modal {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  max-height: 90vh;
  border-radius: 16px 16px 0 0;
  overflow: hidden;
  transform: translateY(100%);
  transition: transform 0.3s ease-out;
}

.drawer-modal.open {
  transform: translateY(0);
}

.drawer-poster {
  width: 100%;
  aspect-ratio: 16/9;
  object-fit: cover;
  /* No padding, no border-radius */
}

.drawer-content {
  padding: 0 16px 16px;
}

.drawer-footer {
  position: sticky;
  bottom: 0;
  padding: 12px 16px;
  background: var(--bg-surface);
  backdrop-filter: blur(10px);
  border-top: 1px solid var(--border);
}
```

### Drag-to-Dismiss (Optional)

For swipe-down-to-close behavior:

1. Track touch/pointer events on the modal
2. Calculate drag distance
3. If dragged > 100px down, close modal
4. Otherwise, snap back

Could use a library like `@neodrag/vanilla` or implement manually.

### Safe Areas

For notched devices:

```css
.drawer-footer {
  padding-bottom: calc(12px + env(safe-area-inset-bottom));
}
```

## Considerations

- **Backdrop:** Semi-transparent overlay with optional blur
- **Scroll behavior:** Content scrolls, footer stays fixed
- **Accessibility:** Ensure focus trapping, escape key closes
- **Animation:** Slide up on open, slide down on close
- **Desktop:** Could show as centered modal on wider screens, drawer on mobile only

## Status

**Future enhancement** — not blocking OMDb integration. Current modal works fine.

## Related

- `plans/omdb-integration.md` — OMDb data will display in this modal
- `TODO.md` — tracked as UI/Styling item
