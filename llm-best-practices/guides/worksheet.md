# LLM Documentation Worksheet

**Purpose:** Fill out this worksheet, then use it to create your project's LLM-optimized documentation.

**Time:** 20-30 minutes

**Output:** Ready-to-use CLAUDE.md and related documentation files

---

## Part 1: Project Basics

### Project Overview

**What is your project?** (1 sentence)
```
This is a [type of application] that [what it does for users].

Example: "This is a task management application that helps teams coordinate work."
```

**Primary tech stack:** (3-5 technologies)
```
-
-
-
-
-
```

**Architecture style:** (check one)
- [ ] Monolith (single application)
- [ ] Microservices (multiple services)
- [ ] Serverless (cloud functions)
- [ ] JAMstack (static + APIs)
- [ ] Full-stack framework (Next.js, Rails, etc.)
- [ ] Other: ___________

---

## Part 2: Development Environment

### Package Manager
- [ ] npm
- [ ] pnpm
- [ ] yarn
- [ ] bun
- [ ] Other: ___________

### Key Commands

**Start development server:**
```bash

```

**Run tests:**
```bash

```

**Production build:**
```bash

```

**Linting:**
```bash

```

**Database migrations (if applicable):**
```bash

```

### Environment Setup

**What needs to be running?** (check all that apply)
- [ ] Local database (Docker)
- [ ] Local database (native)
- [ ] Redis/cache
- [ ] Message queue
- [ ] Cloud services (which?): ___________
- [ ] Other: ___________

**How do you set up locally?** (commands in order)
```bash
1.
2.
3.
4.
```

---

## Part 3: Architecture & Patterns

### Key Architecture Decisions

**List 3-5 important architectural decisions in your project:**

1. **Decision:**
   **Why:**

2. **Decision:**
   **Why:**

3. **Decision:**
   **Why:**

4. **Decision:**
   **Why:**

5. **Decision:**
   **Why:**

### Code Patterns

**Pattern 1: [Category - e.g., "State Management"]**

What's the pattern?
```


```

Example code:
```typescript


```

**Pattern 2: [Category - e.g., "Error Handling"]**

What's the pattern?
```


```

Example code:
```typescript


```

**Pattern 3: [Category - e.g., "API Calls"]**

What's the pattern?
```


```

Example code:
```typescript


```

---

## Part 4: Key Files

**List 10-15 most important files in your project:**

| File Path | What It Does |
|-----------|--------------|
| | |
| | |
| | |
| | |
| | |
| | |
| | |
| | |
| | |
| | |
| | |
| | |
| | |
| | |
| | |

---

## Part 5: Common Gotchas

**List 3-10 things that commonly trip people up:**

1. **Gotcha:**
   **Why it matters:**
   **How to avoid:**

2. **Gotcha:**
   **Why it matters:**
   **How to avoid:**

3. **Gotcha:**
   **Why it matters:**
   **How to avoid:**

4. **Gotcha:**
   **Why it matters:**
   **How to avoid:**

5. **Gotcha:**
   **Why it matters:**
   **How to avoid:**

---

## Part 6: Testing Strategy

### Test Types

**Unit Tests:**
- Framework: ___________
- Location: ___________
- Run command: `___________`
- What we test: ___________

**Integration Tests:**
- Framework: ___________
- Location: ___________
- Run command: `___________`
- What we test: ___________

**E2E Tests:**
- Framework: ___________
- Location: ___________
- Run command: `___________`
- What we test: ___________

### Quality Standards

**Before merging, code must:**
- [ ] Pass all tests
- [ ] Pass linting
- [ ] Build successfully
- [ ] Have X% code coverage (if applicable): _____%
- [ ] Be reviewed by _____ people
- [ ] Other: ___________

---

## Part 7: Security Concerns

**What are the top 3-5 security concerns for your stack?**

1. **Concern:**
   **How we prevent:**

2. **Concern:**
   **How we prevent:**

3. **Concern:**
   **How we prevent:**

4. **Concern:**
   **How we prevent:**

5. **Concern:**
   **How we prevent:**

---

## Part 8: Directory Structure

**Describe your src/ directory:**

```
src/
├── [directory]/          # [What's in here]
├── [directory]/          # [What's in here]
├── [directory]/          # [What's in here]
├── [directory]/          # [What's in here]
├── [directory]/          # [What's in here]
└── [directory]/          # [What's in here]
```

**Other important directories:**

```
[root]/
├── [directory]/          # [What's in here]
├── [directory]/          # [What's in here]
└── [directory]/          # [What's in here]
```

---

## Part 9: Data Flow

**How does data flow through your system?**

**User action → Response** (describe the path):

```
1. User [does X]
2. Frontend [component/action]
3. API/Backend [endpoint/service]
4. Database/External Service [operation]
5. Response back through [path]
6. UI updates [how]
```

**Example for a specific feature:**

Feature: ___________

```
1.
2.
3.
4.
5.
6.
```

---

## Part 10: Communication Preferences

### How should AI communicate with you?

