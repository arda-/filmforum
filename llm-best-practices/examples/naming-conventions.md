# Phase.Domain.Step Naming Convention

## Overview

This project uses a **hierarchical naming system** for organizing work across branches, worktrees, and PRs. The system ensures:
- Clear dependency tracking
- Parallel vs sequential work identification
- Consistent naming across all project artifacts
- Easy visualization of work structure

## Format

```
Phase.Domain.Step
```

### Components

| Component | Description | Example Values | Rules |
|-----------|-------------|----------------|-------|
| **Phase** | Major milestone or project phase | `1-mvp`, `2-auth`, `3-perms` | Always sequential (1 → 2 → 3) |
| **Domain** | Functional area within a phase | `1-schema`, `2-apis`, `3-cells`, `4-datatable`, `5-testing` | Can run in parallel within same phase |
| **Step** | Specific work unit within domain | `1`, `2`, `3` (sequential) or `3A`, `3B`, `3C` (parallel) | Sequential or parallel group |

## Level Definitions

### Phase (Sequential)

Phases represent major project milestones and **must be completed sequentially**.

**Current Phases:**
- `1-mvp` - Core database, APIs, and UI foundation
- `2-auth` - Supabase Auth implementation
- `3-perms` - Permissions and RLS policies
- `4-polish` - UX improvements (keyboard, clipboard, undo/redo)
- `5-audit` - Audit log, snapshots, webhooks
- `6-filtering` - Advanced filtering and sorting UI
- `7-crud` - Type-aware CRUD modals
- `8-views` - Additional views (Gallery, Kanban, Calendar)
- `9-forms` - Form builder with conditional logic
- `10-integrations` - REST API, Zapier, webhooks

**Example:** Phase `2-auth` cannot start until Phase `1-mvp` is complete.

### Domain (Parallel within Phase)

Domains represent functional areas within a phase. Multiple domains **can run in parallel** if they don't have dependencies.

**Phase 1 Domains:**
- `1-schema` - Database schema and migrations
- `2-apis` - Backend API routes
- `3-cells` - Cell renderer components
- `4-datatable` - DataTable integration
- `5-testing` - Test infrastructure and E2E tests

**Parallelization Rules:**
- `1-schema` must complete before `2-apis` (APIs depend on schema)
- `2-apis` and `3-cells` can run in parallel (independent)
- `4-datatable` depends on both `2-apis` and `3-cells`
- `5-testing` can run parallel to everything (test infrastructure)

**Example:** `1-mvp.2-apis.3-columns` and `1-mvp.3-cells.2-validation` can be developed simultaneously.

### Step (Sequential or Parallel)

Steps represent specific work units within a domain.

**Sequential Steps:**
```
1-mvp.2-apis.1-workspaces  (must complete first)
1-mvp.2-apis.2-tables      (then this)
1-mvp.2-apis.3-columns     (then this)
1-mvp.2-apis.4-records     (finally this)
```

**Parallel Steps (using letter suffix):**
```
1-mvp.3-cells.3A-accessibility  (can run parallel)
1-mvp.3-cells.3B-validation     (can run parallel)
1-mvp.3-cells.3C-performance    (can run parallel)
1-mvp.3-cells.4-integration     (runs after 3A, 3B, 3C all complete)
```

**Rules:**
- Same number = sequential (1 → 2 → 3 → 4)
- Same number with letters = parallel group (3A, 3B, 3C all at step 3)
- All parallel steps in a group must complete before next sequential step
- Letter suffix is only for parallelization within same step number

## Naming Patterns

### Branch Names

```
feature/{Phase}.{Domain}.{Step}-{description}
```

**Examples:**
```bash
feature/1-mvp.1-schema.1-database
feature/1-mvp.2-apis.3-columns
feature/1-mvp.3-cells.3A-accessibility
feature/1-mvp.3-cells.3B-validation
feature/1-mvp.4-datatable.1-integration
```

### Worktree Directories

```
datatable-{Phase}.{Domain}.{Step}
```

**Examples:**
```bash
datatable-1-mvp.1-schema.1-database/
datatable-1-mvp.2-apis.3-columns/
datatable-1-mvp.3-cells.3A-accessibility/
datatable-1-mvp.3-cells.3B-validation/
```

### Pull Request Titles

```
{Phase}.{Domain}.{Step}: {Description}
```

**Examples:**
```
1-mvp.1-schema.1: Database foundation with two-schema design
1-mvp.2-apis.3: Columns API with validation
1-mvp.3-cells.3A: Accessibility improvements for cell renderers
1-mvp.3-cells.3B: Validation logic for cell types
```

### Commit Messages

For work that spans multiple steps or is purely organizational:

```
{Phase}.{Domain}: {Description}
```

**Examples:**
```
1-mvp.3-cells: Add Phase.Domain.Step naming convention
1-mvp.2-apis: Refactor API error handling
```

For step-specific work:
```
{Phase}.{Domain}.{Step}: {Description}
```

## Complete Phase 1 Example

### Dependency Graph

