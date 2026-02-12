import re
import csv
import html as html_lib

# NOTE: Film Forum removes individual film pages after their showtimes pass.
# The series page used as input here also gets culled over time, so cache it early.

# Read the HTML file
with open('/Users/ardaungun/code/filmforum/tenement-stories.html', 'r') as f:
    html = f.read()

# Find all movie blocks with title, schedule, and ticket link
# Pattern captures: title, schedule, and Buy Tickets URL
pattern = r'<h3 class="title style-c"><a class="blue-type"[^>]*>([^<]+)</a></h3>.*?<div class="details">\s*<p>([^<]*(?:<br />[^<]*)*)</p>.*?<a class="button small blue" href="([^"]+)">Buy Tickets</a>'

matches = re.findall(pattern, html, re.DOTALL)

# Parse each movie and its showtimes
rows = []
for title, schedule_html, ticket_url in matches:
    title = title.strip()
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
            rows.append([title, current_date, time, ticket_url])

# Write CSV
with open('/Users/ardaungun/code/filmforum/tenement-stories.csv', 'w', newline='') as f:
    writer = csv.writer(f)
    writer.writerow(['Movie', 'Date', 'Time', 'Tickets'])
    writer.writerows(rows)

print(f"Extracted {len(rows)} showtimes for {len(set(r[0] for r in rows))} movies")
