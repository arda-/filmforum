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

2. **Clear messages**:
   - First line: concise summary of what changed
   - Body (if needed): explain why, not what
   - End with Co-Authored-By line

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
