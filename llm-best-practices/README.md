# LLM Best Practices Toolkit

A portable toolkit for setting up AI-optimized documentation in any software project.

## Quick Start

```bash
# 1. Copy this folder into your project
cp -r llm-best-practices /path/to/your/project/

# 2. Run the setup script
cd llm-best-practices
bash setup.sh
```

That's it. The script will prompt you for a few essentials and auto-generate all your documentation and agents.

---

## Folder Contents

```
llm-best-practices/
├── README.md                          # You are here
├── setup.sh                           # Automated setup script (run this!)
├── agents/
│   ├── git-runner.md                  # Git operations agent (auto-copied, invoked by /commit)
│   ├── workplanner.md                 # Workplanner agent (auto-copied, invoked by /workplan)
│   └── reviewer.md                    # Code review agent (auto-copied)
├── skills/
│   ├── commit/SKILL.md                # /commit skill → commit agent
│   ├── review/SKILL.md                # /review skill → reviewer agent
│   └── workplan/SKILL.md              # /workplan skill → workplanner agent
├── templates/
│   ├── claude.md.template             # AI instruction manual (auto-generated)
│   └── roadmap.md.template            # Project roadmap (auto-generated)
├── guides/
│   ├── framework.md                   # Theory, rationale, troubleshooting
│   ├── quick-start.md                 # Manual setup walkthrough (if not using script)
│   └── worksheet.md                   # Project info questionnaire
├── quick-reference.md                 # Cheat sheet and file reference
├── sops/
│   ├── sop-parallel-agents.md         # Parallel agent workflow SOP
│   └── sop-agent-limits.md            # Agent memory management SOP
└── examples/
    ├── claude.md                      # Real CLAUDE.md from a production project
    ├── contributing.md                # Contributing guidelines example
    ├── preferences.md                 # Real .claude/preferences.md
    ├── naming-conventions.md          # Phase.Domain.Step naming system
    └── agents-readme.md               # Agent system documentation
```

---

## After Running setup.sh

The script auto-generates everything and displays a summary table. Here's what happens next:

### Step 1: Restart and Verify

Restart Claude Code (`/exit` + relaunch) so it detects the new agents and skills. Then verify:
```
/agents
```

This loads the three agents (git-runner, workplanner, reviewer) and makes them immediately available.

### Step 2: Customize Your Files

- **CLAUDE.md**: Review and customize with your project-specific patterns, commands, and gotchas
- **ROADMAP.md**: Update with your actual phases, timelines, and deliverables
- **.claude/preferences.md**: Adjust communication style, agent memory limits, and code review standards

### Step 3: Use Your Skills

Skills provide `/slash-command` access that delegates to agents:

| Command | What It Does | Agent |
|---------|-------------|-------|
| `/commit` | Create a well-structured git commit | git-runner |
| `/review` | Expert code review (security, performance, quality) | reviewer |
| `/workplan` | Create structured implementation plan with parallel tracks | workplanner |

**How it works:** Skills are thin invocation wrappers (`.claude/skills/`). Agents contain the full system prompts, model selection, and tool restrictions (`.claude/agents/`). When you run `/commit`, the commit skill forks a new context and hands off to the git-runner agent.

**Note:** Other agents can also invoke git-runner via Task tool when they need git operations.

### Optional: Cleanup

```bash
# If you no longer need the reference docs
rm -rf llm-best-practices/

# Or keep them untracked
echo "llm-best-practices/" >> .gitignore
```

---

## Going Deeper

Read the guides for detailed theory and walkthroughs:

- **[guides/quick-start.md](./guides/quick-start.md)** — Step-by-step setup at three depth levels (30 min, 2 hours, 1 day)
- **[guides/framework.md](./guides/framework.md)** — Why each component matters, advanced patterns, migration guide, troubleshooting
- **[guides/worksheet.md](./guides/worksheet.md)** — Structured questionnaire to capture your project's patterns and decisions

---

## Examples

Browse `examples/` for real-world reference files from a production project:

- **[examples/claude.md](./examples/claude.md)** — Full AI instruction manual for an Airtable clone
- **[examples/contributing.md](./examples/contributing.md)** — Contributing guidelines example
- **[examples/preferences.md](./examples/preferences.md)** — Real agent behavior configuration
- **[examples/agents-readme.md](./examples/agents-readme.md)** — Documentation on agent usage
- **[sops/sop-parallel-agents.md](./sops/sop-parallel-agents.md)** — How to coordinate multiple agents
- **[sops/sop-agent-limits.md](./sops/sop-agent-limits.md)** — Memory management for concurrent agents
- **[examples/naming-conventions.md](./examples/naming-conventions.md)** — Phase.Domain.Step hierarchical naming
