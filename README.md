# @kivcode/base

La infraestructura compartida de los sitios del estudio. **Sin diseño**: la
tipografía, la paleta, las formas y el layout son de cada cliente, y por eso
acá no hay ni un componente visual.

Qué entra y qué no está decidido, archivo por archivo, en `../LIMITE.md`.

## Por qué es un paquete y no una carpeta que se copia

Porque un arreglo tiene que llegar a los sitios que ya existen. Cuando la base
se copiaba, no llegaba: la costura nº 2 —el catálogo de opciones duplicado entre
el formulario y el Worker— está arreglada en larcoview y en vexcom, y **no** en
kivcode-web, que es de donde salió la base. El arreglo viajó hacia adelante y
nunca volvió al origen.

Con un paquete eso es `pnpm update`.

## Instalar

```bash
pnpm add "@kivcode/base@github:kiv-code/kivcode-base#v1.0.0"
```

La versión va fijada a una etiqueta de git y queda anotada en el
`pnpm-lock.yaml`: **ningún sitio se actualiza solo**. Actualizar es una decisión,
y `pnpm check` es la puerta.

## Qué expone

| Import | Qué trae |
| --- | --- |
| `@kivcode/base/worker` | `createWorker({ site, subjects })` — el Worker completo |
| `@kivcode/base/schemas/site` | `siteSchema`, `ownerSchema`, `rucSchema`, `phoneLink`, `whatsappLink` |
| `@kivcode/base/schemas/content` | `seoSummary`, `faqSchema`, `draftFlag`, `publishedFlag`, `iconEnum` |
| `@kivcode/base/content` | `esVisible`, `estaPublicado`, `porOrden`, `porAño` |
| `@kivcode/base/forms` | `attachContactForms()` — el comportamiento del formulario |
| `@kivcode/base/icons` | `BASE_STROKE` y `WHATSAPP_PATH` — el set genérico, para extender |
| `@kivcode/base/styles/base.css` | `container-page` y `prose-body` |
| `@kivcode/base/astro` | `baseConfig()` — la configuración de Astro compartida |
| `@kivcode/base/integrations/headers` | Escribe `_headers` con la CSP al compilar |
| `@kivcode/base/routes/robots` | `robots.txt` con el sitemap del dominio real |
| `@kivcode/base/tsconfig` · `/prettier` | Configuración, para `extends` |
| `kivcode-check-theme` | Comando que verifica el contrato de tokens |

## Cómo lo usa un sitio

```js
// worker/index.mjs — queda en tres líneas
import { createWorker } from '@kivcode/base/worker';
import { SITE, SUBJECTS } from '../src/config/site.ts';
export default createWorker({ site: SITE, subjects: SUBJECTS });
```

```ts
// src/config/site.ts — la forma la pone la base, los valores el sitio
import { siteSchema } from '@kivcode/base/schemas/site';
export const SITE = siteSchema.parse({ name: '…', owner: { type: 'empresa', … } });
```

```js
// astro.config.mjs
import { defineConfig } from 'astro/config';
import { baseConfig } from '@kivcode/base/astro';
export default defineConfig(baseConfig({ site: SITE_URL }));
// Y public/_headers se BORRA: lo genera la base en cada build.
```

```json
// package.json
"check": "kivcode-check-theme && astro check",
"prettier": "@kivcode/base/prettier"
```

```yaml
# .github/workflows/deploy.yml — el sitio no copia el flujo, lo invoca
jobs:
  deploy:
    uses: kiv-code/kivcode-base/.github/workflows/deploy.yml@v1
    secrets: inherit
```

El flujo de CI es la única pieza que se actualiza **sola**, sin `pnpm update`.

## Lo que este paquete no puede resolver

`package.json`, `pnpm-workspace.yaml` (el parche de `sharp`), `wrangler.jsonc`,
`.mise.toml` y `.gitignore` se copian en cada sitio: no existe mecanismo de
herencia para ellos. Un arreglo ahí hay que aplicarlo a mano, y el `CHANGELOG`
lo marca cuando pasa.
