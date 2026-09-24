/**
 * Escribe `_headers` en `dist/` al terminar el build.
 *
 * Va acá y no en `public/_headers` de cada sitio porque la CSP es la pieza que
 * más caro sale equivocada: no se puede probar con `pnpm dev` —los `_headers`
 * solo se aplican en `pnpm preview:cf` y en producción—, así que un error se
 * descubre con el sitio ya publicado.
 *
 * El sitio suma orígenes por directiva, no reescribe la política:
 *
 *   cloudflareHeaders({ añadir: { 'connect-src': ['https://plausible.io'] } })
 */

/** La política mínima que todo sitio del estudio necesita, con Turnstile incluido. */
const CSP_BASE = {
  'default-src': ["'self'"],
  'base-uri': ["'self'"],
  'object-src': ["'none'"],
  'frame-ancestors': ["'none'"],
  'form-action': ["'self'"],
  'img-src': ["'self'", 'data:'],
  'font-src': ["'self'"],
  'style-src': ["'self'", "'unsafe-inline'"],
  'script-src': ["'self'", "'unsafe-inline'", 'https://challenges.cloudflare.com'],
  'frame-src': ['https://challenges.cloudflare.com'],
  'connect-src': ["'self'", 'https://challenges.cloudflare.com'],
};

/**
 * Cloudflare inyecta solo el beacon de Web Analytics en el HTML cuando la zona
 * lo tiene activado. Sin estos dos orígenes el navegador lo bloquea y no hay
 * métricas — el sitio anda, pero no sabés si está trayendo consultas.
 *
 * Viene encendido por defecto porque la analítica es parte del negocio en todos
 * los sitios del estudio: si hubiera que acordarse de activarla, tarde o
 * temprano un sitio saldría sin ella y nadie lo notaría hasta querer mirar los
 * números. No usa cookies ni rastrea entre sitios.
 *
 * Se apaga con `analiticaCloudflare: false` cuando el sitio no la quiera —por
 * ejemplo si el cliente pide cero terceros—. Permitir el origen sin que la zona
 * tenga la analítica activada no carga nada: la política solo autoriza.
 */
const CSP_ANALITICA = {
  'script-src': ['https://static.cloudflareinsights.com'],
  'connect-src': ['https://cloudflareinsights.com'],
};

const fusionar = (...fuentes) => {
  const salida = {};
  for (const fuente of fuentes) {
    for (const [directiva, valores] of Object.entries(fuente)) {
      salida[directiva] = [...(salida[directiva] ?? []), ...valores];
    }
  }
  return salida;
};

const componerCsp = (añadir = {}) =>
  Object.entries(CSP_BASE)
    .map(([directiva, valores]) => {
      const extra = añadir[directiva] ?? [];
      return `${directiva} ${[...valores, ...extra].join(' ')}`;
    })
    .concat(
      // Directivas que el sitio agrega y la base no tiene.
      Object.entries(añadir)
        .filter(([directiva]) => !(directiva in CSP_BASE))
        .map(([directiva, valores]) => `${directiva} ${valores.join(' ')}`),
    )
    .join('; ');

export function cloudflareHeaders({ añadir = {}, extra = '', analiticaCloudflare = true } = {}) {
  const orígenes = analiticaCloudflare ? fusionar(CSP_ANALITICA, añadir) : añadir;

  return {
    name: '@kivcode/base:headers',
    hooks: {
      'astro:build:done': async ({ dir, logger }) => {
        const { writeFile } = await import('node:fs/promises');

        const contenido = `# Generado por @kivcode/base. No editar a mano: se reescribe en cada build.
# Para sumar un origen a la CSP, pásalo a cloudflareHeaders() en astro.config.mjs.

/*
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: geolocation=(), camera=(), microphone=(), payment=()
  Strict-Transport-Security: max-age=31536000; includeSubDomains
  Content-Security-Policy: ${componerCsp(orígenes)}

# Los archivos de _astro llevan hash en el nombre: si cambia el contenido,
# cambia la URL. Se pueden cachear para siempre sin riesgo.
/_astro/*
  Cache-Control: public, max-age=31536000, immutable

/brand/*
  Cache-Control: public, max-age=604800
${extra ? `\n${extra.trim()}\n` : ''}`;

        await writeFile(new URL('_headers', dir), contenido, 'utf8');
        logger.info('_headers escrito con la CSP de la base');
      },
    },
  };
}
