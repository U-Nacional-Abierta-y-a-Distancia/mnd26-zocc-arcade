/**
 * Configuración del servidor. Todo viene de variables de entorno (ver `.env.example`); aquí se leen UNA vez,
 * con sus valores por defecto, y se pasan a los demás módulos. Ningún otro módulo toca `process.env`.
 * @module lib/config
 */
import path from 'node:path';

/**
 * @typedef {Object} Config
 * @property {number}  puerto
 * @property {string}  modelo         Modelo de Claude.
 * @property {string}  esfuerzo       low | medium | high. Un asistente de ayuda no necesita razonar mucho.
 * @property {number}  maxTokens      Tope de la respuesta.
 * @property {boolean} reintentoSeguridad  Reintento del lado del servidor si un clasificador de seguridad rechaza.
 * @property {string}  dirWeb         Carpeta del juego que se sirve.
 * @property {string}  origenCors     Dominio de la página, solo si se sirve desde otro dominio ('' = mismo origen).
 * @property {number}  limitePorMinuto  Peticiones por minuto y por IP.
 * @property {number}  limitePorDia     Peticiones por día y por IP.
 * @property {string}  urlApi        Dirección alternativa de la API (solo para el simulador de pruebas; '' = la oficial).
 * @property {boolean} detrasDeProxy  Leer la IP de `X-Forwarded-For`.
 * @property {Record<string,string>} rutasExtra  Prefijo de URL → carpeta (solo modo desarrollo).
 */

/**
 * Lee la configuración.
 * @param {NodeJS.ProcessEnv} env   Variables de entorno.
 * @param {string[]} argv           Argumentos de la línea de comandos. `--dev` publica `/__pruebas/` (las pruebas del navegador).
 * @param {string} carpeta          Carpeta de este servidor (para resolver rutas relativas).
 * @returns {Config}
 */
export function leerConfig(env = process.env, argv = process.argv, carpeta = process.cwd()) {
  const numero = (valor, porDefecto) => (valor === undefined || valor === '' || !Number.isFinite(Number(valor)) ? porDefecto : Number(valor));
  const rutasExtra = {};
  if (argv.includes('--dev')) rutasExtra['/__pruebas/'] = path.resolve(carpeta, '../pruebas');

  return {
    puerto: numero(env.PORT, 3000),
    modelo: env.JEFE_MODELO || 'claude-opus-5-5',
    esfuerzo: env.JEFE_ESFUERZO || 'low',
    maxTokens: numero(env.JEFE_MAX_TOKENS, 1500),
    reintentoSeguridad: env.JEFE_FALLBACK !== '0',
    dirWeb: path.resolve(carpeta, env.JEFE_WEB || '../src'),
    origenCors: env.JEFE_ORIGEN || '',
    limitePorMinuto: numero(env.JEFE_LIMITE_MIN, 20),
    limitePorDia: numero(env.JEFE_LIMITE_DIA, 300),
    urlApi: env.JEFE_API_URL || '',
    detrasDeProxy: env.JEFE_PROXY === '1',
    rutasExtra,
  };
}

/** ¿Hay clave de la API en el entorno? (Nunca se lee su valor aquí). @param {NodeJS.ProcessEnv} [env] @returns {boolean} */
export const hayClave = (env = process.env) => Boolean(env.ANTHROPIC_API_KEY || env.ANTHROPIC_AUTH_TOKEN);
