# FilmForum Roadmap

## Overview

**Project**: FilmForum
**Description**: A film discussion and scheduling forum built with Astro and webcoreui
**Tech Stack**: TypeScript/Astro

---

## 1. Session List Page

Browsable movie list at `/session/[id]/list` with reactions (Yes/Maybe/No), saved list drawer, shareable URLs, and 2-person compare view.

- Plan: `plans/session-list-page.md`
- Workplan: `workplans/session-list-page.md`

---

## 2. Route Migration

Move schedule from `/` to `/series/[slug]/schedule`. Extract inline script modules, reorganize components, create landing page at `/`.

- Plan: `plans/migration-plan.md`

---

## 3. OMDb Integration

Add critic/audience scores (RT, Metacritic, IMDB) and plot blurbs via OMDb API. Separate data file joined at display time.

- Plan: `plans/omdb-integration.md`

---

## 4. Apple-Style Drawer Modal

Redesign MovieModal as an iOS-style bottom sheet with full-bleed hero image, drag handle, swipe-to-dismiss. Vaul-style implementation in vanilla JS.

- Plan: `plans/apple-drawer-modal.md`
