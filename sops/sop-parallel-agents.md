# SOP: Parallel Agent Workflow Methodology

**Version:** 1.0
**Date:** 2026-01-30
**Purpose:** Maximize development velocity through coordinated parallel agent execution

---

## Overview

This SOP defines the process for using multiple AI agents in parallel to complete complex development work faster. By identifying independent workstreams and running agents simultaneously, we can compress project timelines while maintaining quality.

**Key Principle:** Work that can be done in parallel, should be done in parallel.

---

## When to Use Parallel Agents

Use this methodology when:

✅ **Large project phases** with multiple independent tracks
✅ **Clear dependency chains** that can be parallelized
✅ **Well-defined tasks** with specific deliverables
✅ **Multiple PRs** needed for a single phase
✅ **Time-sensitive work** requiring fast completion

Don't use for:

❌ Highly interdependent tasks requiring sequential execution
❌ Exploratory work without clear requirements
❌ Single-file changes or simple bug fixes
❌ Work requiring constant human decision-making

---

## Process: 5-Step Workflow

### Step 1: Analyze & Decompose

**Goal:** Break down the project phase into independent tracks

1. **Read project documentation** (roadmap, plans, architecture docs)
2. **Identify remaining work** (check git history, PRs, status)
3. **Create dependency graph** showing task relationships
4. **Find critical path** (longest dependency chain)
5. **Identify parallel tracks** (tasks with no dependencies)

**Example from Phase 01:**
```
Remaining: 60% (7 tasks)
Critical Path: B.3 (Columns API) → B.4 (Records API)
Parallel Tracks:
  - Track B.3: Columns API (depends on completed work)
  - Track B.4: Records API (depends on completed work)
  - Track D.1: Cell Infrastructure (independent)
```

**Output:** List of tasks that can start immediately in parallel

---

### Step 2: Craft Agent Instructions

**Goal:** Write clear, complete instructions for each agent

Each agent instruction MUST include:

#### A. Context Section
- Phase/milestone status (X% complete)
- What's already done (link to PRs/commits)
- What depends on this work
- Why this task matters

#### B. Task Definition
1. Create/modify these specific files
2. Key features to implement
3. Implementation details and patterns to follow
4. Edge cases to handle

#### C. Quality Gates (CRITICAL)
```bash
## Quality Gates - MUST PASS BEFORE PR

Run these commands in order:
1. pnpm test     # All tests must pass
2. pnpm build    # Production build must succeed
3. pnpm lint     # No linting errors

IF ANY FAIL:
- Fix the issues
- Re-run all checks
- DO NOT create PR until all pass

ONLY create PR after all quality gates pass.
```

#### D. Testing Requirements
- Write unit tests for core logic
- Write integration tests for API/DB interactions
- Test edge cases and error conditions
- Minimum test count specified
- Coverage target if applicable

#### E. Reference Files
- Link to plan documents with section numbers
- Point to existing code to follow patterns
- Reference schema/type definitions
- Note what's already in place (DB functions, etc.)

#### F. Success Criteria
Clear checklist including:
- All code implemented
- Tests passing (X+ tests)
- Build passing
- Lint passing
- PR created with detailed description

#### G. PR Requirements
- Title format: "[Phase X Track Y]: Clear description"
- Description must include: summary, files changed, testing, breaking changes
- Target branch specified

---

### Step 3: Launch Agents in Parallel

**Goal:** Start all independent agents simultaneously

Launch all agents in a SINGLE message using multiple Task tool calls. This ensures true parallelism.

**Important Notes:**
- Agent IDs are returned for tracking
- Each agent works independently
- Agents are notified of progress automatically
- Don't check on agents unless needed (they'll notify when done)

---

### Step 4: Monitor & Quality Check

**Goal:** Verify agents complete work successfully

**While agents run:**
- System sends progress notifications (ignore unless investigating)
- Agents work autonomously
- Continue with other work

**When agents complete:**
1. **Verify quality gates passed**
   - Check that tests ran and passed
   - Check that build succeeded
   - Check that lint passed

2. **Check for duplicate work**
   - Verify the feature wasn't already implemented
   - Check git history for related commits
   - Stop agents if duplicating existing work

3. **Review agent output**
   - Read completion summary
   - Check files changed
   - Verify PR was created correctly

---

### Step 5: Code Review Process

**Goal:** Ensure code quality through automated review

