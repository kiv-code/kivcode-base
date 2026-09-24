import type { APIRoute } from 'astro';

/**
 * `robots.txt` con el sitemap apuntando al dominio real. Sale de `Astro.site`,
 * que a su vez sale de `PUBLIC_SITE_URL`: un solo dominio, un solo lugar.
 *
 *   // src/pages/robots.txt.ts
 *   export { GET } from '@kivcode/base/routes/robots';
 */
export const robotsTxt =
  (disallow: string[] = []): APIRoute =>
  ({ site }) => {
    const cuerpo = [
      'User-agent: *',
      'Allow: /',
      ...disallow.map((ruta) => `Disallow: ${ruta}`),
      '',
      `Sitemap: ${new URL('sitemap-index.xml', site)}`,
      '',
    ].join('\n');

    return new Response(cuerpo, {
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  };

export const GET = robotsTxt();
