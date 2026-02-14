# Astrobook Story Decorators

This directory contains reusable decorator components for Astrobook stories.

## What are Decorators?

Decorators are wrapper components that apply styling or layout to story components. In Astrobook, decorators are objects with a `component` property and optional `props` that will be passed to the wrapper.

**Important limitations:**
- Decorators only support styling changes
- Cannot modify component context or client-side behaviors
- Must include a `<slot />` for rendering children
- Rendered to HTML via Astro before sending to client

## Available Decorators

### DarkBackground

Wraps components with a dark background for testing components designed for dark surfaces.

**Props:**
- `padding` (string, default: `'2rem'`): Padding around the wrapped component

**Example:**
```ts
import DarkBackground from '../decorators/DarkBackground.astro';

export const OnDark = {
  args: { variant: 'primary' },
  decorators: [
    { component: DarkBackground }
  ],
};

export const OnDarkCustomPadding = {
  args: { variant: 'secondary' },
  decorators: [
    { component: DarkBackground, props: { padding: '4rem' } }
  ],
};
```

### FixedWidth

Constrains component width for testing at specific viewport sizes.

**Props:**
- `width` (string, default: `'400px'`): Maximum width of the container
- `centered` (boolean, default: `true`): Whether to center the container

**Example:**
```ts
import FixedWidth from '../decorators/FixedWidth.astro';

export const Narrow = {
  args: { title: 'Dialog' },
  decorators: [
    { component: FixedWidth, props: { width: '300px' } }
  ],
};

export const Wide = {
  args: { title: 'Wide Dialog' },
  decorators: [
    { component: FixedWidth, props: { width: '800px', centered: false } }
  ],
};
```

## Combining Decorators

Multiple decorators can be stacked. They are applied in order, with the first wrapping closest to the component.

```ts
export const ComplexExample = {
  args: { variant: 'primary' },
  decorators: [
    { component: FixedWidth, props: { width: '500px' } },
    { component: DarkBackground, props: { padding: '3rem' } },
  ],
};
// Result: DarkBackground wraps FixedWidth which wraps the component
```

## Creating Custom Decorators

To create a new decorator:

1. Create an `.astro` file in this directory
2. Accept props for customization
3. Include a `<slot />` for rendering children
4. Apply only styling/layout changes (no context or client-side behavior)

**Example:**
```astro
---
interface Props {
  border?: string;
}

const { border = '2px solid red' } = Astro.props;
---

<div style={`border: ${border};`}>
  <slot />
</div>
```
