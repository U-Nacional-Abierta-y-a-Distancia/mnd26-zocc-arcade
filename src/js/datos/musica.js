/**
 * Música de fondo del juego: qué pista suena en cada momento. Datos puros.
 *
 * Para cambiar una pista, reemplaza el archivo de `assets/audio/musica/` conservando el nombre (o cambia el nombre aquí).
 * Para cambiar dónde suena cada una, edita `PISTA_POR_MOMENTO`.
 *
 * @module datos/musica
 */

/**
 * @typedef {Object} Pista
 * @property {string} archivo  Nombre del archivo en `assets/audio/musica/`.
 * @property {string} uso      Cuándo suena (para quien edite esto).
 */

/** @type {Record<string, Pista>} */
export const PISTAS = {
  portada: { archivo: 'portada.mp3', uso: 'Portada, mochila, agentes, familia y ranking (momentos tranquilos)' },
  retos: { archivo: 'retos.mp3', uso: 'Retos (donde se juega la carrera contra el enemigo)' },
  narrativa: { archivo: 'narrativa.mp3', uso: 'Panel narrado «¿Tu familia está lista?» (la pista más larga: sus escenas duran hasta 72 s)' },
};

/** Pista de cada vista de la aplicación; las que no estén aquí usan `PISTA_INICIAL`. */
export const PISTA_POR_VISTA = { retos: 'retos' };

/** Pista que suena si no hay una específica. */
export const PISTA_INICIAL = 'portada';

/** Pista que suena mientras el panel narrado está abierto. */
export const PISTA_DEL_PANEL = 'narrativa';

/** Carpetas donde se buscan los archivos: con servidor y con `nido.html` abierto con doble clic (queda junto a `src/`). */
export const CARPETAS_MUSICA = ['assets/audio/musica', 'src/assets/audio/musica'];

/** Volumen de la música (0 a 1): bajo, para acompañar sin tapar los efectos; y más bajo aún cuando EL JEFE habla. */
export const VOLUMEN_MUSICA = 0.2;
export const VOLUMEN_CON_VOZ = 0.06;
