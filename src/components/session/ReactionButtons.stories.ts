import type { Meta, StoryObj } from '@storybook/html';
import { expect, userEvent, within } from '@storybook/test';

interface ReactionButtonsArgs {
  movieId: string;
  reaction: 'none' | 'yes' | 'maybe' | 'no';
  size: 'sm' | 'md';
}

const styles = `
  .reactions { display: flex; gap: 6px; }
  .rbtn {
    flex: 1;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    font-family: inherit;
    font-weight: 500;
    border-radius: 8px;
    border: 1.5px solid transparent;
    background: transparent;
    cursor: pointer;
    transition: all 0.15s ease;
    user-select: none;
  }
  .rbtn:active { transform: scale(0.95); }
  .rbtn:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }

  .reactions--md .rbtn { padding: 10px 14px; font-size: 14px; }
  .reactions--sm .rbtn { padding: 6px 10px; font-size: 12px; }
  .reactions--sm .rbtn svg { width: 14px; height: 14px; }

  .rbtn--yes { color: var(--reaction-yes, #22c55e); border-color: var(--reaction-yes, #22c55e); }
  .rbtn--yes.active { background: var(--reaction-yes, #22c55e); color: #fff; }
  .rbtn--maybe { color: var(--reaction-maybe, #f59e0b); border-color: var(--reaction-maybe, #f59e0b); }
  .rbtn--maybe.active { background: var(--reaction-maybe, #f59e0b); color: #fff; }
  .rbtn--no { color: var(--reaction-no, #ef4444); border-color: var(--reaction-no, #ef4444); }
  .rbtn--no.active { background: var(--reaction-no, #ef4444); color: #fff; }
`;

const svgYes = '<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M13.5 4.5l-7 7L3 8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const svgMaybe = '<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="11.5" r="1" fill="currentColor"/><path d="M6 6a2 2 0 114 0c0 1-1.5 1.5-2 2.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>';
const svgNo = '<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>';

function renderReactionButtons(args: ReactionButtonsArgs): HTMLElement {
  const { movieId, reaction, size } = args;
  const container = document.createElement('div');

  container.innerHTML = `
    <style>${styles}</style>
    <div class="reactions reactions--${size}" data-movie-id="${movieId}" data-reaction-group>
      <button
        class="rbtn rbtn--yes ${reaction === 'yes' ? 'active' : ''}"
        data-reaction="yes"
        data-movie-id="${movieId}"
        aria-pressed="${reaction === 'yes'}"
        aria-label="Yes"
      >${svgYes}<span>Yes</span></button>
      <button
        class="rbtn rbtn--maybe ${reaction === 'maybe' ? 'active' : ''}"
        data-reaction="maybe"
        data-movie-id="${movieId}"
        aria-pressed="${reaction === 'maybe'}"
        aria-label="Maybe"
      >${svgMaybe}<span>Maybe</span></button>
      <button
        class="rbtn rbtn--no ${reaction === 'no' ? 'active' : ''}"
        data-reaction="no"
        data-movie-id="${movieId}"
        aria-pressed="${reaction === 'no'}"
        aria-label="No"
      >${svgNo}<span>No</span></button>
    </div>
  `;

  // Attach toggle behavior
  container.addEventListener('click', (e) => {
    const btn = (e.target as HTMLElement).closest('[data-reaction-group] .rbtn') as HTMLElement;
    if (!btn) return;
    btn.classList.toggle('active');
    btn.setAttribute('aria-pressed', String(btn.classList.contains('active')));
  });

  return container;
}

const meta: Meta<ReactionButtonsArgs> = {
  title: 'Session/ReactionButtons',
  render: renderReactionButtons,
  argTypes: {
    reaction: {
      control: 'select',
      options: ['none', 'yes', 'maybe', 'no'],
      description: 'Initial reaction state',
    },
    size: {
      control: 'select',
      options: ['sm', 'md'],
      description: 'Button size variant',
    },
    movieId: { control: 'text' },
  },
  args: {
    movieId: 'demo-1',
    reaction: 'none',
    size: 'md',
  },
};

export default meta;
type Story = StoryObj<ReactionButtonsArgs>;

export const Default: Story = {};

export const YesSelected: Story = {
  args: { reaction: 'yes' },
};

export const MaybeSelected: Story = {
  args: { reaction: 'maybe' },
};

export const NoSelected: Story = {
  args: { reaction: 'no' },
};

export const Small: Story = {
  args: { size: 'sm' },
};

export const SmallWithReaction: Story = {
  args: { size: 'sm', reaction: 'yes' },
};

/** Verifies click toggles the active state and aria-pressed attribute. */
export const ClickToggle: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const yesBtn = canvas.getByRole('button', { name: 'Yes' });

    // Initially not pressed
    await expect(yesBtn).toHaveAttribute('aria-pressed', 'false');
    expect(yesBtn.classList.contains('active')).toBe(false);

    // Click to activate
    await userEvent.click(yesBtn);
    await expect(yesBtn).toHaveAttribute('aria-pressed', 'true');
    expect(yesBtn.classList.contains('active')).toBe(true);

    // Click to deactivate
    await userEvent.click(yesBtn);
    await expect(yesBtn).toHaveAttribute('aria-pressed', 'false');
    expect(yesBtn.classList.contains('active')).toBe(false);
  },
};

/** Verifies multiple buttons can be toggled independently. */
export const IndependentToggles: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const yesBtn = canvas.getByRole('button', { name: 'Yes' });
    const maybeBtn = canvas.getByRole('button', { name: 'Maybe' });

    await userEvent.click(yesBtn);
    await expect(yesBtn).toHaveAttribute('aria-pressed', 'true');

    await userEvent.click(maybeBtn);
    await expect(maybeBtn).toHaveAttribute('aria-pressed', 'true');
    // Yes should still be active
    await expect(yesBtn).toHaveAttribute('aria-pressed', 'true');
  },
};
