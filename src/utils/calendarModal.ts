/**
 * Calendar movie modal management.
 * Handles populating and opening the movie detail modal/dialog.
 */

import type { Movie } from './icsGenerator';
import { downloadICS } from './icsGenerator';
import { toTitleCase, processFFJr } from '../components/MovieTile';

/** Open the movie detail modal and populate it with data. */
export function openMovieModal(movie: Movie): void {
  const titleEl = document.getElementById('modal-title');
  const metaEl = document.getElementById('modal-meta');
  const actorsEl = document.getElementById('modal-actors');
  const descEl = document.getElementById('modal-description');
  const ticketsEl = document.getElementById('modal-buy-tickets') as HTMLAnchorElement;
  const disclaimerEl = document.getElementById('modal-disclaimer');
  const calendarBtn = document.getElementById('modal-add-calendar');
  const posterEl = document.getElementById('modal-poster') as HTMLImageElement;
  const posterPlaceholder = document.querySelector('.poster-placeholder') as HTMLElement;

  // Set poster image with thumbnail + full quality loading
  if (posterEl && posterPlaceholder) {
    if (movie.poster_url) {
      // Get poster filename
      const posterFilename = movie.poster_url.split('/').pop();

      // Load tiny thumbnail first (fast, blurry)
      const thumbEl = document.getElementById('modal-poster-thumb') as HTMLImageElement;
      if (thumbEl) {
        thumbEl.src = `/posters-thumb/${posterFilename?.replace(/\.(png|jpg|jpeg)$/i, '.jpg')}`;
        thumbEl.alt = movie.Movie;
        thumbEl.style.display = 'block';
      }

      // Load full quality in background and swap when ready
      const fullQualityImg = new Image();
      fullQualityImg.onload = () => {
        posterEl.src = fullQualityImg.src;
        if (thumbEl) thumbEl.style.opacity = '0'; // Fade out thumb
      };
      fullQualityImg.src = movie.poster_url;

      posterEl.alt = movie.Movie;
      posterEl.style.display = 'block';
      posterPlaceholder.style.display = 'none';
    } else {
      posterEl.style.display = 'none';
      posterPlaceholder.style.display = 'block';
    }
  }

  if (titleEl) titleEl.textContent = toTitleCase(movie.Movie);

  if (metaEl) {
    const runtime = movie.runtime?.replace(' minutes', 'min') || '';
    metaEl.textContent = [movie.year, movie.director, runtime].filter(Boolean).join(' \u00b7 ');
  }

  if (actorsEl) {
    if (movie.actors) {
      const actorSpans = movie.actors.split(',').map(a => `<span>${a.trim()}</span>`).join(', ');
      actorsEl.innerHTML = `<span class="starring-label">Starring:</span> ${actorSpans}`;
      actorsEl.style.display = 'block';
    } else {
      actorsEl.style.display = 'none';
    }
  }

  if (descEl) {
    descEl.textContent = movie.description || 'No description available.';
  }

  if (ticketsEl) {
    ticketsEl.href = movie.Tickets;
  }

  if (disclaimerEl) {
    const date = new Date(movie.Datetime);
    const showtime = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }).replace(' ', '');
    const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    disclaimerEl.textContent = `When buying, select ${showtime} on ${dateStr}:`;
  }

  if (calendarBtn) {
    calendarBtn.onclick = () => downloadICS(movie);
  }

  // Set up film page link
  const filmPageEl = document.getElementById('modal-film-page') as HTMLAnchorElement;
  if (filmPageEl) {
    if (movie.film_url) {
      filmPageEl.href = movie.film_url;
      filmPageEl.style.display = 'block';
    } else {
      filmPageEl.style.display = 'none';
    }
  }

  (window as any).openDialog('movie-modal');
}

/**
 * Render a grouped movie list for the hidden-movies modal.
 * Groups by title, shows all showtimes per film.
 */
export function renderMovieList(movies: Movie[]): string {
  const byTitle: Record<string, Movie[]> = {};
  movies.forEach(m => {
    if (!byTitle[m.Movie]) byTitle[m.Movie] = [];
    byTitle[m.Movie].push(m);
  });

  const sortedTitles = Object.keys(byTitle).sort();

  return sortedTitles.map(title => {
    const titleMovies = byTitle[title];
    const showtimes = titleMovies.map(m => {
      const date = new Date(m.Datetime);
      const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
      const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const { displayTime } = processFFJr(m.Time, m.Movie);
      return `<span class="hidden-showtime">${dayName} ${dateStr} ${displayTime}</span>`;
    }).join('');
    const meta = [titleMovies[0].year, titleMovies[0].director].filter(Boolean).join(', ');
    const hasFFJr = titleMovies.some(m => m.Time.includes('FF Jr'));
    const displayTitle = hasFFJr ? `${toTitleCase(title)} (FF Jr.)` : toTitleCase(title);
    return `<div class="hidden-movie-item"><span class="hidden-movie-title">${displayTitle}</span>${meta ? `<span class="hidden-movie-meta">(${meta})</span>` : ''}<span class="hidden-movie-showtimes">\u2014 ${showtimes}</span></div>`;
  }).join('');
}