```
Phase 1 (1-mvp)
│
├─ Domain 1: Schema (1-schema)
│  ├─ 1-database (foundations)
│  ├─ 2-types (data types)
│  └─ 3-migrations (migration system)
│
├─ Domain 2: APIs (2-apis)
│  │  Depends on: 1-schema complete
│  ├─ 1-workspaces
│  ├─ 2-tables
│  ├─ 3-columns
│  └─ 4-records
│
├─ Domain 3: Cells (3-cells)
│  │  Can run parallel to 2-apis
│  ├─ 1-infrastructure
│  ├─ 2-renderers
│  ├─ 3A-accessibility  ┐
│  ├─ 3B-validation     ├─ Parallel group at step 3
│  ├─ 3C-performance    ┘
│  └─ 4-integration (depends on 3A, 3B, 3C)
│
├─ Domain 4: DataTable (4-datatable)
│  │  Depends on: 2-apis complete AND 3-cells complete
│  ├─ 1-integration
│  ├─ 2-keyboard
│  └─ 3-clipboard
│
└─ Domain 5: Testing (5-testing)
   │  Can run parallel to everything
   ├─ 1-unit
   ├─ 2-integration
   └─ 3-e2e
```

### Example Work Flow

**Scenario:** Developer wants to add accessibility features to cell renderers.

1. **Identify position:** `1-mvp.3-cells.3A`
   - Phase: `1-mvp` (we're in Phase 1)
   - Domain: `3-cells` (working on cell renderers)
   - Step: `3A` (accessibility is parallel to 3B validation)

2. **Create branch:**
   ```bash
   git checkout -b feature/1-mvp.3-cells.3A-accessibility
   ```

3. **Create worktree:**
   ```bash
   git worktree add ../datatable-1-mvp.3-cells.3A-accessibility feature/1-mvp.3-cells.3A-accessibility
   ```

4. **Open PR:**
   - Title: `1-mvp.3-cells.3A: Accessibility improvements for cell renderers`
   - Description mentions it can run parallel to `3B-validation`

5. **After merge:** Can proceed to step 4 only if both 3A and 3B are complete

## Migration from Old System

### Old Format → New Format

| Old Name | New Format | Notes |
|----------|------------|-------|
| `feature/phase-01-a1-database` | `feature/1-mvp.1-schema.1-database` | Phase 1, Domain 1 (Schema), Step 1 |
| `feature/phase-01-b2-tables-api` | `feature/1-mvp.2-apis.2-tables` | Phase 1, Domain 2 (APIs), Step 2 |
| `feature/phase-01-d-cell-renderers` | `feature/1-mvp.3-cells.2-renderers` | Phase 1, Domain 3 (Cells), Step 2 |
| `datatable-track-d/` | `datatable-1-mvp.3-cells.2-renderers/` | Worktree uses same format |

### Migration Steps

1. **Identify old branch position** in dependency chain
2. **Map to Phase** (usually `1-mvp` for current work)
3. **Map to Domain:**
   - Track A → `1-schema` (database schema)
   - Track B → `2-apis` (backend APIs)
   - Track C → `1-schema` or `2-apis` (depending on context)
   - Track D → `3-cells` (cell renderers)
   - Track E → `4-datatable` (DataTable integration)
4. **Assign Step number** based on dependency order
5. **Add letter suffix** if work runs parallel to other steps

## Visualization Examples

### Sequential Work

```
1-mvp.2-apis.1 → 1-mvp.2-apis.2 → 1-mvp.2-apis.3 → 1-mvp.2-apis.4
(workspaces)     (tables)         (columns)        (records)
```

Each step must complete before the next begins.

### Parallel Work

```
                     ┌─ 1-mvp.3-cells.3A-accessibility ─┐
                     │                                  │
1-mvp.3-cells.2 ────┼─ 1-mvp.3-cells.3B-validation    ─┼──→ 1-mvp.3-cells.4
                     │                                  │
                     └─ 1-mvp.3-cells.3C-performance ───┘
```

All parallel steps (3A, 3B, 3C) can run simultaneously and must complete before step 4.

### Cross-Domain Dependencies

```
1-mvp.1-schema.2
     ↓
1-mvp.2-apis.1 ────→ 1-mvp.2-apis.2 ────→ 1-mvp.2-apis.4
     ↓                                          ↓
1-mvp.3-cells.1 ───→ 1-mvp.3-cells.2 ─────────┤
                                                ↓
                                      1-mvp.4-datatable.1
```

DataTable integration depends on both APIs and Cells being complete.

## Benefits

1. **Clear Dependencies:** Easily see what must complete before starting new work
2. **Parallel Identification:** Letter suffixes immediately show parallel work
3. **Consistent Naming:** Same format across branches, worktrees, PRs, and commits
4. **Scalable:** Works for any project size and complexity
5. **Visual:** Can be easily graphed and visualized
6. **Searchable:** `git branch --list "feature/1-mvp.3-cells.*"` finds all cell work

## Quick Reference

```bash
# Format
{Phase}.{Domain}.{Step}

# Branch
feature/1-mvp.3-cells.3A-accessibility

# Worktree
datatable-1-mvp.3-cells.3A-accessibility/

# PR Title
1-mvp.3-cells.3A: Accessibility improvements for cell renderers

# Commit (organizational)
1-mvp.3-cells: Add Phase.Domain.Step naming convention

# Find all branches in a domain
git branch --list "feature/1-mvp.3-cells.*"

# Find all parallel work at step 3
git branch --list "feature/1-mvp.3-cells.3?-*"
```
