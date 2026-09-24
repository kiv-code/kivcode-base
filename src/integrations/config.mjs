/**
 * La configuración de Astro que todos los sitios comparten. El sitio la extiende
 * con lo suyo; lo que está acá es lo que no se negocia.
 *
 *   import { defineConfig } from 'astro/config';
 *   import { baseConfig } from '@kivcode/base/astro';
 *   export default defineConfig(baseConfig({ site: SITE_URL }));
 */
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import { cloudflareHeaders } from './headers.mjs';

export function baseConfig({ site, integrations = [], headers = {}, ...resto } = {}) {
  return {
    site,
    // HTML plano: el Worker solo despierta en /api/*. Es lo que hace que el
    // sitio sea rápido y que el costo sea cero.
    output: 'static',
    trailingSlash: 'always',
    devToolbar: { enabled: false },
    integrations: [sitemap(), cloudflareHeaders(headers), ...integrations],
    ...resto,
    vite: {
      ...resto.vite,
      plugins: [tailwindcss(), ...(resto.vite?.plugins ?? [])],
      build: {
        ...resto.vite?.build,
        // Nunca incrustar fuentes como data: URI. Si se incrustan, hay que abrir
        // `font-src` a `data:` en la CSP, y no vale la pena por ahorrar una petición.
        assetsInlineLimit: (filePath) =>
          /\.(woff2?|ttf|otf|eot)$/i.test(filePath) ? false : undefined,
      },
    },
  };
}
