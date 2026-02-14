/**
 * Tooltip component stories
 *
 * INTERACTION TESTING:
 * Tooltips show on hover (300ms delay) on devices with hover support.
 * To see tooltips work in Astrobook:
 * 1. Hover over the button/trigger element in each story
 * 2. The tooltip will appear above (or below if no room) after a brief delay
 * 3. Move mouse away to dismiss
 *
 * NOTE: Astrobook does NOT support passing slot content directly to components.
 * The Tooltip component uses <slot /> for its trigger content, but Astrobook only
 * passes args as props. We use a TooltipWrapper decorator that accepts 'triggerText'
 * as a prop and passes it as slot content to the actual Tooltip component.
 *
 * See: TooltipWrapper.astro
 */
import TooltipWrapper from './decorators/TooltipWrapper.astro';
import DarkBackground from './decorators/DarkBackground.astro';
import FixedWidth from './decorators/FixedWidth.astro';

export default {
  component: TooltipWrapper,
};

/** Basic tooltip - hover over the text to see it appear after 300ms */
export const Default = {
  args: { text: 'Download calendar file (.ics)', triggerText: 'calendar file' },
};

/** Tooltip with longer text that wraps within the max width (240px) */
export const LongText = {
  args: { text: 'This tooltip has a much longer text to demonstrate how it wraps within the max width constraint', triggerText: 'long description' },
};

/** Disabled tooltips should not appear when hovering */
export const Disabled = {
  args: { text: 'You should not see this', disabled: true, triggerText: 'disabled text' },
};

/** Tooltip on dark background surface */
export const OnDarkBackground = {
  args: { text: 'Tooltip on dark surface', triggerText: 'dark surface' },
  decorators: [
    { component: DarkBackground },
  ],
};

/** Tooltip in a constrained width container */
export const ConstrainedWidth = {
  args: { text: 'Tooltip in narrow container', triggerText: 'narrow space' },
  decorators: [
    { component: FixedWidth, props: { width: '300px' } },
  ],
};

/** Tooltip with multiple decorators applied */
export const DarkAndNarrow = {
  args: { text: 'Combined decorators example', triggerText: 'combined example' },
  decorators: [
    { component: FixedWidth, props: { width: '400px' } },
    { component: DarkBackground, props: { padding: '3rem' } },
  ],
};
