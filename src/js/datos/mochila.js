/**
 * Kit de la mochila de emergencia (16 ítems en 5 grupos). Cada ítem marcado suma XP.
 * @module datos/mochila
 */

/**
 * @typedef {Object} ItemMochila
 * @property {string} id
 * @property {string} texto
 * @property {string} detalle  Aclaración opcional ('' si no hay).
 */

/** @type {{grupo: string, items: ItemMochila[]}[]} */
export const MOCHILA = [
  {
    grupo: 'Agua y comida',
    items: [
      { id: 'k1', texto: 'Agua potable', detalle: 'Cantidad según las personas de tu casa; cámbiala con regularidad' },
      { id: 'k2', texto: 'Alimentos no perecederos y fáciles de abrir', detalle: 'Revisa fechas de vencimiento' },
      { id: 'k3', texto: 'Abrelatas, cubiertos y vasos', detalle: '' },
    ],
  },
  {
    grupo: 'Salud',
    items: [
      { id: 'k4', texto: 'Botiquín básico', detalle: 'Gasas, antiséptico, curas, guantes' },
      { id: 'k5', texto: 'Medicamentos de uso personal', detalle: 'Con la fórmula médica a la mano' },
      { id: 'k6', texto: 'Tapabocas y artículos de higiene', detalle: '' },
    ],
  },
  {
    grupo: 'Luz y comunicación',
    items: [
      { id: 'k7', texto: 'Linterna con pilas de repuesto', detalle: '' },
      { id: 'k8', texto: 'Radio de pilas', detalle: 'Para seguir las indicaciones oficiales' },
      { id: 'k9', texto: 'Silbato', detalle: 'Para pedir ayuda si quedas atrapado' },
      { id: 'k10', texto: 'Cargador portátil', detalle: '' },
    ],
  },
  {
    grupo: 'Documentos y dinero',
    items: [
      { id: 'k11', texto: 'Copias de documentos en bolsa sellada', detalle: 'Identidad, seguro, escrituras o contratos' },
      { id: 'k12', texto: 'Contactos de emergencia en papel', detalle: '' },
      { id: 'k13', texto: 'Algo de dinero en efectivo', detalle: 'En billetes y monedas pequeñas' },
    ],
  },
  {
    grupo: 'Abrigo y familia',
    items: [
      { id: 'k14', texto: 'Ropa de cambio, abrigo y calzado cerrado', detalle: '' },
      { id: 'k15', texto: 'Cobija ligera o manta térmica', detalle: '' },
      { id: 'k16', texto: 'Lo que necesitan los niños, adultos mayores o mascotas', detalle: 'Pañales, comida, correa, lo que aplique' },
    ],
  },
];

/** Total de ítems del kit. */
export const TOTAL_ITEMS_MOCHILA = MOCHILA.reduce((n, g) => n + g.items.length, 0);
