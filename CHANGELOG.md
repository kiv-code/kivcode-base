# Cambios

Formato: qué cambió y **qué tiene que hacer cada sitio**. Si una línea dice
«a mano», es de las piezas que no pueden heredarse y hay que tocarlas en cada
repositorio.

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
- Plantillas de `.env.example` y `.dev.vars.example`.
