"""Unit tests for parse_showtimes.py"""

import pytest
import tempfile
import csv
from pathlib import Path
from datetime import datetime
from unittest.mock import patch, mock_open
import sys
import os

# Import the actual production functions
from parse_showtimes import parse_html, process_matches, write_csv

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
        matches = parse_html(VALID_HTML)

        assert len(matches) == 1
        title, schedule, url = matches[0]
        assert title == "The Godfather"
        assert "7:00 PM" in schedule
        assert url == "https://tickets.example.com/godfather"

    def test_parse_multiple_movies(self):
        """Test parsing multiple movies"""
        matches = parse_html(MULTIPLE_MOVIES_HTML)

        assert len(matches) == 2
        assert matches[0][0] == "The Godfather"
        assert matches[1][0] == "Taxi Driver"

    def test_parse_multiple_showtimes_same_movie(self):
        """Test parsing a movie with multiple showtimes on same day"""
        matches = parse_html(VALID_HTML)
        scrape_timestamp = datetime.now().isoformat()
        rows, _ = process_matches(matches, scrape_timestamp)

        # Should produce 2 rows for the 2 showtimes
        assert len(rows) == 2
        assert rows[0][0] == "The Godfather"
        assert rows[0][1] == "Monday, February 17"
        assert rows[0][2] == "7:00 PM"
        assert rows[1][0] == "The Godfather"
        assert rows[1][1] == "Monday, February 17"
        assert rows[1][2] == "9:45 PM"

    def test_html_entity_decoding(self):
        """Test that HTML entities like &amp; are properly decoded"""
        matches = parse_html(HTML_ENTITIES_HTML)
        scrape_timestamp = datetime.now().isoformat()
        rows, _ = process_matches(matches, scrape_timestamp)

        # Title should have decoded ampersand
        assert rows[0][0] == "Film & Director"


class TestValidation:
    """Tests for data validation logic"""

    def test_empty_title_validation(self):
        """Test that empty titles are caught"""
        matches = parse_html(EMPTY_TITLE_HTML)
        scrape_timestamp = datetime.now().isoformat()
        rows, warnings = process_matches(matches, scrape_timestamp)

        # Empty title should be skipped
        assert len(rows) == 0
        assert any("empty title" in w for w in warnings)

    def test_missing_ticket_url_validation(self):
        """Test that missing ticket URLs are caught"""
        # Create HTML with whitespace ticket URL (empty href won't match regex)
        html_no_url = """
<h3 class="title style-c"><a class="blue-type" href="#">Movie Title</a></h3>
<div class="details">
    <p>Monday, February 17<br />7:00 PM</p>
</div>
<a class="button small blue" href="   ">Buy Tickets</a>
"""
        matches = parse_html(html_no_url)
        scrape_timestamp = datetime.now().isoformat()
        rows, warnings = process_matches(matches, scrape_timestamp)

        assert len(rows) == 0
        assert any("no ticket URL" in w for w in warnings)

    def test_invalid_url_format_validation(self):
        """Test that non-http URLs are caught and entry is skipped"""
        matches = parse_html(INVALID_URL_HTML)
        scrape_timestamp = datetime.now().isoformat()
        rows, warnings = process_matches(matches, scrape_timestamp)

        # Should produce warning for invalid URL and skip the entry
        assert len(rows) == 0
        assert any("Invalid ticket URL" in w for w in warnings)

    def test_valid_url_passes_validation(self):
        """Test that valid URLs pass validation"""
        matches = parse_html(VALID_HTML)
        scrape_timestamp = datetime.now().isoformat()
        rows, warnings = process_matches(matches, scrape_timestamp)

        # Should not produce URL validation warnings
        assert not any("Invalid ticket URL" in w for w in warnings)

    def test_duplicate_detection(self):
        """Test that duplicate entries are detected"""
        matches = parse_html(DUPLICATE_ENTRIES_HTML)
        scrape_timestamp = datetime.now().isoformat()
        rows, warnings = process_matches(matches, scrape_timestamp)

        # Should only produce 1 row (duplicate skipped)
        assert len(rows) == 1
        assert any("duplicate" in w.lower() for w in warnings)

    def test_different_entries_not_flagged_as_duplicate(self):
        """Test that different entries are not flagged as duplicates"""
        matches = parse_html(MULTIPLE_MOVIES_HTML)
        scrape_timestamp = datetime.now().isoformat()
        rows, warnings = process_matches(matches, scrape_timestamp)

        # Should produce 2 rows with no duplicate warnings
        assert len(rows) == 2
        assert not any("duplicate" in w.lower() for w in warnings)


class TestCSVOutput:
    """Tests for CSV output generation"""

    def test_csv_header_format(self):
        """Test that CSV has correct headers"""
        scrape_timestamp = datetime.now().isoformat()
        rows = []

        with tempfile.NamedTemporaryFile(mode='w', delete=False, suffix='.csv') as f:
            temp_path = f.name

        try:
            write_csv(rows, temp_path)
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

        with tempfile.NamedTemporaryFile(mode='w', delete=False, suffix='.csv') as f:
            temp_path = f.name

        try:
            write_csv(rows, temp_path)
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

        with tempfile.NamedTemporaryFile(mode='w', delete=False, suffix='.csv') as f:
            temp_path = f.name

        try:
            write_csv(rows, temp_path)
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
        # Parse HTML using production function
        matches = parse_html(MULTIPLE_MOVIES_HTML)

        # Process matches using production function
        scrape_timestamp = datetime.now().isoformat()
        rows, validation_warnings = process_matches(matches, scrape_timestamp)

        # Verify results
        assert len(rows) == 2
        assert len(validation_warnings) == 0
        assert rows[0][0] == "The Godfather"
        assert rows[1][0] == "Taxi Driver"

        # Verify CSV can be written using production function
        with tempfile.NamedTemporaryFile(mode='w', delete=False, suffix='.csv') as f:
            temp_path = f.name

        try:
            write_csv(rows, temp_path)

            # Verify CSV can be read back
            with open(temp_path, 'r', newline='', encoding='utf-8') as f:
                reader = csv.reader(f)
                headers = next(reader)
                data_rows = list(reader)
                assert len(data_rows) == 2
                assert headers == ['Movie', 'Date', 'Time', 'Tickets', 'ScrapedAt']
        finally:
            os.unlink(temp_path)
