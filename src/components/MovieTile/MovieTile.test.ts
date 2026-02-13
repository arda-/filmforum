// @vitest-environment jsdom

/**
 * Test suite for MovieTile component logic.
 * Tests createMovieElement DOM output, processFFJr, and toTitleCase.
 * Uses Vitest's built-in jsdom environment for DOM support.
 */

import { describe, it, expect } from 'vitest';
import type { Movie } from '../../types/movie';
import { createMovieElement, processFFJr, toTitleCase } from './index';

function makeMovie(overrides: Partial<Movie> = {}): Movie {
  return {
    Movie: 'Test Film',
    Time: '7:00',
    Tickets: 'https://example.com',
    Datetime: '2026-02-11T19:00:00',
    ...overrides,
  };
}

// --- processFFJr ---

describe('processFFJr', () => {
  it('should pass through normal time and title', () => {
    const result = processFFJr('7:00', 'test film');
    expect(result.displayTime).toBe('7:00');
    expect(result.displayTitle).toBe('Test Film');
  });

  it('should strip FF Jr from time and append to title', () => {
    const result = processFFJr('10:00 FF Jr', 'test film');
    expect(result.displayTime).toBe('10:00');
    expect(result.displayTitle).toBe('Test Film (FF Jr.)');
  });

  it('should handle FF Jr with dash separator', () => {
    const result = processFFJr('10:00 - FF Jr', 'test film');
    expect(result.displayTime).toBe('10:00');
    expect(result.displayTitle).toBe('Test Film (FF Jr.)');
  });
});

// --- toTitleCase (re-exported) ---

describe('toTitleCase (MovieTile)', () => {
  it('should title-case basic strings', () => {
    expect(toTitleCase('hello world')).toBe('Hello World');
  });

  it('should handle single word', () => {
    expect(toTitleCase('hello')).toBe('Hello');
  });

  it('should handle empty string', () => {
    expect(toTitleCase('')).toBe('');
  });
});

// --- createMovieElement ---

