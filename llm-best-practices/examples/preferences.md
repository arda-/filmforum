# User Preferences & Workflow Patterns

This file contains user-specific preferences for how Claude Code should work in this repository.

## Git Worktrees for Parallel Work

**ALWAYS use git worktrees when working on multiple tracks/features in parallel.**

### When to Use Worktrees

Use worktrees whenever:
- Working on 2+ independent tracks from a phase plan
- Tasks can be completed in parallel without dependencies
- User wants to review/manage multiple branches simultaneously

### Standard Worktree Pattern

```bash
# Main repo (current directory)
/Users/ardaungun/code/datatable
Branch: feature/phase-XX-trackY-name

# Worktree for parallel track
git worktree add ../datatable-track-Z -b feature/phase-XX-trackZ-name phase-01
```

### Naming Convention

- Main directory: `datatable` (original repo)
- Worktree directories: `datatable-track-{letter}` or `datatable-{feature-name}`
- Branch names: `feature/phase-XX-{track}-{description}`

**See `naming-conventions.md` for complete branch naming conventions.**

### Example from Phase 1

**Track B.3 (Columns API):**
- Location: `/Users/ardaungun/code/datatable`
- Branch: `feature/phase-01-b3-columns-api`

**Track D (Cell Renderers):**
- Location: `/Users/ardaungun/code/datatable-track-d`
- Branch: `feature/phase-01-d-cell-renderers`

### Benefits

- Disk efficient (shares .git history)
- No context switching - each track isolated
- Can run builds/tests independently
- Easy to open multiple IDE windows
- Can run Claude Code in each directory separately
- Clean separation of concerns

### Cleanup After Merge

```bash
# After merging PRs
git worktree remove ../datatable-track-d
git worktree prune
```

## Communication Style Preferences

- **Concise updates**: Brief status updates, no verbose explanations unless asked
- **Parallel execution**: When multiple tasks can run in parallel, launch them all at once
- **Background agents**: Use background agents liberally for independent work
- **No time estimates**: Don't provide time estimates for tasks

## Agent Concurrency & Memory Limits

**CRITICAL RULES:**
- **Maximum 8 concurrent agents** at any time
- **Total memory limit**: Claude + Ghostty must stay under 32GB combined
- **Per-agent memory**: ~3GB average

### Agent Batching Strategy

When asked to create/process multiple similar items:
- **DON'T**: Spawn one agent per item (causes memory explosion)
- **DO**: Batch into 2-4 agents max, each handling multiple items

**Examples:**

Creating 5 cell components:
- ✅ 5 agents (1-to-1: TextCell, NumberCell, SelectCell, DateCell, BooleanCell)
- ❌ 2 agents with batching (premature optimization)

Creating 8 cell components:
- ✅ 6-7 agents (mostly 1-to-1, batch 2 similar ones like Text+Email)
- ❌ 3 agents (too aggressive batching)
- ❌ 8 separate agents (hitting limit unnecessarily)

Updating 12 phase plans:
- ✅ 6-7 agents (each handles 1-2 plans)
- ❌ 12 separate agents (exceeds limit)
- ❌ 3 agents (batching too early)

### Before Spawning Agents - Decision Tree

1. **Can I do this directly?** (without agents)
   - Simple file edits → Use Read/Edit/Write
   - Single component → Do it directly

2. **How many concurrent agents will I spawn?**
   - 1-2 tasks → Do it directly (no agents)
   - 3-5 tasks → 1-to-1 (3-5 agents, one per task)
   - 6-8 tasks → Mostly parallel (6-7 agents, start batching around 7)
   - 9+ tasks → Batch strategically (5-8 agents)
   - Never exceed 8 concurrent

3. **Should I explain my batching strategy?**
   - If batching (7+ tasks), briefly explain grouping logic
   - Example: "Batching by complexity: simple inputs together, complex pickers together"

## Planning Preferences

- **Create plans first**: For non-trivial implementation tasks, create detailed plans
- **Annotate parallelism**: Mark which tasks can run in parallel (PARALLEL-A, PARALLEL-B, etc.)
- **Track dependencies**: Clearly show Sequential vs Parallel groups

## Git Workflow

- Never force push or rebase without explicit approval
- Always validate builds (`pnpm build`) before pushing
- Run tests before committing
- Keep commit messages concise and descriptive
- Use conventional commit format when applicable

### PR Base Branch Targeting

**CRITICAL**: Always open PRs against their parent phase branch, NOT main/dev.

- Phase 1 work → target `phase-01` branch
- Phase 2 work → target `phase-02` branch
- Phase N work → target `phase-N` branch

**Examples:**
```bash
# ✅ CORRECT
gh pr create --base phase-01 --title "1-mvp.2-apis.3: Columns API"

# ❌ WRONG - Don't target main/dev
gh pr create --base main --title "..."
gh pr create --base dev --title "..."
```