After each PR is created, spawn a review agent:

#### Review Agent Instructions Template

```markdown
You are reviewing PR #X: [Title]

## Your Task

Perform a thorough code review and leave detailed comments on GitHub.

1. **Read all code changes** in the PR
2. **Analyze for:**
   - Code quality and maintainability
   - Type safety and TypeScript best practices
   - Security vulnerabilities (SQL injection, XSS, etc.)
   - Performance issues
   - Error handling completeness
   - Test coverage and quality
   - Adherence to project patterns
   - Breaking changes
   - Documentation completeness

3. **Check testing:**
   - Are there sufficient tests?
   - Do tests cover edge cases?
   - Are tests well-structured?
   - Is test data realistic?

4. **Leave review comments on GitHub:**
   - Use gh CLI to comment on the PR
   - Be specific: reference file names and line numbers
   - Explain WHY something should change
   - Provide code examples for suggestions
   - Group related comments
   - Highlight positives too (good patterns, clever solutions)

5. **Create summary comment:**
   - Overview of findings
   - Critical issues (must fix)
   - Suggestions (nice to have)
   - Positives (good work)
   - Overall assessment
   - **Include AI disclaimer footer** (see format below)

6. **Add AI disclaimer footer:**
   ```markdown
   ---

   🤖 Written by Claude Sonnet 4.5 (claude-sonnet-4-5-20250929) at [ISO-8601-timestamp]
   ```
   Replace `[ISO-8601-timestamp]` with actual timestamp (e.g., `2026-02-01T10:15:30Z`)

## IMPORTANT: Review Only

- You ANALYZE and COMMENT only
- You DO NOT approve or request changes
- You DO NOT merge the PR
- Human (user) makes final approval decision
- Your job: Provide thorough analysis to inform decision

## Reference Files
- Project patterns: CLAUDE.md, CONTRIBUTING.md
- Code standards: .eslintrc, tsconfig.json
- Similar code: [point to examples]

## Success Criteria
- All aspects analyzed thoroughly
- Comments posted to GitHub PR
- Summary comment posted
- Specific, actionable feedback provided
```

#### Review Agent Workflow

1. **Spawn review agent** after PR created
2. **Agent analyzes code** comprehensively
3. **Agent posts comments** on GitHub PR
4. **User reviews** agent's analysis
5. **User approves** or requests changes
6. **User merges** when ready

**Key Point:** Review agents provide analysis and comments only. Human approval is always required.

**AI Disclaimer Requirement:**

All review comments and PR feedback MUST include the standard AI disclaimer footer:

```markdown
---

🤖 Written by Claude Sonnet 4.5 (claude-sonnet-4-5-20250929) at [ISO-8601-timestamp]
```

**Format:** Use the exact format from `.claude/preferences.md` > "AI-Generated Content Disclaimers"

---

## Quality Gates Summary

Every agent MUST pass these gates before creating PR:

| Gate | Command | Requirement |
|------|---------|-------------|
| Tests | `pnpm test` | All pass, 0 failures |
| Build | `pnpm build` | Success, no errors |
| Lint | `pnpm lint` | 0 errors (warnings OK) |
| Type Check | (included in build) | No type errors |

**Enforcement:** If any gate fails, agent must fix issues and re-run all checks before creating PR.

---

## Best Practices

### DO ✅

