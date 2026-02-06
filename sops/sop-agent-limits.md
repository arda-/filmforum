# Standard Operating Procedure: Agent Usage Limits

> **Configured for:** 48GB system RAM, 32GB memory budget, Ghostty terminal.

## Hard Limits

- **Max total memory**: 32 (Claude + Ghostty combined)
- **System RAM**: 48GB total (16GB reserved for OS/other apps)
- **Max concurrent agents**: **DYNAMIC** — calculate before each spawn

## Memory Usage by Agent Type

**CRITICAL:** Any agent (Opus, Sonnet, or Haiku) can use up to **4.4GB maximum**.

The model choice affects speed and quality, NOT memory usage. Always assume 4.4GB per agent for safety calculations.

| Model | Primary Benefit | Max Memory |
|-------|-----------------|------------|
| **Opus** | Deep analysis, complex reasoning | 4.4GB |
| **Sonnet** | Balanced speed/quality | 4.4GB |
| **Haiku** | Fastest execution | 4.4GB |

## Memory Budget Calculation

```
Available for agents: 32 total budget
Per agent: ~4.4GB (observed max, NOT a fixed constant)
Max safe concurrent: (32 - current_usage) / 4.4GB

Example:
- Current usage: 18GB
- Available: 32 - 18 = remaining
- Max agents: remaining / 4.4 (round down)
```

**CRITICAL:**
- Do NOT assume you can always spawn 7 agents
- DO check actual memory usage before spawning
- DO calculate dynamic limit: `(32 - current) / 4.4`
- 4.4GB is observed maximum, not average — actual usage varies

## Decision Tree: When to Use Agents

### 1-2 Tasks
- **Action**: Do it directly (no agents)
- **Why**: Overhead not worth it for small work

### 3-5 Tasks
- **Action**: 1-to-1 parallelization (3-5 agents)
- **Strategy**: One agent per task
- **Example**: 4 API endpoints → 4 agents (one per endpoint)

### 6-8 Tasks
- **Action**: Mostly parallel (6-7 agents)
- **Strategy**: 1-to-1 for most, start considering batching around 7 tasks
- **Example**: 6 components → 6 agents OR 7 components → 5-6 agents (batch 2 similar ones)

### 9-12 Tasks
- **Action**: Spawn 5-7 agents
- **Strategy**: Group similar items together
- **Example**: 10 phase plans → 6 agents (some handle 2 similar plans)

### 13+ Tasks
- **Action**: Spawn 6-8 agents max
- **Strategy**: Equal distribution with logical grouping
- **Example**: 20 test files → 7 agents (~3 files each)

## Batching Strategies

### Strategy 1: By Similarity
Group items that follow the same pattern.

### Strategy 2: By Complexity
Balance simple and complex work per agent.

### Strategy 3: By Dependencies
Keep dependent tasks in the same agent or sequential.

## When NOT to Batch

### Sequential Dependencies
If Task B needs Task A's output, don't batch them together.

### Very Different Patterns
Mixing unrelated work confuses agents and reduces quality.

### Large Individual Tasks
If each task is already complex, don't combine them.

## Monitoring Memory Usage

**CRITICAL:** Always check actual memory usage before spawning agents.

### Check Current Memory Usage

```bash
# Check total Claude + Ghostty memory
ps aux | grep -E 'claude|Ghostty' | awk '{sum+=$6} END {print sum/1024/1024 " GB"}'

# Calculate remaining budget
echo "scale=2; 32 - $(ps aux | grep -E 'claude|Ghostty' | awk '{sum+=$6} END {print sum/1024/1024}')" | bc
```

### Dynamic Agent Limit Calculation

```bash
CURRENT_MEM=$(ps aux | grep -E 'claude|Ghostty' | awk '{sum+=$6} END {print sum/1024/1024}')
AVAILABLE=$(echo "32 - $CURRENT_MEM" | bc)
MAX_AGENTS=$(echo "$AVAILABLE / 4.4" | bc)
echo "Can safely spawn: $MAX_AGENTS agents"
```

### Decision Rules

- If available memory < 4.4GB: **Wait**, don't spawn
- If available memory < 8.8GB: Spawn **1 agent max**
- If available memory < 13.2GB: Spawn **2 agents max**
- If available memory >= 13.2GB: Calculate `available / 4.4` and round down

## Anti-Patterns to Avoid

### One Agent Per Item (when there are too many)
Spawning one agent per small task when you have 8+ items will exceed your memory budget. Batch similar items together.

### Kitchen Sink Batching
Putting everything into one agent causes confusion and low-quality output. Keep logical grouping.

### Smart Batching (the right approach)
Group 2-3 similar items per agent, stay within memory budget, maintain clean logical grouping.

## Response Template

When asked to do multiple things, respond with:

```
I'll batch these into [N] agents to stay under the concurrent limit:
- Agent 1: [Items A, B, C] - [Grouping rationale]
- Agent 2: [Items D, E, F] - [Grouping rationale]
- Agent 3: [Items G, H] - [Grouping rationale]

Proceeding now...
```
