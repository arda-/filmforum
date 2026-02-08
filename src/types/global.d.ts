import type { Movie } from '../utils/icsGenerator';

declare global {
  interface Window {
    /**
     * Movie data inlined at build time via Astro's define:vars.
     * Available on pages that use loadMovieData utility.
     */
    __movieData: Movie[];
  }
}

export {};
