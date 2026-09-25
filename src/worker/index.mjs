/**
 * El Worker de contacto: validación, honeypot, tope de cuerpo, límite por IP,
 * Turnstile y Resend.
 *
 * No importa la configuración del sitio: la RECIBE. Así el mismo Worker sirve a
 * todos los proyectos y ningún sitio tiene el nombre de la marca, el correo ni
 * el catálogo de opciones escritos acá adentro.
 *
 *   // worker/index.mjs del sitio
 *   import { createWorker } from '@kivcode/base/worker';
 *   import { SITE, SUBJECTS } from '../src/config/site.ts';
 *   export default createWorker({ site: SITE, subjects: SUBJECTS });
 */

const MAX_BODY_BYTES = 24_000;

const UNAVAILABLE =
  'El formulario no está disponible en este momento. Tu mensaje sigue aquí; puedes escribirnos por WhatsApp o correo.';

const json = (status, message, extra = {}) =>
  Response.json(
    { ok: status === 200, message },
    {
      status,
      headers: { 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff', ...extra },
    },
  );

/** Lee el cuerpo con tope duro de tamaño, sin cargarlo entero a ciegas. */
async function readForm(request) {
  if (Number(request.headers.get('content-length')) > MAX_BODY_BYTES) throw new RangeError('body');

  const reader = request.body?.getReader();
  if (!reader) throw new Error('body');

  const chunks = [];
  let size = 0;
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > MAX_BODY_BYTES) {
        await reader.cancel();
        throw new RangeError('body');
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }

  return new Response(new Blob(chunks), {
    headers: { 'Content-Type': request.headers.get('content-type') },
  }).formData();
}

/**
 * @param {object} config
 * @param {{ name: string, email: string }} config.site
 * @param {Record<string, string>} config.subjects  valor → etiqueta legible
 * @param {string} [config.turnstileAction]  debe coincidir con el `action` del widget
 * @param {{name: string, label: string, max?: number, required?: boolean}[]} [config.extraFields]
 *        Campos propios del formulario, que se anexan al correo. Existen porque
 *        no todos los formularios son «contacto»: un libro de reclamaciones
 *        pide DNI, tipo de solicitud y pedido del consumidor, y sin esto habría
 *        que escribir un Worker aparte por cada uno.
 * @param {string} [config.subjectPrefix]  encabezado del asunto. Por defecto «Consulta».
 * @param {string} [config.successMessage]
 */
