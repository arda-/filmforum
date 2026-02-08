#!/bin/bash

# LLM Best Practices - Project Setup Script
# Automates toolkit initialization with hybrid approach (prompts + auto-generation)

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Determine script location and project root
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

# Check if we're in the right location
if [ ! -f "$SCRIPT_DIR/README.md" ] || [ ! -d "$SCRIPT_DIR/agents" ]; then
  echo -e "${RED}❌ Error: Cannot find toolkit files in $SCRIPT_DIR${NC}"
  echo "   Usage: cd llm-best-practices && bash setup.sh"
  exit 1
fi

# Check if already set up
if [ -f "$PROJECT_ROOT/CLAUDE.md" ] && [ -d "$PROJECT_ROOT/.claude/agents" ] && [ -d "$PROJECT_ROOT/.claude/skills" ]; then
  echo -e "${YELLOW}⚠️  Warning: This project appears to already be set up${NC}"
  read -p "Continue anyway? (y/n) " -r
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    exit 0
  fi
fi

echo -e "${BLUE}🚀 LLM Best Practices Toolkit Setup${NC}"
echo "=========================================="
echo ""

# Step 1: Gather project information
echo -e "${BLUE}📋 Project Information${NC}"
echo "Enter your project details (required fields marked with *):"
echo ""

# Project name
read -p "Project name*: " PROJECT_NAME
while [ -z "$PROJECT_NAME" ]; do
  echo -e "${RED}Project name is required${NC}"
  read -p "Project name*: " PROJECT_NAME
done

# Project description
read -p "Project description* (1-2 sentences): " PROJECT_DESC
while [ -z "$PROJECT_DESC" ]; do
  echo -e "${RED}Project description is required${NC}"
  read -p "Project description* (1-2 sentences): " PROJECT_DESC
done

# Primary language/framework
read -p "Primary language/framework* (e.g., TypeScript, Python, Go): " LANGUAGE
while [ -z "$LANGUAGE" ]; do
  echo -e "${RED}Language/framework is required${NC}"
  read -p "Primary language/framework* (e.g., TypeScript, Python, Go): " LANGUAGE
done

# Key architecture patterns
echo ""
echo "Key architectural approach (e.g., 'REST API backend + React frontend', 'monorepo', 'event-driven'):"
read -p "Architecture*: " ARCHITECTURE
while [ -z "$ARCHITECTURE" ]; do
  echo -e "${RED}Architecture description is required${NC}"
  read -p "Architecture*: " ARCHITECTURE
done

# Gotchas (optional)
echo ""
echo "Common gotchas/non-obvious things (leave blank if none):"
read -p "Gotchas: " GOTCHAS

echo ""
echo -e "${GREEN}✓ Information collected${NC}"
echo ""

# Step 2: Create directories
echo -e "${BLUE}📁 Setting up directories${NC}"
mkdir -p "$PROJECT_ROOT/.claude/agents"
mkdir -p "$PROJECT_ROOT/.claude/skills/commit" "$PROJECT_ROOT/.claude/skills/review" "$PROJECT_ROOT/.claude/skills/workplan"
mkdir -p "$PROJECT_ROOT/sops"
echo -e "${GREEN}✓ Created .claude/agents/, .claude/skills/, and sops/${NC}"
echo ""

# Step 3: Copy agents, skills, and SOPs
echo -e "${BLUE}🤖 Copying agents, skills, and SOPs${NC}"
for agent in "$SCRIPT_DIR/agents/"*; do
  name="$(basename "$agent")"
  dest="$PROJECT_ROOT/.claude/agents/$name"
  if [ -f "$dest" ]; then
    read -p "  $name already exists. Overwrite? (y/n) " -r
    if [[ $REPLY =~ ^[Yy]$ ]]; then
      cp "$agent" "$dest"
      echo -e "${GREEN}  ✓ Replaced $name${NC}"
    else
      echo -e "${YELLOW}  ⏭  Skipped $name${NC}"
    fi
  else
    cp "$agent" "$dest"
    echo -e "${GREEN}  ✓ Copied $name${NC}"
  fi
done

for skill in commit review workplan; do
  dest="$PROJECT_ROOT/.claude/skills/$skill/SKILL.md"
  if [ -f "$dest" ]; then
    read -p "  /$skill skill already exists. Overwrite? (y/n) " -r
    if [[ $REPLY =~ ^[Yy]$ ]]; then
      cp "$SCRIPT_DIR/skills/$skill/SKILL.md" "$dest"
      echo -e "${GREEN}  ✓ Replaced /$skill skill${NC}"
    else
      echo -e "${YELLOW}  ⏭  Skipped /$skill skill${NC}"
    fi
  else
    cp "$SCRIPT_DIR/skills/$skill/SKILL.md" "$dest"
    echo -e "${GREEN}  ✓ Copied /$skill skill${NC}"
  fi
