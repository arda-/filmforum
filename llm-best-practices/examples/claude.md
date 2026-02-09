# CLAUDE.md

This file provides guidance for AI assistants working on this codebase.

## Conversation Awareness

### When You Ask for Permission or Input

**CRITICAL: If you ask the user a question, you MUST wait for their response before proceeding.**

When you ask for permission, confirmation, or input:
- **STOP and WAIT** - do not make any more tool calls until the user responds
- **Never proceed with the action you asked about** - asking "Would you like me to X?" and then doing X anyway is completely unacceptable
- **Respect stop hooks** - if a stop hook fires, STOP ALL WORK until user explicitly gives permission to continue
- **No assumptions** - silence or delay does not mean "yes", it means wait

**Examples:**

❌ **Wrong:**
```
Agent: "Would you like me to commit this change to the branch?"
Agent: [immediately commits and pushes without waiting for response]
```

✅ **Correct:**
```
Agent: "Would you like me to commit this change to the branch?"
[WAITS for user response]
User: "Yes, go ahead"
Agent: [now commits and pushes]
```

### When User Raises Concerns

When the user raises concerns about approach or design:
- **STOP executing immediately** - no more tool calls until the concern is addressed
- Engage with their concern fully before any more work
- "This smells wrong", "this feels bad", or similar = halt and discuss, don't acknowledge and continue
- The user's input is the priority, not your current task queue
- When in doubt, ask questions rather than continue working

### When User Is Asking vs. Directing

**These phrases mean "analyze and discuss", NOT "implement":**
- "tell me about..."
- "question for you..."
- "what do you think about..."
- "how should we approach..." (when asked as an opening question)
- "I'm curious about..."
- "help me understand..."

**When you see these:**
1. Provide analysis and discussion first
2. Do NOT create todo lists or start planning during analysis
3. Do NOT make any code changes
4. After analysis, ask "Would you like me to implement this?"

**Examples:**

❌ **Wrong:**
```
User: "Tell me about adding dark mode"
Agent: "I'll create a todo list for dark mode..."
[Creates TodoWrite with implementation tasks]
```

✅ **Correct:**
```
User: "Tell me about adding dark mode"
Agent: "Dark mode typically involves: [analysis]...
        Would you like me to implement this?"
```

**When uncertain whether user wants discussion or action: default to discussion.**

### When User Redirects Your Approach

When the user suggests a different approach mid-task:
- **STOP current work immediately** - acknowledge their suggestion before continuing
- **Respond to the user's question or suggestion** - don't ignore it to finish current work
- **Never continue with your original approach after user redirects you**
- User's input is the priority, not completing your current task queue

**When redirected:** STOP → ACKNOWLEDGE → SWITCH to their approach.

❌ **Wrong:** User suggests a different approach; agent ignores it and continues with original plan.
✅ **Correct:** Agent stops, acknowledges the suggestion, and adopts the new approach.

### When to Use Parallel Subagents

**Before starting any multi-step work, check:**
- Are there multiple independent tasks that can run concurrently?
- Could I use parallel Task calls instead of sequential work?
- Did the user explicitly ask for parallel execution?

**If yes to any:**
1. Use parallel subagents by making multiple Task calls in a single message
2. Never do sequential work when parallel is possible and beneficial
3. When user asks "can you parallelize this?", the answer is almost always yes

See `sops/sop-parallel-agents.md` for detailed patterns and examples.

### When Implementing PR Feedback

When asked to implement changes related to a PR (e.g. review suggestions, requested fixes):
- **Always checkout the PR branch first** — run `gh pr view <number> --json headRefName` to find it
- **Never commit PR-related changes directly to main**
- If unsure which branch to use, ask before committing

## Project Context

This is an **Airtable clone** with a dynamic schema system. Users can create their own tables and columns with type-safe storage.

**Important**: Read `.cursor/plans/airtable_clone_6-month_roadmap_976c2338.plan.md` for the full roadmap and target architecture.

## Current Architecture

### Database Schema (Two-Layer Design)

The database uses two PostgreSQL schemas:

| Schema | Purpose | Contents |
|--------|---------|----------|
| `public` | System metadata | `workspaces`, `user_tables`, `user_columns` |
| `user_data` | User data | `ut_*` tables (dynamically created) |

**Key patterns:**
- **Metadata tables** describe what users created (table names, column types, config)
- **Dynamic tables** (`ut_<table_uuid>`) store actual user data
- **DDL functions** use `SECURITY DEFINER` to create/modify user tables
- **RLS policies** enforce ownership-based access control

See `docs/architecture/` for detailed documentation:
- `docs/architecture/README.md` - System overview
- `docs/architecture/database-schema.md` - Complete schema reference
- `docs/architecture/dynamic-tables.md` - How dynamic tables work

### Core Components

**What we have:**
- DataTable component with Excel-like grid
- TanStack Table/Query integration
- Zustand stores for UI state
- Shadcn UI components
- Zod validation schemas
- Dynamic schema system with 15 data types
- API routes for workspaces, tables, columns, records

**What's coming:**
- Supabase Auth (replacing NextAuth)
- Full permissions and RLS
- Views (Gallery, Kanban, Calendar)
- Forms, API keys, integrations

## Development Environment

- **Package manager**: pnpm (use `pnpx` for one-off commands)
- **Supabase**: Cloud-hosted instance (NOT local Docker)
  - Do NOT use `supabase db reset` or other local Docker commands
  - Apply schema changes via Supabase Dashboard SQL Editor or `supabase db push`

### Git Worktrees

Use worktrees for parallel work on multiple features/tracks.