describe('createMovieElement', () => {
  it('should create element with correct base class', () => {
    const movie = makeMovie();
    const el = createMovieElement(movie, { isTimeline: false });
    expect(el.className).toContain('movie');
  });

  it('should add timeline class in timeline mode', () => {
    const movie = makeMovie();
    const el = createMovieElement(movie, { isTimeline: true });
    expect(el.classList.contains('movie--timeline')).toBe(true);
  });

  it('should not add timeline class in grid mode', () => {
    const movie = makeMovie();
    const el = createMovieElement(movie, { isTimeline: false });
    expect(el.classList.contains('movie--timeline')).toBe(false);
  });

  it('should add has-poster class when poster_url exists', () => {
    const movie = makeMovie({ poster_url: '/poster.jpg' });
    const el = createMovieElement(movie, { isTimeline: false });
    expect(el.classList.contains('has-poster')).toBe(true);
    expect(el.style.backgroundImage).toContain('/poster.jpg');
  });

  it('should not add has-poster class without poster_url', () => {
    const movie = makeMovie({ poster_url: undefined });
    const el = createMovieElement(movie, { isTimeline: false });
    expect(el.classList.contains('has-poster')).toBe(false);
  });

  it('should set timeline positioning styles', () => {
    const movie = makeMovie();
    const el = createMovieElement(movie, { isTimeline: true, topPx: 100, heightPx: 200 });
    // top should include TIMELINE_HEADER_OFFSET (28px)
    expect(el.style.top).toBe('128px');
    expect(el.style.height).toBe('200px');
  });

  it('should set only height in demo mode (no topPx)', () => {
    const movie = makeMovie();
    const el = createMovieElement(movie, { isTimeline: true, heightPx: 150 });
    expect(el.style.height).toBe('150px');
    expect(el.style.top).toBe('');
  });

  it('should render movie title in title case', () => {
    const movie = makeMovie({ Movie: 'test film' });
    const el = createMovieElement(movie, { isTimeline: false });
    const titleEl = el.querySelector('.movie-title');
    expect(titleEl?.textContent).toBe('Test Film');
  });

  it('should render movie time', () => {
    const movie = makeMovie({ Time: '7:30' });
    const el = createMovieElement(movie, { isTimeline: false });
    const timeEl = el.querySelector('.movie-time');
    expect(timeEl?.textContent).toBe('7:30');
  });

  it('should render year and director in metadata', () => {
    const movie = makeMovie({ year: '2024', director: 'John Doe' });
    const el = createMovieElement(movie, { isTimeline: false });
    const metaEl = el.querySelector('.movie-year-director');
    expect(metaEl?.textContent).toBe('2024, John Doe');
  });

  it('should render runtime', () => {
    const movie = makeMovie({ runtime: '120 minutes' });
    const el = createMovieElement(movie, { isTimeline: false });
    const runtimeEl = el.querySelector('.movie-runtime');
    expect(runtimeEl?.textContent).toBe('120min');
  });

  it('should limit actors to first 3', () => {
    const movie = makeMovie({ actors: 'Alice, Bob, Charlie, David, Eve' });
    const el = createMovieElement(movie, { isTimeline: false });
    const actorsEl = el.querySelector('.movie-actors');
    expect(actorsEl?.textContent).toBe('Alice, Bob, Charlie');
  });

  it('should set data attributes for lookup', () => {
    const movie = makeMovie({ Movie: 'My Film', Datetime: '2026-02-11T19:00:00' });
    const el = createMovieElement(movie, { isTimeline: false });
    expect(el.dataset.movieTitle).toBe('My Film');
    expect(el.dataset.movieKey).toBe('2026-02-11T19:00:00_My Film');
  });

  it('should set tabindex and role for keyboard access', () => {
    const movie = makeMovie();
    const el = createMovieElement(movie, { isTimeline: false });
    expect(el.getAttribute('tabindex')).toBe('0');
    expect(el.getAttribute('role')).toBe('button');
  });

  it('should add overlap classes for col 1', () => {
    const movie = makeMovie({ _col: 1, _hasOverlap: true });
    const el = createMovieElement(movie, { isTimeline: true });
    expect(el.classList.contains('overlap-col-1')).toBe(true);
  });

  it('should add overlap-col-0 and has-overlap for col 0 with overlap', () => {
    const movie = makeMovie({ _col: 0, _hasOverlap: true });
    const el = createMovieElement(movie, { isTimeline: true });
    expect(el.classList.contains('overlap-col-0')).toBe(true);
    expect(el.classList.contains('has-overlap')).toBe(true);
  });

  it('should render single-showtime badge when highlight mode and count is 1', () => {
    const movie = makeMovie({ Movie: 'Rare Film' });
    const el = createMovieElement(movie, {
      isTimeline: false,
      filteredCounts: { 'Rare Film': 1 },
      singleShowtimeMode: 'highlight',
    });
    const badge = el.querySelector('.single-showtime-badge');
    expect(badge).not.toBeNull();
  });

  it('should not render badge when count > 1', () => {
    const movie = makeMovie({ Movie: 'Common Film' });
    const el = createMovieElement(movie, {
      isTimeline: false,
      filteredCounts: { 'Common Film': 3 },
      singleShowtimeMode: 'highlight',
    });
    const badge = el.querySelector('.single-showtime-badge');
    expect(badge).toBeNull();
  });

  it('should render poster img element when poster_url exists', () => {
    const movie = makeMovie({ poster_url: '/poster.jpg' });
    const el = createMovieElement(movie, { isTimeline: false });
    const img = el.querySelector('.movie-poster-img') as HTMLImageElement;
    expect(img).not.toBeNull();
    expect(img?.getAttribute('src')).toBe('/poster.jpg');
    expect(img?.getAttribute('loading')).toBe('lazy');
  });
});
