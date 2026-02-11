/**
 * Core movie and showtime type definitions
 * Centralized types used across the Film Forum application
 */

/**
 * Movie showtime entry with all metadata
 * Represents a single movie screening with time, details, and optional metadata
 */
export interface Movie {
  Movie: string;
  Time: string;
  Tickets: string;
  Datetime: string;
  year?: string;
  director?: string;
  runtime?: string;
  actors?: string;
  description?: string;
  country?: string;
  film_url?: string;
  poster_url?: string;
  _col?: number;
  _hasOverlap?: boolean;
}

/**
 * A single showtime with time and ticket link
 */
export interface Showtime {
  time: string;
  tickets?: string;
}

/**
 * A movie grouped with all its showtimes for a given date
 */
export interface GroupedMovie {
  film: Movie;
  showtimes: Showtime[];
}

/**
 * Result of aggregating movies for a specific date
 */
export interface AggregationResult {
  targetDate: string;
  movies: GroupedMovie[];
}

/**
 * Time range for a day's movie schedule
 */
export interface DayTimeRange {
  start: number;
  end: number;
  range: number;
}