export function createContactHandler({
  site,
  subjects,
  turnstileAction = 'contact',
  extraFields = [],
  subjectPrefix = 'Consulta',
  successMessage = 'Consulta recibida. Te respondemos en menos de 24 horas.',
}) {
  return async function handleContact(request, env, send = fetch) {
    if (request.method !== 'POST') {
      return json(405, 'Utiliza el formulario para enviar tu consulta.', { Allow: 'POST' });
    }

    const url = new URL(request.url);

    // Same-origin obligatorio: corta el envío desde otros sitios.
    if (request.headers.get('origin') !== url.origin) {
      return json(403, 'Recarga la página e inténtalo de nuevo.');
    }

    const contentType = request.headers.get('content-type') || '';
    if (!/^(multipart\/form-data|application\/x-www-form-urlencoded)(;|$)/i.test(contentType)) {
      return json(415, 'Formato de consulta no válido.');
    }

    let form;
    try {
      form = await readForm(request);
    } catch (error) {
      return json(
        error instanceof RangeError ? 413 : 400,
        'No pudimos leer tu consulta. Revisa la extensión del mensaje e inténtalo de nuevo.',
      );
    }

    const get = (name) => (typeof form.get(name) === 'string' ? form.get(name).trim() : '');

    // Honeypot: un bot rellena todo lo que encuentra.
    if (get('website')) return json(400, 'No pudimos validar tu consulta.');

    const name = get('name');
    const email = get('email');
    const company = get('company');
    const phone = get('phone');
    const service = get('service');
    const message = get('message');
    const token = get('cf-turnstile-response');

    // Campos propios de este formulario. Se validan con el mismo criterio que
    // los de la base: existir si son obligatorios y no pasarse de largo.
    const extras = extraFields.map((campo) => ({
      ...campo,
      valor: get(campo.name),
    }));

    const extraInvalido = extras.some(
      (campo) =>
        (campo.required && !campo.valor) || campo.valor.length > (campo.max ?? 200),
    );

    if (
      extraInvalido ||
      name.length < 2 ||
      name.length > 100 ||
      /[\r\n]/.test(name) ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
      email.length > 254 ||
      company.length > 150 ||
      phone.length > 30 ||
      !Object.hasOwn(subjects, service) ||
      message.length < 20 ||
      message.length > 5000 ||
      get('consent') !== 'on'
    ) {
      return json(
        400,
        'Revisa tus datos: nombre, correo válido, motivo, un mensaje de al menos 20 caracteres y la aceptación de privacidad.',
      );
    }

    if (
      !env.RESEND_API_KEY ||
      !env.CONTACT_FROM_EMAIL ||
      !env.TURNSTILE_SECRET_KEY ||
      !env.CONTACT_RATE_LIMITER
    ) {
      return json(503, UNAVAILABLE);
    }

    // Los tokens de Turnstile son de un solo uso y máximo 2048 caracteres.
    if (!token || token.length > 2048) {
      return json(400, 'Completa la verificación antispam e inténtalo de nuevo.');
    }

    try {
      const ip = request.headers.get('cf-connecting-ip') || 'local';

      const limit = await env.CONTACT_RATE_LIMITER.limit({ key: `contact:${ip}` });
      if (!limit.success) {
        return json(
          429,
          'Has enviado varias consultas seguidas. Espera un minuto antes de intentarlo de nuevo.',
          { 'Retry-After': '60' },
        );
      }

      const verification = await send(
        'https://challenges.cloudflare.com/turnstile/v0/siteverify',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            secret: env.TURNSTILE_SECRET_KEY,
            response: token,
            ...(ip !== 'local' ? { remoteip: ip } : {}),
          }),
          signal: AbortSignal.timeout(7000),
        },
      );

      if (!verification.ok) {
        return json(502, 'La verificación antispam no respondió. Inténtalo de nuevo en unos momentos.');
      }

      const challenge = await verification.json();

      // No basta con `success`: sin comprobar hostname y action, cualquiera
      // resuelve un widget en otro dominio y reusa el token contra el tuyo.
      if (
        !challenge.success ||
        challenge.hostname !== url.hostname ||
        challenge.action !== turnstileAction
      ) {
        return json(400, 'La verificación antispam venció o no es válida. Complétala de nuevo.');
      }

      const result = await send('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${env.RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: env.CONTACT_FROM_EMAIL,
          to: [site.email],
          reply_to: email,
          subject: `${subjectPrefix} ${site.name} · ${subjects[service]}`,
          text: [
            `Nombre: ${name}`,
            `Correo: ${email}`,
            `Empresa: ${company || 'No indicada'}`,
            `Teléfono: ${phone || 'No indicado'}`,
            `Motivo: ${subjects[service]}`,
            ...extras.map((campo) => `${campo.label}: ${campo.valor || 'No indicado'}`),
            '',
            message,
            '',
            'El remitente aceptó el uso de sus datos para responder esta consulta.',
          ].join('\n'),
        }),
        signal: AbortSignal.timeout(10000),
      });

      if (!result.ok) return json(502, UNAVAILABLE);

      // Solo confirmamos cuando Resend devuelve un id: aceptación real, no optimismo.
      const receipt = await result.json();
      if (typeof receipt.id !== 'string' || !receipt.id) return json(502, UNAVAILABLE);

      return json(200, successMessage);
    } catch {
      return json(502, UNAVAILABLE);
    }
  };
}

/**
 * El Worker completo: atiende sus formularios y delega todo lo demás al CDN.
 *
 * Un sitio con un solo formulario pasa `subjects` y listo. Uno con varios
 * —contacto y libro de reclamaciones, por ejemplo— los declara en `forms`:
 *
 *   createWorker({
 *     site: SITE,
 *     forms: {
 *       '/api/contact': { subjects: SUBJECTS },
 *       '/api/reclamaciones': { subjects: SERVICIOS, extraFields: [...] },
 *     },
 *   });
 */
export function createWorker({ forms, ...config }) {
  const declarados = forms ?? { '/api/contact': {} };

  const handlers = Object.entries(declarados).map(([ruta, propio]) => [
    ruta.replace(/\/$/, ''),
    createContactHandler({ ...config, ...propio }),
  ]);

  return {
    async fetch(request, env) {
      const path = new URL(request.url).pathname.replace(/\/$/, '') || '/';

      for (const [ruta, handler] of handlers) {
        if (path === ruta) return handler(request, env);
      }

      if (path.startsWith('/api/')) return json(404, 'Ruta no encontrada.');
      return env.ASSETS.fetch(request);
    },
  };
}
