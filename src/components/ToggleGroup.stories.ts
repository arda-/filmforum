/**
 * ToggleGroup Stories
 *
 * Stories show various configurations of the ToggleGroup component,
 * displaying multiple toggle options in a grouped radio button interface.
 */
import ToggleGroup from './ToggleGroup.astro';

export default {
  component: ToggleGroup,
};

/** Basic toggle group with time filter options */
export const TimeFilter = {
  args: {
    label: 'Time',
    name: 'time',
    options: [
      { label: 'Anytime', value: 'anytime', checked: true },
      { label: 'After 6 PM', value: 'after-6pm' },
      { label: 'After 9 PM', value: 'after-9pm' },
    ],
  },
};

/** Day of week filter options */
export const DayFilter = {
  args: {
    label: 'Day',
    name: 'day',
    options: [
      { label: 'Weekdays', value: 'weekdays' },
      { label: 'Weekends', value: 'weekends', checked: true },
      { label: 'Any', value: 'any' },
    ],
  },
};

/** Rating filter with multiple options */
export const RatingFilter = {
  args: {
    label: 'Rating',
    name: 'rating',
    options: [
      { label: 'All', value: 'all', checked: true },
      { label: '7+', value: '7plus' },
      { label: '8+', value: '8plus' },
      { label: '9+', value: '9plus' },
    ],
  },
};

/** Duration filter with longer labels */
export const DurationFilter = {
  args: {
    label: 'Duration',
    name: 'duration',
    options: [
      { label: 'Under 90 min', value: 'short' },
      { label: '90-120 min', value: 'medium', checked: true },
      { label: 'Over 120 min', value: 'long' },
    ],
  },
};

/** Many options in a toggle group */
export const GenreFilter = {
  args: {
    label: 'Genre',
    name: 'genre',
    options: [
      { label: 'All', value: 'all', checked: true },
      { label: 'Action', value: 'action' },
      { label: 'Drama', value: 'drama' },
      { label: 'Comedy', value: 'comedy' },
      { label: 'Sci-Fi', value: 'scifi' },
    ],
  },
};

/** Toggle group with single selected option */
export const SingleSelection = {
  args: {
    label: 'View',
    name: 'view',
    options: [
      { label: 'List', value: 'list', checked: true },
      { label: 'Grid', value: 'grid' },
    ],
  },
};

/** Toggle group with status indicator */
export const WithStatus = {
  args: {
    label: 'Sort',
    name: 'sort',
    options: [
      { label: 'Newest', value: 'newest', checked: true },
      { label: 'Popular', value: 'popular' },
      { label: 'Rating', value: 'rating' },
    ],
    statusId: 'sort-status',
  },
};