- Analyze dependencies before launching agents
- Write comprehensive instructions with clear success criteria
- Launch agents in parallel when possible
- Specify quality gates explicitly
- Include reference files and patterns to follow
- Verify work isn't duplicated before starting
- Use review agents for code quality
- Let agents work autonomously (don't micro-manage)

### DON'T ❌

- Launch agents with vague instructions
- Skip dependency analysis
- Create PRs without passing quality gates
- Launch agents for already-completed work
- Approve PRs without review agent analysis
- Launch sequential agents when parallel is possible
- Check on agents constantly (they notify when done)
- Launch agents for trivial single-file changes

---

## Metrics & Success Criteria

Track these metrics to measure effectiveness:

### Velocity Metrics
- **Time to completion:** Phase completion time (with vs without parallel agents)
- **Parallelization factor:** Number of agents working simultaneously
- **Throughput:** PRs created per day

### Quality Metrics
- **Quality gate pass rate:** % of PRs passing gates on first attempt
- **Test coverage:** % coverage across all agents' work
- **Review findings:** Critical issues found by review agents

### Efficiency Metrics
- **Duplicate work:** % of agents stopped due to duplicate work
- **Rework rate:** % of PRs requiring significant changes after review
- **Integration issues:** % of PRs causing integration problems

**Target Performance:**
- 3-4x faster phase completion vs. sequential approach
- 90%+ quality gate pass rate on first attempt
- <5% duplicate work rate
- Comprehensive review comments on every PR

---

## Example: Phase 01 Parallel Execution

**Context:** Phase 01 was 40% complete, needed 60% more work

**Step 1: Analysis**
- Remaining: Columns API, Records API, Cell Infrastructure, Integration
- Dependencies: Integration depends on APIs and UI
- Critical Path: APIs → UI → Integration
- Parallel Tracks: 3 (Columns API, Records API, Cell Infrastructure)

**Step 2: Agent Instructions**
Crafted detailed instructions for each track:
- Columns API (B.3): CRUD endpoints, DDL integration, 45+ tests
- Records API (B.4): Generic CRUD, pagination, 60+ tests
- Cell Infrastructure (D.1): Base types, registry, placeholders

**Step 3: Launch**
Launched 3 agents simultaneously in single message

**Step 4: Monitor**
- Discovered PR #27 already completed (stopped duplicate agent)
- Other 3 agents working autonomously

**Step 5: Review** (upcoming)
- Spawn review agent for each PR
- Agents analyze and comment
- User approves after reviewing agent feedback

**Expected Outcome:**
- 40% → 75% complete after agents finish
- 3 PRs ready for review
- Comprehensive test coverage
- All quality gates passed
- ~3x faster than sequential approach

---

## Troubleshooting

### Problem: Agent creating PR before tests pass

**Solution:** Explicitly state in instructions:
```
CRITICAL: Run quality gates BEFORE creating PR:
1. pnpm test - must pass
2. pnpm build - must succeed
3. pnpm lint - must pass
IF ANY FAIL: Fix issues, re-run ALL checks
ONLY create PR after ALL gates pass
```

### Problem: Duplicate work (agent working on completed task)

**Solution:** Before launching agents:
1. Check git history: `git log --oneline -20`
2. Check recent PRs: `gh pr list --state merged --limit 20`
3. Search for related commits: `git log --grep="keyword"`
4. Verify files don't exist: `ls path/to/expected/files`

### Problem: Agents blocked on dependencies

**Solution:** Create dependency graph first:
- Identify what's complete (inputs available)
- Identify what's blocked (waiting on inputs)
- Only launch agents for non-blocked work
- Plan second wave of agents after first wave completes

### Problem: Integration issues between agents' work

**Solution:** Include integration task as final step:
- Launch parallel agents for independent work
- After all complete, launch integration agent
- Integration agent connects the pieces
- Tests full workflow end-to-end

### Problem: Review agent approving PRs (should only comment)

**Solution:** Explicitly state in review agent instructions:
```
IMPORTANT: Review Only
- You ANALYZE and COMMENT only
- You DO NOT approve or request changes
- You DO NOT merge the PR
- Human makes final approval decision
```

---

## Templates

### Agent Instruction Template

See Step 2 above for comprehensive template.

### Review Agent Instruction Template

See Step 5 above for comprehensive template.

### Dependency Graph Template

```
Phase X: [Name]

Prerequisites (must complete first):
- [Task A] - Status: DONE
- [Task B] - Status: DONE

Parallel Tracks (can start now):
- Track 1: [Description]
  - Depends on: [Prerequisites]
  - Deliverable: [What it produces]
  - Tests: [Number/type]

- Track 2: [Description]
  - Depends on: [Prerequisites]
  - Deliverable: [What it produces]
  - Tests: [Number/type]

Integration (after parallel tracks):
- INT.1: [Description]
  - Depends on: Track 1, Track 2
  - Deliverable: [Integration result]

Critical Path: Prerequisites → Track 1 → INT.1
Time Savings: [X]x faster than sequential
```

---

## Revision History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-01-30 | Initial SOP created from Phase 01 parallel agent experience |

---

## Related Documentation

- [CLAUDE.md](../CLAUDE.md) - Project context and conventions
- [Agent Limits SOP](./sop-agent-limits.md) - Memory budgets and concurrent agent limits

---

**Maintainer:** Project Lead
**Last Updated:** 2026-01-30
**Next Review:** After Phase 01 completes
