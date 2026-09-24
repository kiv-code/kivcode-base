/**
 * La regla que impide que un borrador se publique por accidente.
 *
 * Es poco código, pero no puede depender de que alguien la reescriba igual en
 * cada sitio: en desarrollo se ve todo para poder revisar, en el build de
 * producción solo sale lo aprobado.
 */
const PREVIEW = !import.meta.env.PROD;

/** Para colecciones con `draft`: se oculta lo marcado como borrador. */
export const esVisible = (data: { draft?: boolean }): boolean => PREVIEW || !data.draft;

/** Para colecciones con `published`: solo sale lo encendido a propósito. */
export const estaPublicado = (data: { published?: boolean }): boolean =>
  PREVIEW || Boolean(data.published);

/** Orden explícito: menor número, más arriba. */
export const porOrden = <T extends { data: { order: number } }>(a: T, b: T): number =>
  a.data.order - b.data.order;

/** Más reciente primero. */
export const porAño = <T extends { data: { year: number } }>(a: T, b: T): number =>
  b.data.year - a.data.year;
