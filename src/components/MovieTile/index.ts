/**
 * Movie Tile Component
 * Shared logic for rendering movie tiles in both timeline and non-timeline modes
 */

import type { Movie } from '../../utils/icsGenerator';

export interface TileOptions {
  isTimeline: boolean;
  topPx?: number;
  heightPx?: number;
  // For main page state integration
  filteredCounts?: Record<string, number>;
  singleShowtimeMode?: string;
}

function toTitleCase(str: string): string {
  return str.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
}

function processFFJr(time: string, title: string): { displayTime: string; displayTitle: string } {
  const isFFJr = time.includes('FF Jr');
  return {
    displayTime: isFFJr ? time.replace(/\s*[–-]?\s*FF Jr\.?/g, '').trim() : time,
    displayTitle: isFFJr ? `${toTitleCase(title)} (FF Jr.)` : toTitleCase(title)
  };
}

export function createMovieElement(movie: Movie, options: TileOptions): HTMLElement {
  const { isTimeline, topPx, heightPx, filteredCounts, singleShowtimeMode } = options;

  const el = document.createElement('div');
  el.className = 'movie';

  // Timeline mode classes
  if (isTimeline) {
    el.classList.add('movie--timeline');
    if (movie._col === 1) el.classList.add('overlap-col-1');
    else if (movie._hasOverlap) el.classList.add('overlap-col-0', 'has-overlap');
  }

  // Poster handling - BOTH modes use background-image
  if (movie.poster_url) {
    el.classList.add('has-poster');
    el.style.backgroundImage = `url(${movie.poster_url})`;
  }

  // Timeline positioning
  if (isTimeline && topPx !== undefined && heightPx !== undefined) {
    el.style.top = `${topPx + 28}px`;
    el.style.height = `${heightPx}px`;
  } else if (isTimeline && heightPx !== undefined) {
    // Demo mode: just height, no top positioning
    el.style.height = `${heightPx}px`;
  }

  // Build HTML
  const { displayTime, displayTitle } = processFFJr(movie.Time, movie.Movie);
  const yearDirector = [movie.year, movie.director].filter(Boolean).join(', ');
  const runtime = movie.runtime?.replace(' minutes', 'min').replace(' ', '') || '';
  const actors = movie.actors?.split(',').slice(0, 3).map(a => a.trim()).join(', ') || '';

  // Single showtime badge (main page feature)
  const isSingle = filteredCounts && filteredCounts[movie.Movie] === 1;
  const badge = (singleShowtimeMode === 'highlight' && isSingle)
    ? '<span class="single-showtime-badge" title="Only showtime with current filters">&#9733;</span>' : '';

  el.innerHTML = `
    ${badge}
    ${movie.poster_url ? `<img class="movie-poster-img" src="${movie.poster_url}" alt="${movie.Movie}" loading="lazy" width="300" height="300" />` : ''}
    <div class="movie-clickable">
      <div class="movie-text">
        <div class="movie-header">
          <span class="movie-time">${displayTime}</span>
          <span class="movie-title">${displayTitle}</span>
        </div>
        <div class="movie-meta">
          ${yearDirector ? `<span class="movie-year-director">${yearDirector}</span>` : ''}
          ${runtime ? `<span class="movie-runtime">${runtime}</span>` : ''}
          ${actors ? `<span class="movie-actors">${actors}</span>` : ''}
        </div>
      </div>
    </div>
  `;

  // Store lightweight lookup keys instead of full JSON
  el.dataset.movieTitle = movie.Movie;
  el.dataset.movieKey = `${movie.Datetime}_${movie.Movie}`;
  el.setAttribute('tabindex', '0');
  el.setAttribute('role', 'button');

  return el;
}

export function updateTextHeights(): void {
  document.querySelectorAll('.movie.has-poster').forEach(tile => {
    const clickable = tile.querySelector('.movie-clickable') as HTMLElement;
    const textWrapper = tile.querySelector('.movie-text') as HTMLElement;

    if (clickable && textWrapper) {
      const textHeight = textWrapper.offsetHeight + 8;
      clickable.style.setProperty('--text-height', `${textHeight}px`);
    }
  });
}

// Re-export for convenience
export { toTitleCase, processFFJr };
