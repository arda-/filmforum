import type { Meta, StoryObj } from '@storybook/astro';
import CalendarFilterBar from './CalendarFilterBar.astro';

type Story = StoryObj<typeof CalendarFilterBar>;

const meta: Meta<typeof CalendarFilterBar> = {
  component: CalendarFilterBar,
  tags: ['autodocs'],
};

export default meta;

/**
 * All filters active by default.
 * This is the standard view showing all available showtimes and all saved states.
 */
export const Default: Story = {
  args: {
    day: true,
    nite: true,
    weekend: true,
    yes: true,
    maybe: true,
    no: true,
    unmarked: true,
  },
};

/**
 * Only daytime showtimes are shown.
 * Useful for filtering to movies showing during the day.
 */
export const Showings_day: Story = {
  args: {
    day: true,
    nite: false,
    weekend: false,
    yes: true,
    maybe: true,
    no: true,
    unmarked: true,
  },
};

/**
 * Only night showtimes are shown.
 * Filters to evening and late-night screenings.
 */
export const Showings_nite: Story = {
  args: {
    day: false,
    nite: true,
    weekend: false,
    yes: true,
    maybe: true,
    no: true,
    unmarked: true,
  },
};

/**
 * Only weekend showtimes are shown.
 * Good for planning weekend movie trips.
 */
export const Showings_weekend: Story = {
  args: {
    day: false,
    nite: false,
    weekend: true,
    yes: true,
    maybe: true,
    no: true,
    unmarked: true,
  },
};

/**
 * Show only movies marked as "Yes" (wanted).
 * Combined with all time filters for movies you're interested in.
 */
export const Saved_yes: Story = {
  args: {
    day: true,
    nite: true,
    weekend: true,
    yes: true,
    maybe: false,
    no: false,
    unmarked: false,
  },
};

/**
 * Day and weekend showtimes combined.
 * Filters out nighttime screenings but includes all saved states.
 */
export const Showings_day_weekend: Story = {
  args: {
    day: true,
    nite: false,
    weekend: true,
    yes: true,
    maybe: true,
    no: true,
    unmarked: true,
  },
};

/**
 * Show "Yes" and "Maybe" saved movies across all times.
 * Useful for seeing your top consideration movies regardless of showtime.
 */
export const Saved_yes_maybe: Story = {
  args: {
    day: true,
    nite: true,
    weekend: true,
    yes: true,
    maybe: true,
    no: false,
    unmarked: false,
  },
};
