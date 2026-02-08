# LLM-Optimized Documentation Framework

A reusable framework for LLM-assisted development in any project. This document covers the **theory and rationale** behind each component — for ready-to-use templates, see `../templates/`.

---

## Executive Summary

**Core insight:** LLMs are most effective when given clear context, explicit constraints, and structured workflows.

**Core Components:**
1. **CLAUDE.md** — Project-specific AI instructions
2. **Hierarchical Naming** — Phase.Domain.Step for tracking parallel work
3. **Custom Agents** — Specialized AI agents for review, planning, testing
4. **Standard Operating Procedures** — Documented workflows for complex tasks
5. **Quality Gates** — Pre-push validation to prevent CI waste
6. **Conversation Awareness** — Explicit rules for AI interaction patterns

**Impact:**
- 3-4x faster development through parallel agent execution
- Near-zero CI failures from pre-push validation
- Comprehensive code review without human bottleneck

---

## Table of Contents

1. [Core Documentation Files](#core-documentation-files)
2. [Naming Conventions & Structure](#naming-conventions--structure)
3. [Custom Agent System](#custom-agent-system)
4. [Standard Operating Procedures](#standard-operating-procedures)
5. [Quality Assurance Patterns](#quality-assurance-patterns)
6. [Implementation Checklist](#implementation-checklist)
7. [Migration Guide](#migration-guide)
8. [Success Metrics](#success-metrics)
9. [Troubleshooting](#troubleshooting)

---

## Core Documentation Files

### 1. CLAUDE.md — The AI Instruction Manual

**Purpose:** Single source of truth for how AI assistants should work in your codebase.

**Location:** Repository root (`/CLAUDE.md`)

**Template:** See `../templates/claude.md.template`

**Essential Sections:**

#### A. Conversation Awareness Rules
Tell the AI when to stop and engage with human concerns. Prevents AI from bulldozing forward when the user wants to course-correct.

#### B. Project Context
What the project does (1-2 sentences), key architectural patterns, links to detailed architecture docs, current status/phase.

#### C. Development Environment
Package manager and version constraints, database environment (local vs cloud), infrastructure dependencies, stack-specific gotchas.

#### D. Pre-Push Checklist
The non-negotiable quality gates before every push. Saves CI budget and prevents broken builds.

#### E. Code Patterns to Follow
State management, component structure, API/data fetching, error handling, testing conventions.

#### F. Key Files Reference
10-15 most important files with brief descriptions.

#### G. Gotchas
Non-obvious behaviors that cause bugs.

---

### 2. .claude/preferences.md — AI Behavior Configuration

**Purpose:** Define how the AI should communicate and work.

**Template:** See `../templates/preferences.md.template`

**Essential Sections:**

- **Communication Style** — Concise vs verbose, parallel execution preferences, time estimate policy
- **Agent Memory Limits** — Max concurrent agents, total memory budget, per-agent memory, decision tree for when to use agents
- **Review Standards** — Tone (professional, factual), format requirements, what to include/avoid
- **AI Disclaimer Requirements** — When and how to disclose AI-generated content

---

### 3. CONTRIBUTING.md — Developer Workflow

**Purpose:** Local validation and development workflow.

**Template:** See `../templates/contributing.md.template`

**Key insight:** Prevent CI failures by catching issues locally. Include `validate:quick` (before every push) and `validate` (before opening PR) commands.

---

## Naming Conventions & Structure

### Phase.Domain.Step Hierarchical System

**Purpose:** Track parallel work and dependencies clearly.

**Structure:**

```
Phase.Domain.Step
  │      │      └─ Specific work unit (1, 2, 3A, 3B, etc.)
  │      └──────── Functional area within phase (can be parallel)
  └─────────────── Major milestone (sequential)
```

**Examples:**

```bash
# Branch names
feature/1-mvp.2-apis.3-columns
feature/2-auth.1-setup.2-middleware

# Worktree directories
project-1-mvp.2-apis.3-columns/

# PR titles
1-mvp.2-apis.3: Columns API with validation
```

**Rules:**
1. Phases are sequential — Phase 2 can't start until Phase 1 complete
2. Domains can be parallel — `1-mvp.2-apis` and `1-mvp.3-cells` can run simultaneously
3. Steps are sequential by default — Step 1 → Step 2 → Step 3
4. Letter suffix = parallel group — `3A, 3B, 3C` can all run at once, must complete before Step 4

---

### Git Worktree Pattern

**Purpose:** Enable parallel development on multiple features.

```bash
# Create worktree for parallel track
git worktree add ../project-1-mvp.3-cells.2-renderers -b feature/1-mvp.3-cells.2-renderers 1-mvp

# Cleanup after merge
git worktree remove ../project-1-mvp.3-cells.2-renderers
git worktree prune
```

Benefits: Disk efficient (shares .git history), no context switching, independent builds/tests.

---

## Custom Agent System

### Skills + Agents Architecture

The toolkit uses a two-layer system:

- **Skills** (`.claude/skills/`) — Thin `/slash-command` wrappers that provide invocation. Each skill uses `context: fork` and `agent: <name>` to delegate to an agent.
- **Agents** (`.claude/agents/`) — Full system prompts with model selection, tool restrictions, and detailed instructions. Agents do the actual work.

This separation means skills handle *how you invoke* (slash commands, auto-invocation rules) while agents handle *what gets executed* (prompts, models, tools).

### Agent Architecture

**Agents:** See `../agents/` for the three universal agent definitions (git-runner, workplanner, reviewer).

**Skills:** See `../skills/` for the corresponding skill wrappers.

Agent definitions use YAML frontmatter for configuration (name, model, tools, permissions, hooks) followed by markdown instructions.

### Essential Agents

#### 1. Reviewer Agent
- **Purpose:** Automated code review with security, performance, and quality analysis
- **Model:** Opus (deep analysis)
- **Key feature:** Read-only (cannot modify code, enforced by hooks)
- **Posts findings to GitHub PRs**

#### 2. Workplanner Agent
- **Purpose:** Create detailed implementation plans with dependency analysis
- **Model:** Opus (deep analysis)
- **Creates:** Parallel work structures, dependency graphs, test planning, file-level breakdowns

#### 3. Tester Agent (Optional)
- **Purpose:** Run test suites and report results
- **Model:** Haiku (fast execution)

### Agent Memory Management

Any agent (Opus, Sonnet, or Haiku) can use up to ~4.4GB. Model choice affects speed/quality, NOT memory usage.

```
Dynamic limit: max_agents = floor((MEMORY_BUDGET - current_usage) / 4.4GB)
```

See `../sops/sop-agent-limits.md` for the full decision tree and batching strategies.

---

## Standard Operating Procedures

### SOP: Parallel Agent Workflow

**5-Step Process:**

1. **Analyze & Decompose** — Read project docs, identify remaining work, create dependency graph, find critical path, identify parallel tracks
2. **Craft Agent Instructions** — Context, task definition, quality gates, testing requirements, reference files, success criteria, PR requirements
3. **Launch Agents in Parallel** — Send all agent tasks in a single message for true parallelism
4. **Monitor & Quality Check** — Verify quality gates passed, check for duplicate work
5. **Code Review** — Spawn reviewer agent for each completed PR

See `../sops/sop-parallel-agents.md` for the full SOP.

### SOP: Git Workflow with Phase Branches

```
main
 └─ 1-mvp (phase branch)
     ├─ feature/1-mvp.1-schema.1-database
     ├─ feature/1-mvp.2-apis.2-tables
     └─ feature/1-mvp.3-cells.2-renderers
```

PRs target the phase branch. When the phase is complete, merge the phase branch to main.

---

## Quality Assurance Patterns

### Pre-Push Validation Scripts

```json
{
  "scripts": {
    "validate:lockfile": "[install] --frozen-lockfile",
    "validate:quick": "[validate:lockfile] && [build]",
    "validate": "[validate:quick] && [lint] && [test]"
  }
}
```

**Usage:**
- Before every push: `npm run validate:quick && git push`
- Before opening PR: `npm run validate`

### Quality Gates in Agent Instructions

Every implementation agent MUST be told to run quality gates before creating a PR. Include this section in every agent instruction.

---

## Implementation Checklist

### Phase 1: Core Documentation (Required)

- [ ] **CLAUDE.md** — conversation awareness, project context, environment, pre-push checklist, code patterns, key files, gotchas
- [ ] **CONTRIBUTING.md** — validation commands, script reference, common scenarios
- [ ] **Validation scripts** in package.json — `validate:lockfile`, `validate:quick`, `validate`
- [ ] **.claude/preferences.md** — communication style, review standards

### Phase 2: Advanced Patterns (Recommended)

- [ ] **Custom agents** — `.claude/agents/reviewer.md`, `.claude/agents/workplanner.md`
- [ ] **SOPs** — Parallel agent workflow, memory management
- [ ] **Architecture docs** — `docs/architecture/README.md`

### Phase 3: Optimization (Optional)

- [ ] Git hooks for validation
- [ ] Phase.Domain.Step naming adoption
- [ ] AI disclaimer configuration
- [ ] Roadmap with Phase.Domain.Step structure (see `../templates/roadmap.md.template`)

---

## Migration Guide

### Week 1: Foundation

**Day 1:** Create CLAUDE.md with project context, environment, and key files. Add pre-push checklist.

**Day 2:** Create CONTRIBUTING.md with validation commands. Add `validate:quick` and `validate` scripts.

**Day 3:** Create `.claude/preferences.md` with communication style and review standards.

**Day 4-5:** Document code patterns in CLAUDE.md. Add gotchas section. Create key files reference.

### Week 2: Advanced Patterns

**Day 1-2:** Create reviewer agent, test with an existing PR.

**Day 3:** Create workplanner agent, test with an upcoming feature.

**Day 4-5:** Create architecture documentation.

### Week 3: Optimization

**Day 1-2:** Implement Phase.Domain.Step naming.

**Day 3-4:** Create SOPs for parallel agents and memory management.

**Day 5:** Set up git worktree documentation and branching strategy.

---

## Success Metrics

Track these to measure effectiveness:

| Metric | Before | Target After |
|--------|--------|-------------|
| Phase completion time | Baseline | 3-4x faster |
| CI failure rate | Baseline | <5% |
| PR review time | Baseline | <24h (automated) |
| Code quality issues | Baseline | 90%+ caught before PR |

### Developer Experience

- **Reduced context switching:** Worktrees enable parallel work
- **Faster feedback:** Local validation catches issues in seconds
- **Better planning:** Structured Phase.Domain.Step system
- **Comprehensive reviews:** Every PR gets thorough automated review

---

## Troubleshooting

### AI not following CLAUDE.md instructions
1. Verify CLAUDE.md is in repository root
2. Make instructions clear and specific (not vague)
3. Add "CRITICAL:" prefix to essential rules
4. Use **bold** for critical constraints
5. Test: "Read CLAUDE.md and confirm you understand [X]"

### Agents running out of memory
1. Verify memory calculations in sops/sop-agent-limits.md
2. Check actual memory usage before spawning
3. Reduce concurrent agents (batch more aggressively)
4. Wait for agents to complete before spawning new ones

### Quality gates failing frequently
1. Verify `validate:quick` script is correct for your stack
2. Check if lockfile gets out of sync (common with branch switching)
3. Add lockfile validation to agent instructions
4. Document lockfile sync process in CONTRIBUTING.md

### PRs targeting wrong base branch
1. Document base branch rules in CLAUDE.md
2. Add `--base [phase-branch]` explicitly to agent instructions
3. Use branch protection rules on GitHub

---

## Maintenance

### Monthly
- Review and update CLAUDE.md with new patterns
- Update preferences.md if communication preferences change
- Check agent performance

### Quarterly
- Review memory limits (if system RAM changes)
- Update architecture docs with major changes
- Consolidate SOPs if they've grown too large

### Per Phase/Milestone
- Create phase plan document
- Update roadmap in CLAUDE.md
- Document new patterns discovered during phase
