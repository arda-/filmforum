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

### Pre-push Hook

A git pre-push hook automatically runs Python tests when `data-processing/*.py` files have changed. This ensures code quality without slowing down pushes when only frontend files change.

**The hook:**
- ✅ Only runs when Python files in `data-processing/` are modified
- ✅ Installs pytest automatically if needed
- ✅ Blocks push if tests fail
- ✅ Shows clear colored output

**Install the hook:**

The hook is located at `.git/hooks/pre-push` and should be set up automatically. If you need to reinstall it:

```bash
# From project root
chmod +x .git/hooks/pre-push
```

**Bypass the hook** (not recommended):
```bash
git push --no-verify
```