done

for sop in "$SCRIPT_DIR/sops/"*; do
  name="$(basename "$sop")"
  dest="$PROJECT_ROOT/sops/$name"
  if [ -f "$dest" ]; then
    read -p "  $name already exists. Overwrite? (y/n) " -r
    if [[ $REPLY =~ ^[Yy]$ ]]; then
      cp "$sop" "$dest"
      echo -e "${GREEN}  ✓ Replaced $name${NC}"
    else
      echo -e "${YELLOW}  ⏭  Skipped $name${NC}"
    fi
  else
    cp "$sop" "$dest"
    echo -e "${GREEN}  ✓ Copied $name${NC}"
  fi
done
echo -e "${YELLOW}  ⚠  SOPs contain placeholder values ([SYSTEM_RAM], [TERMINAL_APP], etc.)${NC}"
echo "     Edit files in sops/ to match your system configuration."
echo ""

# Step 4: Generate CLAUDE.md
echo -e "${BLUE}📝 Generating CLAUDE.md${NC}"

# Read CLAUDE.md from template
CLAUDE_MD_TEMPLATE="$SCRIPT_DIR/templates/claude.md.template"
if [ ! -f "$CLAUDE_MD_TEMPLATE" ]; then
    echo -e "${RED}Error: Template not found: $CLAUDE_MD_TEMPLATE${NC}"
    exit 1
fi

CLAUDE_MD=$(sed \
    -e "s|\[PROJECT TYPE\]|$PROJECT_NAME|g" \
    -e "s|\[KEY ARCHITECTURAL APPROACH\]|$ARCHITECTURE|g" \
    -e "s|\[LINK TO ROADMAP/PLAN\]|ROADMAP.md|g" \
    "$CLAUDE_MD_TEMPLATE")

if [ -f "$PROJECT_ROOT/CLAUDE.md" ]; then
  read -p "CLAUDE.md already exists. Overwrite? (y/n) " -r
  if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "$CLAUDE_MD" > "$PROJECT_ROOT/CLAUDE.md"
    echo -e "${GREEN}✓ Replaced CLAUDE.md${NC}"
  else
    echo -e "${YELLOW}  ⏭  Skipped CLAUDE.md${NC}"
  fi
else
  echo "$CLAUDE_MD" > "$PROJECT_ROOT/CLAUDE.md"
  echo -e "${GREEN}✓ Generated CLAUDE.md${NC}"
fi
echo ""

# Step 5: Generate preferences.md
echo -e "${BLUE}⚙️  Generating preferences.md${NC}"

