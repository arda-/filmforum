import type { Preview } from '@storybook/html';
import '../src/styles/global.css';

const preview: Preview = {
  parameters: {
    backgrounds: {
      default: 'dark',
      values: [
        { name: 'dark', value: '#020617' },
        { name: 'light', value: '#ffffff' },
      ],
    },
  },
  decorators: [
    (story) => {
      // Apply dark-mode CSS variables directly since Storybook iframes
      // don't trigger prefers-color-scheme: dark automatically.
      const root = document.documentElement;
      root.style.setProperty('--bg-body', '#020617');
      root.style.setProperty('--bg-grid', '#0f172a');
      root.style.setProperty('--bg-day', '#1e293b');
      root.style.setProperty('--bg-day-movies', '#1e293b');
      root.style.setProperty('--bg-movie', '#334155');
      root.style.setProperty('--bg-movie-hover', '#475569');
      root.style.setProperty('--text-primary', '#e2e8f0');
      root.style.setProperty('--text-secondary', '#94a3b8');
      root.style.setProperty('--text-tertiary', '#94a3b8');
      root.style.setProperty('--accent', '#06b6d4');
      root.style.setProperty('--accent-light', '#67e8f9');
      root.style.setProperty('--accent-bg', '#0e7490');
      root.style.setProperty('--reaction-yes', '#4ade80');
      root.style.setProperty('--reaction-maybe', '#fbbf24');
      root.style.setProperty('--reaction-no', '#f87171');
      root.style.setProperty('--drawer-close-bg-opacity', '65%');
      root.style.setProperty('--drawer-close-color', 'var(--text-secondary)');

      const wrapper = document.createElement('div');
      wrapper.style.padding = '20px';
      wrapper.style.fontFamily = "'IBM Plex Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
      wrapper.style.color = 'var(--text-primary)';

      const result = story();
      if (typeof result === 'string') {
        wrapper.innerHTML = result;
      } else if (result instanceof HTMLElement) {
        wrapper.appendChild(result);
      }
      return wrapper;
    },
  ],
};

export default preview;
