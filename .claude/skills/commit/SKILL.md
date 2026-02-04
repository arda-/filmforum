---
name: commit
description: Create atomic commits with clear messages. Use when committing code changes.
model: haiku
---

# Atomic Commit Helper

Create clean, atomic commits.

## Principles

1. **Atomic commits**: One logical change per commit
   - If changes touch multiple concerns, split them into separate commits
   - Each commit should be independently meaningful and reviewable
   - **Key test**: "Could this commit be reverted without breaking other changes?"

2. **Clear messages**:
   - First line: concise summary of what changed
   - Body (if needed): explain why, not what
   - End with Co-Authored-By line

3. **When to split commits**:
   - Creating a new component + refactoring existing code to use it = **2 commits**
   - New feature + demo/example of feature = **2 commits** (unless demo is trivial)
   - Styling + functionality changes = **2 commits** (unless they're inseparable)
   - Create + update unrelated files = **separate commits**

## Steps

1. Run `git status` and `git diff` to review all changes
2. Group changes by logical concern
3. For each logical group:
   - Stage only those files: `git add <specific-files>`
   - Commit with a clear message
4. Repeat until all changes are committed

## Message Format

```
Short summary of the change

Optional body explaining why this change was made,
not what was changed (the diff shows that).

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
```

## Anti-patterns to avoid

- Bundling unrelated changes in one commit
- Generic messages like "updates" or "fixes"
- Committing everything with `git add -A` without review
- Creating a component AND refactoring code to use it in same commit
- Adding a feature AND its demo page in same commit
- Style changes bundled with functionality changes

## Examples of proper splitting

### ❌ BAD: Single commit bundling two concerns
```
Create Button component and refactor dialog buttons

- Added Button.astro with variants
- Updated all dialog buttons to use Button
```

### ✅ GOOD: Two separate atomic commits
```
Commit 1: Create Button component
- New Button.astro with primary, secondary, danger variants
- Reusable across the codebase

Commit 2: Refactor dialog buttons to use Button component
- Replace manual button HTML with Button component
- Remove redundant button styles
```

### ✅ GOOD: Logical grouping when inseparable
```
Add Dialog composable components and demo updates

- Create DialogRoot/DialogHeader/DialogBody/DialogFooter/DialogSeparator
- Update all demo examples to use new components
(These are inseparable - the demo shows the feature)
