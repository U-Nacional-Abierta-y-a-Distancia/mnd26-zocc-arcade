/**
 * Datos de las insignias: que cada una tenga con qué dibujarse (símbolo y estilo) y que la escalera sea
 * coherente con las reglas de XP.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { INSIGNIAS, SIMBOLOS } from '../../src/js/datos/insignias.js';
import { estadisticasDe } from '../../src/js/dominio/familia.js';

const SRC = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../src');
const css = fs.readFileSync(path.join(SRC, 'css/09-insignias.css'), 'utf8');

test('Cada insignia tiene nombre, lema, símbolo existente y un metal con estilo definido', () => {
  for (const ins of INSIGNIAS) {
    assert.ok(ins.nombre && ins.lema, ins.nombre);
    assert.ok(SIMBOLOS[ins.simbolo], `símbolo «${ins.simbolo}» de ${ins.nombre}`);
    assert.match(css, new RegExp(`\\.ins-${ins.metal}\\{`), `falta .ins-${ins.metal} en 09-insignias.css`);
  }
});

test('Los símbolos son SVG simples (sin scripts ni atributos de evento)', () => {
  for (const [clave, svg] of Object.entries(SIMBOLOS)) {
    assert.doesNotMatch(svg, /<script|\son\w+=/i, clave);
  }
});

test('El ranking familiar informa la insignia de cada integrante según su XP', () => {
  const fila = (xp) => estadisticasDe('Ana', { days: { '2026-10-06': Array.from({ length: xp / 10 }, (_, i) => `h${i}`) }, kit: [], fam: 3 }, '2026-10-07', new Date(2026, 9, 7));
  assert.equal(fila(10).insignia, 'Aspirante');
  assert.equal(fila(60).insignia, 'Semilla');
  assert.equal(fila(400).insignia, 'Guardián');
});
