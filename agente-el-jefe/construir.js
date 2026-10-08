/**
 * Genera, a partir de UNA sola fuente de verdad, todo lo que usa EL JEFE:
 *
 *   instrucciones.md ──┬─▶ declarativeAgent_0.json   (agente de Microsoft 365 Copilot)
 *                      │
 *   reglas-chat-web.md ┴─▶ ../servidor-jefe/prompt-jefe.md   (chat de la página: instrucciones + reglas del chat web)
 *
 * Para cambiar lo que sabe o cómo responde EL JEFE: edita `instrucciones.md` (o `reglas-chat-web.md` si solo
 * aplica al chat de la página) y ejecuta `npm run agente`. No edites los archivos generados a mano.
 *
 * Del `declarativeAgent_0.json` existente se conservan `id`, `version`, `actions`, `conversation_starters` y
 * `capabilities` (para que Copilot lo reconozca como el MISMO agente y lo actualice). Solo cambian las instrucciones.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const aqui = path.dirname(fileURLToPath(import.meta.url));
const ruta = (...partes) => path.join(aqui, ...partes);

/** Copilot rechaza instrucciones de más de 8.000 caracteres; se deja margen para no quedar justo. */
const LIMITE_INSTRUCCIONES = 8000;
const MARGEN = 300;
const LIMITE_DESCRIPCION_CORTA = 80;
const LIMITE_DESCRIPCION_LARGA = 4000;

const instrucciones = fs.readFileSync(ruta('instrucciones.md'), 'utf8').trim();
const reglasChatWeb = fs.readFileSync(ruta('reglas-chat-web.md'), 'utf8').trim();

console.log(`instrucciones: ${instrucciones.length} de ${LIMITE_INSTRUCCIONES} caracteres`);
if (instrucciones.length > LIMITE_INSTRUCCIONES - MARGEN) {
  throw new Error(`Las instrucciones superan ${LIMITE_INSTRUCCIONES - MARGEN} caracteres: Copilot las cortaría. Resúmelas.`);
}

/* ---- Agente declarativo de Copilot ---- */
const archivoAgente = ruta('declarativeAgent_0.json');
const agente = JSON.parse(fs.readFileSync(archivoAgente, 'utf8'));
agente.instructions = instrucciones;
fs.writeFileSync(archivoAgente, JSON.stringify(agente, null, 2) + '\n', 'utf8');

/* ---- Manifiesto: se comprueban los límites de las descripciones ---- */
const manifiesto = JSON.parse(fs.readFileSync(ruta('manifest.json'), 'utf8'));
const { short: corta, full: larga } = manifiesto.description;
if (corta.length > LIMITE_DESCRIPCION_CORTA) throw new Error(`Descripción corta de ${corta.length} caracteres (máximo ${LIMITE_DESCRIPCION_CORTA}).`);
if (larga.length > LIMITE_DESCRIPCION_LARGA) throw new Error(`Descripción larga de ${larga.length} caracteres (máximo ${LIMITE_DESCRIPCION_LARGA}).`);

/* ---- Prompt del chat de la página ---- */
const archivoPrompt = path.resolve(aqui, '../servidor-jefe/prompt-jefe.md');
fs.writeFileSync(archivoPrompt, `${instrucciones}\n\n${reglasChatWeb}\n`, 'utf8');

console.log('listo: declarativeAgent_0.json y servidor-jefe/prompt-jefe.md actualizados');
console.log('para el paquete de Copilot, vuelve a comprimir: declarativeAgent_0.json, manifest.json, color.png y outline.png');
