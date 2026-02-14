/**
 * Dialog Story
 *
 * Stories show all visual states and sizes of the Dialog component.
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
 * Stories display the dialog HTML but do NOT automatically open it.
 * To interact with dialogs in a live environment, use the window API:
 * - window.openDialog(id) - Opens the dialog
 * - window.closeDialog(id) - Closes the dialog
 */
import Dialog from './Dialog.astro';

export default {
  component: Dialog,
};

/** Small dialog - 400px max width */
export const Small = {
  args: { id: 'dialog-sm', title: 'Confirm Action', description: 'Are you sure?', size: 'sm' },
};

/** Medium dialog - 500px max width (default) */
export const Medium = {
  args: { id: 'dialog-md', title: 'Movie Details', description: 'Film information and showtimes', size: 'md' },
};

/** Large dialog - 640px max width */
export const Large = {
  args: { id: 'dialog-lg', title: 'Schedule Overview', size: 'lg' },
};

/** Dialog without description subtitle */
export const NoDescription = {
  args: { id: 'dialog-no-desc', title: 'Simple Dialog' },
};

/** Dialog without close button - for required actions */
export const NoCloseButton = {
  args: { id: 'dialog-no-close', title: 'Required Action', showCloseButton: false },
};
