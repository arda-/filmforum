/**
 * Series configuration
 * Maps series slugs to metadata and data file locations
 */

export interface SeriesConfig {
  id: string;
  name: string;
  subtitle: string;
  seriesUrl: string;
  venueName: string;
  dateRange: string;
  dataFile: string;
  active: boolean;
}

export const SERIES: Record<string, SeriesConfig> = {
  'tenement-stories': {
    id: 'tenement-stories',
    name: 'Tenement Stories',
    subtitle: 'From Immigrants to Bohemians',
    seriesUrl: 'https://filmforum.org/series/tenement-stories',
    venueName: 'Film Forum',
    dateRange: 'Feb 6\u201326, 2026',
    dataFile: '/tenement-stories-full.json',
    active: true,
  },
};

export function getSeriesConfig(id: string): SeriesConfig | undefined {
  return SERIES[id];
}

export function getAllSeriesIds(): string[] {
  return Object.keys(SERIES);
}

export function getActiveSeries(): SeriesConfig[] {
  return Object.values(SERIES).filter(s => s.active);
}
