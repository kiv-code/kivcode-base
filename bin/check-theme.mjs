#!/usr/bin/env node
/**
 * Verifica que el `global.css` del sitio defina todos los tokens que las
 * utilidades de la base usan. Sin esto, un token que falta no da error: la
 * variable queda vacía y el texto sale sin color, solo en algunas páginas y
 * sin que nada avise.
 *
 * Vive en el paquete para que la lista se actualice con `pnpm update`. Del sitio
 * se copia únicamente la línea que lo invoca:
 *
 *   "check": "kivcode-check-theme && astro check"
 *
 * Es también la salida al problema de que npm no herede scripts: lo que no puede
 * heredarse es el nombre del comando, no lo que el comando hace.
 */
import { readFileSync } from 'node:fs';
import { argv, exit } from 'node:process';

/** Tokens que las utilidades de `@kivcode/base/styles/base.css` dan por hechos. */
const REQUERIDOS = [
  '--page-gutter',
  '--color-ink',
  '--color-muted',
  '--color-brand',
  '--font-sans',
];

const ruta = argv[2] ?? 'src/styles/global.css';

let css;
try {
  css = readFileSync(ruta, 'utf8');
} catch {
  console.error(`✗ No se encontró ${ruta}.`);
  console.error('  Si tu hoja principal está en otro lado, pásala como argumento.');
  exit(1);
}

const faltan = REQUERIDOS.filter((token) => !new RegExp(`^\\s*${token}\\s*:`, 'm').test(css));

if (faltan.length) {
  console.error(`✗ ${ruta} no define ${faltan.length} token(s) del contrato de la base:`);
  for (const token of faltan) console.error(`    ${token}`);
  console.error('\n  Van dentro del bloque @theme. Sin ellos, las utilidades de la base');
  console.error('  se renderizan sin color y nada lo avisa.');
  exit(1);
}

console.log(`✓ ${ruta} define los ${REQUERIDOS.length} tokens del contrato.`);
