---
name: devlog
description: Update the development log with progress notes, patterns, and learnings. Use after completing significant work or learning something important.
disable-model-invocation: true
model: opus
---

# Development Log Update

Reflect on the recent development work and update `devlog.md` with meaningful notes.

## Your Task

1. **Review recent changes**
   - Check `git log --oneline -20` for recent commits
   - Read recent conversation context for what was accomplished

2. **Reflect on multiple levels**
   - **Progress**: What features/fixes were implemented?
   - **Patterns**: What architectural patterns or code patterns emerged?
   - **Learnings**: What was learned? Any mistakes corrected? Process improvements?
   - **Meta**: Any insights about the development process itself?

3. **Update devlog.md**
   - Add a new dated section at the top (after the title)
   - Follow the existing format with Overview, Key Changes, Files Modified sections
   - Include both technical details AND meta-level reflections
   - Be concise but capture what would be valuable to remember

## Format

```markdown
## YYYY-MM-DD: [Descriptive Title]

### Overview
Brief summary of what was accomplished.

### Key Changes
1. **Change Category**
   - Details

### Patterns & Learnings
- Any meta-level insights, process improvements, or lessons learned

### Files Modified
- List of key files changed
```

## Guidelines

- Focus on what would be valuable to remember later
- Capture "why" decisions, not just "what" changes
- Include learnings that were encoded in CLAUDE.md
- Note any new patterns established for future reference
