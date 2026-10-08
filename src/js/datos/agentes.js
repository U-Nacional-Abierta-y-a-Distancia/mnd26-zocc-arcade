/**
 * Personajes del juego: EL JEFE (único agente con IA), los salvadores (sus subagentes, uno por nivel)
 * y los enemigos. Los textos de los personajes no cambian la lógica: son solo datos.
 * @module datos/agentes
 */

/**
 * @typedef {Object} Personaje
 * @property {string} nombre   Nombre que ve la persona.
 * @property {string} [rol]    Descripción corta (solo agentes).
 * @property {string} [imagen] Clave de `RETRATOS` (personajes ilustrados).
 * @property {string} [sprite] Nombre en `SPRITES` (personajes en pixel art).
 */

/** Agentes: EL JEFE y los salvadores. @type {Record<string, Personaje>} */
export const AGENTES = {
  jefe: { nombre: 'EL JEFE', rol: 'Tu agente con IA', imagen: 'jefe' },
  aqua: { nombre: 'H2O Guardian', rol: 'Salvador del agua', imagen: 'agua' },
  robot: { nombre: 'Robot de energía', rol: 'Salvador de la energía', imagen: 'energia' },
  fuego: { nombre: 'Fuego Guardian', rol: 'Salvador de la prevención del fuego', imagen: 'fuego' },
  sismo: { nombre: 'Sismo', rol: 'Salvador de la preparación', imagen: 'sismo' },
};

/** Enemigos, uno por nivel. @type {Record<string, Personaje>} */
export const ENEMIGOS = {
  sequia: { nombre: 'Voraz Sequía', sprite: 'sequia' },
  derroche: { nombre: 'Derroche Vampiro', sprite: 'derroche' },
  replica: { nombre: 'Réplica', sprite: 'replica' },
  solazo: { nombre: 'Solazo', sprite: 'solazo' },
  chispa: { nombre: 'La Chispa', sprite: 'chispa' },
};