PREFS_MD="# User Preferences & Workflow Patterns

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
\`\`\`markdown
## Changes

- Added 50 unit tests for auth module
- Fixed race condition in request handler
- Improved error messages

## Issues

None. All tests pass, build succeeds.

## Recommendation

Merge. Test coverage improved from 60% to 75%.
\`\`\`

## Commit Message Style

- **Format**: Imperative mood (\"Add feature\" not \"Added feature\")
- **Length**: Title ≤ 70 chars, body ≤ 80 chars per line
- **Content**: Focus on \"why\" not just \"what\"

## File Organization

- Keep related files together by domain
- Use clear naming that reflects purpose
- Avoid deep nesting (max 3 levels deep typically)
"

mkdir -p "$PROJECT_ROOT/.claude"
if [ -f "$PROJECT_ROOT/.claude/preferences.md" ]; then
  read -p "preferences.md already exists. Overwrite? (y/n) " -r
  if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "$PREFS_MD" > "$PROJECT_ROOT/.claude/preferences.md"
    echo -e "${GREEN}✓ Replaced .claude/preferences.md${NC}"
  else
    echo -e "${YELLOW}  ⏭  Skipped .claude/preferences.md${NC}"
  fi
else
  echo "$PREFS_MD" > "$PROJECT_ROOT/.claude/preferences.md"
  echo -e "${GREEN}✓ Generated .claude/preferences.md${NC}"
fi
echo ""

# Step 6: Generate ROADMAP.md
echo -e "${BLUE}🗺️  Generating ROADMAP.md${NC}"

ROADMAP_MD="# $PROJECT_NAME Roadmap

## Overview

**Project**: $PROJECT_NAME
**Description**: $PROJECT_DESC
**Tech Stack**: $LANGUAGE

---

## Phase 1: Foundation (2-4 weeks)

**Goal**: Establish core infrastructure and base architecture

**Key Tasks**:
- [ ] Set up development environment
- [ ] Establish project structure and tooling
- [ ] Create foundational components/modules
- [ ] Set up testing and CI/CD basics

**Deliverable**: Working foundation with basic functionality

---

## Phase 2: Core Features (4-6 weeks)

**Goal**: Implement primary user-facing features

**Key Tasks**:
- [ ] Implement main feature set
- [ ] Build out API/backend services
- [ ] Create UI components and flows
- [ ] Add comprehensive tests

**Deliverable**: Feature-complete MVP

---

## Phase 3: Polish & Scale (2-4 weeks)

**Goal**: Optimize, test thoroughly, and prepare for production

**Key Tasks**:
- [ ] Performance optimization
- [ ] Security audit and hardening
- [ ] Full end-to-end testing
- [ ] Documentation and runbooks

**Deliverable**: Production-ready application

---

## Success Metrics

### Phase 1
- [ ] Codebase builds without errors
- [ ] Basic tests passing
- [ ] Development workflow documented

### Phase 2
- [ ] Core features implemented
- [ ] >70% test coverage
- [ ] No critical bugs

### Phase 3
- [ ] Performance targets met
- [ ] Security review passed
- [ ] Ready for deployment

---

## Using This Roadmap with AI Agents

### Planning Phase Work
\`\`\`
\"Create implementation plan for Phase [N] with task breakdown and dependencies.\"
\`\`\`

### Executing with Parallel Agents
\`\`\`
\"Launch 2 agents:
- Agent 1: [Task 1]
- Agent 2: [Task 2]\"
\`\`\`

### Tracking Progress
Update items as:
- ✅ Completed
- 🔄 In progress
- 📋 Planned
- 🚫 Blocked (note dependency)
"

if [ -f "$PROJECT_ROOT/ROADMAP.md" ]; then
  read -p "ROADMAP.md already exists. Overwrite? (y/n) " -r
  if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "$ROADMAP_MD" > "$PROJECT_ROOT/ROADMAP.md"
    echo -e "${GREEN}✓ Replaced ROADMAP.md${NC}"
  else
    echo -e "${YELLOW}  ⏭  Skipped ROADMAP.md${NC}"
  fi
else
  echo "$ROADMAP_MD" > "$PROJECT_ROOT/ROADMAP.md"
  echo -e "${GREEN}✓ Generated ROADMAP.md${NC}"
fi
echo ""

# Step 7: Summary with table format
echo ""
echo -e "${BLUE}✅ Init workflow complete. Here's what you have:${NC}"
echo ""
echo "┌────────────────────────────────┬──────────────────────────────────────────────┐"
echo "│ File                           │ Purpose                                      │"
echo "├────────────────────────────────┼──────────────────────────────────────────────┤"
echo "│ CLAUDE.md                      │ AI instruction manual for $PROJECT_NAME      │"
echo "│ ROADMAP.md                     │ Development roadmap and phases               │"
echo "│ .claude/preferences.md         │ Workflow preferences and agent limits        │"
echo "│ .claude/agents/git-runner.md   │ Git operations agent (invoked by /commit)    │"
echo "│ .claude/agents/workplanner.md  │ Implementation workplanner agent              │"
echo "│ .claude/agents/reviewer.md     │ Code review agent                            │"
echo "│ .claude/skills/commit/         │ /commit skill (invokes commit agent)         │"
echo "│ .claude/skills/review/         │ /review skill (invokes reviewer agent)       │"
echo "│ .claude/skills/workplan/       │ /workplan skill (invokes workplanner agent)  │"
echo "│ sops/                          │ Standard operating procedures (parallel, etc)│"
echo "└────────────────────────────────┴──────────────────────────────────────────────┘"
echo ""
echo -e "${BLUE}Next steps:${NC}"
echo "  1. Restart Claude Code (/exit + relaunch) to detect new agents and skills"
echo "  2. Verify with /agents — then try /commit, /review, /workplan"
echo "  3. Review and customize CLAUDE.md and ROADMAP.md"
echo "  4. Configure SOPs in sops/ — replace placeholder values ([SYSTEM_RAM], [TERMINAL_APP], etc.)"
echo ""
echo -e "${YELLOW}Optional:${NC}"
echo "  • Delete llm-best-practices/ if you no longer need the reference docs"
echo "  • Add it to .gitignore if you want to keep it untracked"
echo ""
echo -e "${GREEN}Ready to start developing! 🚀${NC}"
