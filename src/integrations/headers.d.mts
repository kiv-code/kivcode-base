import type { AstroIntegration } from 'astro';

export interface HeadersOptions {
  /** Orígenes que este sitio suma a la CSP, por directiva. */
  añadir?: Record<string, string[]>;
  /** Reglas extra al final del archivo, tal cual. */
  extra?: string;
}

export function cloudflareHeaders(options?: HeadersOptions): AstroIntegration;
