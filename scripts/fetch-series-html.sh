#!/bin/bash

# Fetch Film Forum series page HTML and save to data/raw-html/
#
# WHY: Film Forum series pages contain structured information about film series
# (themes, retrospectives, special events) that we need to parse and display.
# We fetch raw HTML first to enable offline parsing and avoid repeated requests
# to filmforum.org during development.
#
# Usage: ./scripts/fetch-series-html.sh <series-slug>
# Example: ./scripts/fetch-series-html.sh tenement-stories

# Validate that a series slug was provided
if [ -z "$1" ]; then
  echo "Usage: ./scripts/fetch-series-html.sh <series-slug>"
  echo "Example: ./scripts/fetch-series-html.sh tenement-stories"
  exit 1
fi

# Slug must be lowercase alphanumeric with hyphens only.
# This ensures the constructed URL is well-formed (these characters are all URL-safe)
# and prevents path traversal in OUTPUT_FILE (no slashes or dots allowed).
if [[ ! "$1" =~ ^[a-z0-9-]+$ ]]; then
  echo "Invalid slug: must contain only lowercase letters, numbers, and hyphens"
  exit 1
fi

SERIES_SLUG="$1"
URL="https://filmforum.org/series/${SERIES_SLUG}"
OUTPUT_DIR="data/raw-html"
OUTPUT_FILE="${OUTPUT_DIR}/${SERIES_SLUG}.html"

echo "Fetching: ${URL}"

# Ensure output directory exists
# WHY: mkdir -p is idempotent and won't fail if directory already exists
mkdir -p "${OUTPUT_DIR}"

# Fetch the page and save to file
# WHY: -s (silent) suppresses progress, -L follows redirects (filmforum.org may redirect)
curl -sL "${URL}" > "${OUTPUT_FILE}"

# Check if curl succeeded and provide feedback
# WHY: $? captures the exit code of the previous command (curl)
# Exit code 0 means success, non-zero means failure
if [ $? -eq 0 ]; then
  echo "✓ Saved to: ${OUTPUT_FILE}"
  echo "  File size: $(wc -c < "${OUTPUT_FILE}") bytes"
else
  echo "✗ Failed to fetch ${URL}"
  exit 1
fi
