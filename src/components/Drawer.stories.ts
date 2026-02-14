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

export const Scrollable = {
  args: {
    id: 'drawer-scrollable',
    title: 'Terms of Service',
    maxHeight: '70vh',
    content: `
      <div style="display: flex; flex-direction: column; gap: 12px;">
        <div>
          <h3 style="font-size: 15px; font-weight: 600; color: var(--text-primary); margin: 20px 0 8px 0;">1. Acceptance of Terms</h3>
          <p style="font-size: 13px; color: var(--text-secondary); line-height: 1.6; margin: 0;">By accessing and using this service, you accept and agree to be bound by the terms and provision of this agreement.</p>
        </div>
        <div>
          <h3 style="font-size: 15px; font-weight: 600; color: var(--text-primary); margin: 20px 0 8px 0;">2. Use License</h3>
          <p style="font-size: 13px; color: var(--text-secondary); line-height: 1.6; margin: 0;">Permission is granted to temporarily download one copy of the materials (information or software) on this website for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title.</p>
          <ul style="font-size: 13px; color: var(--text-secondary); line-height: 1.6; margin: 8px 0 0 0; padding-left: 20px;">
            <li style="margin-bottom: 4px;">modify or copy the materials</li>
            <li style="margin-bottom: 4px;">use the materials for any commercial purpose</li>
            <li>attempt to decompile or reverse engineer any software</li>
          </ul>
        </div>
        <div>
          <h3 style="font-size: 15px; font-weight: 600; color: var(--text-primary); margin: 20px 0 8px 0;">3. Disclaimer</h3>
          <p style="font-size: 13px; color: var(--text-secondary); line-height: 1.6; margin: 0;">The materials on this website are provided on an 'as is' basis. We make no warranties, expressed or implied, and hereby disclaim all other warranties.</p>
        </div>
        <div>
          <h3 style="font-size: 15px; font-weight: 600; color: var(--text-primary); margin: 20px 0 8px 0;">4. Limitations</h3>
          <p style="font-size: 13px; color: var(--text-secondary); line-height: 1.6; margin: 0;">In no event shall we or our suppliers be liable for any damages arising out of the use or inability to use the materials on this website.</p>
        </div>
        <div>
          <h3 style="font-size: 15px; font-weight: 600; color: var(--text-primary); margin: 20px 0 8px 0;">5. Accuracy of Materials</h3>
          <p style="font-size: 13px; color: var(--text-secondary); line-height: 1.6; margin: 0;">The materials appearing on this website could include technical, typographical, or photographic errors. We do not warrant that any materials are accurate, complete or current.</p>
        </div>
        <div>
          <h3 style="font-size: 15px; font-weight: 600; color: var(--text-primary); margin: 20px 0 8px 0;">6. Modifications</h3>
          <p style="font-size: 13px; color: var(--text-secondary); line-height: 1.6; margin: 0;">We may revise these terms of service at any time without notice. By using this website you are agreeing to be bound by the then current version.</p>
        </div>
      </div>
    `,
    triggerText: 'Open Scrollable Content',
  },
};

export const StickyFooter = {
  args: {
    id: 'drawer-sticky-footer',
    title: 'Product Details',
    maxHeight: '70vh',
    content: `
      <div style="display: flex; flex-direction: column; gap: 12px;">
        <div>
          <h3 style="font-size: 15px; font-weight: 600; color: var(--text-primary); margin: 0 0 8px 0;">Overview</h3>
          <p style="font-size: 13px; color: var(--text-secondary); line-height: 1.6; margin: 0;">This drawer demonstrates a sticky footer that stays visible at the bottom while the content scrolls independently.</p>
        </div>
        <div>
          <h3 style="font-size: 15px; font-weight: 600; color: var(--text-primary); margin: 20px 0 8px 0;">Features</h3>
          <ul style="font-size: 13px; color: var(--text-secondary); line-height: 1.6; margin: 0; padding-left: 20px;">
            <li style="margin-bottom: 4px;">Premium quality construction</li>
            <li style="margin-bottom: 4px;">Available in multiple colors</li>
            <li style="margin-bottom: 4px;">Free shipping on all orders</li>
            <li style="margin-bottom: 4px;">30-day money back guarantee</li>
          </ul>
        </div>
        <div>
          <h3 style="font-size: 15px; font-weight: 600; color: var(--text-primary); margin: 20px 0 8px 0;">Specifications</h3>
          <p style="font-size: 13px; color: var(--text-secondary); line-height: 1.6; margin: 0 0 8px 0;">Material: Premium crafted with attention to detail</p>
          <p style="font-size: 13px; color: var(--text-secondary); line-height: 1.6; margin: 0 0 8px 0;">Dimensions: Perfectly sized for standard use</p>
          <p style="font-size: 13px; color: var(--text-secondary); line-height: 1.6; margin: 0;">Weight: Lightweight and durable</p>
        </div>
        <div>
          <h3 style="font-size: 15px; font-weight: 600; color: var(--text-primary); margin: 20px 0 8px 0;">Customer Reviews</h3>
          <p style="font-size: 13px; color: var(--text-secondary); line-height: 1.6; margin: 0 0 8px 0;">"Outstanding quality and fast shipping!" — Sarah M.</p>
          <p style="font-size: 13px; color: var(--text-secondary); line-height: 1.6; margin: 0;">"Exactly what I was looking for." — James P.</p>
        </div>
      </div>
    `,
    footer: `
      <button onclick="window.closeDrawer('drawer-sticky-footer')" style="padding: 10px 16px; font-size: 14px; font-weight: 500; background: var(--bg-movie); color: var(--text-primary); border: 1px solid var(--bg-movie-hover); border-radius: 6px; cursor: pointer; transition: background-color 0.15s;">Cancel</button>
      <button onclick="window.closeDrawer('drawer-sticky-footer')" style="padding: 10px 16px; font-size: 14px; font-weight: 500; background: var(--accent); color: white; border: none; border-radius: 6px; cursor: pointer; transition: opacity 0.15s;">Add to Cart</button>
    `,
    triggerText: 'Open (Sticky Footer)',
  },
};

