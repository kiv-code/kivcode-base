interface FormConfig {
  /** Motivos aceptados: valor → etiqueta legible. */
  subjects: Record<string, string>;
  /** Campos propios de este formulario, anexados al correo. */
  extraFields?: { name: string; label: string; max?: number; required?: boolean }[];
  /** Encabezado del asunto. Por defecto «Consulta». */
  subjectPrefix?: string;
  /** Mensaje de éxito que ve el visitante. */
  successMessage?: string;
  /** Debe coincidir con el `action` del widget de Turnstile. */
  turnstileAction?: string;
}

interface WorkerConfig extends Partial<FormConfig> {
  site: { name: string; email: string };
  /** Varios formularios, por ruta. Sin esto se atiende solo /api/contact. */
  forms?: Record<string, Partial<FormConfig>>;
}

export function createContactHandler(
  config: FormConfig & { site: { name: string; email: string } },
): (request: Request, env: Record<string, any>, send?: typeof fetch) => Promise<Response>;

export function createWorker(config: WorkerConfig): {
  fetch(request: Request, env: Record<string, any>): Promise<Response>;
};
