# Quick Start: LLM-Optimized Documentation

**Goal:** Get LLM-friendly documentation in your project in 30 minutes to 1 day.

For the full theoretical framework, see [framework.md](./framework.md). For ready-to-use templates, see `../templates/`.

---

## 30-Minute Setup

### 1. Create CLAUDE.md (15 min)

Copy `../templates/claude.md.template` to your repository root and fill in the placeholders:

```bash
cp llm-best-practices/templates/claude.md.template CLAUDE.md
```

Fill in: project type, tech stack, dev commands, 2-3 code patterns, 5-10 key files, 3-5 gotchas. See `../examples/claude.md` for a real-world example.

### 2. Add Validation Scripts (10 min)

Add to your `package.json`:

```json
{
  "scripts": {
    "validate:quick": "[your build command]",
    "validate": "[build] && [lint] && [test]"
  }
}
```

### 3. Create .claude/preferences.md (5 min)

```bash
mkdir -p .claude
cp llm-best-practices/templates/preferences.md.template .claude/preferences.md
```

Fill in your communication style and review standards. See `../examples/preferences.md` for reference.

**Test it:**
```
"Read CLAUDE.md and summarize this project"
```

---

## 2-Hour Setup (Recommended)

Do the 30-minute setup above, PLUS:

### 4. Create CONTRIBUTING.md (30 min)

```bash
cp llm-best-practices/templates/contributing.md.template CONTRIBUTING.md
```

Fill in validation commands and common development scenarios. See `../examples/contributing.md` for reference.

### 5. Document Architecture (60 min)

Create `docs/architecture/README.md` with:
- System overview and component diagram
- Key concepts central to your system
- Directory structure with explanations
- Data flow description

---

## Full-Day Setup (Optimal)

Do the 2-hour setup above, PLUS:

### 6. Create Agents and Skills (2 hours)

```bash
# Copy agents
mkdir -p .claude/agents
cp llm-best-practices/agents/* .claude/agents/

# Copy skills
mkdir -p .claude/skills/commit .claude/skills/review .claude/skills/workplan
cp llm-best-practices/skills/commit/SKILL.md .claude/skills/commit/SKILL.md
cp llm-best-practices/skills/review/SKILL.md .claude/skills/review/SKILL.md
cp llm-best-practices/skills/workplan/SKILL.md .claude/skills/workplan/SKILL.md
```

Customize agents in `.claude/agents/` with your domain expertise, stack-specific concerns, and project context. Skills in `.claude/skills/` typically need no customization.

**Important:** Restart Claude Code (`/exit` + relaunch) after creating agents and skills, then verify with `/agents`.

---

## Usage Examples

### After 30-Minute Setup

```
"Implement user authentication following our patterns"
```

Claude will read CLAUDE.md, follow your code patterns, and run your build before pushing.

### After 2-Hour Setup

```
"Create a feature for exporting data to CSV"
```

Claude will read architecture docs, understand your system design, run validate:quick before pushing, and create a PR with proper structure.

### After Full-Day Setup

```
"Plan implementation for real-time notifications"
```

The workplanner agent will research existing code, create a structured plan with dependencies, identify parallel work streams, and include test planning.

```
"Review PR #45"
```

The reviewer agent will check security issues specific to your stack, verify test coverage, and post detailed findings to GitHub.

---

## Quick Reference Cards

### For Claude: Reading Your Docs
1. Read `CLAUDE.md` for context and patterns
2. Read `docs/architecture/README.md` for system design
3. Check `.claude/preferences.md` for communication style
4. Follow pre-push checklist before creating PR

### For You: Maintaining Docs
- **Weekly:** Update CLAUDE.md with new patterns discovered
- **Per Feature:** Update architecture docs if system changed, add new gotchas
- **Quarterly:** Review and consolidate, remove outdated patterns

---

## Common Questions

**Do I need all this documentation?**
No. Start with the 30-minute setup. Add more as you see value.

**How do I know if it's working?**
Ask Claude: "What kind of project is this? What are the key patterns I should follow?" If it accurately describes your project, your documentation is working.

**What's the ROI?**
Faster onboarding (AI understands project quickly), fewer mistakes (AI follows patterns), better reviews (automated quality checks), less CI waste (local validation).

**Can I customize this for my team?**
Yes — these are templates. Adapt to your tech stack, team size, workflow, and quality standards.

---

## Next Steps

- **Full guide:** [framework.md](./framework.md) for theory and rationale
- **Worksheet:** [worksheet.md](./worksheet.md) to capture your project info
- **Examples:** Browse `../examples/` for real-world reference
- **Cheat sheet:** [../quick-reference.md](../quick-reference.md) for a printable quick reference
