# Add Numeric IDs to Movie Data Ingestion

## Problem

Currently, compact encoding relies on array indices which are determined by alphabetical sorting using `localeCompare()`. This can be non-deterministic across different locales:

- User A (English locale) shares URL with indices [2, 3, 5]
- User B (German locale) opens URL, but movies may be sorted differently
- Indices could point to wrong movies

## Current Flow

1. Load raw movie JSON
2. `deduplicateMovies()` - creates UniqueMovie objects with string IDs (e.g., "lonesome")
3. `sortMovies(..., 'alpha')` - sorts using `localeCompare()`
4. Compact encoder uses array index as the reference

## Proposed Solution

Add a deterministic numeric ID to each movie during data ingestion:

```typescript
// When processing movie data
{
  "Movie": "LONESOME",
  "numericId": 42,  // ← Add this
  // ... other fields
}
```

This ID should be:
- **Stable**: Never changes once assigned
- **Unique**: One ID per movie
- **Sequential**: Simple integers (0, 1, 2, ...)
- **Deterministic**: Based on a canonical sort order (e.g., alphabetical by title in en-US locale)

## Implementation

### Option 1: Add to JSON files directly
- Process movie data files
- Add `numericId` field to each movie
- Commit updated JSON files

### Option 2: Generate at build time
- Add a preprocessing step during build
- Assign numeric IDs based on canonical sort
- Keep source JSON clean

### Option 3: Use movie title hash
- Generate numeric ID from movie title hash
- Guaranteed stable across systems
- No need to store in JSON

## Benefits

- ✅ Locale-independent encoding
- ✅ Stable across different browsers/systems
- ✅ More robust shared URLs
- ✅ Can detect data changes (if numericId changes, URL format can be versioned)

## Files to Update

- Movie data files: `public/*.json`
- `src/utils/compactEncoder.ts` - use numeric ID instead of array index
- `src/utils/sessionUtils.ts` - potentially update sorting logic

## Testing

- Verify same encoded URL works across different locales
- Verify adding new movies doesn't change existing IDs
- Verify encoding/decoding with numeric IDs
