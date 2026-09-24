import type { AstroUserConfig } from 'astro';
import type { HeadersOptions } from './headers.mjs';

export function baseConfig(
  options?: AstroUserConfig & { headers?: HeadersOptions },
): AstroUserConfig;
