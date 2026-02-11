import type { Movie } from './movie';

declare global {
  interface Window {
    /**
     * Movie data inlined at build time via Astro's define:vars.
     * Available on pages that use loadMovieData utility.
     */
    __movieData: Movie[];
    /** Series/session ID, set by define:vars on calendar page. */
    __sessionId: string;
  }
}

export {};
