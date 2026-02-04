// @ts-check
import { defineConfig } from 'astro/config';
import { webcore } from 'webcoreui/integration';

// https://astro.build/config
export default defineConfig({
  integrations: [webcore()]
});
