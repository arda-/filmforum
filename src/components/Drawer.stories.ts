/**
 * Drawer Story
 *
 * Stories show all visual states and sizes of the Drawer component.
 *
 * INTERACTION TESTING:
 * Each story includes an "Open Drawer" button that triggers the drawer using the
 * window.openDrawer() API. Click the button to see the drawer slide up from the bottom.
 *
 * FEATURES YOU CAN TEST:
 * - Click the trigger button to open
 * - Swipe or drag from the handle to dismiss (on touch devices)
 * - Click the X button to close
 * - Click the backdrop to close
 * - Press Escape to close
 *
 * For automated interaction tests, see:
 * → tests/components/drawer.spec.ts (Playwright tests)
 *
 * The Playwright tests verify:
 * - Drawer opens/closes correctly
 * - Swipe-to-dismiss gesture works
 * - Escape key closes drawer
 * - Backdrop click closes drawer
 * - Focus management and accessibility
 */
import DrawerWrapper from './decorators/DrawerWrapper.astro';

export default {
  component: DrawerWrapper,
};

export const Default = {
  args: {
    id: 'drawer-default',
    title: 'Default Drawer',
    content: 'This is a default drawer with a title. Click the handle or press Escape to close it.',
    triggerText: 'Open Drawer',
  },
};

export const NoTitle = {
  args: {
    id: 'drawer-no-title',
    content: 'This drawer has no title. Click the X button, backdrop, or swipe down to close.',
    triggerText: 'Open Titleless Drawer',
  },
};

export const Height50 = {
  args: {
    id: 'drawer-height-50',
    title: '50% Height',
    maxHeight: '50vh',
    content: 'This drawer covers only 50% of the viewport height. Try dragging the handle to dismiss it.',
    triggerText: 'Open (50% Height)',
  },
};

export const Height70 = {
  args: {
    id: 'drawer-height-70',
    title: '70% Height',
    maxHeight: '70vh',
    content: 'This drawer covers 70% of the viewport height. Swipe down from the handle to dismiss.',
    triggerText: 'Open (70% Height)',
  },
};

export const Height85 = {
  args: {
    id: 'drawer-height-85',
    title: '85% Height (Default)',
    maxHeight: '85vh',
    content: 'This is the default height at 85% of the viewport. You can drag from the handle area to close the drawer.',
    triggerText: 'Open (85% Height)',
  },
};

export const Height95 = {
  args: {
    id: 'drawer-height-95',
    title: '95% Height',
    maxHeight: '95vh',
    content: 'This drawer covers almost the entire viewport at 95% height. Press Escape or click the backdrop to close.',
    triggerText: 'Open (95% Height)',
  },
};
