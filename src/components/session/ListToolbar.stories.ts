import ListToolbarWrapper from '../decorators/ListToolbarWrapper.astro';

/**
 * NOTE: JavaScript function decorators are not supported in Astrobook.
 * Decorators must be Astro components. Client-side behaviors like opening
 * panels can be tested manually in the Astrobook story.
 *
 * The ListToolbarWrapper decorator enables opening the filter panel on mount
 * for stories that demonstrate filter configurations.
 */

export default {
  component: ListToolbarWrapper,
};

export const DefaultCardView = {
  args: {
    viewMode: 'card',
    sortBy: 'alpha',
    directors: ['Christopher Nolan', 'Denis Villeneuve', 'Greta Gerwig'],
    actors: ['Timothée Chalamet', 'Florence Pugh', 'Oscar Isaac'],
    decades: ['1950s', '1960s', '1970s', '1980s', '1990s', '2000s', '2010s', '2020s'],
  },
};

export const ListView = {
  args: {
    viewMode: 'list',
    sortBy: 'alpha',
    directors: ['Christopher Nolan', 'Denis Villeneuve', 'Greta Gerwig'],
    actors: ['Timothée Chalamet', 'Florence Pugh', 'Oscar Isaac'],
    decades: ['1950s', '1960s', '1970s', '1980s', '1990s', '2000s', '2010s', '2020s'],
  },
};

export const SingleView = {
  args: {
    viewMode: 'single',
    sortBy: 'alpha',
    directors: ['Christopher Nolan', 'Denis Villeneuve', 'Greta Gerwig'],
    actors: ['Timothée Chalamet', 'Florence Pugh', 'Oscar Isaac'],
    decades: ['1950s', '1960s', '1970s', '1980s', '1990s', '2000s', '2010s', '2020s'],
  },
};

export const SortByYear = {
  args: {
    viewMode: 'card',
    sortBy: 'year',
    directors: ['Christopher Nolan', 'Denis Villeneuve', 'Greta Gerwig'],
    actors: ['Timothée Chalamet', 'Florence Pugh', 'Oscar Isaac'],
    decades: ['1950s', '1960s', '1970s', '1980s', '1990s', '2000s', '2010s', '2020s'],
  },
};

export const SortByDirector = {
  args: {
    viewMode: 'card',
    sortBy: 'director',
    directors: ['Christopher Nolan', 'Denis Villeneuve', 'Greta Gerwig'],
    actors: ['Timothée Chalamet', 'Florence Pugh', 'Oscar Isaac'],
    decades: ['1950s', '1960s', '1970s', '1980s', '1990s', '2000s', '2010s', '2020s'],
  },
};

export const SortByMarked = {
  args: {
    viewMode: 'card',
    sortBy: 'marked',
    directors: ['Christopher Nolan', 'Denis Villeneuve', 'Greta Gerwig'],
    actors: ['Timothée Chalamet', 'Florence Pugh', 'Oscar Isaac'],
    decades: ['1950s', '1960s', '1970s', '1980s', '1990s', '2000s', '2010s', '2020s'],
  },
};

export const MinimalFilters = {
  args: {
    viewMode: 'card',
    sortBy: 'alpha',
    directors: ['Christopher Nolan'],
    actors: ['Timothée Chalamet'],
    decades: ['2010s', '2020s'],
    openFilters: true,
  },
};

export const NoFilters = {
  args: {
    viewMode: 'card',
    sortBy: 'alpha',
    directors: [],
    actors: [],
    decades: [],
  },
};

export const ClassicDecades = {
  args: {
    viewMode: 'card',
    sortBy: 'year',
    directors: ['Alfred Hitchcock', 'Orson Welles', 'Billy Wilder'],
    actors: ['Cary Grant', 'James Stewart', 'Grace Kelly'],
    decades: ['1940s', '1950s', '1960s'],
    openFilters: true,
  },
};

export const ModernFilmmakers = {
  args: {
    viewMode: 'card',
    sortBy: 'director',
    directors: ['Denis Villeneuve', 'Greta Gerwig', 'Ari Aster', 'Jordan Peele'],
    actors: ['Timothée Chalamet', 'Florence Pugh', 'Zendaya'],
    decades: ['2010s', '2020s'],
    openFilters: true,
  },
};
