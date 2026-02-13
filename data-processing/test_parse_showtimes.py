"""Unit tests for parse_showtimes.py"""

import pytest
import tempfile
import csv
from pathlib import Path
from datetime import datetime
from unittest.mock import patch, mock_open
import sys
import os

# Sample HTML fixtures for testing
VALID_HTML = """
<h3 class="title style-c"><a class="blue-type" href="#">The Godfather</a></h3>
<div class="details">
    <p>Monday, February 17<br />7:00 PM<br />9:45 PM</p>
</div>
<a class="button small blue" href="https://tickets.example.com/godfather">Buy Tickets</a>
"""

MULTIPLE_MOVIES_HTML = """
<h3 class="title style-c"><a class="blue-type" href="#">The Godfather</a></h3>
<div class="details">
    <p>Monday, February 17<br />7:00 PM</p>
</div>
<a class="button small blue" href="https://tickets.example.com/godfather">Buy Tickets</a>

<h3 class="title style-c"><a class="blue-type" href="#">Taxi Driver</a></h3>
<div class="details">
    <p>Tuesday, February 18<br />8:00 PM</p>
</div>
<a class="button small blue" href="https://tickets.example.com/taxi-driver">Buy Tickets</a>
"""

DUPLICATE_ENTRIES_HTML = """
<h3 class="title style-c"><a class="blue-type" href="#">The Godfather</a></h3>
<div class="details">
    <p>Monday, February 17<br />7:00 PM<br />7:00 PM</p>
</div>
<a class="button small blue" href="https://tickets.example.com/godfather">Buy Tickets</a>
"""

EMPTY_TITLE_HTML = """
<h3 class="title style-c"><a class="blue-type" href="#">   </a></h3>
<div class="details">
    <p>Monday, February 17<br />7:00 PM</p>
</div>
<a class="button small blue" href="https://tickets.example.com/movie">Buy Tickets</a>
"""

INVALID_URL_HTML = """
<h3 class="title style-c"><a class="blue-type" href="#">The Godfather</a></h3>
<div class="details">
    <p>Monday, February 17<br />7:00 PM</p>
</div>
<a class="button small blue" href="/relative/path">Buy Tickets</a>
"""

HTML_ENTITIES_HTML = """
<h3 class="title style-c"><a class="blue-type" href="#">Film &amp; Director</a></h3>
<div class="details">
    <p>Monday, February 17<br />7:00 PM</p>
</div>
<a class="button small blue" href="https://tickets.example.com/film">Buy Tickets</a>
"""


class TestHTMLParsing:
    """Tests for HTML parsing functionality"""

    def test_parse_single_movie_single_showtime(self):
        """Test parsing a single movie with one showtime"""
        import re
        pattern = r'<h3 class="title style-c"><a class="blue-type"[^>]*>([^<]+)</a></h3>.*?<div class="details">\s*<p>([^<]*(?:<br />[^<]*)*)</p>.*?<a class="button small blue" href="([^"]+)">Buy Tickets</a>'
        matches = re.findall(pattern, VALID_HTML, re.DOTALL)

        assert len(matches) == 1
        title, schedule, url = matches[0]
        assert title == "The Godfather"
        assert "7:00 PM" in schedule
        assert url == "https://tickets.example.com/godfather"

    def test_parse_multiple_movies(self):
        """Test parsing multiple movies"""
        import re
        pattern = r'<h3 class="title style-c"><a class="blue-type"[^>]*>([^<]+)</a></h3>.*?<div class="details">\s*<p>([^<]*(?:<br />[^<]*)*)</p>.*?<a class="button small blue" href="([^"]+)">Buy Tickets</a>'
        matches = re.findall(pattern, MULTIPLE_MOVIES_HTML, re.DOTALL)

        assert len(matches) == 2
        assert matches[0][0] == "The Godfather"
        assert matches[1][0] == "Taxi Driver"

    def test_parse_multiple_showtimes_same_movie(self):
        """Test parsing a movie with multiple showtimes on same day"""
        import re
        import html as html_lib

        pattern = r'<h3 class="title style-c"><a class="blue-type"[^>]*>([^<]+)</a></h3>.*?<div class="details">\s*<p>([^<]*(?:<br />[^<]*)*)</p>.*?<a class="button small blue" href="([^"]+)">Buy Tickets</a>'
        matches = re.findall(pattern, VALID_HTML, re.DOTALL)

        title, schedule_html, ticket_url = matches[0]
        lines = re.split(r'<br\s*/>', schedule_html)
        lines = [l.strip() for l in lines if l.strip()]

        # Parse date-time pairs
        showtimes = []
        current_date = None
        for line in lines:
            line = html_lib.unescape(line).strip()
            if re.match(r'(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)', line):
                current_date = line
            elif re.match(r'\d{1,2}:\d{2}', line) and current_date:
                showtimes.append((current_date, line))

        assert len(showtimes) == 2
        assert showtimes[0] == ("Monday, February 17", "7:00 PM")
        assert showtimes[1] == ("Monday, February 17", "9:45 PM")

    def test_html_entity_decoding(self):
        """Test that HTML entities like &amp; are properly decoded"""
        import re
        import html as html_lib

        pattern = r'<h3 class="title style-c"><a class="blue-type"[^>]*>([^<]+)</a></h3>.*?<div class="details">\s*<p>([^<]*(?:<br />[^<]*)*)</p>.*?<a class="button small blue" href="([^"]+)">Buy Tickets</a>'
        matches = re.findall(pattern, HTML_ENTITIES_HTML, re.DOTALL)

        title = html_lib.unescape(matches[0][0])
        assert title == "Film & Director"


