import Dialog from './Dialog.astro';

export default {
  component: Dialog,
};

export const Small = {
  args: { id: 'dialog-sm', title: 'Confirm Action', description: 'Are you sure?', size: 'sm' },
};

export const Medium = {
  args: { id: 'dialog-md', title: 'Movie Details', description: 'Film information and showtimes', size: 'md' },
};

export const Large = {
  args: { id: 'dialog-lg', title: 'Schedule Overview', size: 'lg' },
};

export const NoDescription = {
  args: { id: 'dialog-no-desc', title: 'Simple Dialog' },
};

export const NoCloseButton = {
  args: { id: 'dialog-no-close', title: 'Required Action', showCloseButton: false },
};
