# Cambios

Formato: qué cambió y **qué tiene que hacer cada sitio**. Si una línea dice
«a mano», es de las piezas que no pueden heredarse y hay que tocarlas en cada
repositorio.

## v1.5.0 — 24/09/2026

- **Varios formularios por sitio.** `createWorker({ forms })` declara una
  configuración por ruta. Salió del Libro de Reclamaciones de vexcom, que es
  obligatorio por ley en Perú y pide campos que un formulario de contacto no
  tiene.
- **`extraFields`**: campos propios que se validan y se anexan al correo. Sin
  esto habría que escribir un Worker por cada formulario, y toda la protección
  —honeypot, tope de cuerpo, límite por IP, Turnstile— se duplicaría.
- `subjectPrefix` y `successMessage` configurables por formulario.

El uso de siempre no cambia: `createWorker({ site, subjects })` sigue
atendiendo `/api/contact`.

## v1.4.0 — 24/09/2026

- **`phoneAlt` opcional**, para las empresas que publican dos líneas. Opcional y
  no obligatorio: la mayoría tiene una sola, y un campo vacío obligatorio es un
  campo muerto esperando a publicarse mal.
- `telLink(phone)` para construir el enlace de cualquier número, no solo del
  principal. `phoneLink(site)` sigue igual.

## v1.3.0 — 24/09/2026

- **Tercer titular posible: `pendiente`.** Los datos legales del cliente casi
  siempre llegan después de que el sitio está construido, y hasta ahora la
  única salida era escribir un nombre de relleno que nadie volvía a mirar.
  Ahora es un estado del esquema, con una `nota` que explica qué falta y que
  **sale publicada en la página de privacidad**: que incomode es el punto.

  Cuando llegan los datos, pasar a `empresa` o `persona` es una línea, y el
  esquema valida lo que corresponda —incluido el dígito verificador del RUC—.

## v1.2.0 — 24/09/2026

- **La CSP permite el beacon de Cloudflare Web Analytics, encendido por
  defecto.** Sin esos dos orígenes el navegador lo bloquea y el sitio anda pero
  no hay métricas: no sabés si está trayendo consultas. Viene activado porque la
  analítica es parte del negocio en todos los sitios del estudio — si hubiera que
  acordarse de encenderla, tarde o temprano un sitio saldría sin ella y nadie lo
  notaría hasta querer mirar los números.

  Se apaga por sitio con `headers: { analiticaCloudflare: false }`, para el
  cliente que pida cero terceros.

  **A mano en cada sitio ya desplegado:** ninguno. Se actualiza con `pnpm update`
  y se vuelve a desplegar.

## v1.1.2 — 24/09/2026

- **`iconEnum` perdía los tipos literales** y devolvía `string`: cualquier
  cadena pasaba como nombre de icono y se caía el único punto de la costura
  nº 8, que era que un nombre inventado rompiera el build. Ahora conserva las
  claves del registro como unión.

## v1.1.1 — 24/09/2026

Dos fallos que solo aparecen cuando un sitio real lo usa.

- **El `tsconfig` de la base ya no trae `include`.** Un `include` heredado se
  resuelve contra el archivo que lo define, o sea contra `node_modules`: el
  sitio pasaba de revisar 34 archivos a revisar 10 y `pnpm check` seguía en
  verde. Un error de tipos en una página habría pasado la puerta sin que nada
  avisara. **Cada sitio declara su propio `include` y `exclude`.**
- Declaraciones de tipos para los módulos `.mjs` (worker, integraciones), que
  salían como `any` implícito.

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
