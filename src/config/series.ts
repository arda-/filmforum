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
  metadataFile?: string; // Optional: series-level metadata (description, images, partnership info, etc.)
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
    metadataFile: '/series-metadata/tenement-stories.json',
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