**Response style:** (check one)
- [ ] Concise (brief updates, get to the point)
- [ ] Detailed (explain everything)
- [ ] Balanced (brief updates, detailed when asked)

**When to ask for confirmation:**
- [ ] Always ask before making changes
- [ ] Only ask for risky operations (deletes, force push, etc.)
- [ ] Rarely ask (move fast, I'll review after)

**Code review tone:**
- [ ] Direct and factual
- [ ] Encouraging and positive
- [ ] Balanced (positive + critical)

**Time estimates:**
- [ ] Don't provide estimates
- [ ] Provide rough estimates when asked
- [ ] Always include estimates for planning

---

## Part 11: Project Phases (Optional)

**If you're using a phased development approach:**

### Phase 1: [Name]
**Goal:**
**Status:** [Not started / In progress / Complete]
**Key deliverables:**
-
-
-

### Phase 2: [Name]
**Goal:**
**Status:** [Not started / In progress / Complete]
**Key deliverables:**
-
-
-

### Phase 3: [Name]
**Goal:**
**Status:** [Not started / In progress / Complete]
**Key deliverables:**
-
-
-

---

## Part 12: Custom Agents (Advanced)

**Do you want specialized AI agents?** (check all that apply)

- [ ] **Reviewer Agent** - Automated code review
  - Should check for: ___________
  - Should prevent: ___________
  - Model: Opus (deep analysis) / Sonnet (balanced) / Haiku (fast)

- [ ] **Workplanner Agent** - Create implementation plans
  - Planning style: ___________
  - Should include: ___________
  - Model: Opus / Sonnet / Haiku

- [ ] **Tester Agent** - Run and report on tests
  - Test types to run: ___________
  - Report format: ___________
  - Model: Opus / Sonnet / Haiku

- [ ] **Custom Agent:** ___________
  - Purpose: ___________
  - Capabilities: ___________
  - Model: Opus / Sonnet / Haiku

---

## Next Steps

### After Completing This Worksheet

1. **Create CLAUDE.md:**
   - Use `../templates/CLAUDE.md.template`
   - Fill in with your answers from this worksheet
   - Place in repository root

2. **Add Validation Scripts:**
   - Add to `package.json` (see Part 2 for your commands)
   ```json
   "validate:quick": "[your build command]",
   "validate": "[build] && [lint] && [test]"
   ```

3. **Create .claude/preferences.md:**
   - Use `../templates/preferences.md.template`
   - Customize with Part 10 answers

4. **Create Architecture Docs (Optional):**
   - Create `docs/architecture/README.md`
   - Use Parts 3, 8, and 9 from this worksheet

5. **Create Custom Agents (Optional):**
   - Use Part 12 to decide which agents you need
   - Follow agent templates in `../templates/`

### Testing Your Documentation

After creating docs, test with Claude:

```
"Read CLAUDE.md and summarize this project. What are the key patterns I should follow?"
```

If Claude accurately describes your project, you're done!

If not, update CLAUDE.md with missing information.

---

## Tips for Filling Out This Worksheet

### Work with Your Team

- **Don't do this alone:** Get input from 2-3 developers
- **30-minute meeting:** Go through this together
- **Capture debates:** If team disagrees on a pattern, document both approaches

### Be Specific

**❌ Vague:**
```
"We use React hooks for state"
```

**✅ Specific:**
```
"Server state: TanStack Query
UI state: Zustand stores
Form state: React Hook Form + Zod validation"
```

### Show, Don't Just Tell

**❌ Abstract:**
```
"We handle errors properly"
```

**✅ Concrete:**
```javascript
// Always wrap async operations
try {
  const result = await api.call()
  return { data: result }
} catch (error) {
  if (error instanceof ApiError) {
    return { error: error.message }
  }
  return { error: 'Something went wrong' }
}
```

### Update Over Time

- **First pass:** Fill in what you know (80% is fine)
- **After 2 weeks:** Update with patterns you've discovered
- **Monthly:** Review and refine

---

## Example: Filled Out Worksheet (E-commerce Platform)

### Part 1: Project Basics

**What is your project?**
```
This is an e-commerce platform that enables small businesses to sell online.
```

**Primary tech stack:**
```
- Next.js 14 (App Router)
- PostgreSQL + Prisma
- Stripe for payments
- Redis (Upstash) for caching
- Vercel for hosting
```

**Architecture style:**
- [x] Full-stack framework (Next.js)

### Part 2: Development Environment

**Package Manager:**
- [x] pnpm

**Key Commands:**
- Start dev: `pnpm dev`
- Tests: `pnpm test`
- Build: `pnpm build`
- Lint: `pnpm lint`
- Migrations: `pnpm prisma migrate dev`

**Environment Setup:**
```bash
1. git clone [repo]
2. pnpm install
3. docker-compose up -d  # Starts PostgreSQL + Redis
4. cp .env.example .env.local
5. pnpm prisma migrate dev
6. pnpm dev
```

[Continue filling out remaining sections...]

---

**Version:** 1.0
**Created:** 2026-02-05
**Time to complete:** 20-30 minutes
**Output:** Ready-to-use documentation for your project
