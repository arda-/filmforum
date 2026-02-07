# LLM Documentation Quick Reference

**Keep this open while setting up your project.**

---

## File Locations

| File | Location | Purpose |
|------|----------|---------|
| **CLAUDE.md** | `/CLAUDE.md` | Main AI instruction manual |
| **CONTRIBUTING.md** | `/CONTRIBUTING.md` | Developer workflow |
| **preferences.md** | `/.claude/preferences.md` | AI behavior config |
| **reviewer.md** | `/.claude/agents/reviewer.md` | Code review agent |
| **workplanner.md** | `/.claude/agents/workplanner.md` | Workplanner agent |
| **git-runner.md** | `/.claude/agents/git-runner.md` | Git operations agent |
| **SKILL.md** | `/.claude/skills/commit/SKILL.md` | /commit skill |
| **SKILL.md** | `/.claude/skills/review/SKILL.md` | /review skill |
| **SKILL.md** | `/.claude/skills/workplan/SKILL.md` | /workplan skill |

---

## Essential Sections Checklist

### CLAUDE.md Must Have

1. **Conversation Awareness** — When to stop and ask
2. **Project Context** — What this project does
3. **Pre-Push Checklist** — Quality gates
4. **Code Patterns** — How we write code
5. **Key Files** — Most important 5-10 files
6. **Gotchas** — Common mistakes

### CONTRIBUTING.md Must Have

1. `validate:quick` command and usage
2. `validate` command for full check
3. Common scenarios guide

### preferences.md Must Have

1. Communication style preferences
2. Code review standards (tone and format)
3. AI disclaimer requirements (if any)

---

## Commands Reference

### Setting Up

```bash
# Recommended: use the automated setup script
cd llm-best-practices && bash setup.sh

# Or manually:
cp llm-best-practices/templates/claude.md.template CLAUDE.md

mkdir -p .claude/agents
cp llm-best-practices/agents/* .claude/agents/

mkdir -p .claude/skills/commit .claude/skills/review .claude/skills/workplan
cp llm-best-practices/skills/commit/SKILL.md .claude/skills/commit/SKILL.md
cp llm-best-practices/skills/review/SKILL.md .claude/skills/review/SKILL.md
cp llm-best-practices/skills/workplan/SKILL.md .claude/skills/workplan/SKILL.md
```

### Testing

```
"Read CLAUDE.md and summarize: What is this project? What patterns should I follow?"
```

### Daily Use

```bash
# Before every push
npm run validate:quick && git push

# Before opening PR
npm run validate

# After switching branches
npm install && git status [lockfile]
```

---

## Skills + Agents Quick Reference

Skills provide `/slash-command` access. Agents contain the system prompts and tool restrictions.

### /commit → Commit Agent

**Invoke:** `/commit` or `/commit fix auth bug` | **Model:** Sonnet | **Auto-invoke:** No (user-only)

**Does:** Validates changes, creates well-structured commit with conventional message format.

### /review → Reviewer Agent

**Invoke:** `/review` or `/review PR #31` | **Model:** Opus | **Auto-invoke:** Yes

**Checks:** Security, type safety, code quality, performance, testing. Read-only tools.

### /workplan → Workplanner Agent

**Invoke:** `/workplan` or `/workplan real-time notifications` | **Model:** Opus | **Auto-invoke:** Yes

**Creates:** Parallel work structure, dependency analysis, testing requirements, file-level breakdown. Read-only tools.

---

## Template Placeholders

When using templates, replace these:

| Placeholder | Replace With |
|-------------|--------------|
| `[PROJECT_TYPE]` | "e-commerce platform", "task manager", etc. |
| `[TECH_STACK]` | "Next.js + PostgreSQL", "Rails + React", etc. |
| `[PACKAGE_MANAGER]` | npm, pnpm, yarn, cargo, etc. |
| `[BUILD_COMMAND]` | `pnpm build`, `cargo build`, etc. |
| `[TEST_COMMAND]` | `pnpm test`, `pytest`, etc. |
| `[LINT_COMMAND]` | `pnpm lint`, `ruff check`, etc. |
| `[SYSTEM_RAM]` | Your total system RAM (e.g., 48GB) |
| `[MEMORY_BUDGET]` | RAM budget for agents (e.g., 32GB) |
| `[TERMINAL_APP]` | Your terminal app (e.g., iTerm2, Ghostty, Terminal) |

---

## Common Issues

| Issue | Solution |
|-------|----------|
| Claude doesn't follow patterns | Make patterns more explicit with code examples |
| Claude doesn't stop when asked | Add/emphasize Conversation Awareness section |
| Build failures in CI | Ensure validate:quick runs before every push |
| Lockfile out of sync | Add validate:lockfile script |
| Agent memory issues | Check sops/sop-agent-limits.md, calculate before spawning |

---

## Validation Scripts Pattern

```json
{
  "scripts": {
    "validate:lockfile": "[install] --frozen-lockfile",
    "validate:quick": "[validate:lockfile] && [build]",
    "validate": "[validate:quick] && [lint] && [test]"
  }
}
```

---

**Full guide:** `guides/framework.md` | **Step-by-step:** `guides/quick-start.md` | **Worksheet:** `guides/worksheet.md`
