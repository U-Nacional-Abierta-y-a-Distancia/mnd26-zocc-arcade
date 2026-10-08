import test from 'node:test';
import assert from 'node:assert/strict';
import * as A from '../../src/js/estado/almacen.js';
import { CLAVES } from '../../src/js/config.js';

/** Almacenamiento falso en memoria (misma interfaz mínima que `localStorage`). */
class Memoria {
  constructor(inicial = {}) { this.datos = new Map(Object.entries(inicial)); }
  getItem(k) { return this.datos.has(k) ? this.datos.get(k) : null; }
  setItem(k, v) { this.datos.set(k, String(v)); }
}

/** Almacenamiento que siempre falla (modo privado, bloqueado o lleno). */
const roto = { getItem() { throw new Error('bloqueado'); }, setItem() { throw new Error('lleno'); } };

const guardado = (mem) => JSON.parse(mem.getItem(CLAVES.estado));

test('Arranque sin datos: nadie ha entrado y el estado está vacío', () => {
  A.cargar(new Memoria());
  assert.equal(A.hayJugadorActivo(), false);
  assert.equal(A.apodoActivo(), 'jugador');
  assert.deepEqual(A.apodosDeLaFamilia(), []);
  assert.deepEqual(A.S.days, {});
});

test('Inscribir y activar guarda a la familia con la forma de siempre (famName, active, members)', () => {
  const mem = new Memoria();
  A.cargar(mem);
  A.inscribir('Mama');
  A.activarJugador('Mama');
  A.nombrarFamilia('Los Salazar');
  const raiz = guardado(mem);
  assert.equal(raiz.famName, 'Los Salazar');
  assert.equal(raiz.active, 'Mama');
  assert.deepEqual(Object.keys(raiz.members), ['Mama']);
  assert.ok(raiz.members.Mama.joined > 0);
});

test('Lo guardado se recupera al volver a cargar', () => {
  const mem = new Memoria();
  A.cargar(mem);
  A.inscribir('Mama'); A.inscribir('Papa');
  A.activarJugador('Papa');
  A.S.days['2026-10-07'] = ['a1'];
  A.guardar();

  A.cargar(mem);
  assert.equal(A.apodoActivo(), 'Papa');
  assert.deepEqual(A.S.days, { '2026-10-07': ['a1'] });
  assert.deepEqual(A.apodosDeLaFamilia().sort(), ['Mama', 'Papa']);
});

test('Cambiar de jugador guarda al saliente y carga al entrante', () => {
  A.cargar(new Memoria());
  A.inscribir('Mama'); A.inscribir('Papa');
  A.activarJugador('Mama');
  A.S.kit.push('k1');
  assert.equal(A.activarJugador('Papa'), true);
  assert.deepEqual(A.S.kit, []);
  A.activarJugador('Mama');
  assert.deepEqual(A.S.kit, ['k1']);
  assert.equal(A.activarJugador('Nadie'), false);
  assert.equal(A.apodoActivo(), 'Mama');
});

test('Inscribir dos veces el mismo apodo no borra su progreso', () => {
  A.cargar(new Memoria());
  A.inscribir('Mama'); A.activarJugador('Mama');
  A.S.kit.push('k1'); A.guardar();
  A.inscribir('Mama');
  assert.deepEqual(A.R.members.Mama.kit, ['k1']);
});

test('Migración: el progreso del formato antiguo pasa al primer nickname, y solo a ese', () => {
  const antiguo = { days: { '2026-10-01': ['a1', 'a2'] }, kit: ['k1'], fam: 4 };
  const mem = new Memoria({ [CLAVES.estadoAntiguo]: JSON.stringify(antiguo) });
  A.cargar(mem);
  assert.equal(A.hayJugadorActivo(), false);
  A.inscribir('Mama', { heredarAntiguo: true });
  assert.deepEqual(A.R.members.Mama.days, antiguo.days);
  assert.equal(A.R.members.Mama.fam, 4);
  assert.equal(A.R.legacy, undefined);
  A.inscribir('Papa');
  assert.deepEqual(A.R.members.Papa.days, {});
});

test('Si ya existe el formato nuevo, el antiguo se ignora', () => {
  const raiz = { famName: '', active: null, members: { Mama: { days: {}, kit: [], fam: 3 } } };
  const mem = new Memoria({ [CLAVES.estado]: JSON.stringify(raiz), [CLAVES.estadoAntiguo]: JSON.stringify({ days: { x: ['a1'] } }) });
  A.cargar(mem);
  assert.equal(A.R.legacy, undefined);
});

test('Datos corruptos o jugador activo inexistente: se arranca limpio sin fallar', () => {
  A.cargar(new Memoria({ [CLAVES.estado]: '{esto no es json' }));
  assert.deepEqual(A.apodosDeLaFamilia(), []);
  A.cargar(new Memoria({ [CLAVES.estado]: JSON.stringify({ famName: '', active: 'Fantasma', members: {} }) }));
  assert.equal(A.hayJugadorActivo(), false);
});

test('Sin almacenamiento disponible el juego sigue funcionando (no lanza)', () => {
  assert.doesNotThrow(() => {
    A.cargar(roto);
    A.inscribir('Mama');
    A.activarJugador('Mama');
    A.S.kit.push('k1');
    A.guardar();
  });
  assert.deepEqual(A.S.kit, ['k1']);
});

test('Ánimo: se deja a otro integrante y se consume una sola vez', () => {
  A.cargar(new Memoria());
  A.inscribir('Mama'); A.inscribir('Papa');
  A.enviarAnimo('Papa', 'Mama');
  A.activarJugador('Papa');
  const animo = A.consumirAnimo();
  assert.equal(animo.from, 'Mama');
  assert.equal(A.consumirAnimo(), null);
});

test('Quitar integrante y reiniciar progreso', () => {
  const mem = new Memoria();
  A.cargar(mem);
  A.inscribir('Mama'); A.inscribir('Papa');
  A.activarJugador('Mama');
  A.S.days['2026-10-07'] = ['a1'];
  A.reiniciarProgreso();
  assert.deepEqual(guardado(mem).members.Mama.days, {});
  A.quitarIntegrante('Papa');
  assert.deepEqual(Object.keys(guardado(mem).members), ['Mama']);
});
