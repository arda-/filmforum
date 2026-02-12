#!/bin/bash

# NOTE: Film Forum removes individual film pages after their showtimes pass.
# If HTML files were not cached before page removal, poster extraction will fail
# for those films.

# Directory containing HTML files
HTML_DIR="/Users/ardaungun/code/filmforum/movie-pages"
# Output directory for posters
POSTERS_DIR="/Users/ardaungun/code/filmforum/astro-calendar/public/posters"

# Create posters directory if it doesn't exist
mkdir -p "$POSTERS_DIR"

# Loop through all HTML files
for html_file in "$HTML_DIR"/*.html; do
    # Get the base filename without extension
    base_name=$(basename "$html_file" .html)

    # Extract poster URL from og:image meta tag
    poster_url=$(grep -o 'property="og:image" content="[^"]*' "$html_file" | sed 's/property="og:image" content="//')

    if [ -n "$poster_url" ]; then
        echo "Found poster for $base_name: $poster_url"

        # Download the poster
        curl -s -o "$POSTERS_DIR/${base_name}.png" "$poster_url"

        if [ $? -eq 0 ]; then
            echo "  ✓ Downloaded to ${base_name}.png"
        else
            echo "  ✗ Failed to download"
        fi
    else
        echo "No poster URL found for $base_name"
    fi
done

echo ""
echo "Download complete! Posters saved to: $POSTERS_DIR"
