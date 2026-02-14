/**
 * ReactionButtons Story
 *
 * Stories show all visual states of the ReactionButtons component.
 * These are three-button groups (Yes/Maybe/No) for expressing user reactions to movies.
 *
 * INTERACTION TESTING:
 * Automated interaction tests are NOT run in Astrobook stories.
 * For testing button behavior (click, keyboard, toggle state), see:
 * → tests/components/reaction-buttons.spec.ts (Playwright tests)
 *
 * The Playwright tests verify:
 * - Buttons toggle active state on click
 * - Keyboard activation (Space/Enter) toggles state
 * - aria-pressed attribute updates correctly
 * - Multiple buttons can be active independently
 * - Buttons display correct colors for each reaction type
 *
 * See docs/ASTROBOOK_INTERACTION_TESTING.md for full guidance.
 */
import ReactionButtons from './ReactionButtons.astro';

export default {
  component: ReactionButtons,
};

/** Default state - no reaction selected */
export const Default = {
  args: { movieId: 'demo-1' },
};

/** Yes reaction selected */
export const YesSelected = {
  args: { movieId: 'demo-2', reaction: 'yes' },
};

/** Maybe reaction selected */
export const MaybeSelected = {
  args: { movieId: 'demo-3', reaction: 'maybe' },
};

/** No reaction selected */
export const NoSelected = {
  args: { movieId: 'demo-4', reaction: 'no' },
};

/** Small size variant - no reaction selected */
export const Small = {
  args: { movieId: 'demo-5', size: 'sm' },
};

/** Small size variant - Yes reaction selected */
export const SmallYes = {
  args: { movieId: 'demo-6', reaction: 'yes', size: 'sm' },
};
