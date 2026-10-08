import test from 'node:test';
import assert from 'node:assert/strict';
import { NIVELES, TOTAL_NIVELES } from '../../src/js/datos/niveles.js';
import { INSIGNIAS } from '../../src/js/datos/insignias.js';
import {
  estadoNuevo, habitosActivos, hechosEnDia, hechosEnJugada, indiceInsignia, jugadaDe, jugadasCompletas, loteDe,
  marcasTotales, preparacionFuego, rachaDe, registrarMarca, repararEstado, siguienteNivel, xpDe,
} from '../../src/js/dominio/progreso.js';

const nivel = (id) => NIVELES.find((n) => n.id === id);
const HOY = '2026-10-07';

/** Marca todos los hábitos activos de un nivel (6) y devuelve el resultado de la última marca. */
function completarJugada(estado, id, dia = HOY) {
  const n = nivel(id);
  let r;
  for (const h of habitosActivos(estado, n)) r = registrarMarca(estado, n, h.id, true, dia);
  return r;
}

test('Datos: 5 niveles con bancos de 18 hábitos y ids únicos', () => {
  assert.equal(TOTAL_NIVELES, 5);
  const ids = NIVELES.flatMap((n) => n.habitos.map((h) => h.id));
  for (const n of NIVELES) assert.equal(n.habitos.length, 18, n.id);
  assert.equal(new Set(ids).size, ids.length, 'ids repetidos entre niveles');
});

test('XP: 10 por hábito marcado y 5 por ítem de la mochila', () => {
  const s = estadoNuevo();
  s.days['2026-10-01'] = ['a1', 'a2'];
  s.days['2026-10-02'] = ['e1'];
  s.kit = ['k1', 'k2'];
  assert.equal(marcasTotales(s), 3);
  assert.equal(xpDe(s), 3 * 10 + 2 * 5);
});

test('Insignias: la escalera tiene 6 peldaños que empiezan en 0 XP y suben sin repetirse', () => {
  assert.equal(INSIGNIAS.length, 6);
  assert.equal(INSIGNIAS[0].xp, 0);
  INSIGNIAS.forEach((ins, i) => { if (i) assert.ok(ins.xp > INSIGNIAS[i - 1].xp, ins.nombre); });
  assert.equal(new Set(INSIGNIAS.map((i) => i.nombre)).size, 6);
});

test('Insignias: una jugada completa (60 XP) basta para la primera insignia ganada', () => {
  assert.equal(INSIGNIAS[1].xp, 6 * 10);
});

test('Insignias: el índice sube en el umbral exacto y nunca baja al acumular XP', () => {
  for (const [xp, esperado] of [[0, 0], [59, 0], [60, 1], [179, 1], [180, 2], [399, 2], [400, 3], [750, 4], [1299, 4], [1300, 5], [99999, 5]]) {
    assert.equal(indiceInsignia(xp), esperado, `${xp} XP`);
  }
});

test('Racha: cuenta días seguidos y no se pierde si hoy aún no se marcó', () => {
  const ahora = new Date(2026, 9, 7, 12);
  const dias = { '2026-10-06': ['a1'], '2026-10-05': ['a1'], '2026-10-04': ['a1'] };
  assert.equal(rachaDe(dias, ahora), 3, 'hoy sin marcar: sigue la de ayer');
  assert.equal(rachaDe({ ...dias, '2026-10-07': ['a1'] }, ahora), 4, 'hoy marcado suma');
  assert.equal(rachaDe({ '2026-10-04': ['a1'] }, ahora), 0, 'un hueco la reinicia');
  assert.equal(rachaDe({}, ahora), 0);
});

test('Banco: cada jugada son 6 hábitos y la 4.ª repite la 1.ª', () => {
  for (const n of NIVELES) {
    const [j1, j2, j3, j4] = [1, 2, 3, 4].map((r) => loteDe(n, r));
    assert.equal(j1.length, 6);
    assert.equal(j2.length, 6);
    assert.equal(j3.length, 6);
    assert.deepEqual(j4.map((h) => h.id), j1.map((h) => h.id), `${n.id}: la jugada 4 repite la 1`);
    assert.notDeepEqual(j2.map((h) => h.id), j1.map((h) => h.id));
  }
});

test('jugadaDe crea el registro (ronda 1) y marca lo que ya estaba hecho hoy', () => {
  const s = estadoNuevo();
  s.days[HOY] = ['a1', 'a3', 'e1'];
  const j = jugadaDe(s, nivel('agua'), HOY);
  assert.deepEqual(j, { r: 1, c: 0, done: ['a1', 'a3'] });
  assert.equal(s.rd.agua, j, 'queda guardado en el estado');
});

test('Marcar y desmarcar un hábito actualiza el día y la jugada', () => {
  const s = estadoNuevo();
  const agua = nivel('agua');
  registrarMarca(s, agua, 'a1', true, HOY);
  assert.deepEqual(s.days[HOY], ['a1']);
  assert.equal(hechosEnJugada(s, agua), 1);
  registrarMarca(s, agua, 'a1', false, HOY);
  assert.equal(s.days[HOY], undefined, 'un día vacío se elimina');
  assert.equal(hechosEnJugada(s, agua), 0);
});

test('Marcar dos veces el mismo hábito no lo duplica', () => {
  const s = estadoNuevo();
  registrarMarca(s, nivel('agua'), 'a1', true, HOY);
  registrarMarca(s, nivel('agua'), 'a1', true, HOY);
  assert.deepEqual(s.days[HOY], ['a1']);
});

