import Tooltip from './Tooltip.astro';

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
