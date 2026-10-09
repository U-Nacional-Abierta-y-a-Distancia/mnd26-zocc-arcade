/**
 * Animación de combate. Dos direcciones:
 *  - hábito BUENO: el salvador del nivel lanza una señal simbólica contra el enemigo (gotas, rayo, bruma, espuma u
 *    ondas), el enemigo recibe el golpe y, con el tercero, se desintegra;
 *  - DESCUIDO reconocido: el enemigo se agranda y lanza una ráfaga de brasas contra el salvador, que recibe el golpe
 *    y, con el tercero, cae.
 *
 * Todo se hace con la Web Animations API (`elemento.animate`) sobre elementos temporales que se eliminan solos.
 * Con «reducir movimiento» solo hay un destello breve.
 *
 * @module ui/combate
 */
import { ENEMIGOS } from '../datos/agentes.js';
import { hechosEnJugada, malosEnJugada } from '../dominio/progreso.js';
import { S } from '../estado/almacen.js';
import { $, $$, el, reducirMovimiento } from '../util/dom.js';
import { avisar, confeti } from './avisos.js';
import { sonar } from './sonido.js';

/** Tipo de señal que lanza el salvador de cada nivel. */
const SENAL_POR_NIVEL = { agua: 'gotas', energia: 'rayo', calor: 'bruma', fuego: 'espuma', sismo: 'ondas' };

/** Tiempo de «armado» del lanzamiento antes de que salga la señal (ms). */
const ARMADO_MS = 150;

/** @typedef {{x:number, y:number}} Punto */

/** Centro de un elemento, relativo a la esquina de la arena. @param {HTMLElement} nodo @param {DOMRect} base @returns {Punto} */
function centroDe(nodo, base) {
  const r = nodo.getBoundingClientRect();
  return { x: r.left + r.width / 2 - base.left, y: r.top + r.height / 2 - base.top };
}

/** Transformación CSS de traslado (y escala opcional). @param {Punto} p @param {number} [escala] @returns {string} */
const mover = (p, escala) => `translate(${p.x}px,${p.y}px)${escala != null ? ` scale(${escala})` : ''}`;

/**
 * Crea un elemento temporal, lo anima y lo elimina al terminar.
 * @param {HTMLElement} capa
 * @param {string} css Estilo del elemento.
 * @param {Keyframe[]} cuadros
 * @param {KeyframeAnimationOptions} opciones
 */
function lanzarElemento(capa, css, cuadros, opciones) {
  const nodo = el('i', 'fxp');
  nodo.style.cssText = css;
  capa.appendChild(nodo);
  const animacion = nodo.animate(cuadros, opciones);
  animacion.onfinish = animacion.oncancel = () => nodo.remove();
}

/** Igual que `lanzarElemento` pero respetando el tiempo de armado: oculto hasta su turno. */
function lanzarSenalElemento(capa, css, cuadros, opciones) {
  lanzarElemento(capa, `${css};opacity:0`, cuadros, { ...opciones, delay: (opciones.delay || 0) + ARMADO_MS, fill: 'forwards' });
}

/* ------------------------------------------------------------------ las cinco señales (devuelven ms hasta el impacto) */

/** Agua: siete gotas en arco. */
function senalGotas(capa, origen, destino, dx, dy) {
  for (let i = 0; i < 7; i += 1) {
    lanzarSenalElemento(capa,
      `width:8px;height:11px;margin:-6px 0 0 -4px;background:${i % 2 ? '#FFFFFF' : '#99FFFF'};border-radius:50% 50% 50% 50%/62% 62% 38% 38%;box-shadow:0 0 8px #99FFFF`,
      [
        { transform: mover(origen, 1), opacity: 1 },
        { transform: mover({ x: origen.x + dx * 0.5, y: origen.y + dy * 0.5 - 52 }, 1), opacity: 1, offset: 0.5 },
        { transform: mover(destino, 0.7), opacity: 0.9 },
      ],
      { duration: 520, delay: i * 55, easing: 'ease-in', fill: 'backwards' });
  }
  return 520 + 3 * 55;
}

/** Energía: un rayo en zigzag que se dibuja de a poco. */
function senalRayo(capa, origen, destino, dx, dy) {
  const pasos = 9;
  const largo = Math.sqrt(dx * dx + dy * dy) || 1;
  const px = -dy / largo; const py = dx / largo; // perpendicular al recorrido
  for (let i = 0; i <= pasos; i += 1) {
    const t = i / pasos;
    const desvio = (i === 0 || i === pasos) ? 0 : (i % 2 ? 16 : -16);
    const punto = { x: origen.x + dx * t + px * desvio, y: origen.y + dy * t + py * desvio };
    lanzarSenalElemento(capa,
      'width:11px;height:11px;margin:-5px 0 0 -5px;background:#fff;box-shadow:0 0 10px #99FFFF,0 0 20px #99FFFF',
      [{ transform: mover(punto, 1), opacity: 1 }, { transform: mover(punto, 0.4), opacity: 0 }],
      { duration: 260, delay: i * 28, fill: 'backwards' });
  }
  return pasos * 28;
}