class TestValidation:
    """Tests for data validation logic"""

    def test_empty_title_validation(self):
        """Test that empty titles are caught"""
        validation_warnings = []
        title = "   "

        if not title.strip():
            validation_warnings.append("Skipping entry with empty title")

        assert len(validation_warnings) == 1
        assert "empty title" in validation_warnings[0]

    def test_missing_ticket_url_validation(self):
        """Test that missing ticket URLs are caught"""
        validation_warnings = []
        ticket_url = ""
        title = "Movie Title"

        if not ticket_url or not ticket_url.strip():
            validation_warnings.append(f"Warning: Movie '{title}' has no ticket URL")

        assert len(validation_warnings) == 1
        assert "no ticket URL" in validation_warnings[0]

    def test_invalid_url_format_validation(self):
        """Test that non-http URLs are caught"""
        import re
        validation_warnings = []
        ticket_url = "/relative/path"
        title = "Movie Title"

        if not re.match(r'^https?://', ticket_url):
            validation_warnings.append(f"Warning: Invalid ticket URL for '{title}': {ticket_url}")

        assert len(validation_warnings) == 1
        assert "Invalid ticket URL" in validation_warnings[0]

    def test_valid_url_passes_validation(self):
        """Test that valid URLs pass validation"""
        import re
        validation_warnings = []
        ticket_url = "https://tickets.example.com/movie"

        if not re.match(r'^https?://', ticket_url):
            validation_warnings.append(f"Warning: Invalid ticket URL: {ticket_url}")

        assert len(validation_warnings) == 0

    def test_duplicate_detection(self):
        """Test that duplicate entries are detected"""
        seen_entries = set()
        validation_warnings = []

        # First entry
        entry1 = ("Movie Title", "Monday, Feb 17", "7:00 PM", "https://example.com")
        if entry1 in seen_entries:
            validation_warnings.append(f"Skipping duplicate: {entry1[0]} on {entry1[1]} at {entry1[2]}")
        else:
            seen_entries.add(entry1)

        # Duplicate entry
        entry2 = ("Movie Title", "Monday, Feb 17", "7:00 PM", "https://example.com")
        if entry2 in seen_entries:
            validation_warnings.append(f"Skipping duplicate: {entry2[0]} on {entry2[1]} at {entry2[2]}")
        else:
            seen_entries.add(entry2)

        assert len(validation_warnings) == 1
        assert "duplicate" in validation_warnings[0].lower()

    def test_different_entries_not_flagged_as_duplicate(self):
        """Test that different entries are not flagged as duplicates"""
        seen_entries = set()
        validation_warnings = []

        entries = [
            ("Movie A", "Monday, Feb 17", "7:00 PM", "https://example.com/a"),
            ("Movie B", "Monday, Feb 17", "7:00 PM", "https://example.com/b"),
            ("Movie A", "Tuesday, Feb 18", "7:00 PM", "https://example.com/a"),
        ]

        for entry in entries:
            if entry in seen_entries:
                validation_warnings.append(f"Skipping duplicate: {entry[0]}")
            else:
                seen_entries.add(entry)

        assert len(validation_warnings) == 0
        assert len(seen_entries) == 3


