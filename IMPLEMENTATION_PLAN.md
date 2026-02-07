# Implementation Plan: Compact Encoding for Share Lists

## Overview

Integrate the new compact encoding into the share list feature to:
1. Fix the current bug (if any)
2. Reduce URL size by 80-88%
3. Enable future PIN protection

## Current State Analysis

### Files Involved

```
src/pages/s/[id]/list/
├── index.astro           # Main list page with Share button
└── saved.astro           # Shared list view page

src/pages/s/[id]/compare/
└── [...lists].astro      # Comparison page

src/utils/
├── storageManager.ts     # Current encoding (OLD)
└── compactEncoder.ts     # New encoding (NEW)
```

### Current Flow

```
User marks movies
    ↓
Clicks "Share" in SavedListDrawer
    ↓
list/index.astro:440 → encodeReactions(reactions)
    ↓
Generates URL: /s/{id}/list/saved?u={userId}&r={encoded}
    ↓
Friend opens URL
    ↓
saved.astro:104 → decodeReactions(encodedReactions)
    ↓
Filters movies and displays
```

### Potential Bug

**Line saved.astro:104:**
```typescript
const friendReactions = decodeReactions(encodedReactions);
```

This uses the old decoder which expects movie IDs in the encoded string. However, it should work because the old encoding includes full movie IDs like "lonesome:y,taxi:m".

**Possible issues:**
1. Empty `encodedReactions` → returns `{}`
2. Movie IDs don't match between encoding/decoding
3. Base64 decoding fails

Let's verify by adding debug logging first.

---

## Implementation Steps

### Phase 1: Debug Current Implementation (15 min)

**Goal:** Understand why current sharing isn't working

**Step 1.1: Add debug logging to saved.astro**

```diff
// src/pages/s/[id]/list/saved.astro:104
const friendReactions = decodeReactions(encodedReactions);

+ // DEBUG: Log what we got
+ console.log('DEBUG: encoded string:', encodedReactions);
+ console.log('DEBUG: decoded reactions:', friendReactions);
+ console.log('DEBUG: all movies:', allMovies.length, 'movies');
+ console.log('DEBUG: yes movies:', allMovies.filter(m => friendReactions[m.id] === 'yes').length);
```

**Step 1.2: Test current flow**

1. Mark a few movies (yes, maybe, no)
2. Click Share button
3. Copy the URL
4. Open in new tab/incognito
5. Check browser console for DEBUG logs
6. Identify the issue

**Expected findings:**
- If `encodedReactions` is empty → share button not encoding correctly
- If `friendReactions` is `{}` → decoding failed
- If movies aren't showing → filtering logic issue

---

### Phase 2: Integrate Compact Encoding (30 min)

**Goal:** Replace old encoding with new compact encoding

**Step 2.1: Update list/index.astro (Share button)**

```diff
// src/pages/s/[id]/list/index.astro

// At the top, add import
<script>
-  import { getReactions, setReaction, getReactionCounts, encodeReactions } from '../../../../utils/storageManager';
+  import { getReactions, setReaction, getReactionCounts } from '../../../../utils/storageManager';
+  import { encodeReactionsCompact } from '../../../../utils/compactEncoder';
  import { getUserId } from '../../../../utils/storageManager';
  // ... other imports

  const sessionId = (window as any).__sessionId as string;
  const allMovies = (window as any).__movieData as UniqueMovie[];

  // ... existing code ...

  // --- Share --- (line ~438)
  document.getElementById('saved-share-btn')?.addEventListener('click', async () => {
    const reactions = getReactions(sessionId);
-   const encoded = encodeReactions(reactions);
+   const encoded = encodeReactionsCompact(reactions, allMovies);
    const userId = getUserId();
    const url = `${window.location.origin}/s/${sessionId}/list/saved?u=${userId}&r=${encoded}`;

    if (navigator.share) {
      try {
        await navigator.share({ title: 'My Movie List', url });
      } catch {
        // User cancelled or share failed
      }
    } else {
      await navigator.clipboard.writeText(url);
      const btn = document.getElementById('saved-share-btn');
      if (btn) {
        const orig = btn.innerHTML;
        btn.textContent = 'Link copied!';
        setTimeout(() => { btn.innerHTML = orig; }, 2000);
      }
    }
  });
</script>
```

**Step 2.2: Update list/saved.astro (Shared list view)**

