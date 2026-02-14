import type { Meta, StoryObj } from '@storybook/html';
import { expect, userEvent, within } from '@storybook/test';

interface DrawerArgs {
  id: string;
  title?: string;
  maxHeight: string;
  bodyContent: string;
}

const styles = `
  .drawer {
    display: none;
    position: fixed;
    inset: 0;
    z-index: 200;
  }
  .drawer[data-open="true"] {
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
  }
  .drawer-backdrop {
    position: absolute;
    inset: 0;
    background: rgba(0, 0, 0, 0.6);
    animation: drawer-backdrop-in 0.3s cubic-bezier(0.32, 0.72, 0, 1);
  }
  .drawer[data-open="true"] .drawer-container {
    animation: drawer-slide-up 0.3s cubic-bezier(0.32, 0.72, 0, 1);
  }
  .drawer.closing .drawer-backdrop {
    animation: drawer-backdrop-out 0.25s cubic-bezier(0.32, 0.72, 0, 1) forwards;
  }
  .drawer.closing .drawer-container {
    animation: drawer-slide-down 0.25s cubic-bezier(0.32, 0.72, 0, 1) forwards;
  }
  @keyframes drawer-backdrop-in { from { opacity: 0; } to { opacity: 1; } }
  @keyframes drawer-backdrop-out { from { opacity: 1; } to { opacity: 0; } }
  @keyframes drawer-slide-up { from { transform: translateY(100%); } to { transform: translateY(0); } }
  @keyframes drawer-slide-down { from { transform: translateY(0); } to { transform: translateY(100%); } }

  .drawer-container {
    position: relative;
    z-index: 1;
    max-height: var(--drawer-max-height, 85vh);
    background: var(--bg-day);
    border-radius: 1.5rem 1.5rem 0 0;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.15);
    will-change: transform;
    outline: none;
  }
  .drawer-handle-area {
    display: flex;
    justify-content: center;
    padding: 12px 0 4px;
    cursor: grab;
    flex-shrink: 0;
  }
  .drawer-handle-area:active { cursor: grabbing; }
  .drawer-handle {
    width: 36px;
    height: 4px;
    background: var(--bg-movie-hover);
    border-radius: 2px;
  }
  .drawer-close-btn {
    position: absolute; top: 12px; right: 12px; z-index: 1;
    display: flex; align-items: center; justify-content: center;
    width: 36px; height: 36px; padding: 0;
    background: color-mix(in srgb, var(--bg-movie-hover) 65%, transparent);
    backdrop-filter: blur(8px);
    border: none; border-radius: 50%;
    color: var(--text-secondary); cursor: pointer; outline: none;
    transition: background-color 0.15s, color 0.15s;
  }
  .drawer-close-btn:hover { background: var(--bg-movie-hover); color: var(--text-primary); }
  .drawer-header { padding: 0 20px 12px; padding-right: 48px; flex-shrink: 0; }
  .drawer-title { font-size: 17px; font-weight: 600; color: var(--text-primary); margin: 0; }
  .drawer-body {
    overflow-y: auto; overscroll-behavior: contain;
    padding: 0 20px 12px; flex: 1 1 auto; min-height: 0;
  }
  .drawer-trigger {
    padding: 8px 16px; font-family: inherit; font-size: 14px; font-weight: 500;
    background: var(--accent); color: #fff; border: none; border-radius: 6px; cursor: pointer;
  }
  .drawer-trigger:hover { background: var(--accent-bg); }
`;

const closeSvg = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>';

