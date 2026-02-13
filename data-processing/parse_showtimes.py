import re
import csv
import html as html_lib
import os
import sys
import argparse
from pathlib import Path
from datetime import datetime

# NOTE: Film Forum removes individual film pages after their showtimes pass.
# The series page used as input here also gets culled over time, so cache it early.

# Get script directory for relative paths
SCRIPT_DIR = Path(__file__).parent
PROJECT_ROOT = SCRIPT_DIR.parent

# Parse command-line arguments
parser = argparse.ArgumentParser(
    description='Parse Film Forum series showtimes from HTML to CSV',
    formatter_class=argparse.RawDescriptionHelpFormatter,
    epilog='''
Examples:
  # Parse tenement-stories series (default)
  %(prog)s

  # Parse a different series
  %(prog)s --series my-series

  # Specify custom input/output files
  %(prog)s --input my-file.html --output my-file.csv
'''
)
parser.add_argument(
    '--series',
    default='tenement-stories',
    help='Series name (default: tenement-stories). Used to determine default input/output files.'
)
parser.add_argument(
    '--input',
    help='Input HTML file path (overrides --series default)'
)
parser.add_argument(
    '--output',
    help='Output CSV file path (overrides --series default)'
)

args = parser.parse_args()

# Determine input and output files
if args.input:
    INPUT_HTML = args.input
else:
    INPUT_HTML = os.environ.get('INPUT_HTML', str(PROJECT_ROOT / f'{args.series}.html'))

if args.output:
    OUTPUT_CSV = args.output
else:
    OUTPUT_CSV = os.environ.get('OUTPUT_CSV', str(PROJECT_ROOT / f'{args.series}.csv'))

# Read the HTML file
try:
    with open(INPUT_HTML, 'r', encoding='utf-8') as f:
        html = f.read()
except FileNotFoundError:
    print(f"Error: Input file not found: {INPUT_HTML}")
    exit(1)
except Exception as e:
    print(f"Error reading input file: {e}")
    exit(1)

# Find all movie blocks with title, schedule, and ticket link
# Pattern captures: title, schedule, and Buy Tickets URL
pattern = r'<h3 class="title style-c"><a class="blue-type"[^>]*>([^<]+)</a></h3>.*?<div class="details">\s*<p>([^<]*(?:<br />[^<]*)*)</p>.*?<a class="button small blue" href="([^"]+)">Buy Tickets</a>'

try:
    matches = re.findall(pattern, html, re.DOTALL)
except Exception as e:
    print(f"Error parsing HTML with regex: {e}")
    exit(1)

# Parse each movie and its showtimes
# Add timestamp for data freshness tracking
scrape_timestamp = datetime.now().isoformat()

rows = []
seen_entries = set()  # For duplicate detection
validation_warnings = []

for title, schedule_html, ticket_url in matches:
    title = title.strip()

    # Validate required fields
    if not title:
        validation_warnings.append("Skipping entry with empty title")
        continue

    if not ticket_url or not ticket_url.strip():
        validation_warnings.append(f"Warning: Movie '{title}' has no ticket URL")
        continue

    # Validate ticket URL format
    ticket_url = ticket_url.strip()
    if not re.match(r'^https?://', ticket_url):
        validation_warnings.append(f"Warning: Invalid ticket URL for '{title}': {ticket_url}")

    # Clean up the schedule - split by <br />
    lines = re.split(r'<br\s*/>', schedule_html)
    lines = [l.strip() for l in lines if l.strip()]

    # Parse date-time pairs
    current_date = None
    for line in lines:
        # Clean HTML entities
        line = html_lib.unescape(line).strip()
        if re.match(r'(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)', line):
            current_date = line
        elif re.match(r'\d{1,2}:\d{2}', line) and current_date:
            time = line

            # Duplicate detection
            entry_key = (title, current_date, time, ticket_url)
            if entry_key in seen_entries:
                validation_warnings.append(f"Skipping duplicate: {title} on {current_date} at {time}")
                continue
            seen_entries.add(entry_key)

            rows.append([title, current_date, time, ticket_url, scrape_timestamp])

# Report validation warnings
if validation_warnings:
    print("\n⚠ Validation Warnings:")
    for warning in validation_warnings:
        print(f"  {warning}")

# Write CSV
try:
    with open(OUTPUT_CSV, 'w', newline='', encoding='utf-8') as f:
        writer = csv.writer(f)
        writer.writerow(['Movie', 'Date', 'Time', 'Tickets', 'ScrapedAt'])
        writer.writerows(rows)
    print(f"\n✓ Extracted {len(rows)} showtimes for {len(set(r[0] for r in rows))} movies")
    print(f"✓ Scraped at: {scrape_timestamp}")
    print(f"✓ Wrote output to: {OUTPUT_CSV}")

    # Data quality summary
    if validation_warnings:
        print(f"\n⚠ Total validation warnings: {len(validation_warnings)}")
except Exception as e:
    print(f"Error writing CSV file: {e}")
    exit(1)