```diff
// src/pages/s/[id]/list/saved.astro:93

<script>
- import { decodeReactions, getReactions, setReaction, encodeReactions, getUserId } from '../../../../utils/storageManager';
+ import { getReactions, setReaction, getUserId } from '../../../../utils/storageManager';
+ import { decodeReactionsCompact, encodeReactionsCompact } from '../../../../utils/compactEncoder';
  import { toTitleCase, formatRuntime } from '../../../../utils/movieUtils';
  import type { UniqueMovie, MovieReaction } from '../../../../types/session';

  const sessionId = (window as any).__sessionId as string;
  const allMovies = (window as any).__movieData as UniqueMovie[];

  // Parse userId and reactions from URL query params
  const urlParams = new URLSearchParams(window.location.search);
  const friendUserId = urlParams.get('u') || 'unknown';
  const encodedReactions = urlParams.get('r') || '';
- const friendReactions = decodeReactions(encodedReactions);
+ const friendReactions = decodeReactionsCompact(encodedReactions, allMovies);

  // ... rest of the code ...

  // Compare button (line ~181)
  document.getElementById('compare-btn')?.addEventListener('click', () => {
    const myReactions = getReactions(sessionId);
-   const myEncoded = encodeReactions(myReactions);
+   const myEncoded = encodeReactionsCompact(myReactions, allMovies);
    const friendEncoded = encodedReactions;
    window.location.href = `/s/${sessionId}/compare/${friendEncoded}/${myEncoded}`;
  });
</script>
```

**Step 2.3: Update compare/[...lists].astro**

```diff
// src/pages/s/[id]/compare/[...lists].astro

<script>
- import { decodeReactions } from '../../../../utils/storageManager';
+ import { decodeReactionsCompact } from '../../../../utils/compactEncoder';
  import { toTitleCase, formatRuntime } from '../../../../utils/movieUtils';
  import type { UniqueMovie, MovieReaction } from '../../../../types/session';

  const sessionId = (window as any).__sessionId as string;
  const allMovies = (window as any).__movieData as UniqueMovie[];

  // ... parse URL ...

- const list1Reactions = decodeReactions(list1Encoded);
- const list2Reactions = decodeReactions(list2Encoded);
+ const list1Reactions = decodeReactionsCompact(list1Encoded, allMovies);
+ const list2Reactions = decodeReactionsCompact(list2Encoded, allMovies);

  // ... rest of the code ...
</script>
```

**Step 2.4: Update SavedListDrawer.astro (if it has any encoding logic)**

Check if this component has any direct encoding calls. If so, update them.

---

### Phase 3: Test Integration (20 min)

**Step 3.1: Manual testing**

1. Start dev server: `pnpm dev`
2. Navigate to a session list (e.g., `/s/tenement-stories/list`)
3. Mark several movies with different reactions
4. Click "Share" button
5. Verify URL is generated and copied
6. Check URL length (should be ~60 chars instead of 150+)
7. Open URL in new tab/incognito
8. Verify shared list displays correctly
9. Mark some movies in the shared view
10. Click "Compare with my list"
11. Verify comparison works

**Step 3.2: Edge cases**

Test these scenarios:
- Empty list (no reactions) → should show "No movies in this list"
- Single reaction → should work
- All movies marked → should work
- Large list (50+ movies, 30+ reactions) → should work

**Step 3.3: Backward compatibility (optional)**

If you want to support old shared links, add a fallback:

```typescript
// In saved.astro
function decodeReactionsSmart(encoded: string, allMovies: UniqueMovie[]): ReactionMap {
  if (!encoded) return {};

  // Try new format first
  try {
    const decoded = decodeReactionsCompact(encoded, allMovies);
    if (Object.keys(decoded).length > 0) return decoded;
  } catch (e) {
    console.log('New format failed, trying old format:', e);
  }

  // Fallback to old format
  try {
    return decodeReactions(encoded);
  } catch (e) {
    console.error('Both decoders failed:', e);
    return {};
  }
}

const friendReactions = decodeReactionsSmart(encodedReactions, allMovies);
```

---

### Phase 4: URL Structure Verification (10 min)

**Step 4.1: Verify all routes use correct URL pattern**

Search for any hardcoded URLs and update them:

```bash
# Search for old /session/ routes
rg "/session/" src/

# Search for URL generation
rg "list/saved" src/
rg "/compare/" src/
```

**Expected URLs:**
- Share: `/s/{id}/list/saved?u={userId}&r={compact}`
- Compare: `/s/{id}/compare/{list1}/{list2}`

**Step 4.2: Update any links in components**

Check:
- SavedListDrawer.astro
- BottomToolbar.astro
- Any navigation components

---

### Phase 5: Build & Deploy Verification (10 min)

**Step 5.1: Build test**

```bash
pnpm build
```

