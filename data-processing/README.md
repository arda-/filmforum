# Data Processing Scripts

Python scripts for processing Film Forum showtime data.

## Scripts

### parse_showtimes.py

Parses Film Forum series HTML pages and extracts showtime information to CSV format.

**Usage:**

```bash
# Parse default series (tenement-stories)
python parse_showtimes.py

# Parse a different series
python parse_showtimes.py --series my-series

# Specify custom input/output files
python parse_showtimes.py --input custom.html --output custom.csv
```

**Features:**
- Relative path handling (works across different machines)
- Environment variable support for INPUT_HTML and OUTPUT_CSV
- Command-line arguments for flexibility
- Comprehensive error handling
- Data quality validation (empty fields, URL format, duplicates)
- Data freshness tracking with ScrapedAt timestamps

### process_posters.py

Downloads and processes movie poster images from Film Forum HTML pages.

## Testing

Install test dependencies:

```bash
pip install -r requirements.txt
```

Run tests:

```bash
# Run all tests
pytest

# Run with verbose output
pytest -v

# Run specific test file
pytest test_parse_showtimes.py

# Run specific test class
pytest test_parse_showtimes.py::TestHTMLParsing

# Run specific test
pytest test_parse_showtimes.py::TestHTMLParsing::test_parse_single_movie_single_showtime
```

## Development

The test suite includes:
- HTML parsing tests
- Data validation tests
- CSV output format tests
- Command-line argument tests
- Timestamp generation tests
- File handling tests
- End-to-end integration tests
