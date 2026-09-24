import type { AstroIntegration } from 'astro';

export interface HeadersOptions {
  /** Orígenes que este sitio suma a la CSP, por directiva. */
  añadir?: Record<string, string[]>;
  /** Reglas extra al final del archivo, tal cual. */
  extra?: string;
  /**
   * Permite el beacon de Cloudflare Web Analytics. Encendido por defecto: la
   * analítica es parte del negocio en todos los sitios del estudio.
   */
  analiticaCloudflare?: boolean;
}

export function cloudflareHeaders(options?: HeadersOptions): AstroIntegration;
