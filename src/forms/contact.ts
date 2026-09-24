/**
 * El comportamiento del formulario de contacto. La base NO exporta un
 * componente: exporta esta función y cada sitio escribe su propio HTML.
 *
 * El formulario es la parte que más se mira de un sitio; compartir el maquetado
 * sería aceptar que todos los clientes tengan el mismo. Y los errores viven
 * acá, no en el HTML: la costura nº 11 —el token de un solo uso— hubo que
 * arreglarla tres veces, y era JavaScript.
 *
 * El HTML del sitio solo necesita tres anclajes:
 *   <form data-contact-form action="/api/contact">
 *     <p data-status role="status" tabindex="-1"></p>
 *     <button type="submit">…</button>
 *
 * El estado se comunica con `data-state` en el elemento de estado
 * (`sending` · `ok` · `error`), para que el sitio lo pinte con su propia paleta.
 */

export interface ContactFormOptions {
  /** Mientras se envía. */
  sending?: string;
  /** Si el Worker responde bien pero no manda texto. */
  success?: string;
  /** Si el Worker responde mal y no manda texto. */
  failure?: string;
  /** Si no hubo respuesta: el visitante está sin conexión o algo se cayó. */
  offline?: string;
}

const DEFAULTS: Required<ContactFormOptions> = {
  sending: 'Enviando…',
  success: 'Consulta recibida. Te respondemos pronto.',
  failure: 'No pudimos enviar tu consulta. Inténtalo de nuevo.',
  offline: 'No pudimos conectar. Revisa tu conexión o escríbenos por WhatsApp.',
};

export function attachContactForm(form: HTMLFormElement, options: ContactFormOptions = {}): void {
  const texts = { ...DEFAULTS, ...options };
  const status = form.querySelector<HTMLElement>('[data-status]');
  const button = form.querySelector<HTMLButtonElement>('button[type="submit"]');

  /**
   * El token de Turnstile es de un solo uso y el widget no se reinicia con
   * form.reset(). Sin esto, el segundo envío desde la misma página siempre muere
   * con «la verificación venció» y el visitante no entiende por qué.
   */
  const resetChallenge = () => {
    const widget = form.querySelector<HTMLElement>('.cf-turnstile');
    const { turnstile } = window as unknown as { turnstile?: { reset(el: HTMLElement): void } };
    if (widget && turnstile) turnstile.reset(widget);
  };

  const say = (message: string, state: 'sending' | 'ok' | 'error') => {
    if (!status) return;
    status.textContent = message;
    status.dataset.state = state;
    status.focus();
  };

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (button) button.disabled = true;
    say(texts.sending, 'sending');

    try {
      const response = await fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        headers: { Accept: 'application/json' },
      });
      const payload: { message?: string } = await response.json().catch(() => ({}));

      if (response.ok) {
        form.reset();
        say(payload.message ?? texts.success, 'ok');
      } else {
        say(payload.message ?? texts.failure, 'error');
      }
    } catch {
      say(texts.offline, 'error');
    } finally {
      resetChallenge();
      if (button) button.disabled = false;
    }
  });
}

/** Engancha todos los formularios de la página. Es lo que usa un sitio normal. */
export function attachContactForms(
  selector = '[data-contact-form]',
  options: ContactFormOptions = {},
): void {
  document.querySelectorAll<HTMLFormElement>(selector).forEach((form) => {
    attachContactForm(form, options);
  });
}
