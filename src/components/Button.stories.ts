import Button from './Button.astro';

export default {
  component: Button,
};

export const Primary = {
  args: { variant: 'primary' },
  render: (args: any) => ({
    ...args,
    default: 'Primary Button',
  }),
};

export const Secondary = {
  args: { variant: 'secondary' },
  render: (args: any) => ({
    ...args,
    default: 'Secondary Button',
  }),
};

export const Danger = {
  args: { variant: 'danger' },
  render: (args: any) => ({
    ...args,
    default: 'Danger Button',
  }),
};

export const Outline = {
  args: { variant: 'outline' },
  render: (args: any) => ({
    ...args,
    default: 'Outline Button',
  }),
};

export const Ghost = {
  args: { variant: 'ghost' },
  render: (args: any) => ({
    ...args,
    default: 'Ghost Button',
  }),
};

export const Link = {
  args: { variant: 'link' },
  render: (args: any) => ({
    ...args,
    default: 'Link Button',
  }),
};

export const Small = {
  args: { size: 'sm' },
  render: (args: any) => ({
    ...args,
    default: 'Small Button',
  }),
};

export const Default = {
  args: { size: 'default' },
  render: (args: any) => ({
    ...args,
    default: 'Default Button',
  }),
};

export const Large = {
  args: { size: 'lg' },
  render: (args: any) => ({
    ...args,
    default: 'Large Button',
  }),
};

export const Icon = {
  args: { size: 'icon' },
  render: (args: any) => ({
    ...args,
    default: '✕',
  }),
};

export const Disabled = {
  args: { disabled: true },
  render: (args: any) => ({
    ...args,
    default: 'Disabled Button',
  }),
};

export const WithIcon = {
  args: { variant: 'primary' },
  render: (args: any) => ({
    ...args,
    default: '<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M13.5 4.5l-7 7L3 8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg> Confirm',
  }),
};
