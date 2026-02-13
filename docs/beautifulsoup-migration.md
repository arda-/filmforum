# Migrating from Regex to BeautifulSoup for HTML Parsing

## Overview

This document outlines how we could migrate `parse_showtimes.py` from regex-based HTML parsing to BeautifulSoup. The regex approach works but is brittle—it breaks if Film Forum reorders attributes, adds whitespace, or modifies their HTML structure slightly.

**Status:** Documentation only—not yet implemented.

## Current Approach: Regex

### The Regex Pattern

```python
pattern = r'<h3 class="title style-c"><a class="blue-type"[^>]*>([^<]+)</a></h3>.*?<div class="details">\s*<p>([^<]*(?:<br />[^<]*)*)</p>.*?<a class="button small blue" href="([^"]+)">Buy Tickets</a>'

matches = re.findall(pattern, html, re.DOTALL)
# Returns: List[Tuple[title, schedule_html, ticket_url]]
```

### Problems with Regex

1. **Attribute Order Sensitivity**
   - `class="title style-c"` must appear in that exact order
   - If Film Forum writes `class="style-c title"`, it breaks

2. **Whitespace Fragility**
   - `<h3 class="title style-c">` must have exactly that whitespace
   - Extra spaces, tabs, or newlines can break the match

3. **HTML Structure Coupling**
   - Assumes `<h3>` → `<div class="details">` → `<a class="button">` appears in exact sequence
   - Any intermediate elements break the pattern

4. **Class Name Brittleness**
   - Hard-codes `"title style-c"`, `"blue-type"`, `"button small blue"`
   - CSS refactoring on their end breaks our scraper

5. **Hard to Debug**
   - When the regex fails, you get zero matches
   - No indication of which part of the pattern failed

6. **Hard to Maintain**
   - The pattern is ~200 characters of cryptic regex
   - Modifying it requires expertise and careful testing

## Proposed Approach: BeautifulSoup

### Installation

```bash
pnpm add -D beautifulsoup4  # If using Node-based tooling
# OR
pip install beautifulsoup4 lxml  # For Python environment
```

### Code Example

```python
from bs4 import BeautifulSoup
from typing import List, Tuple

def parse_html(html: str) -> List[Tuple[str, str, str]]:
    """
    Parse HTML to extract movie information using BeautifulSoup.

    Args:
        html: HTML content to parse

    Returns:
        List of tuples (title, schedule_html, ticket_url)
    """
    soup = BeautifulSoup(html, 'lxml')
    results = []

    # Find all movie title headers
    # This finds h3 elements with class containing both "title" and "style-c"
    # Order doesn't matter, extra classes are fine
    title_headers = soup.find_all('h3', class_=lambda c: c and 'title' in c and 'style-c' in c)

    for h3 in title_headers:
        try:
            # Extract title from the link inside h3
            title_link = h3.find('a', class_='blue-type')
            if not title_link:
                continue
            title = title_link.get_text(strip=True)

            # Find the next details div (contains schedule)
            details_div = h3.find_next('div', class_='details')
            if not details_div:
                continue

            # Get schedule HTML from the paragraph
            schedule_p = details_div.find('p')
            if not schedule_p:
                continue

            # Get inner HTML of the paragraph (preserves <br /> tags)
            schedule_html = ''.join(str(content) for content in schedule_p.contents)

            # Find the Buy Tickets button (search within the same container)
            # Start from the h3 and look for the button in the same parent context
            container = h3.parent
            ticket_button = container.find('a', class_=lambda c: c and 'button' in c)
            if not ticket_button:
                continue

            ticket_url = ticket_button.get('href', '').strip()
            if not ticket_url:
                continue

            results.append((title, schedule_html, ticket_url))

        except Exception as e:
            # Log but don't fail on individual parse errors
            print(f"Warning: Failed to parse movie entry: {e}")
            continue

    return results
```

### Alternative: More Robust Selectors

If Film Forum's HTML has a consistent container structure, we can anchor on that:

```python
def parse_html_v2(html: str) -> List[Tuple[str, str, str]]:
    """
    Alternative approach: find movie containers first, then extract data.
    """
    soup = BeautifulSoup(html, 'lxml')
    results = []

    # Assume movies are in a common container (adjust selector as needed)
    # This is more flexible - we're looking for the pattern, not exact classes
    for movie_section in soup.find_all('div', class_=lambda c: c and 'movie' in c.lower()):
        try:
            # Title
            title_elem = movie_section.find('h3', class_='title')
            title = title_elem.get_text(strip=True) if title_elem else None

            # Schedule
            details = movie_section.find('div', class_='details')
            schedule_p = details.find('p') if details else None
            schedule_html = ''.join(str(c) for c in schedule_p.contents) if schedule_p else None

            # Ticket URL
            ticket_link = movie_section.find('a', string=lambda s: s and 'Buy Tickets' in s)
            ticket_url = ticket_link.get('href') if ticket_link else None

            # Only add if we got all required fields
            if title and schedule_html and ticket_url:
                results.append((title, schedule_html, ticket_url))

        except Exception as e:
            print(f"Warning: Failed to parse movie entry: {e}")
            continue

    return results
```

### CSS Selector Approach

BeautifulSoup also supports CSS selectors via `.select()`:

```python
def parse_html_v3(html: str) -> List[Tuple[str, str, str]]:
    """
    Using CSS selectors for maximum flexibility.
    """
    soup = BeautifulSoup(html, 'lxml')
    results = []

    # Find all h3.title elements
    for h3 in soup.select('h3.title'):
        try:
            # Title
            title = h3.get_text(strip=True)

            # Schedule (next .details div after this h3)
            details = h3.find_next_sibling('div', class_='details')
            if not details:
                # Try finding any .details div that comes after
                details = h3.find_next('div', class_='details')

            schedule_html = None
            if details:
                schedule_p = details.select_one('p')
                if schedule_p:
                    schedule_html = ''.join(str(c) for c in schedule_p.contents)

            # Ticket URL (look for button with "Buy Tickets" text)
            container = h3.find_parent()  # Get parent container
            ticket_link = None
            for link in container.select('a.button'):
                if 'Buy Tickets' in link.get_text():
                    ticket_link = link
                    break

            ticket_url = ticket_link.get('href') if ticket_link else None

            if title and schedule_html and ticket_url:
                results.append((title, schedule_html, ticket_url))

        except Exception as e:
            print(f"Warning: Failed to parse movie entry: {e}")
            continue

    return results
```

## Comparison

| Aspect | Regex | BeautifulSoup |
|--------|-------|---------------|
| **Attribute Order** | Breaks if reordered | Order-independent |
| **Whitespace** | Sensitive to changes | Whitespace-agnostic |
| **Class Names** | Exact match required | Can check for presence, not order |
| **HTML Structure** | Rigid—breaks with intermediate elements | Flexible—uses DOM traversal |
| **Debugging** | "No match" or silent failure | Can inspect parsed tree, get partial results |
| **Maintenance** | Requires regex expertise | Readable, Pythonic API |
| **Performance** | Faster for simple patterns | Slower (builds full DOM tree) |
| **Dependencies** | None (stdlib `re`) | Requires `beautifulsoup4` + parser (`lxml`) |

## When the Regex Would Break

### Scenario 1: Class Reordering

```html
<!-- Current HTML (works) -->
<h3 class="title style-c">

<!-- After CSS refactor (breaks regex) -->
<h3 class="style-c title">
```

**BeautifulSoup:** Still works—checks for presence of both classes.

### Scenario 2: Attribute Reordering

```html
<!-- Current HTML (works) -->
<a class="blue-type" href="/film/slug">

<!-- After refactor (breaks regex) -->
<a href="/film/slug" class="blue-type">
```

**BeautifulSoup:** Still works—attribute order doesn't matter.

### Scenario 3: Whitespace Changes

```html
<!-- Current HTML (works) -->
<div class="details">
  <p>Monday, Feb 17<br />7:30</p>

<!-- After minification (breaks regex) -->
<div class="details"><p>Monday, Feb 17<br />7:30</p>
```

**BeautifulSoup:** Still works—whitespace is normalized.

### Scenario 4: Additional Classes