**Use the worktree-setup agent** (recommended):
```
Task tool with subagent_type: "worktree-setup"
Prompt: "Create worktree for <feature> based on <base-branch>"
```

**Or manually:**
```bash
# Create worktree
git worktree add ../datatable-feature-name -b feature/branch-name base-branch

# REQUIRED: Setup the new worktree
cp .env.local ../datatable-feature-name/
cd ../datatable-feature-name && pnpm install
```

**Cleanup after merge:**
```bash
git worktree remove ../datatable-feature-name
git worktree prune
```

See `.claude/preferences.md` for detailed workflow preferences (agent limits, PR conventions, review patterns).

## CRITICAL: Pre-Push Checklist

**NEVER push broken builds to open PRs.** Before every push:

```bash
pnpm build          # Must pass with zero errors
pnpm test           # Must pass all tests
pnpm lint           # Should pass (fix warnings)
```

If any of these fail, debug and fix locally BEFORE pushing. Pushing broken builds wastes CI budget and blocks PR review.

## Commands

```bash
pnpm dev          # Start dev server (Turbopack)
pnpm build        # Production build
pnpm test         # Run Vitest tests
pnpm test:watch   # Tests in watch mode
pnpm lint         # ESLint
```

## CRITICAL: Pre-Push Validation

**ALWAYS validate locally before committing/pushing to avoid wasting CI budget.**

### Required Before Every Push
```bash
# Quick validation (lockfile + build)
pnpm run validate:quick

# If passes, safe to push
git push
```

### Before Opening PR
```bash
# Full validation (lockfile + build + lint + tests)
pnpm run validate
```

### After Switching Branches or Merging
```bash
# Always reinstall to update lockfile
pnpm install

# Check if lockfile changed and commit it
git status pnpm-lock.yaml
```

**Common issue:** Lockfile out of sync with package.json causes Vercel build failures.
**Solution:** Run `pnpm run validate:lockfile` to catch this locally.

See `CONTRIBUTING.md` for full details.

## Code Patterns to Follow

### State Management
- **Server state**: TanStack Query with optimistic updates
- **UI state**: Zustand stores (`useGridStore`, `useSelectionStore`)
- **Table config**: `useDataTable` hook wraps TanStack Table

### Component Conventions
- Use `"use client"` for client components
- Shadcn UI primitives in `src/components/ui/`
- Use `cn()` from `src/lib/utils` for conditional classes
- Zod schemas for all data validation

### DataTable Specifics
- Column 0 is always row numbers (skip for data operations)
- `useGridStore` tracks active cell, selection, editing state
- `flushSnapshot()` commits edits on blur/Enter
- Typing in a focused cell opens inline editor immediately

### API Route Pattern
```typescript
// Dynamic tables system:
// - /api/workspaces - Workspace CRUD
// - /api/tables/[id] - Table CRUD (creates ut_* tables via DDL functions)
// - /api/columns/[id] - Column CRUD (alters ut_* tables)
// - /api/records/[tableId] - Generic CRUD on any user table
// Validated with Zod before write
```

## Key Files

| File | What It Does |
|------|--------------|
| `src/components/DataTable.tsx` | Core Excel-like grid (selection, editing, keyboard) |
| `src/lib/queries.ts` | TanStack Query hooks for data fetching |
| `src/lib/queries/dynamic-tables.ts` | TanStack Query hooks for dynamic schema |
| `src/stores/useGridStore.ts` | Active cell, selection, editing state |
| `src/hooks/useDataTable.ts` | TanStack Table configuration |
| `src/lib/supabase/` | Supabase client and helpers |
| `src/lib/schemas/` | Zod validation schemas for all data types |
| `docs/architecture/` | Database schema and system documentation |

## Testing

- Vitest for unit tests
- Mock Supabase client in tests
- Mock auth with `vi.mock("@/auth")`
- Test files in `src/__tests__/` directory

## Gotchas

1. **Row number column**: Always index 0, don't include in data operations
2. **Selection vs Active Cell**: Selection is a range, active cell is single focus
3. **Optimistic updates**: TanStack Query handles rollback on error
4. **Column sizing**: Persisted to localStorage, not server

## Roadmap Phases (Summary)

See `.cursor/plans/airtable_clone_6-month_roadmap_976c2338.plan.md` for details:

1. **Phase 1**: Supabase + dynamic schema + data types - **IN PROGRESS** (database foundation complete)
2. **Phase 2**: Supabase Auth (email/password + Google)
3. **Phase 3**: Permissions, RLS, API keys
4. **Phase 4**: DataTable polish (keyboard, clipboard, undo/redo)
5. **Phase 5**: Audit log, snapshots, webhooks
6. **Phase 6**: Filtering and sorting UI
7. **Phase 7**: Type-aware CRUD modals
8. **Phase 8**: Views (Grid, Gallery, Kanban, Calendar, Charts)
9. **Phase 9**: Form builder with conditional logic
10. **Phase 10**: REST API, Zapier, integrations

### Phase 1 Progress

Completed:
- Two-schema database design (`public` + `user_data`)
- System tables: workspaces, user_tables, user_columns
- DDL functions with SECURITY DEFINER for dynamic table/column operations
- RLS policies on all system tables
- 15 data type implementations with Zod schemas
- Cell renderers for Tier 1 data types
- API routes for workspaces, tables, columns, records
- TanStack Query hooks for dynamic tables
- Workspace/table/column management UI components

Remaining:
- Full integration testing
- DataTable integration with dynamic schema

**MVP target**: After Phase 3 (dynamic tables + auth + permissions)