test('Completar la jugada: avanza de ronda y entrega lo que hay que celebrar', () => {
  const s = estadoNuevo();
  const { completa, jugada } = completarJugada(s, 'agua');
  assert.equal(completa, true);
  assert.equal(jugada.nivel, 0);
  assert.equal(jugada.hecha, 1);
  assert.equal(jugada.siguientes.length, 6);
  assert.deepEqual(s.rd.agua, { r: 2, c: 1, done: [] });
});

test('La primera jugada completa gana la insignia Semilla; la segunda no trae insignia nueva', () => {
  const s = estadoNuevo();
  const primera = completarJugada(s, 'agua');
  assert.deepEqual([primera.jugada.insignia, primera.jugada.nueva, primera.insigniaNueva], [1, true, 1]);
  const segunda = completarJugada(s, 'agua');
  assert.deepEqual([segunda.jugada.insignia, segunda.jugada.nueva, segunda.insigniaNueva], [1, false, null]);
  const tercera = completarJugada(s, 'agua');
  assert.deepEqual([tercera.jugada.insignia, tercera.jugada.nueva], [2, true], '180 XP = Explorador');
});

test('Subir de insignia sin cerrar una jugada también se avisa (insigniaNueva) y desmarcar no la dispara', () => {
  const s = estadoNuevo();
  const resultados = [];
  for (const id of ['a1', 'a2', 'a3']) resultados.push(registrarMarca(s, nivel('agua'), id, true, HOY));
  for (const id of ['e1', 'e2', 'e3']) resultados.push(registrarMarca(s, nivel('energia'), id, true, HOY));
  assert.deepEqual(resultados.map((r) => r.insigniaNueva), [null, null, null, null, null, 1]);
  assert.ok(resultados.every((r) => !r.completa));
  assert.equal(registrarMarca(s, nivel('energia'), 'e3', false, HOY).insigniaNueva, null);
});

test('Solo el sexto hábito completa la jugada; los anteriores no traen jugada', () => {
  const s = estadoNuevo();
  const agua = nivel('agua');
  const resultados = habitosActivos(s, agua).map((h) => registrarMarca(s, agua, h.id, true, HOY));
  assert.deepEqual(resultados.map((r) => r.completa), [false, false, false, false, false, true]);
  assert.ok(resultados.slice(0, 5).every((r) => r.jugada === null));
});

test('Desmarcar un hábito de la jugada nueva no completa ni resta jugadas', () => {
  const s = estadoNuevo();
  completarJugada(s, 'agua');
  const antes = jugadasCompletas(s);
  const r = registrarMarca(s, nivel('agua'), habitosActivos(s, nivel('agua'))[0].id, false, HOY);
  assert.equal(r.completa, false);
  assert.equal(jugadasCompletas(s), antes);
});

test('Repetir el banco: tras 3 jugadas vuelven los mismos hábitos y siguen sumando XP', () => {
  const s = estadoNuevo();
  const ronda1 = habitosActivos(s, nivel('agua')).map((h) => h.id);
  for (let i = 0; i < 3; i += 1) completarJugada(s, 'agua');
  assert.deepEqual(habitosActivos(s, nivel('agua')).map((h) => h.id), ronda1, 'el banco vuelve a empezar');
  const cuarta = completarJugada(s, 'agua', '2026-10-08');
  assert.equal(cuarta.jugada.hecha, 4);
  assert.equal(jugadasCompletas(s), 4);
  assert.equal(xpDe(s), 4 * 60, 'repetir cuenta: 60 XP por jugada, también en la vuelta 2');
});

test('siguienteNivel apunta al nivel con menos jugadas (el primero si hay empate)', () => {
  const s = estadoNuevo();
  assert.equal(siguienteNivel(s), 0);
  completarJugada(s, 'agua');
  assert.equal(siguienteNivel(s), 1);
  for (const n of NIVELES.slice(1)) completarJugada(s, n.id);
  assert.equal(siguienteNivel(s), 0, 'todos con 1 jugada: gana el primero');
  completarJugada(s, 'agua');
  assert.equal(siguienteNivel(s), 1);
});

test('hechosEnDia cuenta los hábitos del banco marcados un día (sirve al ranking)', () => {
  const s = estadoNuevo();
  s.days[HOY] = ['a1', 'a7', 'e1', 'xx'];
  assert.equal(hechosEnDia(s, nivel('agua'), HOY), 2);
  assert.equal(hechosEnDia(s, nivel('energia'), HOY), 1);
  assert.equal(hechosEnDia(s, nivel('agua'), '2000-01-01'), 0);
});

test('Preparación para el fuego cuenta los pasos «Listo para la emergencia» marcados alguna vez', () => {
  const s = estadoNuevo();
  assert.equal(preparacionFuego(s), 0);
  s.days['2026-10-01'] = ['f8'];
  s.days['2026-10-02'] = ['f9', 'f1'];
  assert.equal(preparacionFuego(s), 2);
});

test('repararEstado completa campos faltantes de datos antiguos', () => {
  assert.deepEqual(repararEstado({}), { days: {}, kit: [], fam: 3 });
  const s = { days: { a: [] }, kit: ['k1'], fam: 5 };
  assert.equal(repararEstado(s), s);
  assert.equal(s.fam, 5);
});
