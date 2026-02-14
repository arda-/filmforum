/**
 * Dialog Stories
 *
 * Stories show all visual states and sizes of the Dialog component using composable components:
 * - DialogRoot: Container and state management
 * - DialogHeader/DialogTitle/DialogDescription: Header section
 * - DialogBody: Scrollable content area
 * - DialogSeparator: Visual divider
 * - DialogFooter: Action buttons
 *
 * INTERACTION TESTING:
 * Automated interaction tests are NOT run in Astrobook stories.
 * For testing dialog behavior (open/close, keyboard, focus), see:
 * → tests/components/dialog.spec.ts (Playwright tests)
 *
 * The Playwright tests verify:
 * - Dialog opens when triggered
 * - Dialog closes on Escape key
 * - Dialog closes on backdrop click
 * - Close button closes the dialog
 * - Focus management and accessibility
 *
 * See docs/ASTROBOOK_INTERACTION_TESTING.md for full guidance.
 *
 * USAGE IN ASTROBOOK:
 * Stories display a trigger button and dialog content. Click "Open Dialog" to see the dialog.
 * You can close it by:
 * - Clicking the close button (X) in the top-right
 * - Clicking the backdrop
 * - Pressing Escape key
 *
 * The window API is also available:
 * - window.openDialog(id) - Opens the dialog
 * - window.closeDialog(id) - Closes the dialog
 */
import DialogWrapper from './decorators/DialogWrapper.astro';

export default {
  component: DialogWrapper,
};

/** Small dialog - 400px max width */
export const Small = {
  args: {
    id: 'dialog-sm',
    title: 'Confirm Action',
    description: 'Are you sure?',
    size: 'sm',
    triggerText: 'Open Small Dialog',
    body: 'This is a small dialog with a max-width of 400px.',
  },
};

/** Medium dialog - 500px max width (default) */
export const Medium = {
  args: {
    id: 'dialog-md',
    title: 'Movie Details',
    description: 'Film information and showtimes',
    size: 'md',
    triggerText: 'Open Medium Dialog',
    body: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
  },
};

/** Large dialog - 640px max width */
export const Large = {
  args: {
    id: 'dialog-lg',
    title: 'Schedule Overview',
    description: 'Complete overview of all scheduled films and timings',
    size: 'lg',
    triggerText: 'Open Large Dialog',
    body: 'Item 1 - Some content here. Item 2 - More content. Item 3 - Even more content.',
  },
};

/** Dialog without description subtitle */
export const NoDescription = {
  args: {
    id: 'dialog-no-desc',
    title: 'Simple Dialog',
    triggerText: 'Open Simple Dialog',
    body: 'This dialog has no description subtitle.',
  },
};

/** Dialog without close button - for required actions */
export const NoCloseButton = {
  args: {
    id: 'dialog-no-close',
    title: 'Required Action',
    description: 'This action requires confirmation.',
    showCloseButton: false,
    triggerText: 'Open Required Dialog',
    body: 'You must choose one of the options below to continue.',
  },
};
