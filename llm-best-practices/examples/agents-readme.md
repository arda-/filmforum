# Custom Agents

This directory contains custom agent configurations for specialized tasks in the datatable project.

## Available Agents

| Agent | Model | Purpose | Memory Usage |
|-------|-------|---------|--------------|
| **reviewer** | Opus 4.5 | Code review, security analysis | 3.5-4.4GB |
| **workplanner** | Opus 4.6 | Implementation planning | 2.5-3.8GB |
| **tester** | Haiku 4 | Test execution, build validation | 1.2-2.0GB |

## How to Use Custom Agents

### Invoking Agents

Custom agents are invoked automatically by Claude Code when their skills match the task:

```bash
# Code review (automatically uses reviewer agent)
"Review PR #31"

# Planning (automatically uses workplanner agent)
"/workplan Gallery view"

# Testing (automatically uses tester agent)
"Run all tests and report results"
```

### Manual Invocation

You can also explicitly request an agent by name:

```bash
# Explicit agent request
"Use the reviewer agent to analyze security in PR #30"
"Have the workplanner agent create a Phase 2 implementation plan"
"Run the tester agent to validate the build"
```

### Agent Configuration

Each agent is defined in a markdown file with YAML frontmatter:

```yaml
---
name: agent-name
model: opus|sonnet|haiku
tools:
  - Read
  - Grep
  - Bash
permissionMode: dontAsk
hooks:
  PreToolUse:
    - matcher: "Write|Edit"
      command: "exit 1"
---
```

**Key fields:**
- `name`: Agent identifier (used for invocation)
- `model`: LLM model (opus = deep analysis, sonnet = balanced, haiku = speed)
- `tools`: Available tools (read-only agents exclude Write/Edit)
- `permissionMode`: `dontAsk` for automation, `ask` for user confirmation
- `hooks`: Enforce constraints (e.g., prevent code modification)

## Agent Capabilities

### Reviewer (Opus)

**Best for:**
- Security audits (SQL injection, XSS, auth bypass)
- Performance analysis
- Type safety validation
- Architecture review

**Memory:** 3.5-4.4GB (peak during large PR analysis)

**Output:** GitHub PR comments with specific line references

**Example:**
```
"Review PR #31 for security vulnerabilities"
```

### Workplanner (Opus)

**Best for:**
- Breaking down complex features
- Creating Phase.Domain.Step implementation plans
- Dependency analysis
- Mermaid diagrams for architecture

**Memory:** 2.5-3.8GB (peak during multi-domain planning)

**Output:** Structured markdown plan with checkpoints

**Example:**
```
"Create implementation plan for Phase 2 (Authentication)"
```

### Tester (Haiku)

**Best for:**
- Running full test suites
- Build validation
- Flaky test detection
- Quick smoke tests

**Memory:** 1.2-2.0GB (peak during full test run)

**Output:** Test report with pass/fail counts and failure details

**Example:**
```
"Run all tests and validate build before merge"
```

## Memory Management

### Memory Usage by Agent Type

**CRITICAL:** All agents (Opus, Sonnet, Haiku) use the same memory: **up to 4.4GB maximum**.

| Model | Max Memory | Primary Benefit |
|-------|------------|-----------------|
| Opus | 4.4GB | Deep analysis, complex reasoning |
| Sonnet | 4.4GB | Balanced speed and quality |
| Haiku | 4.4GB | Fastest execution |

**Key Points:**
- Memory usage depends on context size and tool usage, NOT model choice
- Always assume 4.4GB per agent for safety calculations
- Model choice affects: speed, quality, cost (NOT memory)
- Observed maximum across all models: 4.4GB

### Before Spawning Agents

Always check available memory:

```bash
# Check current memory usage
ps aux | grep -E 'claude|ghostty' | awk '{sum+=$6} END {print sum/1024/1024 " GB"}'

# Calculate available slots
CURRENT_GB=$(ps aux | grep -E 'claude|ghostty' | awk '{sum+=$6} END {print sum/1024/1024}')
AVAILABLE_GB=$(echo "32 - $CURRENT_GB" | bc)
MAX_AGENTS=$(echo "$AVAILABLE_GB / 4.4" | bc)

echo "Can safely spawn: $MAX_AGENTS agents"
```

**Budget:** 32GB total (48GB system RAM - 16GB for OS/apps)

