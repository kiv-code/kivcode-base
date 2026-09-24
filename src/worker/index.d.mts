interface WorkerConfig {
  site: { name: string; email: string };
  /** Motivos del formulario: valor → etiqueta legible. */
  subjects: Record<string, string>;
  /** Debe coincidir con el `action` del widget de Turnstile. */
  turnstileAction?: string;
}

export function createContactHandler(
  config: WorkerConfig,
): (request: Request, env: Record<string, any>, send?: typeof fetch) => Promise<Response>;

export function createWorker(config: WorkerConfig): {
  fetch(request: Request, env: Record<string, any>): Promise<Response>;
};
