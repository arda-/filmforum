# TODO: Replace SVG OG Images with Proper Raster Images

## Issue
All OpenGraph image files currently have `.jpg` extensions but are actually SVG files (415-711 bytes).
Social media platforms (Facebook, Twitter/X, LinkedIn) **do not support SVG** for OpenGraph images and will fail to display previews.

## Files to Replace

- `/public/og-default.jpg`
- `/public/og-images/home.jpg`
- `/public/og-images/series/tenement-stories.jpg`
- `/public/og-images/calendar/tenement-stories.jpg`
- `/public/og-images/list/tenement-stories.jpg`
- `/public/og-images/shared-list.jpg`
- `/public/og-images/compare-lists.jpg`

## Requirements

1. **Dimensions:** 1200x630 pixels (OpenGraph standard)
2. **Format:** PNG or JPEG (not SVG!)
3. **Design:**
   - Dark background (#0a0a0a or similar)
   - FilmForum branding
   - Relevant text for each page type
   - Simple, clean design

## Options for Creating Images

### Option 1: Design Tool
Use Figma, Canva, or Photoshop to create designs at 1200x630

### Option 2: OG Image Service
- [Vercel OG Image](https://vercel.com/docs/functions/og-image-generation)
- [Cloudinary](https://cloudinary.com/documentation/image_transformations)

### Option 3: Programmatic Generation
```bash
# Install sharp (image processing)
pnpm add -D sharp

# Create a script to generate PNGs from templates
```

## Current Impact

Social media link previews will **not work** until these are replaced with proper raster images.
Meta tags are correct, but images are invalid format.
