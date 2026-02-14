import ListToolbar from './ListToolbar.astro';

const openFilterPanelDecorator = (story) => {
  const rendered = story();
  return {
    ...rendered,
    setup: () => {
      // After rendering, open the filter disclosure panel
      setTimeout(() => {
        const filterDisclosure = document.getElementById('filter-disclosure');
        const filterToggleBtn = document.getElementById('filter-toggle-btn');
        if (filterDisclosure && filterToggleBtn) {
          filterDisclosure.classList.add('open');
          filterToggleBtn.classList.add('active');
          filterToggleBtn.setAttribute('aria-expanded', 'true');
        }
      }, 0);
    },
  };
};

export default {
  component: ListToolbar,
};

export const DefaultCardView = {
  args: {
    viewMode: 'card',
    sortBy: 'alpha',
    directors: ['Christopher Nolan', 'Denis Villeneuve', 'Greta Gerwig'],
    actors: ['Timothée Chalamet', 'Florence Pugh', 'Oscar Isaac'],
    decades: ['1950s', '1960s', '1970s', '1980s', '1990s', '2000s', '2010s', '2020s'],
  },
  decorators: [openFilterPanelDecorator],
};

export const ListView = {
  args: {
    viewMode: 'list',
    sortBy: 'alpha',
    directors: ['Christopher Nolan', 'Denis Villeneuve', 'Greta Gerwig'],
    actors: ['Timothée Chalamet', 'Florence Pugh', 'Oscar Isaac'],
    decades: ['1950s', '1960s', '1970s', '1980s', '1990s', '2000s', '2010s', '2020s'],
  },
  decorators: [openFilterPanelDecorator],
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
  decorators: [openFilterPanelDecorator],
};

export const SortByDirector = {
  args: {
    viewMode: 'card',
    sortBy: 'director',
    directors: ['Christopher Nolan', 'Denis Villeneuve', 'Greta Gerwig'],
    actors: ['Timothée Chalamet', 'Florence Pugh', 'Oscar Isaac'],
    decades: ['1950s', '1960s', '1970s', '1980s', '1990s', '2000s', '2010s', '2020s'],
  },
  decorators: [openFilterPanelDecorator],
};

export const SortByMarked = {
  args: {
    viewMode: 'card',
    sortBy: 'marked',
    directors: ['Christopher Nolan', 'Denis Villeneuve', 'Greta Gerwig'],
    actors: ['Timothée Chalamet', 'Florence Pugh', 'Oscar Isaac'],
    decades: ['1950s', '1960s', '1970s', '1980s', '1990s', '2000s', '2010s', '2020s'],
  },
  decorators: [openFilterPanelDecorator],
};

export const MinimalFilters = {
  args: {
    viewMode: 'card',
    sortBy: 'alpha',
    directors: ['Christopher Nolan'],
    actors: ['Timothée Chalamet'],
    decades: ['2010s', '2020s'],
  },
  decorators: [openFilterPanelDecorator],
};

export const ExtensiveFilters = {
  args: {
    viewMode: 'card',
    sortBy: 'alpha',
    directors: [
      'Alfred Hitchcock',
      'Stanley Kubrick',
      'Christopher Nolan',
      'Denis Villeneuve',
      'Greta Gerwig',
      'Wes Anderson',
      'Martin Scorsese',
      'Quentin Tarantino',
      'Paul Thomas Anderson',
      'David Fincher',
    ],
    actors: [
      'Timothée Chalamet',
      'Florence Pugh',
      'Oscar Isaac',
      'Saoirse Ronan',
      'Adam Driver',
      'Zendaya',
      'Meryl Streep',
      'Cate Blanchett',
    ],
    decades: ['1940s', '1950s', '1960s', '1970s', '1980s', '1990s', '2000s', '2010s', '2020s'],
  },
  decorators: [openFilterPanelDecorator],
};

export const NoFilters = {
  args: {
    viewMode: 'card',
    sortBy: 'alpha',
    directors: [],
    actors: [],
    decades: [],
  },
  decorators: [openFilterPanelDecorator],
};

export const ClassicDecades = {
  args: {
    viewMode: 'card',
    sortBy: 'year',
    directors: ['Alfred Hitchcock', 'Orson Welles', 'Billy Wilder'],
    actors: ['Cary Grant', 'James Stewart', 'Grace Kelly'],
    decades: ['1940s', '1950s', '1960s'],
  },
  decorators: [openFilterPanelDecorator],
};

export const ModernFilmmakers = {
  args: {
    viewMode: 'card',
    sortBy: 'director',
    directors: ['Denis Villeneuve', 'Greta Gerwig', 'Ari Aster', 'Jordan Peele'],
    actors: ['Timothée Chalamet', 'Florence Pugh', 'Zendaya'],
    decades: ['2010s', '2020s'],
  },
  decorators: [openFilterPanelDecorator],
};
