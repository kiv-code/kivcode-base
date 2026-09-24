/**
 * El set mínimo que necesita cualquier sitio del estudio. Cada sitio lo extiende
 * con los de su rubro —wifi y cocina para alquiler, barco y camión para
 * logística— en vez de arrastrar un set de software que no le sirve.
 * (COSTURAS nº 5)
 *
 *   export const ICONS = { ...BASE_ICONS, barco: '…', camion: '…' };
 *   const icon = iconEnum(ICONS);
 *
 * Cada valor es el contenido de un <svg viewBox="0 0 24 24">, sin la etiqueta:
 * el componente del sitio la pone, junto con el tamaño y el color que su diseño
 * pida.
 */
export const BASE_ICONS = {
  flecha: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  tilde: '<path d="M4 12.5 9 17.5 20 6.5"/>',
  correo: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>',
  telefono:
    '<path d="M5 3h4l2 5-2.5 1.5a12 12 0 0 0 6 6L16 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 5a2 2 0 0 1 2-2Z"/>',
  whatsapp:
    '<path d="M21 11.5a8.5 8.5 0 0 1-12.6 7.4L3 21l2.1-5.4A8.5 8.5 0 1 1 21 11.5Z"/>',
  menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
  cerrar: '<path d="M6 6l12 12M18 6 6 18"/>',
  externo: '<path d="M14 5h5v5M19 5l-8 8M18 13v6H5V6h6"/>',
} as const;

export type BaseIconName = keyof typeof BASE_ICONS;