Verify:
- No TypeScript errors
- No import errors
- Build completes successfully

**Step 5.2: Preview build**

```bash
pnpm preview
```

Test the production build:
- Share functionality works
- URLs are compact
- Decoding works in preview mode

---

## File Checklist

### Files to Modify

- [ ] `src/pages/s/[id]/list/index.astro` - Update encoding in share button
- [ ] `src/pages/s/[id]/list/saved.astro` - Update decoding for shared view
- [ ] `src/pages/s/[id]/compare/[...lists].astro` - Update comparison decoding

### Files to Review (may need updates)

- [ ] `src/components/session/SavedListDrawer.astro` - Check for encoding logic
- [ ] `src/components/session/BottomToolbar.astro` - Check for URL generation

### Files Created (already done)

- [x] `src/utils/compactEncoder.ts` - Core library
- [x] `src/utils/compactEncoder.test.ts` - Tests
- [x] `src/utils/encodingComparison.test.ts` - Comparison tests
- [x] `vitest.config.ts` - Test configuration
- [x] Documentation files

---

## Validation

### Before Integration

Current behavior:
```
Share → encodeReactions → "bG9uZXNvbWU6eSx0YXhpOm0=" (44 chars)
Decode → decodeReactions → {lonesome: 'yes', taxi: 'maybe'}
```

### After Integration

New behavior:
```
Share → encodeReactionsCompact → "AwABAjk=" (8 chars)
Decode → decodeReactionsCompact → {lonesome: 'yes', taxi: 'maybe'}
```

### Success Criteria

✓ Share button generates compact URLs
✓ Compact URLs decode correctly
✓ Movie lists display properly
✓ Comparison feature works
✓ Empty lists handled gracefully
✓ URL length reduced by 80%+
✓ No console errors
✓ Build passes

---

## Rollback Plan

If something breaks:

1. Revert changes:
   ```bash
   git restore src/pages/s/[id]/list/index.astro
   git restore src/pages/s/[id]/list/saved.astro
   git restore src/pages/s/[id]/compare/[...lists].astro
   ```

2. Old links will work (if you kept backward compatibility)

3. Debug with:
   ```typescript
   console.log('Encoding input:', reactions);
   console.log('Encoded output:', encoded);
   console.log('Decoding input:', encodedReactions);
   console.log('Decoded output:', friendReactions);
   ```

---

## Future Enhancements

After successful integration, consider:

### Phase 6: PIN Protection (Future)

Add optional encryption:

```typescript
// When sharing with PIN
const pin = prompt('Set a PIN (optional, leave empty for public):');
if (pin) {
  const encrypted = await encryptReactions(encoded, pin);
  const url = `/s/${sessionId}/list/saved?u=${userId}&r=${encrypted}&s=1`;
} else {
  const url = `/s/${sessionId}/list/saved?u=${userId}&r=${encoded}`;
}

// When viewing secured list
if (urlParams.get('s') === '1') {
  const pin = prompt('Enter PIN to view:');
  const decrypted = await decryptReactions(encodedReactions, pin);
  const friendReactions = decodeReactionsCompact(decrypted, allMovies);
}
```

Implementation: See `ENCODING.md` for Web Crypto API details.

### Phase 7: Server Storage (Optional)

If collaborative editing is needed:

1. Create API endpoint to store encrypted blobs
2. Generate random 6-char IDs
3. Store: `{id: "abc123", encrypted: "...", metadata: {...}}`
4. URL: `/s/{id}/list/abc123`
5. Client decrypts with PIN

---

## Time Estimates

- Phase 1 (Debug): 15 min
- Phase 2 (Integration): 30 min
- Phase 3 (Testing): 20 min
- Phase 4 (Verification): 10 min
- Phase 5 (Build): 10 min

**Total: ~90 minutes**

With buffer for unexpected issues: **2 hours**

---

## Questions to Resolve

Before starting implementation:

1. **Backward compatibility:** Support old links or break them?
   - Option A: Clean break (simpler)
   - Option B: Support both (user-friendly)

2. **Debug logging:** Keep or remove after testing?
   - Recommend: Remove in production, keep in dev mode

3. **PIN protection:** Implement now or later?
   - Recommend: Later (separate PR)

4. **URL shortening:** Needed?
   - Probably not - compact encoding is already short enough

---

## Ready to Start?

1. Choose backward compatibility strategy
2. Start with Phase 1 (Debug)
3. Verify current behavior
4. Proceed to Phase 2 (Integration)
5. Test thoroughly
6. Commit and push

Let me know when you're ready and I'll start the implementation!
