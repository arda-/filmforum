import type { Meta, StoryObj } from '@storybook/html';
import { expect, userEvent, within } from '@storybook/test';

interface ToggleArgs {
  id: string;
  label: string;
  pressed: boolean;
  disabled: boolean;
  variant: 'default' | 'outline';
  size: 'default' | 'sm' | 'lg';
}

const styles = `
  .toggle {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-family: inherit;
    font-weight: 500;
    border-radius: 6px;
    cursor: pointer;
    user-select: none;
    white-space: nowrap;
    transition: background-color 0.15s ease, color 0.15s ease, border-color 0.15s ease, transform 0.1s ease;
  }
  .toggle:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }
  .toggle:active { transform: scale(0.97); }
  .toggle:disabled { pointer-events: none; opacity: 0.5; cursor: not-allowed; }

  .toggle--default { background: var(--bg-movie, #334155); border: 1px solid transparent; color: var(--text-secondary, #94a3b8); }
  .toggle--default:hover { background: var(--bg-movie-hover, #475569); color: var(--text-primary, #e2e8f0); }
  .toggle--default[data-state="on"] { background: var(--accent, #06b6d4); color: #fff; }
  .toggle--default[data-state="on"]:hover { background: var(--accent-bg, #0e7490); }

  .toggle--outline { background: transparent; border: 1px solid var(--bg-movie-hover, #475569); color: var(--text-secondary, #94a3b8); }
  .toggle--outline:hover { background: var(--bg-movie, #334155); border-color: var(--text-tertiary, #94a3b8); color: var(--text-primary, #e2e8f0); }
  .toggle--outline[data-state="on"] { background: var(--bg-movie, #334155); border-color: var(--accent, #06b6d4); color: var(--text-primary, #e2e8f0); }
  .toggle--outline[data-state="on"]:hover { background: var(--bg-movie-hover, #475569); }

  .toggle--sm { height: 28px; padding: 0 10px; font-size: 12px; }
  .toggle--default.toggle--default { height: 32px; padding: 0 12px; font-size: 13px; }
  .toggle--lg { height: 40px; padding: 0 16px; font-size: 14px; }
`;

function renderToggle(args: ToggleArgs): HTMLElement {
  const { id, label, pressed, disabled, variant, size } = args;
  const container = document.createElement('div');

  container.innerHTML = `
    <style>${styles}</style>
    <button
      type="button"
      id="${id}"
      class="toggle toggle--${variant} toggle--${size}"
      data-state="${pressed ? 'on' : 'off'}"
      aria-pressed="${pressed}"
      ${disabled ? 'disabled' : ''}
    >${label}</button>
  `;

  const btn = container.querySelector('.toggle') as HTMLButtonElement;
  btn.addEventListener('click', () => {
    if (btn.disabled) return;
    const isPressed = btn.getAttribute('data-state') === 'on';
    const newState = !isPressed;
    btn.setAttribute('data-state', newState ? 'on' : 'off');
    btn.setAttribute('aria-pressed', String(newState));
    btn.dispatchEvent(new CustomEvent('change', {
      bubbles: true,
      detail: { pressed: newState },
    }));
  });

  return container;
}

const meta: Meta<ToggleArgs> = {
  title: 'Components/Toggle',
  render: renderToggle,
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'outline'],
      description: 'Visual style variant',
    },
    size: {
      control: 'select',
      options: ['sm', 'default', 'lg'],
      description: 'Button size',
    },
    pressed: { control: 'boolean', description: 'Initial pressed state' },
    disabled: { control: 'boolean', description: 'Disabled state' },
    label: { control: 'text' },
    id: { control: 'text' },
  },
  args: {
    id: 'toggle-demo',
    label: 'After 6 PM',
    pressed: false,
    disabled: false,
    variant: 'default',
    size: 'default',
  },
};

export default meta;
type Story = StoryObj<ToggleArgs>;

export const Default: Story = {};

export const Pressed: Story = {
  args: { pressed: true },
};

export const Outline: Story = {
  args: { variant: 'outline' },
};

export const OutlinePressed: Story = {
  args: { variant: 'outline', pressed: true },
};

export const Small: Story = {
  args: { size: 'sm', label: 'Weekend' },
};

export const Large: Story = {
  args: { size: 'lg', label: 'Show Details' },
};

export const Disabled: Story = {
  args: { disabled: true, label: 'Unavailable' },
};

export const DisabledPressed: Story = {
  args: { disabled: true, pressed: true, label: 'Locked On' },
};

/** Verifies click toggles the data-state and aria-pressed attributes. */
export const ClickToggle: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const btn = canvas.getByRole('button', { name: 'After 6 PM' });

    // Initially off
    await expect(btn).toHaveAttribute('data-state', 'off');
    await expect(btn).toHaveAttribute('aria-pressed', 'false');

    // Click to activate
    await userEvent.click(btn);
    await expect(btn).toHaveAttribute('data-state', 'on');
    await expect(btn).toHaveAttribute('aria-pressed', 'true');

    // Click to deactivate
    await userEvent.click(btn);
    await expect(btn).toHaveAttribute('data-state', 'off');
    await expect(btn).toHaveAttribute('aria-pressed', 'false');
  },
};
