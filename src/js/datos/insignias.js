/**
 * Escalera de insignias, como las de los exploradores. La insignia se gana con la experiencia (XP) acumulada:
 * cada hábito marcado suma XP, así que cumplir y REPETIR hábitos (jugada tras jugada, día tras día) sube de
 * insignia. Una jugada completa son 60 XP.
 *
 * Es lo que se muestra al terminar un reto, en la cabecera, en el ranking personal y en el de la familia.
 * @module datos/insignias
 */

/**
 * @typedef {Object} Insignia
 * @property {string} nombre   Nombre visible.
 * @property {number} xp       XP necesaria para obtenerla.
 * @property {string} lema     Frase que dice qué significa tenerla.
 * @property {string} metal    Acabado de la insignia (clase CSS: gris, bronce, plata, oro, cian, leyenda).
 * @property {string} simbolo  Clave de `SIMBOLOS`.
 */

/** @type {Insignia[]} Ordenadas de menor a mayor XP. */
export const INSIGNIAS = [
  { nombre: 'Aspirante', xp: 0, lema: 'Todo viaje empieza con un paso.', metal: 'gris', simbolo: 'punto' },
  { nombre: 'Semilla', xp: 60, lema: 'Completaste tu primera jugada: algo empezó a crecer.', metal: 'bronce', simbolo: 'brote' },
  { nombre: 'Explorador', xp: 180, lema: 'Ya recorriste tres jugadas: conoces el camino.', metal: 'plata', simbolo: 'brujula' },
  { nombre: 'Guardián', xp: 400, lema: 'Tus hábitos ya son costumbre en casa.', metal: 'oro', simbolo: 'escudo' },
  { nombre: 'Centinela', xp: 750, lema: 'Repites y vigilas: tu familia está más preparada.', metal: 'cian', simbolo: 'ojo' },
  { nombre: 'Leyenda', xp: 1300, lema: 'Constancia ejemplar: otros aprenden de ti.', metal: 'leyenda', simbolo: 'estrella' },
];

/** Dibujos de las insignias: contenido SVG en una cuadrícula de 24 × 24, que se pinta con el color del metal. */
export const SIMBOLOS = {
  punto: '<circle cx="12" cy="12" r="4.5" fill="none" stroke="currentColor" stroke-width="2.5"/>',
  brote: '<path d="M12 21v-8" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/><path d="M12 13c0-4 3-6.5 8-6.5 0 4-3 6.5-8 6.5zM12 16c0-3-2-5.5-7-5.5 0 3 2 5.5 7 5.5z"/>',
  brujula: '<circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="2"/><path d="M16 8l-2.2 5.8L8 16l2.2-5.8z"/>',
  escudo: '<path d="M12 2.5l8 3v6c0 5-3.4 8.6-8 10.5-4.6-1.9-8-5.5-8-10.5v-6z"/>',
  ojo: '<path d="M2 12s3.8-7 10-7 10 7 10 7-3.8 7-10 7S2 12 2 12z" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="12" r="3.2"/>',
  estrella: '<path d="M12 2.5l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4l-5.9 3.1 1.2-6.5L2.5 9.4l6.6-.9z"/>',
};
