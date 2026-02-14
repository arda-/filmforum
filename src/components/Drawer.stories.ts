import Drawer from './Drawer.astro';

export default {
  component: Drawer,
};

export const Default = {
  args: { id: 'drawer-default', title: 'Default Drawer' },
};

export const NoTitle = {
  args: { id: 'drawer-no-title' },
};

export const Height50 = {
  args: { id: 'drawer-height-50', title: '50% Height', maxHeight: '50vh' },
};

export const Height70 = {
  args: { id: 'drawer-height-70', title: '70% Height', maxHeight: '70vh' },
};

export const Height85 = {
  args: { id: 'drawer-height-85', title: '85% Height (Default)', maxHeight: '85vh' },
};

export const Height95 = {
  args: { id: 'drawer-height-95', title: '95% Height', maxHeight: '95vh' },
};