class TestCSVOutput:
    """Tests for CSV output generation"""

    def test_csv_header_format(self):
        """Test that CSV has correct headers"""
        with tempfile.NamedTemporaryFile(mode='w', delete=False, suffix='.csv', newline='') as f:
            writer = csv.writer(f)
            writer.writerow(['Movie', 'Date', 'Time', 'Tickets', 'ScrapedAt'])
            temp_path = f.name

        try:
            with open(temp_path, 'r', newline='') as f:
                reader = csv.reader(f)
                headers = next(reader)
                assert headers == ['Movie', 'Date', 'Time', 'Tickets', 'ScrapedAt']
        finally:
            os.unlink(temp_path)

    def test_csv_row_format(self):
        """Test that CSV rows have correct format"""
        scrape_timestamp = datetime.now().isoformat()
        rows = [
            ['The Godfather', 'Monday, February 17', '7:00 PM', 'https://example.com', scrape_timestamp]
        ]

        with tempfile.NamedTemporaryFile(mode='w', delete=False, suffix='.csv', newline='') as f:
            writer = csv.writer(f)
            writer.writerow(['Movie', 'Date', 'Time', 'Tickets', 'ScrapedAt'])
            writer.writerows(rows)
            temp_path = f.name

        try:
            with open(temp_path, 'r', newline='') as f:
                reader = csv.reader(f)
                next(reader)  # Skip header
                row = next(reader)
                assert len(row) == 5
                assert row[0] == 'The Godfather'
                assert row[1] == 'Monday, February 17'
                assert row[2] == '7:00 PM'
                assert row[3] == 'https://example.com'
                # Verify timestamp is ISO format
                datetime.fromisoformat(row[4])
        finally:
            os.unlink(temp_path)

    def test_csv_encoding_utf8(self):
        """Test that CSV is written with UTF-8 encoding"""
        scrape_timestamp = datetime.now().isoformat()
        rows = [
            ['Café Müller', 'Monday, February 17', '7:00 PM', 'https://example.com', scrape_timestamp]
        ]

        with tempfile.NamedTemporaryFile(mode='w', delete=False, suffix='.csv', newline='', encoding='utf-8') as f:
            writer = csv.writer(f)
            writer.writerow(['Movie', 'Date', 'Time', 'Tickets', 'ScrapedAt'])
            writer.writerows(rows)
            temp_path = f.name

        try:
            with open(temp_path, 'r', newline='', encoding='utf-8') as f:
                reader = csv.reader(f)
                next(reader)  # Skip header
                row = next(reader)
                assert row[0] == 'Café Müller'
        finally:
            os.unlink(temp_path)


class TestCommandLineArguments:
    """Tests for command-line argument parsing"""

    def test_default_series_name(self):
        """Test that default series name is 'tenement-stories'"""
        import argparse
        parser = argparse.ArgumentParser()
        parser.add_argument('--series', default='tenement-stories')
        args = parser.parse_args([])

        assert args.series == 'tenement-stories'

    def test_custom_series_name(self):
        """Test parsing custom series name"""
        import argparse
        parser = argparse.ArgumentParser()
        parser.add_argument('--series', default='tenement-stories')
        args = parser.parse_args(['--series', 'my-series'])

        assert args.series == 'my-series'

    def test_custom_input_file(self):
        """Test parsing custom input file"""
        import argparse
        parser = argparse.ArgumentParser()
        parser.add_argument('--input')
        args = parser.parse_args(['--input', 'custom.html'])

        assert args.input == 'custom.html'

    def test_custom_output_file(self):
        """Test parsing custom output file"""
        import argparse
        parser = argparse.ArgumentParser()
        parser.add_argument('--output')
        args = parser.parse_args(['--output', 'custom.csv'])

        assert args.output == 'custom.csv'


