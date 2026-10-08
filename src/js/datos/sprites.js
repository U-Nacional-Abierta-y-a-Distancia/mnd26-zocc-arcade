/**
 * Sprites en pixel art. Cada sprite se dibuja con su MITAD IZQUIERDA (10 columnas por fila) y el
 * dibujo la espeja para obtener la imagen completa. Cada carácter es un píxel de la paleta; '.' es transparente.
 * @module datos/sprites
 */

/** Paleta: carácter → color. (c cian, w blanco, k verde oscuro, s gris, d gris oscuro, o naranja, y amarillo, g verde profundo). */
export const PALETA = { c: '#99FFFF', w: '#FFFFFF', k: '#2c6f74', s: '#9B9F9F', d: '#2a2f30', o: '#FF8A3D', y: '#FFD36B', g: '#1b3a3c' };

/** Ancho de la mitad izquierda de cada sprite, en píxeles. */
export const ANCHO_MITAD = 10;

/** @type {Record<string, string[]>} */
export const SPRITES = {
  /* enemigo: sol con cara que aprieta al mediodía */
  solazo: [
    '.........y',
    '.o...o...y',
    '..o..o..o.',
    '....oooooo',
    '..ooyyyyyy',
    '.ooyyyyyyy',
    '.oyyyddyyy',
    'ooyyyddyyy',
    '.oyyyyyyyy',
    '.oyydddddd',
    '..oyyyyyyy',
    '..ooyyyyyy',
    '....oooooo',
    '..o..o..o.',
  ],
  /* enemigo: llama con cara que vive de descuidos */
  chispa: [
    '.........y',
    '.........o',
    '........oo',
    '.......ooo',
    '......oooy',
    '.....ooyyy',
    '....oooyyy',
    '...ooyddyy',
    '...ooyddyy',
    '..oooyyyyy',
    '..oooyyddd',
    '..oooyyyyy',
    '...ooooyyy',
    '....ooooyy',
    '.....ooooo',
  ],
  /* enemigo: calavera de tierra agrietada */
  sequia: [
    '...ssssss.',
    '..ssssdsss',
    '.sssosssss',
    '.sdddsssdo',
    '.sdoyssdss',
    '.sdooyssss',
    '.ssdddsssd',
    '..ssssdddd',
    '..sssssdss',
    '..ssdddddd',
    '..sdwdwdwd',
    '..sdwdwdwd',
    '...sddddd.',
    '....ssssss',
    '.....s.s..',
  ],
  /* enemigo: vampiro de plug que chupa energía */
  derroche: [
    '...yy.....',
    '...yy.....',
    '..ssssssss',
    '.sssssssss',
    'sssoosssss',
    'sssoysssss',
    'ssssssssss',
    'sssddddddd',
    'sswdddddwd',
    '.ssdwddddd',
    '.ssssssss.',
    '.s.ss.ss.s',
  ],
  /* enemigo: bloque de roca quebrada con grieta */
  replica: [
    '.......ddd',
    '.....ddsss',
    '....dsssso',
    '...dsssdoy',
    '..dsssdoos',
    '..dsydooss',
    '.dsyydosss',
    '.dssssdoss',
    '.dsssdooss',
    '.dssddosss',
    '.dsssdoyss',
    '.dsssssdoo',
    '.dddddddss',
  ],
  /* icono de la mochila de emergencia */
  mochila: [
    '.....ccccc',
    '....c.....',
    '..cccccccc',
    '.cwwwwwwww',
    '.cwwwwwwww',
    '.cwwwwwwww',
    '.ckkkkkkkk',
    '.cwwwwwwww',
    '.cwccccccc',
    '.cwcwwwwww',
    '.cwcwwwwww',
    '.cwcwwwwww',
    '.cwccccccc',
    '.cwwwwwwww',
    '.cwwwwwwww',
    '..cccccccc',
  ],
};
