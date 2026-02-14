import Tooltip from './Tooltip.astro';
import DarkBackground from './decorators/DarkBackground.astro';
import FixedWidth from './decorators/FixedWidth.astro';

export default {
  component: Tooltip,
};

export const Default = {
  args: { text: 'Download calendar file (.ics)' },
};

export const LongText = {
  args: { text: 'This tooltip has a much longer text to demonstrate how it wraps within the max width constraint' },
};

export const Disabled = {
  args: { text: 'You should not see this', disabled: true },
};

export const OnDarkBackground = {
  args: { text: 'Tooltip on dark surface' },
  decorators: [
    { component: DarkBackground },
  ],
};

export const ConstrainedWidth = {
  args: { text: 'Tooltip in narrow container' },
  decorators: [
    { component: FixedWidth, props: { width: '300px' } },
  ],
};

export const DarkAndNarrow = {
  args: { text: 'Combined decorators example' },
  decorators: [
    { component: FixedWidth, props: { width: '400px' } },
    { component: DarkBackground, props: { padding: '3rem' } },
  ],
};
