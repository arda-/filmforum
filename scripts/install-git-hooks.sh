#!/bin/bash

# Install git hooks for the filmforum repository

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
HOOKS_DIR="$PROJECT_ROOT/.git/hooks"

echo "Installing git hooks..."

# Install pre-push hook
cat > "$HOOKS_DIR/pre-push" << 'HOOK_EOF'
#!/bin/bash

# Pre-push hook to run Python tests when data-processing files change

# ANSI color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Get the remote ref being pushed to
remote="$1"
url="$2"

# Check if any Python files in data-processing/ have changed
echo "Checking for changes in data-processing Python files..."

# Get the remote branch we're pushing to
while read local_ref local_sha remote_ref remote_sha
do
    if [ "$remote_sha" = "0000000000000000000000000000000000000000" ]; then
        # New branch, compare with main/master
        if git rev-parse --verify origin/main >/dev/null 2>&1; then
            base_branch="origin/main"
        elif git rev-parse --verify origin/master >/dev/null 2>&1; then
            base_branch="origin/master"
        else
            # No base branch found, skip check
            echo -e "${YELLOW}⚠ No base branch found, skipping Python tests${NC}"
            exit 0
        fi
        range="$base_branch..$local_sha"
    else
        # Existing branch, compare with remote
        range="$remote_sha..$local_sha"
    fi

    # Check if any Python files in data-processing/ changed
    changed_py_files=$(git diff --name-only "$range" | grep "^data-processing/.*\.py$" || true)

    if [ -n "$changed_py_files" ]; then
        echo -e "${YELLOW}Python files changed in data-processing/:${NC}"
        echo "$changed_py_files" | sed 's/^/  - /'
        echo ""
        echo "Running Python tests..."

        # Change to data-processing directory
        cd data-processing || exit 1

        # Check if pytest is available
        if ! command -v pytest &> /dev/null; then
            echo -e "${YELLOW}⚠ pytest not found. Installing from requirements.txt...${NC}"
            pip install -q -r requirements.txt || {
                echo -e "${RED}✗ Failed to install pytest${NC}"
                exit 1
            }
        fi

        # Run pytest
        if pytest -v; then
            echo -e "${GREEN}✓ All Python tests passed${NC}"
        else
            echo -e "${RED}✗ Python tests failed${NC}"
            echo "Fix the tests before pushing, or use --no-verify to skip (not recommended)"
            exit 1
        fi

        cd - > /dev/null
    else
        echo -e "${GREEN}✓ No Python files changed in data-processing/, skipping tests${NC}"
    fi

    # Check if any frontend files changed
    echo ""
    echo "Checking for changes in frontend files..."
    changed_frontend_files=$(git diff --name-only "$range" | \
        grep -E "\.(ts|tsx|astro|test\.ts|test\.tsx|scss|css)$" | \
        grep -v "^data-processing/" || true)

    if [ -n "$changed_frontend_files" ]; then
        echo -e "${YELLOW}Frontend files changed:${NC}"
        echo "$changed_frontend_files" | sed 's/^/  - /'
        echo ""

        # Run frontend tests
        echo "Running frontend tests..."
        if pnpm test:run; then
            echo -e "${GREEN}✓ All frontend tests passed${NC}"
        else
            echo -e "${RED}✗ Frontend tests failed${NC}"
            echo "Fix the tests before pushing, or use --no-verify to skip"
            exit 1
        fi

        # Run build verification
        echo ""
        echo "Building project..."
        if pnpm build; then
            echo -e "${GREEN}✓ Build successful${NC}"
        else
            echo -e "${RED}✗ Build failed${NC}"
            echo "Fix the build errors before pushing"
            exit 1
        fi
    else
        echo -e "${GREEN}✓ No frontend files changed, skipping frontend tests and build check${NC}"
    fi
done

exit 0
HOOK_EOF

chmod +x "$HOOKS_DIR/pre-push"

echo "✓ Pre-push hook installed"
echo ""
echo "Git hooks installed successfully!"
echo ""
echo "The pre-push hook will:"
echo "  - Run Python tests when data-processing/*.py files change"
echo "  - Run frontend tests (pnpm test:run) when frontend files change"
echo "  - Run build check (pnpm build) after frontend tests"
echo "  - Block pushes if any checks fail"