function renderDrawer(args: DrawerArgs): HTMLElement {
  const { id, title, maxHeight, bodyContent } = args;
  const container = document.createElement('div');

  container.innerHTML = `
    <style>${styles}</style>
    <button class="drawer-trigger" data-open-drawer="${id}">Open Drawer</button>
    <div id="${id}" class="drawer" data-open="false" role="dialog" aria-modal="true"${title ? ` aria-labelledby="${id}-title"` : ''}>
      <div class="drawer-backdrop" data-drawer-close></div>
      <div class="drawer-container" style="--drawer-max-height: ${maxHeight}">
        <div class="drawer-handle-area" data-drawer-handle>
          <div class="drawer-handle"></div>
        </div>
        <button class="drawer-close-btn" data-drawer-close aria-label="Close">${closeSvg}</button>
        ${title ? `<div class="drawer-header"><h2 id="${id}-title" class="drawer-title">${title}</h2></div>` : ''}
        <div class="drawer-body">${bodyContent}</div>
      </div>
    </div>
  `;

  const drawer = container.querySelector(`#${id}`) as HTMLElement;
  const drawerContainer = drawer.querySelector('.drawer-container') as HTMLElement;
  const handle = drawer.querySelector('[data-drawer-handle]') as HTMLElement;
  const trigger = container.querySelector(`[data-open-drawer="${id}"]`) as HTMLElement;

  function closeDrawer() {
    drawer.classList.add('closing');
    setTimeout(() => {
      drawer.dataset.open = 'false';
      drawer.classList.remove('closing');
      drawerContainer.style.transform = '';
      document.body.style.overflow = '';
    }, 250);
  }

  // Open
  trigger.addEventListener('click', () => {
    drawer.dataset.open = 'true';
    document.body.style.overflow = 'hidden';
    drawerContainer.setAttribute('tabindex', '-1');
    requestAnimationFrame(() => drawerContainer.focus());
  });

  // Close on backdrop/close button
  container.querySelectorAll('[data-drawer-close]').forEach(el => {
    el.addEventListener('click', (e) => {
      e.stopPropagation();
      closeDrawer();
    });
  });

  // Escape to close
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && drawer.dataset.open === 'true') {
      closeDrawer();
    }
  });

  // Mouse drag on handle
  if (handle) {
    let startY = 0;
    let currentY = 0;
    let isDragging = false;

    handle.addEventListener('mousedown', (e: MouseEvent) => {
      isDragging = true;
      startY = e.clientY;
      drawerContainer.style.transition = 'none';

      const onMouseMove = (e: MouseEvent) => {
        if (!isDragging) return;
        currentY = e.clientY - startY;
        if (currentY < 0) currentY = 0;
        drawerContainer.style.transform = `translateY(${currentY}px)`;
      };

      const onMouseUp = () => {
        isDragging = false;
        drawerContainer.style.transition = '';
        if (currentY > 80) {
          closeDrawer();
        } else {
          drawerContainer.style.transform = '';
        }
        currentY = 0;
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
      };

      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
    });
  }

  return container;
}

const meta: Meta<DrawerArgs> = {
  title: 'Components/Drawer',
  render: renderDrawer,
  argTypes: {
    title: { control: 'text' },
    maxHeight: { control: 'text', description: 'Max height CSS value' },
    bodyContent: { control: 'text' },
  },
  args: {
    id: 'drawer-demo',
    title: 'Movie Details',
    maxHeight: '85vh',
    bodyContent: `
      <p style="color: var(--text-secondary); line-height: 1.6; margin-bottom: 12px;">
        <strong style="color: var(--text-primary);">The Third Man</strong> (1949) &middot; 104 min
      </p>
      <p style="color: var(--text-secondary); line-height: 1.6; margin-bottom: 12px;">
        Directed by Carol Reed. Starring Joseph Cotten, Orson Welles, Alida Valli.
      </p>
      <p style="color: var(--text-secondary); line-height: 1.6;">
        Pulp novelist Holly Martins travels to postwar Vienna to work for his childhood friend Harry Lime,
        only to discover that Lime has recently died. Martins becomes embroiled in a mystery surrounding
        Lime's death and the shadowy world of black marketeering in occupied Vienna.
      </p>
    `,
  },
};

export default meta;
type Story = StoryObj<DrawerArgs>;

export const Default: Story = {};

export const NoTitle: Story = {
  args: { title: undefined },
};

export const ShortHeight: Story = {
  args: { maxHeight: '40vh', title: 'Compact Drawer' },
};

/** Verifies the drawer opens on trigger click and closes on close button click. */
export const OpenClose: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('button', { name: 'Open Drawer' });
    const drawer = canvasElement.querySelector('.drawer') as HTMLElement;

    // Initially closed
    await expect(drawer).toHaveAttribute('data-open', 'false');

    // Open
    await userEvent.click(trigger);
    await expect(drawer).toHaveAttribute('data-open', 'true');

    // Close via close button
    const closeBtn = canvas.getByRole('button', { name: 'Close' });
    await userEvent.click(closeBtn);

    // Wait for close animation
    await new Promise(resolve => setTimeout(resolve, 300));
    await expect(drawer).toHaveAttribute('data-open', 'false');
  },
};
