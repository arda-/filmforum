import Icon from './Icon.astro';

export default {
  component: Icon,
};

export const Default = {
  args: { name: 'check', size: 16 },
};

export const Large = {
  args: { name: 'x', size: 32 },
};

export const Small = {
  args: { name: 'star', size: 12 },
};

export const CustomSize = {
  args: { name: 'heart', size: 24 },
};

export const Calendar = {
  args: { name: 'calendar', size: 20 },
};

export const Search = {
  args: { name: 'search', size: 20 },
};

export const Settings = {
  args: { name: 'settings', size: 20 },
};

export const Info = {
  args: { name: 'info', size: 20 },
};

export const ChevronDown = {
  args: { name: 'chevron-down', size: 16 },
};

export const ChevronRight = {
  args: { name: 'chevron-right', size: 16 },
};
