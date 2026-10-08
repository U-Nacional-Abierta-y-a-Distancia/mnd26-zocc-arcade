import test from 'node:test';
import assert from 'node:assert/strict';
import { claveDia, numeroDeDia } from '../../src/js/util/fecha.js';
import { diasTexto, escaparHtml, formatoLigero, normalizar } from '../../src/js/util/texto.js';

test('claveDia da AAAA-MM-DD en hora local y rellena con ceros', () => {
  assert.equal(claveDia(new Date(2026, 0, 5)), '2026-01-05');
  assert.equal(claveDia(new Date(2026, 11, 31, 23, 59)), '2026-12-31');
});

test('numeroDeDia permite restar fechas, también entre meses y años', () => {
  assert.equal(numeroDeDia('2026-03-01') - numeroDeDia('2026-02-28'), 1);
  assert.equal(numeroDeDia('2027-01-01') - numeroDeDia('2026-12-31'), 1);
  assert.equal(numeroDeDia('2026-10-07') - numeroDeDia('2026-10-07'), 0);
});

test('normalizar quita tildes y mayúsculas', () => {
  assert.equal(normalizar('¿Cómo VOY? Energía, ñandú'), '¿como voy? energia, nandu');
});

test('escaparHtml neutraliza etiquetas y ampersands', () => {
  assert.equal(escaparHtml('<img onerror=x> & más'), '&lt;img onerror=x&gt; &amp; más');
});

test('formatoLigero convierte **negrita**, viñetas y saltos, sin dejar pasar HTML', () => {
  assert.equal(formatoLigero('**hola**\n- uno\n* dos'), '<b>hola</b><br>• uno<br>• dos');
  const peligroso = formatoLigero('<script>alert(1)</script> **ok**');
  assert.ok(!peligroso.includes('<script'));
  assert.ok(peligroso.includes('&lt;script&gt;'));
});

test('diasTexto usa singular y plural', () => {
  assert.equal(diasTexto(1), '1 día');
  assert.equal(diasTexto(0), '0 días');
  assert.equal(diasTexto(5), '5 días');
});