**Safety margin:** Always leave 1-2GB free (don't spawn if `available < 4.4GB`)

### Parallel Agent Limits

| Current Usage | Max Safe Agents | Notes |
|---------------|-----------------|-------|
| < 10GB | 5 agents | Plenty of headroom |
| 10-20GB | 3 agents | Moderate usage |
| 20-28GB | 1-2 agents | Approaching limit |
| > 28GB | 0 agents | Wait for completion |

**Dynamic calculation:** `max_agents = floor((32GB - current_usage) / 4.4GB)`

See `sops/sop-agent-limits.md` for full memory management guidelines.

## Creating Custom Agents

### 1. Create Agent File

Create `.claude/agents/my-agent.md`:

```markdown
---
name: my-agent
model: sonnet
tools:
  - Read
  - Grep
  - Bash
permissionMode: dontAsk
hooks:
  PreToolUse:
    - matcher: "Write|Edit|NotebookEdit"
      command: "exit 1"
---

# My Custom Agent

**Role:** Brief description

**Expertise:**
- Domain knowledge area 1
- Domain knowledge area 2

## Tasks

1. Primary task description
2. Secondary task description

## Output Format

```markdown
[Expected output structure]
```

## Example Usage

[Usage examples]
```

### 2. Choose Model

| Model | When to Use |
|-------|-------------|
| **Opus** | Deep analysis, security, complex reasoning |
| **Sonnet** | Balanced performance, general tasks |
| **Haiku** | Speed critical, simple tasks, high volume |

### 3. Define Tools

**Read-only agents:**
```yaml
tools:
  - Read
  - Grep
  - Glob
  - Bash  # For read-only commands
```

**Analysis agents:**
```yaml
tools:
  - Read
  - Grep
  - Glob
  - WebFetch  # For documentation lookup
```

### 4. Add Safety Hooks

**Prevent code modification:**
```yaml
hooks:
  PreToolUse:
    - matcher: "Write|Edit|NotebookEdit"
      command: "exit 1"
```

**Enforce read-only Bash:**
```yaml
hooks:
  PreToolUse:
    - matcher: "Bash"
      command: |
        if echo "$TOOL_ARGS" | grep -E "rm|mv|cp|>|git\s+(push|commit)"; then
          echo "BLOCK: Destructive bash command not allowed"
          exit 1
        fi
```

### 5. Test Agent

```bash
# Restart Claude Code to load new agent
claude-code restart

# Or reload agents
/agents

# Test invocation
"Use my-agent to [task description]"
```

## Best Practices

### Agent Design

1. **Single Responsibility** - Each agent does one thing well
2. **Clear Output Format** - Consistent, parseable results
3. **Read-Only by Default** - Use hooks to prevent accidents
4. **Model Selection** - Choose cheapest model that works
5. **Tool Minimalism** - Only include necessary tools

### Usage Patterns

**Sequential work:**
```
1. Workplanner creates implementation plan
2. User reviews and approves
3. Development agents execute plan
4. Tester validates results
5. Reviewer performs final check
```

**Parallel work:**
```
# Spawn 3 review agents simultaneously
"Review PRs #30, #31, and #32 in parallel"

# Each agent gets different PR, no interference
```

### Common Pitfalls

❌ **Don't:**
- Give agents Write/Edit without strong justification
- Assume fixed memory limits (always check dynamically)
- Spawn unlimited agents without memory checks
- Use Opus for simple tasks (expensive, slow)

✅ **Do:**
- Prefer read-only agents for safety
- Calculate memory before spawning
- Use Haiku for repetitive/simple tasks
- Add AI disclaimers to agent output

## Troubleshooting

### Agent Not Found

```
Error: Agent 'my-agent' not found
```

**Fix:** Restart Claude Code or run `/agents` to reload

### Out of Memory

```
System memory critical: 31.8GB / 32GB
```

**Fix:** Wait for agents to complete, or kill idle agents

### Permission Denied

```
Error: Agent attempted to use Write tool (blocked by hook)
```

**Expected:** Read-only agents should be blocked from Write/Edit

## Examples

### Security Audit Workflow

```bash
# 1. Reviewer analyzes security
"Use reviewer to audit PR #31 for SQL injection and XSS vulnerabilities"

# 2. Human reviews findings
# 3. Developer fixes issues
# 4. Reviewer re-checks
"Re-review PR #31 security fixes"
```

### Feature Implementation Workflow

```bash
# 1. Workplanner creates plan
"/workplan Gallery view (Phase 8)"

# 2. User approves plan
# 3. Implementation (manual or agent-assisted)
# 4. Tester validates
"Run all tests and validate build"

# 5. Reviewer checks quality
"Review PR #45 (Gallery view implementation)"
```

### Parallel Code Review

```bash
# Review multiple PRs simultaneously
"Review PRs #30, #31, #32, and #34 in parallel"

# Each spawns a reviewer agent
# All post comments to respective PRs
# User reviews all findings together
```

## See Also

- `.claude/preferences.md` - AI disclaimer requirements
- `sops/sop-agent-limits.md` - Memory management guidelines
- `sops/sop-parallel-agents.md` - Parallel workflow patterns
- `.claude/naming-conventions.md` - Branch naming for PRs

---

**Version:** 1.0 (2026-02-01)
