import Header from '../Header.astro';

export default {
  component: Header,
};

export const Default = {
  args: {
    seriesName: 'SPECTACLE',
    seriesSubtitle: 'The Best of World Cinema',
    seriesUrl: 'https://example.com/spectacle',
    venueName: 'Film Forum',
    dateRange: 'Jan 15 - Feb 28',
  },
};

export const ShortSeries = {
  args: {
    seriesName: 'NOIR',
    seriesSubtitle: 'Classic Film Noir',
    seriesUrl: 'https://example.com/noir',
    venueName: 'Metrograph',
    dateRange: 'Feb 1-7',
  },
};

export const LongTitle = {
  args: {
    seriesName: 'RETROSPECTIVE',
    seriesSubtitle: 'The Complete Works of Andrei Tarkovsky',
    seriesUrl: 'https://example.com/tarkovsky',
    venueName: 'BAM Rose Cinemas',
    dateRange: 'March 1 - April 30',
  },
};

export const MinimalDates = {
  args: {
    seriesName: 'WEEKEND',
    seriesSubtitle: 'Modern Classics',
    seriesUrl: 'https://example.com/weekend',
    venueName: 'Anthology',
    dateRange: 'Feb 14-16',
  },
};
