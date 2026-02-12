#!/bin/bash

# Fetch Film Forum series page HTML and save to data/raw-html/
# Usage: ./scripts/fetch-series-html.sh <series-slug>
# Example: ./scripts/fetch-series-html.sh tenement-stories

if [ -z "$1" ]; then
  echo "Usage: ./scripts/fetch-series-html.sh <series-slug>"
  echo "Example: ./scripts/fetch-series-html.sh tenement-stories"
  exit 1
fi

SERIES_SLUG="$1"
URL="https://filmforum.org/series/${SERIES_SLUG}"
OUTPUT_DIR="data/raw-html"
OUTPUT_FILE="${OUTPUT_DIR}/${SERIES_SLUG}.html"

echo "Fetching: ${URL}"

# Create output directory if it doesn't exist
mkdir -p "${OUTPUT_DIR}"

# Fetch the page and save to file
curl -sL "${URL}" > "${OUTPUT_FILE}"

if [ $? -eq 0 ]; then
  echo "✓ Saved to: ${OUTPUT_FILE}"
  echo "  File size: $(wc -c < "${OUTPUT_FILE}") bytes"
else
  echo "✗ Failed to fetch ${URL}"
  exit 1
fi
