/**
 * Cálculos de la sección Ranking: últimos días y dominio semanal por nivel. Sin DOM.
 * @module dominio/ranking
 */
import { HABITOS_POR_JUGADA } from '../config.js';
import { NIVELES } from '../datos/niveles.js';
import { claveDia } from '../util/fecha.js';
import { hechosEnDia } from './progreso.js';

/** @typedef {import('./progreso.js').Estado} Estado */

/**
 * Hábitos marcados cada día, de los más antiguos a hoy.
 * @param {Estado} s
 * @param {number} [cuantos] Días a mostrar (por defecto 7).
 * @param {Date} [ahora]
 * @returns {{fecha: Date, clave: string, cantidad: number}[]}
 */
export function ultimosDias(s, cuantos = 7, ahora = new Date()) {
  const dias = [];
  for (let atras = cuantos - 1; atras >= 0; atras -= 1) {
    const fecha = new Date(ahora);
    fecha.setDate(fecha.getDate() - atras);
    const clave = claveDia(fecha);
    dias.push({ fecha, clave, cantidad: (s.days[clave] || []).length });
  }
  return dias;
}

/**
 * Porcentaje de dominio de cada nivel en los días dados: hábitos marcados / (6 hábitos × días).
 * @param {Estado} s
 * @param {{clave: string}[]} dias
 * @returns {{nivel: string, porcentaje: number}[]}
 */
export function dominioSemanal(s, dias) {
  return NIVELES.map((nivel) => {
    const total = dias.reduce((n, d) => n + hechosEnDia(s, nivel, d.clave), 0);
    return { nivel: nivel.nombre, porcentaje: Math.round((total / (HABITOS_POR_JUGADA * dias.length)) * 100) };
  });
}
