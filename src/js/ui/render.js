/**
 * Redibujo general. Después de cualquier cambio de estado se llama a `renderTodo()`, que repinta cada sección
 * a partir del estado (patrón «el estado manda»: las secciones no guardan datos propios).
 * @module ui/render
 */
import { renderMochila } from './mochila.js';
import { renderChip, renderRanking } from './ranking.js';
import { renderRetos } from './retos.js';

/** Repinta Retos, Mochila, Ranking y el indicador de insignia de la cabecera. */
export function renderTodo() {
  renderRetos();
  renderMochila();
  renderRanking();
  renderChip();
}
