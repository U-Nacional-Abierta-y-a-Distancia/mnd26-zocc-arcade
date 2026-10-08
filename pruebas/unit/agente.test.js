/**
 * El agente EL JEFE tiene una sola fuente (`agente-el-jefe/instrucciones.md`). Estas pruebas avisan si alguno de
 * los archivos generados quedó desactualizado: la solución es ejecutar `npm run agente`.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const leer = (...p) => fs.readFileSync(path.join(RAIZ, ...p), 'utf8');

const instrucciones = leer('agente-el-jefe', 'instrucciones.md').trim();
const reglas = leer('agente-el-jefe', 'reglas-chat-web.md').trim();

test('Las instrucciones caben en el límite de Copilot (8.000) con margen', () => {
  assert.ok(instrucciones.length <= 7700, `${instrucciones.length} caracteres`);
});

test('El agente de Copilot usa las instrucciones vigentes', () => {
  const agente = JSON.parse(leer('agente-el-jefe', 'declarativeAgent_0.json'));
  assert.equal(agente.instructions, instrucciones, 'ejecuta `npm run agente`');
  assert.equal(agente.name, 'EL JEFE');
});

test('El prompt del servidor = instrucciones + reglas del chat web', () => {
  assert.equal(leer('servidor-jefe', 'prompt-jefe.md').trim(), `${instrucciones}\n\n${reglas}`, 'ejecuta `npm run agente`');
});

test('Las instrucciones conservan el protocolo de emergencias y no prometen un APK', () => {
  assert.match(instrucciones, /Seguridad primero/);
  assert.match(instrucciones, /\*\*123\*\*/);
  assert.match(instrucciones, /APK[^.]*propuesta visual/);
  assert.doesNotMatch(instrucciones, /en preparación/);
});

test('El manifiesto respeta los límites de descripción', () => {
  const { description } = JSON.parse(leer('agente-el-jefe', 'manifest.json'));
  assert.ok(description.short.length <= 80);
  assert.ok(description.full.length <= 4000);
});
