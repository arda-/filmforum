import type { APIRoute } from 'astro';

export const GET: APIRoute = ({ site }) => {
  const siteUrl = site?.toString().replace(/\/$/, '') || 'http://localhost:4321';

  const robotsTxt = `# FilmForum robots.txt
# Allow search engines to index public pages

User-agent: *
Allow: /
Disallow: /demo/
Disallow: /s/*/list/saved
Disallow: /s/*/compare/

Sitemap: ${siteUrl}/sitemap-index.xml
`;

  return new Response(robotsTxt, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
    },
  });
};
