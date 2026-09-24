# Cambios

Formato: qué cambió y **qué tiene que hacer cada sitio**. Si una línea dice
«a mano», es de las piezas que no pueden heredarse y hay que tocarlas en cada
repositorio.

## v1.1.0 — 24/09/2026

Ajuste salido de la primera migración, exactamente para lo que sirve versionar.

- **`BASE_ICONS` → `BASE_STROKE`, con otro formato.** Guardaba marcado SVG
  completo; los sitios guardan arrays de atributos `d`, que es mejor porque deja
  el grosor, el color y el tamaño del lado del diseño. Se adopta el formato real
  y se usan los trazos ya probados de kivcode-web.
- Se suma `WHATSAPP_PATH`: se dibuja relleno y no con trazo, y lo usan todos los
  sitios.

## v1.0.0 — 24/09/2026

Primera extracción, desde `kivcode-web`.

- Worker de contacto parametrizado: recibe `site` y `subjects` en vez de
  importarlos. Cierra la costura nº 2 por construcción — el catálogo de opciones
  ya no puede duplicarse entre el formulario y el Worker.
- Esquema de datos de la empresa con titular como unión discriminada
  (`persona` / `empresa`) y **RUC validado con dígito verificador**. Cierra la
  costura nº 7: la razón social y el RUC dejan de estar escritos a mano en la
  página de privacidad.
- Comportamiento del formulario como función, no como componente. Incluye el
  reinicio del token de Turnstile (costura nº 11).
- Filtros de borrador y publicado, y los dos ordenamientos.
- Registro de iconos genérico con el enum derivado de sus claves
  (costuras nº 5 y nº 8).
- `container-page` y `prose-body`, sin iniciales de marca (costura nº 6).
- `kivcode-check-theme`: verifica que el `@theme` del sitio defina los tokens
  que las utilidades de la base dan por hechos.
- Flujo de CI como *reusable workflow*.
- `baseConfig()` para `astro.config.mjs`: salida estática, barra final,
  sitemap, Tailwind y la regla que impide incrustar fuentes como `data:` URI.
- Integración que **genera `public/_headers`** al compilar, con la CSP como
  valor por defecto y orígenes añadibles por directiva. Verificado: produce una
  política idéntica byte a byte a la que tenía kivcode-web a mano. Al migrar,
  el sitio **borra** su `public/_headers`.
- `robots.txt` como ruta reexportable.
- Plantillas de `.env.example` y `.dev.vars.example`.

**El menú móvil NO entra**, aunque `LIMITE.md` lo había anotado. Un `<details>`
sin clases no sirve: lo compartible sería el maquetado, o sea diseño. El
conocimiento que importa ya está en la costura nº 16.