/** Calor: bruma fresca que se expande. */
function senalBruma(capa, origen, destino) {
  for (let i = 0; i < 14; i += 1) {
    const desvio = (Math.random() - 0.5) * 46;
    lanzarSenalElemento(capa,
      'width:11px;height:11px;margin:-5px 0 0 -5px;background:rgba(210,255,255,.75);box-shadow:0 0 12px rgba(153,255,255,.7)',
      [
        { transform: mover({ x: origen.x, y: origen.y + desvio * 0.3 }, 0.5), opacity: 0.9 },
        { transform: mover({ x: destino.x, y: destino.y + desvio }, 2.2), opacity: 0 },
      ],
      { duration: 640 + Math.random() * 240, delay: i * 32, easing: 'ease-out', fill: 'backwards' });
  }
  return 560;
}

/** Fuego: espuma de extintor. */
function senalEspuma(capa, origen, destino, dx, dy) {
  for (let i = 0; i < 6; i += 1) {
    lanzarSenalElemento(capa,
      'width:15px;height:15px;margin:-7px 0 0 -7px;background:#fff;border-radius:3px;box-shadow:0 0 14px #fff',
      [
        { transform: mover(origen, 0.6), opacity: 1 },
        { transform: mover({ x: origen.x + dx * 0.55, y: origen.y + dy * 0.55 - 24 + i * 4 }, 1), opacity: 1, offset: 0.55 },
        { transform: mover({ x: destino.x + (i - 3) * 6, y: destino.y + (i % 2 ? 10 : -10) }, 2.4), opacity: 0 },
      ],
      { duration: 620, delay: i * 70, easing: 'ease-out', fill: 'backwards' });
  }
  return 620 + 2 * 70;
}

/** Sismo: tres ondas de choque. */
function senalOndas(capa, origen, destino) {
  for (let i = 0; i < 3; i += 1) {
    lanzarSenalElemento(capa,
      'width:18px;height:18px;margin:-9px 0 0 -9px;border:2px solid #99FFFF;box-shadow:0 0 10px #99FFFF',
      [{ transform: mover(origen, 1), opacity: 1 }, { transform: mover(destino, 3.4), opacity: 0.15 }],
      { duration: 520, delay: i * 130, easing: 'ease-in', fill: 'backwards' });
  }
  return 520 + 130;
}

const SENALES = { gotas: senalGotas, rayo: senalRayo, bruma: senalBruma, espuma: senalEspuma, ondas: senalOndas };

/* ------------------------------------------------------------------ impacto y derrota */

/** Chispas naranjas del enemigo, sacudida y destello. */
function impacto(capa, destino, enemigo) {
  const chispas = 10;
  for (let i = 0; i < chispas; i += 1) {
    const angulo = (i / chispas) * Math.PI * 2;
    const radio = 26 + Math.random() * 22;
    lanzarElemento(capa,
      `width:7px;height:7px;margin:-3px 0 0 -3px;background:${i % 3 ? '#FF8A3D' : '#fff'};box-shadow:0 0 8px #FF8A3D`,
      [
        { transform: mover(destino, 1), opacity: 1 },
        { transform: mover({ x: destino.x + Math.cos(angulo) * radio, y: destino.y + Math.sin(angulo) * radio }, 0.3), opacity: 0 },
      ],
      { duration: 430, easing: 'ease-out' });
  }
  enemigo.animate([
    { transform: 'translateX(0)', filter: 'brightness(1)' },
    { transform: 'translateX(-7px)', filter: 'brightness(2.6)' },
    { transform: 'translateX(6px)', filter: 'brightness(1.6)' },
    { transform: 'translateX(-3px)', filter: 'brightness(1.2)' },
    { transform: 'translateX(0)', filter: 'brightness(1)' },
  ], { duration: 340 });
}

/** El enemigo se desintegra, sale confeti y reaparece para la siguiente jugada. */
function derrotar(nivel, enemigo) {
  sonar('enemigo-cae');
  const caja = enemigo.getBoundingClientRect();
  confeti(caja.left + caja.width / 2, caja.top + caja.height / 2);
  avisar(`${ENEMIGOS[nivel.enemigo].nombre} derrotado`);
  const caida = enemigo.animate([
    { transform: 'scale(1)', opacity: 1, filter: 'brightness(1)' },
    { transform: 'scale(1.1)', opacity: 1, filter: 'brightness(3)', offset: 0.25 },
    { transform: 'scale(.15) rotate(10deg)', opacity: 0, filter: 'brightness(4)' },
  ], { duration: 760, easing: 'ease-in', fill: 'forwards' });
  caida.onfinish = () => {
    caida.cancel();
    enemigo.animate([{ opacity: 0, transform: 'scale(.6)' }, { opacity: 1, transform: 'scale(1)' }], { duration: 480 });
  };
}

