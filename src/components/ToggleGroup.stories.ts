/**
 * ToggleGroup Stories
 *
 * Stories demonstrate the ToggleGroup component functionality,
 * showing various configurations and use cases.
 */
import ToggleGroup from './ToggleGroup.astro';

export default {
  component: ToggleGroup,
};

/** Default toggle group with three options */
export const Default = {
  args: {
    label: 'Select option',
    name: 'default',
    size: 'default',
    options: [
      { label: 'Option 1', value: 'option1', checked: true },
      { label: 'Option 2', value: 'option2' },
      { label: 'Option 3', value: 'option3' },
    ],
  },
};

/** Small toggle group with size variant */
export const Small = {
  args: {
    label: 'Size',
    name: 'small',
    size: 'sm',
    options: [
      { label: 'A', value: 'a', checked: true },
      { label: 'B', value: 'b' },
      { label: 'C', value: 'c' },
    ],
  },
};

/** Large toggle group with size variant */
export const Large = {
  args: {
    label: 'Select option',
    name: 'large',
    size: 'lg',
    options: [
      { label: 'Option 1', value: 'option1', checked: true },
      { label: 'Option 2', value: 'option2' },
      { label: 'Option 3', value: 'option3' },
    ],
  },
};

/** Disabled toggle group (disabled state) */
export const Disabled = {
  args: {
    label: 'Disabled group',
    name: 'disabled',
    disabled: true,
    options: [
      { label: 'Option 1', value: 'option1', checked: true },
      { label: 'Option 2', value: 'option2' },
      { label: 'Option 3', value: 'option3' },
    ],
  },
};

/** Single selection mode (default behavior) */
export const SingleSelect = {
  args: {
    label: 'Choose one',
    name: 'single',
    options: [
      { label: 'A', value: 'a', checked: true },
      { label: 'B', value: 'b' },
      { label: 'C', value: 'c' },
    ],
  },
};

/** Multi-select mode (checkbox-based) */
export const MultiSelect = {
  args: {
    label: 'Choose multiple',
    name: 'multi',
    options: [
      { label: 'A', value: 'a', checked: true },
      { label: 'B', value: 'b', checked: true },
      { label: 'C', value: 'c' },
    ],
  },
};

/** Minimum selection required (at least one must be selected) */
export const MinimumSelection = {
  args: {
    label: 'At least one required',
    name: 'minimum',
    options: [
      { label: 'Option 1', value: 'option1', checked: true },
      { label: 'Option 2', value: 'option2' },
      { label: 'Option 3', value: 'option3' },
    ],
  },
};

/** Icon-only toggles */
export const Icon = {
  args: {
    label: 'Icons only',
    name: 'icons',
    options: [
      { label: '', value: 'prev', checked: true, icon: 'chevron-left' },
      { label: '', value: 'next', icon: 'chevron-right' },
    ],
  },
};

/** Icons with text labels */
export const IconAndText = {
  args: {
    label: 'With icons',
    name: 'icon-text',
    options: [
      { label: 'Menu', value: 'menu', checked: true, icon: 'menu' },
      { label: 'Settings', value: 'settings', icon: 'settings' },
      { label: 'Done', value: 'done', icon: 'check' },
    ],
  },
};
