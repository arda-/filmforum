# Contributing Guide

## Local Validation - Run BEFORE Pushing

**IMPORTANT:** Always validate locally before pushing to avoid wasting CI budget.

### Quick Validation (Required before every push)

```bash
# 1. Validate lockfile is in sync
pnpm run validate:lockfile

# 2. Test production build
pnpm build

# 3. If both pass, you're good to push
git push
```

**Or use the combined command:**
```bash
pnpm run validate:quick && git push
```

### Full Validation (Before opening PR)

```bash
# Validates everything: lockfile, build, lint, tests
pnpm run validate
```

---

## Why This Matters

### The Lockfile Problem

When `pnpm-lock.yaml` is out of sync with `package.json`:
- ❌ Vercel build fails immediately
- 💸 Wastes CI budget
- ⏱️ Wastes team time debugging

**Common causes:**
- Switching branches with different dependencies
- Merging branches
- Adding/removing packages but not committing lockfile

### The Build Problem

When code doesn't build in production:
- ❌ Vercel deployment fails
- 💸 Wastes CI budget
- 🐛 Breaks the deployment pipeline

**Common causes:**
- TypeScript errors
- ESLint errors
- Missing environment variables
- Import/export issues

---

## Local Validation Commands

### `pnpm run validate:lockfile`
Checks if lockfile matches package.json (same as Vercel does).

**What it does:**
```bash
pnpm install --frozen-lockfile
```

**If it fails:**
```bash
# Lockfile is out of sync - update it
pnpm install

# Commit the updated lockfile
git add pnpm-lock.yaml
git commit -m "Update pnpm-lock.yaml"
```

### `pnpm run validate:quick`
Runs lockfile + build validation (takes ~20-30 seconds).

**What it does:**
```bash
pnpm install --frozen-lockfile && pnpm build
```

### `pnpm run validate`
Full validation: lockfile + build + lint + tests (takes ~1-2 minutes).

**What it does:**
```bash
pnpm install --frozen-lockfile && pnpm build && pnpm lint && pnpm test
```

### `pnpm run build:vercel`
Simulates exact Vercel build environment (most accurate, slower).

**What it does:**
```bash
vercel build
```

**When to use:** If you're unsure about deployment-specific issues.

---

## Recommended Workflow

### Daily Development
```bash
# Make changes
# ...

# Before pushing
pnpm run validate:quick && git push
```

### Before Opening PR
```bash
# Run full validation
pnpm run validate

# If all pass
git push
```

### After Switching Branches
```bash
# Always reinstall after switching branches with different deps
pnpm install

# Check if lockfile changed
git status pnpm-lock.yaml

# If changed, commit it
git add pnpm-lock.yaml
git commit -m "Update lockfile after branch switch"
```

### After Merging/Rebasing
```bash
# Reinstall to update lockfile
pnpm install

# Validate everything still works
pnpm run validate:quick
```

---

## Common Scenarios

### "I just switched branches and got a lockfile error"
```bash
# Update lockfile
pnpm install

# Commit if changed
git add pnpm-lock.yaml
git commit -m "Update lockfile"
```

### "I added a new package"
```bash
# Install package
pnpm add some-package

# Lockfile is automatically updated
# Commit both package.json and lockfile
git add package.json pnpm-lock.yaml
git commit -m "Add some-package"

# Validate before pushing
pnpm run validate:quick && git push
```

### "Build failed on Vercel but works locally"
```bash
# Try Vercel build locally
pnpm run build:vercel

# This simulates the exact Vercel environment
# If it fails locally, you can debug it
```

---

## Scripts Reference

| Command | Speed | What It Checks | When To Use |
|---------|-------|----------------|-------------|
| `validate:lockfile` | Fast (~2s) | Lockfile sync | After branch switch |
| `validate:quick` | Medium (~30s) | Lockfile + Build | Before every push |
| `validate` | Slow (~1-2m) | Everything | Before opening PR |
| `build:vercel` | Slow (~30-60s) | Exact Vercel env | Debugging deploy issues |

---

## Pro Tips

1. **Create an alias** in your shell:
   ```bash
   # Add to ~/.zshrc or ~/.bashrc
   alias pushv="pnpm run validate:quick && git push"

   # Then just run:
   pushv
   ```

2. **Check status before committing:**
   ```bash
   git status | grep pnpm-lock.yaml
   # If lockfile changed, commit it!
   ```

3. **Fast feedback loop:**
   ```bash
   # Just check lockfile first (2 seconds)
   pnpm run validate:lockfile

   # If that passes, do full validation
   pnpm run validate:quick
   ```

4. **When in doubt:**
   ```bash
   # Nuclear option: clean reinstall
   rm -rf node_modules pnpm-lock.yaml
   pnpm install
   pnpm run validate:quick
   ```

---

## Questions?

- **"Why not use git hooks?"** - We want explicit control, not automatic. Plus hooks can be frustrating for WIP pushes.
- **"Why not just rely on CI?"** - CI costs money. Catching issues locally saves budget.
- **"Can I skip this?"** - No. If you push broken code, you're wasting everyone's time and money.

---

## The Bottom Line

**Before pushing, run:**
```bash
pnpm run validate:quick && git push
```

That's it. This one command saves CI budget and keeps the deployment pipeline healthy.
