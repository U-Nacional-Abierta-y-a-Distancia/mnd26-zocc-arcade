import test from 'node:test';
import assert from 'node:assert/strict';
import { estadisticasDe, mensajeDeApodoInvalido, ordenarFamilia } from '../../src/js/dominio/familia.js';

const HOY = '2026-10-07';
const AHORA = new Date(2026, 9, 7, 12);
/** n hábitos marcados (los ids no importan para el ranking: solo se cuentan). */
const habitos = (n) => Array.from({ length: n }, (_, i) => `h${i}`);
const miembro = (days) => ({ days, kit: [], fam: 3 });

test('Nickname: acepta letras con tilde, números, guion y guion bajo', () => {
  for (const ok of ['Ma', 'Mamá', 'Juan_10', 'Sofi-2', 'Ñandú']) assert.equal(mensajeDeApodoInvalido(ok, []), '', ok);
});

test('Nickname: rechaza vacío, muy corto, muy largo, espacios y símbolos', () => {
  for (const mal of ['', 'a', 'x'.repeat(17), 'Con espacio', 'a@b', '<b>']) {
    assert.match(mensajeDeApodoInvalido(mal, []), /Usa de 2 a 16/, JSON.stringify(mal));
  }
});

test('Nickname: no permite repetidos aunque cambien las mayúsculas', () => {
  assert.match(mensajeDeApodoInvalido('mama', ['Mama', 'Papa']), /ya está inscrito/);
  assert.equal(mensajeDeApodoInvalido('Abuela', ['Mama', 'Papa']), '');
});

test('estadisticasDe: XP, racha, hábitos de hoy y días sin marcar', () => {
  const fila = estadisticasDe('Mama', { days: { '2026-10-06': habitos(2), '2026-10-05': habitos(1) }, kit: ['k1'], fam: 3, rd: { agua: { r: 2, c: 1, done: [] }, fuego: { r: 1, c: 0, done: [] } } }, HOY, AHORA);
  assert.equal(fila.xp, 3 * 10 + 5);
  assert.equal(fila.racha, 2);
  assert.equal(fila.hoy, 0);
  assert.equal(fila.jugadas, 1);
  assert.equal(fila.diasSinMarcar, 1);
  assert.equal(fila.ultimoDia, '2026-10-06');
});

test('estadisticasDe: quien nunca marcó nada tiene diasSinMarcar = null', () => {
  const fila = estadisticasDe('Sofi', miembro({}), HOY, AHORA);
  assert.equal(fila.diasSinMarcar, null);
  assert.equal(fila.ultimoDia, null);
  assert.equal(fila.xp, 0);
});

test('Ranking familiar: orden por XP, puestos y estados (lidera / al día / ayuda)', () => {
  const filas = ordenarFamilia({
    Sofi: miembro({}),                                                      // nunca empezó
    Luis: miembro({ '2026-10-04': habitos(1) }),                            // 3 días sin marcar
    Papa: miembro({ [HOY]: habitos(4) }),                                   // 40 XP < 40 % de 120
    Juan: miembro({ '2026-10-06': habitos(10) }),                           // 100 XP, ayer
    Mama: miembro({ [HOY]: habitos(6), '2026-10-06': habitos(6) }),         // 120 XP
  }, HOY, AHORA);

  assert.deepEqual(filas.map((f) => f.apodo), ['Mama', 'Juan', 'Papa', 'Luis', 'Sofi']);
  assert.deepEqual(filas.map((f) => f.puesto), [1, 2, 3, 4, 5]);
  const estado = Object.fromEntries(filas.map((f) => [f.apodo, f.estado]));
  assert.deepEqual(estado, { Mama: 'lidera', Juan: 'aldia', Papa: 'ayuda', Luis: 'ayuda', Sofi: 'ayuda' });
  const motivo = Object.fromEntries(filas.map((f) => [f.apodo, f.motivo]));
  assert.match(motivo.Papa, /atrás/);
  assert.match(motivo.Luis, /3 días/);
  assert.match(motivo.Sofi, /no ha empezado/);
});

test('Ranking familiar: un solo integrante no «lidera» (no hay con quién compararse)', () => {
  const [unica] = ordenarFamilia({ Mama: miembro({ [HOY]: habitos(3) }) }, HOY, AHORA);
  assert.equal(unica.estado, 'aldia');
});

test('Ranking familiar: los empates en XP se resuelven por racha y luego por nombre', () => {
  const filas = ordenarFamilia({
    Zoe: miembro({ [HOY]: habitos(2) }),
    Ana: miembro({ [HOY]: habitos(2) }),
  }, HOY, AHORA);
  assert.deepEqual(filas.map((f) => f.apodo), ['Ana', 'Zoe']);
});

test('Ranking familiar: lista vacía no falla', () => {
  assert.deepEqual(ordenarFamilia({}, HOY, AHORA), []);
});
