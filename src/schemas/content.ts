import { z } from 'astro/zod';

/**
 * Las piezas que se repiten en los esquemas de contenido. El paquete NO define
 * colecciones: cada sitio arma las suyas con esto. kivcode tiene servicios,
 * sectores y proyectos; larcoview tiene un departamento; vexcom tiene otros
 * servicios. Un esquema común para eso sería inventar un denominador que no
 * existe.
 */

/**
 * El resumen que Google muestra debajo del título. El tope no es decorativo:
 * si el texto no entra, Google lo corta a la mitad. Vale más romper el build
 * que publicar una descripción mutilada.
 */
export const seoSummary = z.string().max(165);

/** En borrador no se publica, pero sí se ve en desarrollo. */
export const draftFlag = z.boolean().default(false);

/** Nada llega a producción por accidente: hay que encenderlo a propósito. */
export const publishedFlag = z.boolean().default(false);

/** Una pregunta frecuente, dentro de una página o en la lista de la portada. */
export const faqSchema = z.object({
  question: z.string().min(1),
  answer: z.string().min(1),
});

/**
 * El enum de iconos válidos se DERIVA del registro del sitio, no se escribe
 * aparte. Así agregar un icono es una línea, y un nombre inventado sigue
 * rompiendo el build en vez de renderizar un hueco silencioso. (COSTURAS nº 5 y nº 8)
 *
 *   const icon = iconEnum(ICONS);
 */
export const iconEnum = <T extends Record<string, unknown>>(registry: T) =>
  z.enum(
    Object.keys(registry) as [Extract<keyof T, string>, ...Extract<keyof T, string>[]],
  );
