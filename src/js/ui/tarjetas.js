/**
 * Tarjetas de presentación de personajes: la tarjeta de EL JEFE y los «duelos» (salvador contra enemigo
 * de cada nivel). Se usan en la portada y en la sección Agentes.
 * @module ui/tarjetas
 */
import { AGENTES, ENEMIGOS } from '../datos/agentes.js';
import { RETRATOS } from '../datos/ilustraciones.js';
import { NIVELES } from '../datos/niveles.js';
import { $, el } from '../util/dom.js';
import { crearSprite } from './sprites.js';

/** Anchos (px) con que se dibujan los sprites de enemigos que ocupan más espacio. */
const ANCHO_ENEMIGO_GRANDE = 140;
const ANCHO_SPRITE = 120;
const ANCHO_SPRITE_PEQUENO = 64;

/**
 * Imagen de un personaje: retrato ilustrado o sprite en pixel art.
 * @param {'agente' | 'enemigo'} tipo
 * @param {string} id Clave en `AGENTES` o `ENEMIGOS`.
 * @param {boolean} [pequeno] Versión reducida (varios salvadores a la vez).
 * @returns {HTMLElement} Contenedor `.pic`.
 */
export function imagenDePersonaje(tipo, id, pequeno = false) {
  const contenedor = el('div', 'pic');
  const personaje = (tipo === 'agente' ? AGENTES : ENEMIGOS)[id];
  if (personaje.imagen) {
    const imagen = /** @type {HTMLImageElement} */ (el('img'));
    imagen.src = RETRATOS[personaje.imagen];
    imagen.alt = '';
    imagen.width = 150;
    imagen.height = 190;
    contenedor.appendChild(imagen);
  } else {
    const sprite = crearSprite(personaje.sprite);
    const grande = personaje.sprite === 'replica' || personaje.sprite === 'derroche';
    sprite.style.width = `${pequeno ? ANCHO_SPRITE_PEQUENO : (grande ? ANCHO_ENEMIGO_GRANDE : ANCHO_SPRITE)}px`;
    contenedor.appendChild(sprite);
  }
  return contenedor;
}

/**
 * Lado de los aliados en la arena: un salvador (nombre y rol) o un equipo de varios.
 * @param {import('../datos/niveles.js').Nivel} nivel
 * @param {'duelo' | 'retos'} contexto  En el duelo se muestra el rol del salvador; en Retos, el nombre del nivel.
 * @returns {HTMLElement} Columna `.fighter`.
 */
export function ladoDeSalvadores(nivel, contexto) {
  const varios = nivel.agentes.length > 1;
  const lado = el('div', 'fighter' + (varios && contexto === 'duelo' ? ' team-wrap' : ''));
  if (varios) {
    const equipo = el('div', 'team');
    nivel.agentes.forEach((a) => equipo.appendChild(imagenDePersonaje('agente', a, true)));
    lado.appendChild(equipo);
    lado.appendChild(el('b', null, 'Tus salvadores'));
    lado.appendChild(el('small', null, 'Salvadores de EL JEFE'));
  } else {
    const agente = AGENTES[nivel.agentes[0]];
    lado.appendChild(imagenDePersonaje('agente', nivel.agentes[0]));
    lado.appendChild(el('b', null, agente.nombre));
    lado.appendChild(el('small', null, contexto === 'duelo' ? agente.rol : nivel.nombre));
  }
  return lado;
}

/**
 * Lado del enemigo en la arena.
 * @param {import('../datos/niveles.js').Nivel} nivel
 * @returns {HTMLElement} Columna `.fighter.foe`.
 */
export function ladoDelEnemigo(nivel) {
  const lado = el('div', 'fighter foe');
  lado.appendChild(imagenDePersonaje('enemigo', nivel.enemigo));
  lado.appendChild(el('b', null, ENEMIGOS[nivel.enemigo].nombre));
  lado.appendChild(el('small', null, 'Enemigo'));
  return lado;
}

/**
 * Tarjeta de duelo de un nivel.
 * @param {import('../datos/niveles.js').Nivel} nivel
 * @param {boolean} completa  true = con la ficha detallada (sección Agentes); false = compacta (portada).
 * @returns {HTMLElement}
 */
export function tarjetaDeDuelo(nivel, completa) {
  const tarjeta = el('article', completa ? 'duel' : 'duel compact');
  const arena = el('div', 'arena');
  const vs = el('div', 'vs', 'VS');
  vs.setAttribute('aria-hidden', 'true');
  arena.append(ladoDeSalvadores(nivel, 'duelo'), vs, ladoDelEnemigo(nivel));
  tarjeta.appendChild(arena);

  const cuerpo = el('div', 'body');
  cuerpo.appendChild(el('p', null, nivel.textos.enemigo));
  const lista = el('dl');
  [['Zona', nivel.nombre], ['Cómo te apoya', nivel.textos.apoyo], ['Debilidad del enemigo', nivel.textos.debilidad], ['Por qué importa', nivel.textos.porQue]]
    .forEach(([termino, definicion]) => {
      const fila = el('div');
      fila.appendChild(el('dt', null, termino));
      fila.appendChild(el('dd', null, definicion));
      lista.appendChild(fila);
    });
  cuerpo.appendChild(lista);
  tarjeta.appendChild(cuerpo);
  return tarjeta;
}

/** Tarjeta de EL JEFE, el único agente con IA. @returns {HTMLElement} */
export function tarjetaDeElJefe() {
  const tarjeta = el('article', 'agente-card');
  tarjeta.appendChild(imagenDePersonaje('agente', 'jefe'));

  const cuerpo = el('div', 'g-body');
  cuerpo.appendChild(el('h3', null, 'EL JEFE'));
  cuerpo.appendChild(el('p', null, 'El único agente con IA del juego. Te recuerda, adapta los retos a tu casa y te explica por qué cada hábito importa. Celebra tus avances y te ayuda a retomar el ritmo si lo pierdes.'));
  cuerpo.appendChild(el('p', 'g-sub', 'Para cada reto convoca a un salvador, un subagente que enfrenta a su enemigo: <b>H2O Guardian</b> (agua y calor), <b>Robot de energía</b> (energía), <b>Fuego Guardian</b> (fuego) y <b>Sismo</b> (sismo y preparación). Son 5 niveles: Agua, Energía, Calor, Fuego y Sismo.'));
  tarjeta.appendChild(cuerpo);
  return tarjeta;
}

/** Monta las tarjetas en la portada y en la sección Agentes. Se llama una vez al arrancar. */
export function montarTarjetas() {
  NIVELES.forEach((nivel) => {
    $('#homeDuels').appendChild(tarjetaDeDuelo(nivel, false));
    $('#appDuels').appendChild(tarjetaDeDuelo(nivel, true));
  });
  $('#homeJefe').appendChild(tarjetaDeElJefe());
  $('#appJefe').appendChild(tarjetaDeElJefe());
}