**When using `gh pr create` without `--base` flag:**
- GitHub defaults to the repo's default branch (often `main` or `dev`)
- **ALWAYS explicitly specify `--base phase-01`** for Phase 1 PRs
- Or use: `gh pr create --base $(git config branch.$(git branch --show-current).merge | cut -d/ -f3)`

## Phase Work Organization

- Use worktrees for parallel tracks within a phase
- Each track gets its own branch and PR
- Merge tracks into phase-01 independently
- Keep phase-01 as stable integration branch

## Branch Naming Convention - Transition Period

**Current State:**
- Phase 1 integration branch: `phase-01` (legacy)
- Feature branches: Use `feature/1-mvp.X.Y-description` for ALL new work
- Existing PRs: Can continue with old naming until merged

**New Convention:**
- Phase branches: `1-mvp`, `2-auth`, `3-perms`, etc.
- Feature branches: `feature/Phase.Domain.Step-description`
- Examples:
  - `feature/1-mvp.2-apis.2-tables`
  - `feature/1-mvp.3-cells.3A-accessibility`

**Migration Strategy (Phase-Based):**
1. **Active Phase:** Old-format PRs can merge to `phase-01`
2. **All New Work:** Must use new format (`1-mvp.X.Y`)
3. **Phase Complete:** When all old-format PRs merged → rename `phase-01` → `1-mvp`
4. **Phase 2+:** Start with correct naming from day one (`2-auth`, `3-perms`, etc.)

**For New Branches:**
```bash
# ✅ NEW FORMAT (required for all new work)
git checkout -b feature/1-mvp.2-apis.2-tables phase-01
git worktree add ../datatable-1-mvp.2-apis.2-tables -b feature/1-mvp.2-apis.2-tables phase-01

# ❌ OLD FORMAT (legacy only, no new work)
git checkout -b feature/phase-01-b2-tables-api phase-01
```

See `naming-conventions.md` for full details.

## Review Agent Pattern

**IMPORTANT**: When spawning agents to review code/PRs:

1. **Analyze and evaluate** - Agent reviews code quality, tests, architecture
2. **Provide findings**:
   - ✅ What's good
   - ⚠️ What needs attention
   - 🚨 What must be fixed before merge
3. **Suggest next steps** - Recommendations for improvements or merge
4. **Wait for user confirmation** - NEVER automatically merge, commit, or modify code

Review agents are **read-only** and **advisory only**. All actions require explicit user approval.

### Code Review Standards

**Tone:** Professional, factual, engineer-to-engineer.

**Avoid:**
- Excessive praise ("excellent!", "amazing!", star ratings)
- Flowery language ("comprehensive", "thorough" overuse)
- Emoji overload
- Overly structured sections (Executive Summary, Impact Analysis, etc.)

**Include:**
- What changed (factual list with line counts)
- Issues found (specific line refs, severity: blocking/non-blocking)
- Test results (numbers, pass/fail)
- Recommendation (merge/needs-work/block + rationale)

**Good Example:**
```markdown
## Changes

- Added 126 unit tests for cell utils (src/__tests__/components/cells/utils.test.ts)
- Fixed RPC parameter naming in integration tests (3 files, 12 call sites)
- Made console warnings environment-aware (NODE_ENV !== 'production')

## Issues

None. All tests pass (427/428), build succeeds.

## Recommendation

Merge. Zero breaking changes, test coverage improved 72%.
```

**Bad Example:**
```markdown
⭐⭐⭐⭐⭐ EXCELLENT WORK!

## Executive Summary
I'm absolutely thrilled to present this comprehensive analysis...

## Impact Analysis
The extraordinary improvements in this PR...
```

Write for senior engineers who want facts, not cheerleading.

## AI-Generated Content Disclaimers

**IMPORTANT**: All AI-generated content (PR descriptions, code reviews, comments) must include a disclaimer.

### Required Format

At the bottom of all AI-generated content, add a single concise line:

```
🤖 Written by Claude Sonnet 4.5 (claude-sonnet-4-5-20250929) at 2026-01-30T06:45:00Z
```

**Format**: `🤖 Written by Claude Sonnet 4.5 ([model-id]) at [ISO-8601-timestamp]`

### Examples

**PR Description:**
```markdown
## Summary
[PR content...]

---

🤖 Written by Claude Sonnet 4.5 (claude-sonnet-4-5-20250929) at 2026-01-30T06:45:00Z
```

**Code Review Comment:**
```markdown
## Review Findings
[Review content...]

---

🤖 Written by Claude Sonnet 4.5 (claude-sonnet-4-5-20250929) at 2026-01-30T06:45:00Z
```

### When to Include

- ✅ PR titles and descriptions
- ✅ Code review comments
- ✅ Issue comments
- ✅ Commit messages (if automatically generated)
- ✅ Documentation generated by AI
- ❌ Code itself (use code comments if needed)
- ❌ Test output or logs

### Rationale

- **Transparency**: Users should know when interacting with AI
- **Accountability**: Clear attribution for generated content
- **Debugging**: Timestamp helps track when content was created
- **Ethics**: Industry best practice for AI transparency
