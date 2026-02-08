// @ts-check
import { defineConfig } from 'astro/config';
import { webcore } from 'webcoreui/integration';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://filmforum.org',
  integrations: [
    webcore(),
    sitemap({
      filter: (page) =>
        !page.includes('/demo/') &&
        !page.includes('/list/saved') &&
        !page.includes('/compare/'),
    })
  ]
});
