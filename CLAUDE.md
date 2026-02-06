# FilmForum

A film discussion and scheduling forum built with Astro and webcoreui.

**Roadmap**: See `ROADMAP.md` for the full development plan.

## Conversation Awareness

### When You Ask for Permission or Input

**CRITICAL: If you ask the user a question, you MUST wait for their response before proceeding.**

- **STOP and WAIT** — do not make any more tool calls until the user responds
- **Never proceed with the action you asked about** — asking "Would you like me to X?" and then doing X anyway is unacceptable
- **Respect stop hooks** — if a stop hook fires, STOP ALL WORK until user explicitly gives permission
- **No assumptions** — silence or delay does not mean "yes", it means wait

### When User Raises Concerns

- **STOP executing immediately** — no more tool calls until the concern is addressed
- Engage with their concern fully before any more work
- "This smells wrong", "this feels bad", or similar = halt and discuss
- The user's input is the priority, not your current task queue

### When User Is Asking vs. Directing

**These phrases mean "analyze and discuss", NOT "implement":**
- "tell me about...", "question for you...", "what do you think about..."
- "how should we approach...", "I'm curious about...", "help me understand..."

When you see these: provide analysis first, do NOT start planning or making changes. After analysis, ask "Would you like me to implement this?"

**When uncertain whether user wants discussion or action: default to discussion.**

### When User Redirects Your Approach

When the user suggests a different approach mid-task:
STOP → ACKNOWLEDGE → SWITCH to their approach.

### When Implementing PR Feedback

- **Always checkout the PR branch first** — run `gh pr view <number> --json headRefName` to find it
- **Never commit PR-related changes directly to main**
- If unsure which branch to use, ask before committing

### When to Use Parallel Subagents

Before starting multi-step work, check if tasks can run concurrently. If yes, use parallel Task calls.
See `sops/sop-parallel-agents.md` for detailed patterns.

## How to Work

- Know the basic documentation of tools being used (Astro, pnpm, etc.)
- Never hedge with "or whatever" — be precise
- If unsure, check the config/docs first
- If still unsure after checking, ask the user to help learn
- Don't guess or be vague about things that can be verified

## Git Commits

- Use `/commit` skill for committing (uses haiku, ensures atomic commits)
- Prefer atomic commits: one logical change per commit
- Don't bundle unrelated changes together
- Each commit should be independently meaningful

## Skills

- `/commit` — atomic commits with clear messages
- `/review` — code review for security, performance, best practices
- `/workplan` — structured implementation plan with parallel tracks
- `/devlog` — update devlog.md after significant work
- `/frontend-design` — auto-loads for UI component work, aims for distinctive production-grade interfaces

## Package Manager

Use `pnpm` (not npm) for all package management commands.

## Commands

```bash
pnpm dev            # Start dev server
pnpm build          # Production build
pnpm preview        # Preview production build
```

### Pre-Push Checklist

**NEVER push broken builds.** Before every push:
```bash
pnpm build          # Must pass with zero errors
```

## Demo Pages

Demo/test pages live at `/demo/*` with an index at `/demo`.

See `.claude/preferences.md` for detailed workflow preferences.
