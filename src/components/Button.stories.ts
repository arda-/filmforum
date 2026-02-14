/**
 * Button component stories
 *
 * NOTE: Astrobook does NOT support passing slot content directly to components.
 * The Button component uses <slot /> for its content, but Astrobook only passes
 * args as props. To work around this limitation, we use a ButtonWrapper adapter
 * component that accepts 'text' or 'html' as props and passes them as slot content
 * to the Button component.
 *
 * See: ButtonWrapper.astro
 */
import ButtonWrapper from './decorators/ButtonWrapper.astro';

export default {
  component: ButtonWrapper,
  tags: ['autodocs'],
};

export const Primary = {
  args: { variant: 'primary', text: 'Primary Button' },
};

export const Secondary = {
  args: { variant: 'secondary', text: 'Secondary Button' },
};

export const Danger = {
  args: { variant: 'danger', text: 'Danger Button' },
};

export const Outline = {
  args: { variant: 'outline', text: 'Outline Button' },
};

export const Ghost = {
  args: { variant: 'ghost', text: 'Ghost Button' },
};

export const Link = {
  args: { variant: 'link', text: 'Link Button' },
};

export const Small = {
  args: { size: 'sm', text: 'Small Button' },
};

export const Default = {
  args: { size: 'default', text: 'Default Button' },
};

export const Large = {
  args: { size: 'lg', text: 'Large Button' },
};

export const Icon = {
  args: { size: 'icon', text: '✕' },
};

export const Disabled = {
  args: { disabled: true, text: 'Disabled Button' },
};

export const WithIcon = {
  args: { variant: 'primary', html: '<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M13.5 4.5l-7 7L3 8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg> Confirm' },
};
