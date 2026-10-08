/**
 * Constantes del juego. Cualquier número «mágico» que afecte a las reglas vive aquí, no repartido por el código.
 * @module config
 */

/** Hábitos que muestra cada nivel a la vez: una «jugada». */
export const HABITOS_POR_JUGADA = 6;

/** XP que suma cada hábito marcado. */
export const XP_POR_HABITO = 10;

/** XP que suma cada ítem guardado en la mochila. */
export const XP_POR_ITEM_MOCHILA = 5;

/** Personas en casa que se pueden indicar en la mochila. */
export const PERSONAS_CASA = { min: 1, max: 12, porDefecto: 3 };

/** Reglas del nickname (apodo). El patrón admite letras (con tildes y ñ), números, guion y guion bajo. */
export const APODO = {
  min: 2,
  max: 16,
  patron: /^[A-Za-z0-9_\-ÁÉÍÓÚÜÑáéíóúüñ]{2,16}$/,
};

/** Longitud máxima del nombre de la familia. */
export const NOMBRE_FAMILIA_MAX = 30;

/** Criterios para marcar a alguien como «necesita ayuda» en el ranking familiar. */
export const FAMILIA = {
  /** Días sin marcar hábitos a partir de los cuales se considera inactivo. */
  diasSinActividad: 2,
  /** Si tiene menos de esta fracción de las XP del líder, va «muy atrás». */
  fraccionRezago: 0.4,
};

/** Claves de almacenamiento del navegador. */
export const CLAVES = {
  /** Estado de la familia y de cada jugador (localStorage). */
  estado: 'ysph-v2',
  /** Formato antiguo de un solo jugador; se migra al primer nickname. */
  estadoAntiguo: 'arcade-habitos-v1',
  /** Marca de que ya se vio la presentación en esta sesión (sessionStorage). */
  presentacionVista: 'ysph-splash',
  /** Historial del chat con EL JEFE (sessionStorage). */
  chatHistorial: 'ysph-jefe-hist',
  /** Posición del personaje flotante (localStorage). */
  chatPosicion: 'ysph-jefe-pos',
};

/** Tiempos de las animaciones y de la presentación, en milisegundos. */
export const TIEMPOS = {
  /** Espera tras el último hábito, para ver caer al enemigo antes de las ventanas. */
  esperaAntesDeVentanasMs: 1900,
  /** Duración del aviso (toast). */
  avisoMs: 2200,
  /** Presentación: escena 1 (equipo y Olimpiadas). */
  presentacionEscena1Ms: 5000,
  /** Presentación: instante en que aparece cada bloque de la escena 2, contado desde su inicio. */
  presentacionBloquesMs: [2000, 3800, 5200],
  /** Presentación: «Listo» y fin, contados desde el inicio de la escena 2. */
  presentacionListoMs: 6200,
  presentacionFinMs: 7200,
};

/** Ajustes del chat de EL JEFE. */
export const CHAT = {
  /** Ruta de la API del servidor intermedio (se puede cambiar con `<meta name="jefe-api">`). */
  rutaApi: '/api/jefe',
  /** Mensajes del historial que se envían a la IA. */
  maxMensajes: 12,
  /** Caracteres máximos por pregunta. */
  maxCaracteres: 600,
  /** Pausa de «escribiendo…» antes de una respuesta predefinida. */
  esperaLocalMs: 520,
  /** Tiempo máximo de espera de una respuesta de la IA. */
  tiempoLimiteIaMs: 45000,
  /** Tiempo máximo para saber si el servidor de IA está disponible. */
  tiempoSondeoMs: 2500,
};
