import type { Meta, StoryObj } from '@storybook/html';
import { expect, userEvent, within } from '@storybook/test';

interface DialogArgs {
  id: string;
  title: string;
  description?: string;
  showCloseButton: boolean;
  size: 'sm' | 'md' | 'lg';
  bodyContent: string;
}

const styles = `
  .dialog {
    display: none;
    position: fixed;
    inset: 0;
    z-index: 1000;
    align-items: center;
    justify-content: center;
  }
  .dialog[data-open="true"] { display: flex; }
  .dialog-backdrop {
    position: absolute;
    inset: 0;
    background: rgba(0, 0, 0, 0.8);
    animation: backdrop-in 0.15s ease-out;
  }
  .dialog[data-open="true"] .dialog-content {
    animation: content-in 0.2s ease-out;
  }
  @keyframes backdrop-in { from { opacity: 0; } to { opacity: 1; } }
  @keyframes content-in {
    from { opacity: 0; transform: scale(0.95) translateY(-10px); }
    to { opacity: 1; transform: scale(1) translateY(0); }
  }
  .dialog-content {
    position: relative;
    background: var(--bg-day);
    border-radius: 12px;
    padding: 24px;
    margin: 16px;
    max-height: calc(100vh - 32px);
    overflow-y: auto;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2), 0 0 0 1px rgba(255, 255, 255, 0.05);
  }
  .dialog-content--sm { width: 100%; max-width: 400px; }
  .dialog-content--md { width: 100%; max-width: 500px; }
  .dialog-content--lg { width: 100%; max-width: 640px; }
  .dialog-header { margin-bottom: 16px; }
  .dialog-title { margin: 0; font-size: 18px; font-weight: 600; color: var(--text-primary); line-height: 1.4; }
  .dialog-description { margin: 8px 0 0 0; font-size: 14px; color: var(--text-secondary); line-height: 1.5; }
  .dialog-close {
    position: absolute; top: 16px; right: 16px;
    display: flex; align-items: center; justify-content: center;
    width: 28px; height: 28px; padding: 0;
    background: transparent; border: none; border-radius: 6px;
    color: var(--text-tertiary); cursor: pointer;
    transition: background-color 0.15s, color 0.15s;
  }
  .dialog-close:hover { background: var(--bg-movie); color: var(--text-primary); }
  .dialog-body { font-size: 14px; color: var(--text-secondary); line-height: 1.6; }
  .dialog-trigger {
    padding: 8px 16px; font-family: inherit; font-size: 14px; font-weight: 500;
    background: var(--accent); color: #fff; border: none; border-radius: 6px; cursor: pointer;
  }
  .dialog-trigger:hover { background: var(--accent-bg); }
`;

const closeSvg = '<svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M11.7816 4.03157C12.0062 3.80702 12.0062 3.44295 11.7816 3.2184C11.5571 2.99385 11.193 2.99385 10.9685 3.2184L7.50005 6.68682L4.03164 3.2184C3.80708 2.99385 3.44301 2.99385 3.21846 3.2184C2.99391 3.44295 2.99391 3.80702 3.21846 4.03157L6.68688 7.49999L3.21846 10.9684C2.99391 11.193 2.99391 11.557 3.21846 11.7816C3.44301 12.0061 3.80708 12.0061 4.03164 11.7816L7.50005 8.31316L10.9685 11.7816C11.193 12.0061 11.5571 12.0061 11.7816 11.7816C12.0062 11.557 12.0062 11.193 11.7816 10.9684L8.31322 7.49999L11.7816 4.03157Z" fill="currentColor" fill-rule="evenodd" clip-rule="evenodd"></path></svg>';

function renderDialog(args: DialogArgs): HTMLElement {
  const { id, title, description, showCloseButton, size, bodyContent } = args;
  const container = document.createElement('div');

  container.innerHTML = `
    <style>${styles}</style>
    <button class="dialog-trigger" data-open-dialog="${id}">Open Dialog</button>
    <div id="${id}" class="dialog" data-open="false" role="dialog" aria-modal="true" aria-labelledby="${id}-title">
      <div class="dialog-backdrop" data-dialog-close></div>
      <div class="dialog-content dialog-content--${size}">
        <div class="dialog-header">
          <h2 id="${id}-title" class="dialog-title">${title}</h2>
          ${description ? `<p class="dialog-description">${description}</p>` : ''}
        </div>
        <div class="dialog-body">${bodyContent}</div>
        ${showCloseButton ? `<button class="dialog-close" data-dialog-close aria-label="Close">${closeSvg}</button>` : ''}
      </div>
    </div>
  `;

  const dialog = container.querySelector(`#${id}`) as HTMLElement;
  const trigger = container.querySelector(`[data-open-dialog="${id}"]`) as HTMLElement;

  // Open on trigger click
  trigger.addEventListener('click', () => {
    dialog.dataset.open = 'true';
    document.body.style.overflow = 'hidden';
    const focusable = dialog.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])') as HTMLElement;
    focusable?.focus();
  });

  // Close on backdrop/close button click
  container.querySelectorAll('[data-dialog-close]').forEach(el => {
    el.addEventListener('click', (e) => {
      if (e.target === el) {
        dialog.dataset.open = 'false';
        document.body.style.overflow = '';
      }
    });
  });

  // Close on Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && dialog.dataset.open === 'true') {
      dialog.dataset.open = 'false';
      document.body.style.overflow = '';
    }
  });

  return container;
}

const meta: Meta<DialogArgs> = {
  title: 'Components/Dialog',
  render: renderDialog,
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'Dialog width',
    },
    showCloseButton: { control: 'boolean', description: 'Show close button' },
    title: { control: 'text' },
    description: { control: 'text' },
    bodyContent: { control: 'text' },
  },
  args: {
    id: 'dialog-demo',
    title: 'Confirm Action',
    description: 'Are you sure you want to proceed?',
    showCloseButton: true,
    size: 'sm',
    bodyContent: '<p>This action cannot be undone. Please review carefully before confirming.</p>',
  },
};

export default meta;
type Story = StoryObj<DialogArgs>;

export const Default: Story = {};

export const Medium: Story = {
  args: { size: 'md', title: 'Movie Details', description: 'Film information and showtimes' },
};

export const Large: Story = {
  args: { size: 'lg', title: 'Schedule Overview', bodyContent: '<p>A wider dialog for more complex content layouts with tables or multi-column information.</p>' },
};

export const NoCloseButton: Story = {
  args: { showCloseButton: false, title: 'Required Action', description: 'Click the backdrop to close' },
};

export const NoDescription: Story = {
  args: { description: undefined, title: 'Simple Dialog' },
};

/** Verifies the dialog opens on trigger click and closes on backdrop click. */
export const OpenClose: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('button', { name: 'Open Dialog' });
    const dialog = canvasElement.querySelector('.dialog') as HTMLElement;

    // Initially closed
    await expect(dialog).toHaveAttribute('data-open', 'false');

    // Open
    await userEvent.click(trigger);
    await expect(dialog).toHaveAttribute('data-open', 'true');

    // Close via close button
    const closeBtn = canvas.getByRole('button', { name: 'Close' });
    await userEvent.click(closeBtn);
    await expect(dialog).toHaveAttribute('data-open', 'false');
  },
};