```html
<!-- Current HTML (works) -->
<a class="button small blue" href="...">

<!-- After design system update (breaks regex) -->
<a class="button small blue hover-effect" href="...">
```

**BeautifulSoup:** Still works—checks for class presence, not exact match.

## Trade-offs

### Why BeautifulSoup is Better

1. **Resilience** — Survives minor HTML changes that would break regex
2. **Readability** — Code is self-documenting
3. **Maintainability** — Easier to modify selectors than regex patterns
4. **Debugging** — Can inspect intermediate results
5. **Partial Results** — Can extract what's available even if some fields are missing

### Why We Might Keep Regex

1. **Zero Dependencies** — Regex is stdlib, BeautifulSoup is external
2. **Performance** — Regex is faster for simple patterns (but speed isn't critical here)
3. **Works Today** — Current regex isn't broken *yet*

## Migration Path

If we decide to migrate:

1. **Add Dependency**
   ```bash
   pip install beautifulsoup4 lxml
   ```

2. **Create New Parser Function**
   - Keep `parse_html()` signature identical
   - Swap implementation to BeautifulSoup
   - Return same data format: `List[Tuple[str, str, str]]`

3. **Run Tests**
   - `test_parse_showtimes.py` should pass without modification
   - Tests are implementation-agnostic (they test behavior, not internals)

4. **Test Against Real HTML**
   - Download current Film Forum HTML
   - Verify BeautifulSoup extracts same data as regex
   - Compare output CSVs

5. **Deploy**
   - Update requirements/dependencies
   - No API changes needed (same function signature)

## Real-World Example: Before & After

### Current Regex Version

```python
def parse_html(html: str) -> List[Tuple[str, str, str]]:
    pattern = r'<h3 class="title style-c"><a class="blue-type"[^>]*>([^<]+)</a></h3>.*?<div class="details">\s*<p>([^<]*(?:<br />[^<]*)*)</p>.*?<a class="button small blue" href="([^"]+)">Buy Tickets</a>'

    try:
        matches = re.findall(pattern, html, re.DOTALL)
        return matches
    except Exception as e:
        print(f"Error parsing HTML with regex: {e}")
        raise
```

### BeautifulSoup Version

```python
from bs4 import BeautifulSoup

def parse_html(html: str) -> List[Tuple[str, str, str]]:
    soup = BeautifulSoup(html, 'lxml')
    results = []

    for h3 in soup.find_all('h3', class_='title'):
        try:
            title = h3.get_text(strip=True)
            details = h3.find_next('div', class_='details')
            schedule_html = ''.join(str(c) for c in details.find('p').contents)
            ticket_url = h3.find_next('a', class_='button').get('href')

            if title and schedule_html and ticket_url:
                results.append((title, schedule_html, ticket_url))
        except (AttributeError, TypeError):
            continue

    return results
```

**Lines of Code:** 9 vs 13 (slightly longer, but far more readable)

**Regex Complexity:** 200 chars of pattern vs 0

**Maintainability:** 🔴 Hard → 🟢 Easy

## Testing Considerations

Our existing tests in `test_parse_showtimes.py` would continue to work because:

1. **Same Function Signature** — `parse_html(html: str) -> List[Tuple[str, str, str]]`
2. **Same Return Format** — List of tuples
3. **Same Error Handling** — Can still raise or return empty list

The tests are **implementation-agnostic**—they test the behavior (extracting movies from HTML), not the mechanism (regex vs BeautifulSoup).

## Recommendation

**Implement BeautifulSoup when:**
- Film Forum changes their HTML and regex breaks
- We expand scraping to other pages with different structures
- We need to extract additional fields (director, runtime, etc.)

**Keep regex for now if:**
- It's working and we have more urgent features to build
- We're okay with potential breakage (acceptable risk)
- We want to minimize dependencies

## See Also

- [`parse_showtimes.py`](../data-processing/parse_showtimes.py) — Current implementation
- [`test_parse_showtimes.py`](../data-processing/test_parse_showtimes.py) — Test suite
- [`filmforum-scraping.md`](./filmforum-scraping.md) — Overall scraping strategy
