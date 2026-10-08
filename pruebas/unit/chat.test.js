import test from 'node:test';
import assert from 'node:assert/strict';
import {
  RESPUESTAS_POR_TEMA, contextoParaIA, esUrgente, respuestaUrgente, responderLocal,
} from '../../src/js/dominio/chat.js';
import { estadoNuevo, registrarMarca } from '../../src/js/dominio/progreso.js';
import { NIVELES } from '../../src/js/datos/niveles.js';

test('Peligro inmediato: se detecta con y sin tildes', () => {
  for (const frase of ['Huele a gas en la cocina', 'huelo gas', 'Hay humo en la casa', 'Está temblando', 'SOCORRO', 'auxilio por favor']) {
    assert.equal(esUrgente(frase), true, frase);
  }
});

test('Peligro inmediato: las preguntas normales no lo activan', () => {
  for (const frase of ['¿Cómo voy?', '¿Qué hago si hay un temblor?', 'consejos para ahorrar agua', 'qué es el fuego']) {
    assert.equal(esUrgente(frase), false, frase);
  }
});

test('Protocolo de urgencia: cada peligro recibe su respuesta y todas dirigen al 123', () => {
  assert.match(respuestaUrgente('huelo gas'), /no enciendas luces/);
  assert.match(respuestaUrgente('está temblando'), /agáchate/i);
  assert.match(respuestaUrgente('hay humo'), /Prevención|123/);
  assert.match(respuestaUrgente('socorro'), /Si estás en peligro ahora/);
  // En un temblor no se llama durante el movimiento: la guía es cubrirse y salir después.
  for (const t of ['huelo gas', 'hay humo', 'socorro']) assert.match(respuestaUrgente(t), /123/);
});

test('Respuestas por tema: cada tema tiene texto y el de gas va primero (gana en empates)', () => {
  assert.ok(RESPUESTAS_POR_TEMA.length >= 8);
  assert.match(responderLocal('¿qué hago con el gas?', estadoNuevo()), /gas/i);
  assert.match(responderLocal('consejos de agua', estadoNuevo()), /llave/);
  assert.match(responderLocal('sismo', estadoNuevo()), /agáchate/i);
  assert.match(responderLocal('hola', estadoNuevo()), /El JEFE/);
});

test('Pregunta desconocida: sugiere qué preguntar', () => {
  assert.match(responderLocal('asdf qwerty', estadoNuevo()), /Aún no sé responder/);
});

test('«Siguiente reto» apunta al nivel con menos jugadas y cuenta los hábitos que faltan', () => {
  const s = estadoNuevo();
  assert.match(responderLocal('¿Cuál es mi siguiente reto?', s), /nivel 1 \(Agua\).*te faltan 6 hábitos para completar la jugada 1/);
  for (const id of ['a1', 'a2', 'a3', 'a4', 'a6', 'a5']) registrarMarca(s, NIVELES[0], id, true, '2026-10-07');
  assert.match(responderLocal('siguiente', s), /nivel 2 \(Energía\)/, 'Agua ya tiene una jugada: toca otro nivel');
});

test('«¿Estoy listo para el fuego?» informa los pasos de preparación', () => {
  const s = estadoNuevo();
  assert.match(responderLocal('¿Estoy listo para el fuego?', s), /Vas 0 de 3/);
  registrarMarca(s, NIVELES[3], 'f8', true, '2026-10-07');
  assert.match(responderLocal('¿Estoy listo para un incendio?', s), /Vas 1 de 3.*Te falta/);
  for (const id of ['f9', 'f10']) registrarMarca(s, NIVELES[3], id, true, '2026-10-07');
  assert.match(responderLocal('estoy listo para el fuego', s), /^Sí: ya cumpliste los 3 pasos/);
});

test('«¿Cómo voy?» resume XP, insignia, racha y jugadas', () => {
  assert.match(responderLocal('¿Cómo voy?', estadoNuevo()), /Llevas 0 XP, insignia Aspirante.*0 jugadas/);
});

test('«¿Qué insignia tengo?» dice la actual y cuánto falta para la siguiente', () => {
  const s = estadoNuevo();
  assert.match(responderLocal('¿Qué insignia tengo?', s), /Aspirante.*Para «Semilla» te faltan 60 XP, unos 6 hábitos/);
  for (const id of ['a1', 'a2', 'a3', 'a4', 'a6', 'a5']) registrarMarca(s, NIVELES[0], id, true, '2026-10-07');
  assert.match(responderLocal('mi insignia', s), /Tu insignia es Semilla.*Para «Explorador» te faltan 120 XP/);
  s.days['2026-10-01'] = Array.from({ length: 140 }, (_, i) => `x${i}`);
  assert.match(responderLocal('mi rango', s), /Leyenda.*la más alta/);
});

test('contextoParaIA: solo números (sin nickname ni texto) y un registro por nivel', () => {
  const s = estadoNuevo();
  registrarMarca(s, NIVELES[0], 'a1', true, '2026-10-07');
  const ctx = contextoParaIA(s);
  assert.equal(ctx.xp, 10);
  assert.equal(ctx.insignia, 0);
  assert.equal(ctx.niveles.length, NIVELES.length);
  assert.deepEqual(ctx.niveles[0], { j: 1, h: 1, c: 0 });
  const soloNumeros = (v) => (typeof v === 'number') || (Array.isArray(v) ? v.every(soloNumeros) : typeof v === 'object' && Object.values(v).every(soloNumeros));
  assert.ok(soloNumeros(ctx), 'el contexto no debe llevar texto');
});
