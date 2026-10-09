/**
 * Reglas de la música de fondo: qué pista toca y a qué volumen. Sin DOM ni audio (se prueba en Node).
 * @module dominio/musica
 */
import { PISTA_DEL_PANEL, PISTA_INICIAL, PISTA_POR_VISTA, VOLUMEN_CON_VOZ, VOLUMEN_MUSICA } from '../datos/musica.js';

/**
 * Pista que corresponde al momento actual.
 * @param {{vista: string, panelAbierto: boolean}} momento
 * @returns {string} Clave de `PISTAS`.
 */
export function pistaPara({ vista, panelAbierto }) {
  if (panelAbierto) return PISTA_DEL_PANEL;
  return PISTA_POR_VISTA[vista] ?? PISTA_INICIAL;
}

/**
 * Volumen objetivo de la música.
 * @param {{sonido: boolean, desbloqueada: boolean, oculta: boolean, narrando: boolean}} estado
 *   `sonido`: botón de sonido activado; `desbloqueada`: el navegador deja sonar (suele exigir un toque o tecla antes; false si rechazó la reproducción);
 *   `oculta`: la pestaña no se ve; `narrando`: EL JEFE está hablando.
 * @returns {number} 0 si no debe sonar.
 */
export function volumenPara({ sonido, desbloqueada, oculta, narrando }) {
  if (!sonido || !desbloqueada || oculta) return 0;
  return narrando ? VOLUMEN_CON_VOZ : VOLUMEN_MUSICA;
}

/**
 * Siguiente volumen de una pista que se acerca a su objetivo (para entrar y salir suavemente).
 * @param {number} actual
 * @param {number} objetivo
 * @param {number} paso  Cuánto cambia como máximo por vuelta.
 * @returns {number}
 */
export function acercar(actual, objetivo, paso) {
  if (Math.abs(objetivo - actual) <= paso) return objetivo;
  return actual + Math.sign(objetivo - actual) * paso;
}
