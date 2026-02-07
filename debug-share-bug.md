# Share List Bug Investigation

## Hypothesis 1: Empty Query Parameters

**Issue:** User opens `/s/tenement-stories/list/saved` directly without `?u=...&r=...` parameters.

**Expected behavior:**
- `encodedReactions` would be empty string `""`
- `decodeReactions("")` would return `{}`
- `yesMovies` and `maybeMovies` would be empty arrays
- Page shows "No movies in this list"

**This is expected!** User must have a share URL to view.

## Hypothesis 2: Generated URL is Wrong

**Issue:** When user clicks Share button, the URL generated might be incorrect.

**Check:**
1. Does `encodeReactions(reactions)` return correct base64?
2. Is `reactions` object populated correctly?
3. Is the URL formatted correctly?

Looking at line 442 in list/index.astro:
```typescript
const url = `${window.location.origin}/s/${sessionId}/list/saved?u=${userId}&r=${encoded}`;
```

This looks correct.

## Hypothesis 3: Data Mismatch

**Issue:** Movie IDs in encoded reactions don't match movie IDs in `allMovies`.

**Example:**
- Encoding uses: `lonesome:y`
- Decoding looks for movie with `id: "lonesome"`
- But `allMovies` has different IDs?

**Check:**
Looking at saved.astro line 110-111:
```typescript
const yesMovies = allMovies.filter(m => friendReactions[m.id] === 'yes');
const maybeMovies = allMovies.filter(m => friendReactions[m.id] === 'maybe');
```

This requires that the movie IDs in `friendReactions` match the IDs in `allMovies`.

**Movie ID generation** (from sessionUtils.ts line 9-14):
```typescript
export function movieId(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}
```

So for movie "LONESOME", the ID would be "lonesome".

**When encoding** (in list/index.astro):
- User marks movie with id "lonesome"
- `getReactions(sessionId)` returns `{lonesome: 'yes'}`
- `encodeReactions({lonesome: 'yes'})` returns base64 of "lonesome:y"

**When decoding** (in saved.astro):
- `decodeReactions(base64)` returns `{lonesome: 'yes'}`
- `allMovies.filter(m => friendReactions[m.id] === 'yes')` should find movies with `id === "lonesome"`

**This should work!**

## Hypothesis 4: Build vs Dev Server Issue

**Issue:** Static paths might not be generated correctly.

Looking at saved.astro line 16-18:
```typescript
export function getStaticPaths() {
  return getAllSeriesIds().map(id => ({ params: { id } }));
}
```

This generates static paths for all series IDs at build time.

**In dev mode:** Should work
**In production:** Only pre-generated paths will exist

## Most Likely Bug

Based on the code review, the **most likely scenario** is:

**User hasn't actually generated a share link yet!**

If you:
1. Go to `/s/tenement-stories/list`
2. Don't mark any movies
3. Try to access `/s/tenement-stories/list/saved` directly

Result: Empty list (which is correct!)

## To Reproduce the Bug

1. Start dev server: `pnpm dev`
2. Go to: `http://localhost:4321/s/tenement-stories/list`
3. Mark some movies (click Yes, Maybe, No buttons)
4. Open SavedListDrawer (click "Review Saved" in bottom toolbar)
5. Click "Share" button
6. Copy the generated URL
7. Open the URL in a new tab or incognito window
8. **Expected:** See the shared list
9. **Actual:** See "No movies in this list"? ← This is the bug

## Debug Steps

Add this to saved.astro after line 104:

```typescript
const friendReactions = decodeReactions(encodedReactions);

// DEBUG
console.log('=== SHARE LIST DEBUG ===');
console.log('1. Encoded reactions from URL:', encodedReactions);
console.log('2. Decoded reactions:', friendReactions);
console.log('3. All movies count:', allMovies.length);
console.log('4. All movie IDs:', allMovies.map(m => m.id));
console.log('5. Friend reaction IDs:', Object.keys(friendReactions));
console.log('6. Yes movies found:', yesMovies.length);
console.log('7. Maybe movies found:', maybeMovies.length);
console.log('========================');
```

This will show exactly what's happening.

## My Prediction

The bug is likely one of these:

**A)** User is testing with an empty list (no movies marked) ← Most likely
**B)** Share button not working (check browser console for errors)
**C)** Movie ID mismatch between encoding and decoding ← Unlikely but possible

## Next Step

We need to actually test this to see which hypothesis is correct.
