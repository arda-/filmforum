# User Preferences & Workflow Patterns

This file contains preferences for how Claude Code should work in this repository.

## Communication Style

- **Concise updates**: Brief status updates, no verbose explanations unless asked
- **Parallel execution**: When multiple tasks can run in parallel, launch them all at once
- **Background agents**: Use background agents liberally for independent work
- **No time estimates**: Don't provide time estimates for tasks

## Agent Memory & Concurrency

**CRITICAL RULES:**
- **Maximum 3 concurrent agents** at any time
- **Per-agent memory**: ~4.4GB (observed max)

### When to Use Agents

1. **Can I do this directly?** (without agents)
   - Simple file edits → Use Read/Edit/Write
   - Single component → Do it directly

2. **How many concurrent agents will I spawn?**
   - 1-2 tasks → Do it directly (no agents)
   - 3-5 tasks → 1-to-1 (3-5 agents, one per task)
   - 6+ tasks → Batch strategically (max 3 concurrent)

## Code Review Standards

**Tone:** Professional, factual, engineer-to-engineer.

**Include:**
- What changed (factual list with line counts)
- Issues found (specific line refs, severity: blocking/non-blocking)
- Test results (numbers, pass/fail)
- Recommendation (merge/needs-work + rationale)

**Example:**
```markdown
## Changes

- Added 50 unit tests for auth module
- Fixed race condition in request handler
- Improved error messages

## Issues

None. All tests pass, build succeeds.

## Recommendation

Merge. Test coverage improved from 60% to 75%.
```

## Commit Message Style

- **Format**: Imperative mood ("Add feature" not "Added feature")
- **Length**: Title ≤ 70 chars, body ≤ 80 chars per line
- **Content**: Focus on "why" not just "what"

## File Organization

- Keep related files together by domain
- Use clear naming that reflects purpose
- Avoid deep nesting (max 3 levels deep typically)

