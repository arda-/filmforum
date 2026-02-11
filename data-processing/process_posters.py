#!/usr/bin/env python3

import os
import re
import json
import urllib.request
from pathlib import Path

# Directories
HTML_DIR = "/Users/ardaungun/code/filmforum/movie-pages"
POSTERS_DIR = "/Users/ardaungun/code/filmforum/astro-calendar/public/posters"
JSON_FILE = "/Users/ardaungun/code/filmforum/tenement-stories-evenings.json"

# Create posters directory if it doesn't exist
os.makedirs(POSTERS_DIR, exist_ok=True)


def validate_poster_url(poster_url: str, movie_title: str) -> None:
    """
    Validate poster URL format at data generation time.
    Ensures URLs are safe relative paths without malicious content.

    Args:
        poster_url: The poster URL to validate
        movie_title: Movie title for error messages

    Raises:
        ValueError: If URL format is invalid or potentially dangerous
    """
    # Check for absolute URLs
    if re.match(r'^https?://', poster_url, re.IGNORECASE):
        raise ValueError(
            f"Invalid poster_url for '{movie_title}': "
            f"Absolute URLs not allowed ({poster_url}). "
            f"Use relative paths like '/posters/movie-name.jpg'"
        )

    # Check for protocol-relative URLs
    if poster_url.startswith('//'):
        raise ValueError(
            f"Invalid poster_url for '{movie_title}': "
            f"Protocol-relative URLs not allowed ({poster_url})"
        )

    # Check for directory traversal
    if '..' in poster_url:
        raise ValueError(
            f"Invalid poster_url for '{movie_title}': "
            f"Directory traversal not allowed ({poster_url})"
        )

    # Check expected format
    if not poster_url.startswith('/posters/'):
        raise ValueError(
            f"Invalid poster_url for '{movie_title}': "
            f"Must start with '/posters/' ({poster_url})"
        )

    # Check for dangerous characters
    if re.search(r'[<>\'"&]', poster_url):
        raise ValueError(
            f"Invalid poster_url for '{movie_title}': "
            f"Contains dangerous characters ({poster_url})"
        )

# Dictionary to map film URLs to poster URLs
film_to_poster = {}

print("=" * 80)
print("TASK 1: Extracting poster URLs from HTML files")
print("=" * 80)

# Process each HTML file
for html_file in sorted(Path(HTML_DIR).glob("*.html")):
    with open(html_file, 'r', encoding='utf-8') as f:
        content = f.read()

    # Extract poster URL from og:image meta tag
    poster_match = re.search(r'property="og:image"\s+content="([^"]+)"', content)
    # Extract film URL from canonical link
    film_url_match = re.search(r'<link rel="canonical" href="([^"]+)"', content)

    if poster_match and film_url_match:
        poster_url = poster_match.group(1)
        film_url = film_url_match.group(1)

        # Get the slug from the HTML filename
        slug = html_file.stem

        film_to_poster[film_url] = {
            'poster_url': poster_url,
            'slug': slug
        }

        print(f"  ✓ {slug}: {poster_url}")

print(f"\nExtracted {len(film_to_poster)} poster URLs")

print("\n" + "=" * 80)
print("TASK 2: Downloading poster images")
print("=" * 80)

downloaded_count = 0
for film_url, data in film_to_poster.items():
    poster_url = data['poster_url']
    slug = data['slug']

    # Determine file extension from URL
    ext = '.png' if poster_url.endswith('.png') else '.jpg'
    local_path = os.path.join(POSTERS_DIR, f"{slug}{ext}")

    try:
        print(f"  Downloading {slug}{ext}...", end=" ")
        urllib.request.urlretrieve(poster_url, local_path)
        print("✓")
        downloaded_count += 1
        # Update the local path in our mapping
        local_poster_path = f"/posters/{slug}{ext}"
        validate_poster_url(local_poster_path, slug)
        film_to_poster[film_url]['local_path'] = local_poster_path
    except Exception as e:
        print(f"✗ Error: {e}")

print(f"\nDownloaded {downloaded_count} posters to {POSTERS_DIR}")

print("\n" + "=" * 80)
print("TASK 3: Updating JSON file with poster URLs")
print("=" * 80)

# Read the JSON file
with open(JSON_FILE, 'r', encoding='utf-8') as f:
    movies = json.load(f)

# Update each movie with poster_url
updated_count = 0
for movie in movies:
    film_url = movie.get('film_url')
    if film_url in film_to_poster:
        local_path = film_to_poster[film_url].get('local_path')
        if local_path:
            validate_poster_url(local_path, movie['Movie'])
            movie['poster_url'] = local_path
            updated_count += 1
            print(f"  ✓ {movie['Movie']}: {local_path}")

# Write the updated JSON back to file
with open(JSON_FILE, 'w', encoding='utf-8') as f:
    json.dump(movies, f, indent=2, ensure_ascii=False)

print(f"\nUpdated {updated_count} entries in {JSON_FILE}")

print("\n" + "=" * 80)
print("SUMMARY")
print("=" * 80)
print(f"  Extracted poster URLs: {len(film_to_poster)}")
print(f"  Downloaded posters: {downloaded_count}")
print(f"  Updated JSON entries: {updated_count}")
print("=" * 80)