export const MovieDetail = {
  args: {
    id: 'drawer-movie-detail',
    maxHeight: '85vh',
    content: `
      <div style="display: flex; flex-direction: column; gap: 8px;">
        <div style="width: 100%; aspect-ratio: 16/9; background: var(--bg-movie); border-radius: 8px; overflow: hidden; margin-bottom: 8px; flex-shrink: 0;">
          <img src="https://images.unsplash.com/photo-1485846234645-a62644f84728?w=800&q=80" alt="Movie poster" style="width: 100%; height: 100%; object-fit: cover; display: block;" loading="lazy" />
        </div>
        <h2 style="font-size: 24px; font-weight: 600; color: var(--text-primary); margin: 0; line-height: 1.2;">Street Scene</h2>
        <p style="font-size: 14px; color: var(--text-secondary); margin: 0;">1931 · King Vidor · 80 min</p>
        <p style="font-size: 13px; color: var(--text-tertiary); margin: 0; margin-bottom: 12px;">Sylvia Sidney, William Collier Jr., Estelle Taylor</p>
        <p style="font-size: 13px; color: var(--text-secondary); line-height: 1.6; margin: 0; padding-left: 1.5em; position: relative; font-style: italic;">"A slice-of-life drama set on a single New York City block during a sweltering summer day. The film captures the rhythms and tensions of tenement life with remarkable authenticity."</p>
        <p style="font-size: 12px; color: var(--text-tertiary); text-align: right; margin: 4px 0 12px 0; font-style: italic;">— Film Forum</p>
        <div style="display: flex; gap: 16px; padding: 12px 0; margin: 8px 0; border-top: 1px solid var(--bg-movie-hover); border-bottom: 1px solid var(--bg-movie-hover);">
          <div style="display: flex; flex-direction: column; gap: 4px;">
            <span style="font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-tertiary);">IMDB</span>
            <span style="font-size: 18px; font-weight: 600; color: var(--accent);">7.2</span>
          </div>
          <div style="display: flex; flex-direction: column; gap: 4px;">
            <span style="font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-tertiary);">RT</span>
            <span style="font-size: 18px; font-weight: 600; color: var(--accent);">88%</span>
          </div>
          <div style="display: flex; flex-direction: column; gap: 4px;">
            <span style="font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-tertiary);">META</span>
            <span style="font-size: 18px; font-weight: 600; color: var(--accent);">70</span>
          </div>
        </div>
      </div>
    `,
    footer: `
      <button onclick="window.closeDrawer('drawer-movie-detail')" style="padding: 10px 16px; font-size: 14px; font-weight: 500; background: var(--bg-movie); color: var(--text-primary); border: 1px solid var(--bg-movie-hover); border-radius: 6px; cursor: pointer; transition: background-color 0.15s;">Close</button>
      <button onclick="window.closeDrawer('drawer-movie-detail')" style="padding: 10px 16px; font-size: 14px; font-weight: 500; background: var(--accent); color: white; border: none; border-radius: 6px; cursor: pointer; transition: opacity 0.15s;">Buy Tickets</button>
    `,
    triggerText: 'Open Movie Detail',
  },
};