/**
 * Lanza la animación de combate de un hábito marcado.
 * @param {import('../datos/niveles.js').Nivel} nivel
 * @param {{arena: HTMLElement, izquierda: HTMLElement, derecha: HTMLElement, vida: HTMLElement}} zona
 *        Elementos de la arena del nivel (los crea `ui/retos.js`).
 * @param {boolean} completa  true si este hábito completó la jugada (el enemigo cae).
 */
export function lanzarSenal(nivel, zona, completa) {
  try {
    const { arena } = zona;
    const base = arena.getBoundingClientRect();
    let capa = $('.fxl', arena);
    if (!capa) {
      capa = el('div', 'fxl');
      capa.setAttribute('aria-hidden', 'true');
      arena.appendChild(capa);
    }
    const enemigo = /** @type {HTMLElement} */ ($('.pic', zona.derecha));
    const salvador = /** @type {HTMLElement} */ ($('.pic', zona.izquierda));
    const destino = centroDe(enemigo, base);
    const origen = centroDe(salvador, base);
    origen.x += 34; origen.y -= 16; // sale de la mano del salvador, hacia el enemigo
    const dx = destino.x - origen.x; const dy = destino.y - origen.y;

    if (reducirMovimiento) {
      sonar('impacto');
      enemigo.animate([{ filter: 'brightness(2.4)' }, { filter: 'none' }], { duration: 260 });
      if (completa) avisar(`${ENEMIGOS[nivel.enemigo].nombre} derrotado`);
      return;
    }

    // El salvador se echa hacia atrás, lanza y vuelve a su sitio.
    salvador.animate([
      { transform: 'translateX(0) scale(1)', filter: 'brightness(1)' },
      { transform: 'translateX(-8px) scale(1.03)', filter: 'brightness(1.5)', offset: 0.35 },
      { transform: 'translateX(16px) scale(1.06)', filter: 'brightness(2)', offset: 0.6 },
      { transform: 'translateX(0) scale(1)', filter: 'brightness(1)' },
    ], { duration: 420, easing: 'ease-out' });

    const tipo = SENAL_POR_NIVEL[nivel.id] || 'gotas';
    sonar(`senal-${tipo}`);
    const msHastaImpacto = SENALES[tipo](capa, origen, destino, dx, dy);

    setTimeout(() => {
      try {
        impacto(capa, destino, enemigo);
        sonar('impacto');
        if (tipo === 'ondas') {
          arena.animate([
            { transform: 'translateX(0)' }, { transform: 'translateX(-3px)' }, { transform: 'translateX(3px)' },
            { transform: 'translateX(-2px)' }, { transform: 'translateX(0)' },
          ], { duration: 300 });
        }
        if (!completa) { // la barra de vida: el segmento recién apagado parpadea
          const segmento = $$('i', zona.vida)[hechosEnJugada(S, nivel) - 1];
          if (segmento) {
            segmento.classList.add('hit');
            setTimeout(() => segmento.classList.remove('hit'), 520);
          }
        } else {
          setTimeout(() => derrotar(nivel, enemigo), 150);
        }
      } catch { /* la animación es decorativa: un fallo no debe afectar al juego */ }
    }, msHastaImpacto + ARMADO_MS);
  } catch { /* idem */ }
}

/* ------------------------------------------------------------------ ataque del enemigo (descuidos) */

/** Ráfaga de brasas del enemigo hacia el salvador. Devuelve ms hasta el impacto. */
function rafagaDelEnemigo(capa, origen, destino) {
  for (let i = 0; i < 8; i += 1) {
    const desvio = (Math.random() - 0.5) * 36;
    lanzarSenalElemento(capa,
      `width:11px;height:11px;margin:-5px 0 0 -5px;background:${i % 3 ? '#FF8A3D' : '#FFD36B'};border-radius:2px;box-shadow:0 0 12px #FF8A3D`,
      [
        { transform: mover(origen, 0.6), opacity: 1 },
        { transform: mover({ x: (origen.x + destino.x) / 2, y: (origen.y + destino.y) / 2 - 30 + desvio }, 1), opacity: 1, offset: 0.5 },
        { transform: mover({ x: destino.x, y: destino.y + desvio * 0.5 }, 1.4), opacity: 0.9 },
      ],
      { duration: 520, delay: i * 50, easing: 'ease-in', fill: 'backwards' });
  }
  return 520 + 7 * 50;
}

