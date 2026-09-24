/**
 * Los trazos genéricos que necesita cualquier sitio del estudio, normalizados a
 * un viewBox de 24×24. Cada icono es un array de atributos `d`: así el
 * componente del sitio decide el grosor, el color y el tamaño, que son diseño.
 *
 * Cada sitio extiende este set con los de su rubro —wifi y cocina para
 * alquiler, barco y camión para logística— en vez de arrastrar iconos de
 * software que no le sirven (COSTURAS nº 5):
 *
 *   export const STROKE = { ...BASE_STROKE, barco: ['…'] } as const;
 *   const icon = iconEnum(STROKE);   // el enum se deriva, no se escribe aparte
 */
export const BASE_STROKE = {
  arrow: ['M6 18L18 6M18 6H9.5M18 6v8.5'],
  chevron: ['M9.5 5.5 16 12l-6.5 6.5'],
  chevronDown: ['M6 9.5 12 15.5 18 9.5'],
  plus: ['M12 5v14M5 12h14'],
  minus: ['M5 12h14'],
  check: ['M5 12.5 10 17.5 19 7.5'],
  menu: ['M4 8.5h16M4 15.5h16'],
  close: ['M6 6l12 12M18 6L6 18'],
  mail: [
    'M4.5 5.5h15A1.5 1.5 0 0 1 21 7v10a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 17V7a1.5 1.5 0 0 1 1.5-1.5Z',
    'm3.5 7.5 8.5 6 8.5-6',
  ],
  clock: ['M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Z', 'M12 7v5.2l3.4 2'],
} as const satisfies Record<string, readonly string[]>;

export type BaseIconName = keyof typeof BASE_STROKE;

/**
 * WhatsApp va aparte porque se dibuja relleno y no con trazo. Está en la base
 * porque todos los sitios del estudio lo usan.
 */
export const WHATSAPP_PATH =
  'M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38a9.9 9.9 0 0 0 4.79 1.22c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2Zm0 18.13a8.2 8.2 0 0 1-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.22 8.22 0 0 1-1.26-4.36c0-4.54 3.7-8.23 8.25-8.23 2.2 0 4.27.86 5.83 2.41a8.19 8.19 0 0 1 2.41 5.83c0 4.54-3.7 8.21-8.24 8.21Zm4.52-6.16c-.25-.12-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.13-.16.25-.64.81-.79.98-.14.16-.29.19-.54.06-.25-.12-1.05-.39-1.99-1.23-.74-.66-1.23-1.47-1.38-1.72-.14-.25-.02-.38.11-.51.11-.11.25-.29.37-.43.12-.14.16-.25.25-.41.08-.16.04-.31-.02-.43-.06-.12-.56-1.34-.76-1.84-.2-.48-.41-.42-.56-.43h-.48c-.16 0-.43.06-.65.31-.23.25-.85.83-.85 2.03s.87 2.35.99 2.51c.12.16 1.71 2.61 4.14 3.66.58.25 1.03.4 1.38.51.58.18 1.11.16 1.53.1.47-.07 1.47-.6 1.67-1.18.21-.58.21-1.07.14-1.18-.06-.11-.22-.18-.47-.3Z';