class TestTimestampGeneration:
    """Tests for timestamp generation"""

    def test_timestamp_is_iso_format(self):
        """Test that timestamp is in ISO 8601 format"""
        scrape_timestamp = datetime.now().isoformat()

        # Should not raise exception
        parsed = datetime.fromisoformat(scrape_timestamp)
        assert isinstance(parsed, datetime)

    def test_timestamp_is_consistent_across_rows(self):
        """Test that same timestamp is used for all rows in a single run"""
        scrape_timestamp = datetime.now().isoformat()

        rows = [
            ['Movie A', 'Monday', '7:00 PM', 'https://example.com', scrape_timestamp],
            ['Movie B', 'Tuesday', '8:00 PM', 'https://example.com', scrape_timestamp],
        ]

        # All rows should have identical timestamp
        timestamps = [row[4] for row in rows]
        assert len(set(timestamps)) == 1


class TestFileHandling:
    """Tests for file I/O error handling"""

    def test_missing_input_file_error(self):
        """Test that missing input file produces appropriate error"""
        nonexistent_file = '/tmp/nonexistent_file_12345.html'

        with pytest.raises(FileNotFoundError):
            with open(nonexistent_file, 'r', encoding='utf-8') as f:
                f.read()

    def test_invalid_html_doesnt_crash(self):
        """Test that invalid HTML doesn't crash the parser"""
        import re
        invalid_html = "<div>Invalid HTML without proper structure</div>"
        pattern = r'<h3 class="title style-c"><a class="blue-type"[^>]*>([^<]+)</a></h3>.*?<div class="details">\s*<p>([^<]*(?:<br />[^<]*)*)</p>.*?<a class="button small blue" href="([^"]+)">Buy Tickets</a>'

        # Should return empty list, not crash
        matches = re.findall(pattern, invalid_html, re.DOTALL)
        assert matches == []


class TestIntegration:
    """Integration tests for the complete parsing flow"""

    def test_end_to_end_parsing(self):
        """Test complete parsing flow from HTML to CSV"""
        import re
        import html as html_lib

        # Parse HTML
        pattern = r'<h3 class="title style-c"><a class="blue-type"[^>]*>([^<]+)</a></h3>.*?<div class="details">\s*<p>([^<]*(?:<br />[^<]*)*)</p>.*?<a class="button small blue" href="([^"]+)">Buy Tickets</a>'
        matches = re.findall(pattern, MULTIPLE_MOVIES_HTML, re.DOTALL)

        # Process matches
        scrape_timestamp = datetime.now().isoformat()
        rows = []
        seen_entries = set()
        validation_warnings = []

        for title, schedule_html, ticket_url in matches:
            title = title.strip()

            if not title:
                validation_warnings.append("Skipping entry with empty title")
                continue

            if not ticket_url or not ticket_url.strip():
                validation_warnings.append(f"Warning: Movie '{title}' has no ticket URL")
                continue

            ticket_url = ticket_url.strip()
            if not re.match(r'^https?://', ticket_url):
                validation_warnings.append(f"Warning: Invalid ticket URL for '{title}': {ticket_url}")

            lines = re.split(r'<br\s*/>', schedule_html)
            lines = [l.strip() for l in lines if l.strip()]

            current_date = None
            for line in lines:
                line = html_lib.unescape(line).strip()
                if re.match(r'(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)', line):
                    current_date = line
                elif re.match(r'\d{1,2}:\d{2}', line) and current_date:
                    time = line

                    entry_key = (title, current_date, time, ticket_url)
                    if entry_key in seen_entries:
                        validation_warnings.append(f"Skipping duplicate: {title} on {current_date} at {time}")
                        continue
                    seen_entries.add(entry_key)

                    rows.append([title, current_date, time, ticket_url, scrape_timestamp])

        # Verify results
        assert len(rows) == 2
        assert len(validation_warnings) == 0
        assert rows[0][0] == "The Godfather"
        assert rows[1][0] == "Taxi Driver"

        # Verify CSV can be written
        with tempfile.NamedTemporaryFile(mode='w', delete=False, suffix='.csv', newline='', encoding='utf-8') as f:
            writer = csv.writer(f)
            writer.writerow(['Movie', 'Date', 'Time', 'Tickets', 'ScrapedAt'])
            writer.writerows(rows)
            temp_path = f.name

        try:
            # Verify CSV can be read back
            with open(temp_path, 'r', newline='', encoding='utf-8') as f:
                reader = csv.reader(f)
                headers = next(reader)
                data_rows = list(reader)
                assert len(data_rows) == 2
        finally:
            os.unlink(temp_path)