/** El salvador recibe el golpe: chispas y destello. */
function impactoEnSalvador(capa, destino, salvador) {
  for (let i = 0; i < 10; i += 1) {
    const angulo = (i / 10) * Math.PI * 2;
    const radio = 24 + Math.random() * 22;
    lanzarElemento(capa,
      `width:7px;height:7px;margin:-3px 0 0 -3px;background:${i % 2 ? '#99FFFF' : '#fff'};box-shadow:0 0 8px #99FFFF`,
      [
        { transform: mover(destino, 1), opacity: 1 },
        { transform: mover({ x: destino.x + Math.cos(angulo) * radio, y: destino.y + Math.sin(angulo) * radio }, 0.3), opacity: 0 },
      ],
      { duration: 430, easing: 'ease-out' });
  }
  salvador.animate([
    { transform: 'translateX(0)', filter: 'brightness(1)' },
    { transform: 'translateX(8px)', filter: 'brightness(2.6) saturate(0)' },
    { transform: 'translateX(-6px)', filter: 'brightness(1.5)' },
    { transform: 'translateX(0)', filter: 'brightness(1)' },
  ], { duration: 340 });
}

/** El salvador cae (se apaga) y reaparece para reintentar la jugada. */
function caerSalvador(nivel, salvador) {
  avisar('Tu salvador cayó: repite la jugada');
  sonar('salvador-cae');
  const caida = salvador.animate([
    { transform: 'scale(1)', opacity: 1, filter: 'brightness(1)' },
    { transform: 'scale(1.05) rotate(-6deg)', opacity: 1, filter: 'brightness(2.4) saturate(0)', offset: 0.3 },
    { transform: 'scale(.7) rotate(-14deg) translateY(14px)', opacity: 0.15, filter: 'grayscale(1)' },
  ], { duration: 720, easing: 'ease-in', fill: 'forwards' });
  caida.onfinish = () => {
    caida.cancel();
    salvador.animate([{ opacity: 0, transform: 'scale(.7)' }, { opacity: 1, transform: 'scale(1)' }], { duration: 480 });
  };
}

/**
 * Animación de un descuido reconocido: el enemigo se hace fuerte y ataca al salvador.
 * @param {import('../datos/niveles.js').Nivel} nivel
 * @param {{arena: HTMLElement, izquierda: HTMLElement, derecha: HTMLElement, vidaAliada: HTMLElement}} zona
 * @param {boolean} derrota  true si este descuido hizo caer al salvador.
 */
export function lanzarAtaque(nivel, zona, derrota) {
  try {
    const { arena } = zona;
    const base = arena.getBoundingClientRect();
    let capa = $('.fxl', arena);
    if (!capa) {
      capa = el('div', 'fxl');
      capa.setAttribute('aria-hidden', 'true');
      arena.appendChild(capa);
    }
    const enemigo = /** @type {HTMLElement} */ ($('.pic', zona.derecha));
    const salvador = /** @type {HTMLElement} */ ($('.pic', zona.izquierda));
    const origen = centroDe(enemigo, base);
    const destino = centroDe(salvador, base);
    origen.x -= 30; // sale de frente del enemigo

    if (reducirMovimiento) {
      sonar('golpe');
      salvador.animate([{ filter: 'brightness(2.4) saturate(0)' }, { filter: 'none' }], { duration: 260 });
      if (derrota) avisar('Tu salvador cayó: repite la jugada');
      return;
    }

    // El enemigo «crece» y embiste antes de lanzar.
    enemigo.animate([
      { transform: 'translateX(0) scale(1)', filter: 'brightness(1)' },
      { transform: 'translateX(10px) scale(1.12)', filter: 'brightness(1.6) hue-rotate(-12deg)', offset: 0.4 },
      { transform: 'translateX(-14px) scale(1.18)', filter: 'brightness(2)', offset: 0.65 },
      { transform: 'translateX(0) scale(1)', filter: 'brightness(1)' },
    ], { duration: 420, easing: 'ease-out' });

    sonar('rafaga');
    const msHastaImpacto = rafagaDelEnemigo(capa, origen, destino);
    setTimeout(() => {
      try {
        impactoEnSalvador(capa, destino, salvador);
        sonar('golpe');
        if (!derrota) { // la barra de vida del salvador: el segmento recién apagado parpadea
          const segmento = $$('i', zona.vidaAliada)[malosEnJugada(S, nivel) - 1];
          if (segmento) {
            segmento.classList.add('hit');
            setTimeout(() => segmento.classList.remove('hit'), 520);
          }
        } else {
          setTimeout(() => caerSalvador(nivel, salvador), 150);
        }
      } catch { /* decorativa */ }
    }, msHastaImpacto + ARMADO_MS);
  } catch { /* idem */ }
}
