import { z } from 'astro/zod';

/**
 * Dígito verificador del RUC peruano (módulo 11). Un RUC mal tipeado rompe la
 * compilación en vez de publicarse: detecta un dígito cambiado y también dos
 * dígitos traspuestos, que es el error que nadie ve al releer.
 *
 * No se valida el prefijo (10 persona natural, 20 jurídica): existen también 15
 * y 17, y restringirlo dejaría fuera a un cliente legítimo.
 */
export const esRucValido = (ruc: string): boolean => {
  if (!/^\d{11}$/.test(ruc)) return false;
  const pesos = [5, 4, 3, 2, 7, 6, 5, 4, 3, 2];
  const suma = pesos.reduce((acc, peso, i) => acc + Number(ruc[i]) * peso, 0);
  const resto = 11 - (suma % 11);
  return Number(ruc[10]) === (resto === 10 ? 0 : resto === 11 ? 1 : resto);
};

export const rucSchema = z
  .string()
  .refine(esRucValido, 'RUC inválido: son 11 dígitos y no pasa el dígito verificador.');

/**
 * Quién responde legalmente por el sitio.
 *
 * Es una unión discriminada y no una lista de campos opcionales a propósito: con
 * todo opcional no se distingue «esto falta porque no aplica» de «esto falta
 * porque me olvidé», y la página de privacidad tendría que adivinar. Acá el
 * `type` decide qué es obligatorio, y el build reclama lo que falte.
 *
 * Las variantes son `strictObject` y no `object`: una `persona` con `legalName`
 * se aceptaría en silencio —Zod descarta lo que no conoce— y eso significa que
 * alguien creyó que era una empresa. Mejor que rompa.
 */
export const ownerSchema = z.discriminatedUnion('type', [
  /** Una landing de un profesional independiente. Con nombre y correo alcanza
   *  para identificar a quién reclamarle, que es lo que pide la Ley 29733. */
  z.strictObject({
    type: z.literal('persona'),
    name: z.string().min(1),
    /** Solo si tiene negocio. Una persona sin RUC no tiene dónde ponerlo, que
     *  es distinto de tenerlo vacío. */
    ruc: rucSchema.optional(),
  }),

  z.strictObject({
    type: z.literal('empresa'),
    /** Razón social exacta, como figura en SUNAT. */
    legalName: z.string().min(1),
    /** Nombre comercial, solo si difiere de la razón social. */
    tradeName: z.string().min(1).optional(),
    ruc: rucSchema,
    /**
     * Domicilio fiscal como una línea legible. Acá SÍ va compuesto, al revés
     * que el lugar del sitio: este texto se muestra literal en un párrafo de la
     * página de privacidad y nadie lo parsea. Descomponerlo sería ceremonia sin
     * consumidor.
     */
    fiscalAddress: z.string().min(1),
  }),
]);

/**
 * Datos de la empresa o persona. Fuente única: ningún componente escribe a mano
 * un nombre, un correo ni un teléfono.
 *
 * Ojo: la URL del sitio NO vive acá. Sale de astro.config.mjs y se lee con
 * `Astro.site`. Un solo dominio, un solo lugar.
 */
export const siteSchema = z.object({
  name: z.string().min(1),
  tagline: z.string().min(1),
  /** Es la descripción que sale en Google y al compartir. Más de 165 caracteres
   *  y la corta a la mitad. */
  description: z.string().max(165),
  email: z.email(),
  /** En el formato que lee una persona: «+51 926 062 640». Los enlaces `tel:` y
   *  `wa.me` se derivan de acá. Nunca se guarda el mismo número dos veces. */
  phone: z.string().min(1),

  /**
   * El lugar, descompuesto. Acá sí por separado: los datos estructurados de
   * schema.org piden `addressLocality` y `addressRegion` en campos distintos, y
   * componer una cadena es trivial mientras que separar una ya escrita no.
   */
  locality: z.string().min(1),
  region: z.string().min(1),
  country: z.string().length(2),
  countryName: z.string().min(1),

  lang: z.string().min(1),
  ogLocale: z.string().min(1),

  owner: ownerSchema,
});

export type Site = z.infer<typeof siteSchema>;
export type Owner = z.infer<typeof ownerSchema>;

/**
 * Catálogo de opciones del formulario. Cruza la frontera cliente/servidor: lo
 * pinta el `<select>` y lo valida el Worker. Vive en `config/` y lo importan
 * los dos lados — cuando estuvo duplicado, el Worker terminó rechazando
 * opciones que el formulario sí ofrecía. (COSTURAS nº 2)
 */
export const subjectsSchema = z.record(z.string(), z.string());
export type Subjects = z.infer<typeof subjectsSchema>;

const digits = (value: string): string => value.replace(/\D/g, '');

/** Enlace `tel:` derivado del teléfono publicado. */
export const phoneLink = (site: Site): string => `tel:+${digits(site.phone)}`;

/** Enlace de WhatsApp, con mensaje precargado opcional según el contexto del clic. */
export const whatsappLink = (site: Site, message?: string): string => {
  const base = `https://wa.me/${digits(site.phone)}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
};

/** El lugar compuesto para mostrar: «Lima, Perú». */
export const placeLabel = (site: Site): string => `${site.locality}, ${site.countryName}`;

/** El nombre con el que se presenta legalmente, según el tipo de titular. */
export const ownerLabel = (owner: Owner): string =>
  owner.type === 'empresa' ? owner.legalName : owner.name;
