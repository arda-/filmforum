# Share List Authentication & Compare

## Problem
Currently, shared lists (`/s/[id]/shared?u=...&r=...`) don't have user authentication. Anyone viewing a shared link can see and modify reactions, but there's no way to:
1. Identify yourself when viewing someone else's list
2. Save your own reactions for comparison
3. Compare your list with your friend's list
4. Prevent unauthorized editing of the original list

## Proposed Solution

### User Identity System
- **PIN-based naming**: When first viewing a shared list, prompt for a name/nickname
- Store user identity in localStorage with a PIN or simple auth token
- Associate reactions with user identity
- Allow "naming" yourself so shared lists can show "John's picks" vs "Sarah's picks"

### Compare View (`/s/[id]/compare`)
- Display two lists side-by-side or in sections:
  - **Friend's List**: Original shared list (read-only snapshot from URL)
  - **Your List**: Your reactions from localStorage
- Highlight:
  - Movies you both said "Yes" to (matches)
  - Movies with conflicting opinions
  - Movies only one person reacted to
- Quick stats: "You both want to see 5 movies", "3 disagreements", etc.

### Share Flow
1. You share: `/s/[id]/shared?u=yourId&r=encodedReactions`
2. Friend opens link, prompted: "What's your name?" → stores as "Friend"
3. Friend marks their reactions → saved to localStorage with their identity
4. Friend clicks "Compare" → shows both lists side-by-side
5. Friend can share back their list to you

### Technical Approach
- Use URL params for shared reactions (current: `?u=userId&r=encoded`)
- Add `localStorage` entry: `{ userId: 'abc123', name: 'John' }`
- Compare view: decode URL reactions + read localStorage reactions
- PIN system: optional 4-digit PIN stored with userId for "claiming" a shared list

## Example Flow
```
Alice creates list → shares to Bob
Bob opens link → enters name "Bob" → marks his reactions
Bob clicks "Compare" → sees:
  - Alice's picks (from URL)
  - Bob's picks (from localStorage)
  - Overlap/differences highlighted
Bob shares his list back to Alice
Alice opens Bob's link → comparison view
```

## Future Enhancements
- Multi-way compare (3+ people)
- Group list aggregation ("Most wanted by group")
- Export comparison as image/PDF
- Anonymous mode (no name required)
- "Clone this list" button to start from someone else's picks

## Related Files
- `/src/pages/s/[id]/shared.astro` - Shared list view
- `/src/pages/s/[id]/list/saved.astro` - Your cart/saved list
- `/src/pages/s/[id]/compare/` - Future compare view
- `/src/utils/storageManager.ts` - User identity storage
