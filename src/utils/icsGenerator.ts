/**
 * ICS Calendar Generation Utilities
 * Functions for generating and downloading ICS calendar files for movie showtimes
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
 * Converts a string to title case
 */
function toTitleCase(str: string): string {
  return str.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
}

/**
 * Formats a Date object to ICS date format (YYYYMMDDTHHMMSSZ)
 */
function formatICSDate(date: Date): string {
  return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
}

/**
 * Escapes special characters for ICS format
 * ICS requires escaping backslash, semicolon, comma, and newline characters
 */
function escapeICS(str: string): string {
  return str.replace(/[\\;,\n]/g, (match) => {
    if (match === '\n') return '\\n';
    return '\\' + match;
  });
}

/**
 * Generates an ICS calendar file content for a movie showtime
 */
export function generateICS(movie: Movie): string {
  const startDate = new Date(movie.Datetime);
  const runtime = parseInt(movie.runtime || '90');
  const endDate = new Date(startDate.getTime() + runtime * 60000);

  const title = `${toTitleCase(movie.Movie)} at Film Forum`;
  const location = 'Film Forum, 209 W Houston St, New York, NY 10014';
  const description = [
    movie.director ? `Director: ${movie.director}` : '',
    movie.year ? `Year: ${movie.year}` : '',
    movie.description ? movie.description.substring(0, 200) + (movie.description.length > 200 ? '...' : '') : ''
  ].filter(Boolean).join('\n');

  const uid = `${startDate.getTime()}-${movie.Movie.replace(/\s+/g, '')}@filmforum`;

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Film Forum Calendar//EN',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${formatICSDate(new Date())}`,
    `DTSTART:${formatICSDate(startDate)}`,
    `DTEND:${formatICSDate(endDate)}`,
    `SUMMARY:${escapeICS(title)}`,
    `LOCATION:${escapeICS(location)}`,
    `DESCRIPTION:${escapeICS(description)}`,
    movie.Tickets ? `URL:${movie.Tickets}` : '',
    'END:VEVENT',
    'END:VCALENDAR'
  ].filter(Boolean).join('\r\n');
}

/**
 * Downloads an ICS calendar file for a movie showtime
 * Creates a blob, generates a download link, and triggers the download
 */
export function downloadICS(movie: Movie): void {
  const icsContent = generateICS(movie);
  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = `${movie.Movie.replace(/\s+/g, '-').toLowerCase()}-film-forum.ics`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
