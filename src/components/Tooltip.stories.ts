import type { Meta, StoryObj } from '@storybook/html';

interface TooltipArgs {
  text: string;
  disabled: boolean;
  triggerLabel: string;
}

const styles = `
  .tooltip-wrapper { display: inline-flex; position: relative; }
  .tooltip-content {
    position: fixed;
    z-index: 302;
    padding: 6px 10px;
    font-size: 12px;
    line-height: 1.4;
    color: var(--text-primary);
    background: var(--bg-movie);
    border: 1px solid var(--bg-movie-hover);
    border-radius: 6px;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
    pointer-events: none;
    opacity: 0;
    transition: opacity 0.15s ease;
    max-width: 240px;
    word-wrap: break-word;
  }
  .tooltip-content.visible { opacity: 1; }
  .tooltip-trigger {
    padding: 8px 16px; font-family: inherit; font-size: 14px; font-weight: 500;
    background: var(--bg-movie); color: var(--text-primary);
    border: 1px solid var(--bg-movie-hover); border-radius: 6px; cursor: pointer;
  }
  .tooltip-trigger:hover { background: var(--bg-movie-hover); }
`;

function renderTooltip(args: TooltipArgs): HTMLElement {
  const { text, disabled, triggerLabel } = args;
  const container = document.createElement('div');
  container.style.padding = '60px 20px';

  container.innerHTML = `
    <style>${styles}</style>
    <span class="tooltip-wrapper" data-tooltip="${text}" data-disabled="${disabled}">
      <button class="tooltip-trigger">${triggerLabel}</button>
    </span>
  `;

  const wrapper = container.querySelector('.tooltip-wrapper') as HTMLElement;
  let tooltipEl: HTMLElement | null = null;
  let showTimeout: number | null = null;
  let hideTimeout: number | null = null;

  const show = () => {
    if (disabled) return;
    if (hideTimeout) { clearTimeout(hideTimeout); hideTimeout = null; }

    showTimeout = window.setTimeout(() => {
      const tooltipText = wrapper.getAttribute('data-tooltip');
      if (!tooltipText) return;

      tooltipEl = document.createElement('div');
      tooltipEl.className = 'tooltip-content';
      tooltipEl.textContent = tooltipText;
      tooltipEl.setAttribute('role', 'tooltip');
      document.body.appendChild(tooltipEl);

      const rect = wrapper.getBoundingClientRect();
      const tooltipRect = tooltipEl.getBoundingClientRect();

      let left = rect.left + rect.width / 2 - tooltipRect.width / 2;
      let top = rect.top - tooltipRect.height - 8;

      const padding = 8;
      if (left < padding) left = padding;
      if (left + tooltipRect.width > window.innerWidth - padding) {
        left = window.innerWidth - tooltipRect.width - padding;
      }
      if (top < padding) top = rect.bottom + 8;

      tooltipEl.style.left = `${left}px`;
      tooltipEl.style.top = `${top}px`;

      requestAnimationFrame(() => tooltipEl?.classList.add('visible'));
    }, 300);
  };

  const hide = () => {
    if (showTimeout) { clearTimeout(showTimeout); showTimeout = null; }
    if (tooltipEl) {
      tooltipEl.classList.remove('visible');
      hideTimeout = window.setTimeout(() => {
        tooltipEl?.remove();
        tooltipEl = null;
      }, 150);
    }
  };

  wrapper.addEventListener('mouseenter', show);
  wrapper.addEventListener('mouseleave', hide);
  wrapper.addEventListener('focus', show, true);
  wrapper.addEventListener('blur', hide, true);

  return container;
}

const meta: Meta<TooltipArgs> = {
  title: 'Components/Tooltip',
  render: renderTooltip,
  argTypes: {
    text: { control: 'text', description: 'Tooltip text content' },
    disabled: { control: 'boolean', description: 'Disable tooltip' },
    triggerLabel: { control: 'text', description: 'Button label' },
  },
  args: {
    text: 'Download the calendar file (.ics) for this film series',
    disabled: false,
    triggerLabel: 'Export Calendar',
  },
};

export default meta;
type Story = StoryObj<TooltipArgs>;

export const Default: Story = {};

export const ShortText: Story = {
  args: { text: 'Save', triggerLabel: 'Action' },
};

export const LongText: Story = {
  args: {
    text: 'This tooltip has a much longer text content to demonstrate how it wraps within the maximum width constraint of 240 pixels',
    triggerLabel: 'Hover for details',
  },
};

export const Disabled: Story = {
  args: { disabled: true, triggerLabel: 'No tooltip here' },
};
