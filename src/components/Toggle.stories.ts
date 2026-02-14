import Toggle from './Toggle.astro';

export default {
  component: Toggle,
};

export const Default = {
  args: { id: 'toggle-1', label: 'After 6 PM' },
};

export const Pressed = {
  args: { id: 'toggle-2', label: 'After 6 PM', pressed: true },
};

export const Outline = {
  args: { id: 'toggle-3', label: 'Weekends', variant: 'outline' },
};

export const OutlinePressed = {
  args: { id: 'toggle-4', label: 'Weekends', variant: 'outline', pressed: true },
};

export const Small = {
  args: { id: 'toggle-5', label: 'Compact', size: 'sm' },
};

export const Large = {
  args: { id: 'toggle-6', label: 'Show Details', size: 'lg' },
};

export const Disabled = {
  args: { id: 'toggle-7', label: 'Unavailable', disabled: true },
};

export const DisabledPressed = {
  args: { id: 'toggle-8', label: 'Locked', disabled: true, pressed: true },
};
