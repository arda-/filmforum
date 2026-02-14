/**
 * Toggle Button Story
 *
 * Stories show all visual states of the Toggle component.
 *
 * INTERACTION TESTING:
 * Automated interaction tests are NOT run in Astrobook stories.
 * For testing toggle behavior (click, keyboard, state changes), see:
 * → tests/components/toggle.spec.ts (Playwright tests)
 *
 * The Playwright tests verify:
 * - State toggles on click
 * - Keyboard activation (Space/Enter)
 * - Disabled state prevents interaction
 * - aria-pressed attribute updates correctly
 *
 * See docs/ASTROBOOK_INTERACTION_TESTING.md for full guidance.
 */
import Toggle from './Toggle.astro';

export default {
  component: Toggle,
};

/** Default unchecked state */
export const Default = {
  args: { id: 'toggle-1', label: 'After 6 PM' },
};

/** Checked/pressed state */
export const Pressed = {
  args: { id: 'toggle-2', label: 'After 6 PM', pressed: true },
};

/** Outline variant - unchecked */
export const Outline = {
  args: { id: 'toggle-3', label: 'Weekends', variant: 'outline' },
};

/** Outline variant - checked */
export const OutlinePressed = {
  args: { id: 'toggle-4', label: 'Weekends', variant: 'outline', pressed: true },
};

/** Small size variant */
export const Small = {
  args: { id: 'toggle-5', label: 'Compact', size: 'sm' },
};

/** Large size variant */
export const Large = {
  args: { id: 'toggle-6', label: 'Show Details', size: 'lg' },
};

/** Disabled state - prevents interaction */
export const Disabled = {
  args: { id: 'toggle-7', label: 'Unavailable', disabled: true },
};

/** Disabled state with checked appearance */
export const DisabledPressed = {
  args: { id: 'toggle-8', label: 'Locked', disabled: true, pressed: true },
};
