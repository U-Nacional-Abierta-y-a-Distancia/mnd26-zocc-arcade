/**
 * Banco de hábitos NEGATIVOS («descuidos»): 18 por nivel, uno por cada hábito bueno de `habitos.js`.
 *
 * Cada jugada muestra 3 hábitos buenos y 3 descuidos del mismo lote. Marcar un descuido es RECONOCER que se hizo
 * hoy: fortalece al enemigo y hiere al salvador (con 3 descuidos, el salvador cae). El descuido en la posición
 * `i` es el opuesto del hábito bueno en la posición `i` (se usa para explicar cómo corregirlo).
 *
 * Para AÑADIR un descuido: agrégalo al final de la lista de su nivel, con el mismo criterio que los hábitos buenos
 * (cantidad en múltiplos de 3, y los dos bancos siempre del mismo tamaño). Los `id` se generan por posición
 * (`ma1`, `me7`…): no reordenes ni borres los existentes, porque el progreso guardado se identifica por ellos.
 *
 * @module datos/habitos-malos
 */
import { HABITOS } from './habitos.js';

/** Letra de cada nivel en los id de los descuidos (`m` + letra + posición). */
const LETRA = { agua: 'a', energia: 'e', calor: 'c', fuego: 'f', sismo: 's' };

/** Textos de los descuidos, en el mismo orden que los hábitos buenos de cada nivel. @type {Record<string, string[]>} */
const TEXTOS = {
  agua: [
    'Dejé la llave abierta mientras me cepillaba o enjabonaba',
    'Vi una fuga o un goteo y no lo reporté',
    'Boté agua limpia (la del enjuague o la de un balde) en vez de reutilizarla',
    'Regué las plantas al mediodía, cuando más se evapora el agua',
    'Lavé frutas y verduras con el chorro abierto todo el tiempo',
    'Dejé el agua guardada destapada o en recipientes sucios',
    'Me di una ducha larga, de más de 10 minutos',
    'Usé el sanitario como basurero (tiré residuos y jalé el agua)',
    'Lavé el carro o la moto con la manguera abierta',
    'Lavé el patio o la acera con manguera en vez de barrerlos',
    'Dejé que se perdiera el agua lluvia sin recogerla',
    'Dejé un grifo goteando sin cambiarle el empaque',
    'Puse la lavadora con muy poca ropa',
    'Lavé los platos con el grifo abierto todo el tiempo',
    'Vi a alguien dejar la llave abierta y no le dije nada',
    'Ignoré el medidor aunque la factura del agua subió',
    'Dejé la tierra de las matas descubierta, al sol directo',
    'Compré o sembré plantas que gastan mucha agua sin necesitarlo',
  ],
  energia: [
    'Dejé luces encendidas en cuartos donde no había nadie',
    'Dejé cargadores y equipos conectados sin usarlos',
    'Encendí el ventilador o el aire con las cortinas y ventanas cerradas',
    'Dejé encendidos bombillos viejos de alto consumo',
    'Usé la plancha o la lavadora para muy poca ropa',
    'Dejé la puerta de la nevera abierta mucho rato o mal cerrada',
    'Encendí bombillos de día teniendo buena luz natural',
    'Dejé el televisor o el computador en espera toda la noche',
    'Usé el ventilador o los bombillos llenos de polvo sin limpiarlos',
    'Cociné con las ollas destapadas y el fuego muy alto',
    'Dejé el celular cargando mucho después de llegar al 100 %',
    'Descongelé alimentos con el microondas o con agua por afán',
    'Prendí el horno para una sola cosa pequeña',
    'Usé la secadora teniendo sol y espacio para tender la ropa',
    'Compré un electrodoméstico sin mirar cuánta energía gasta',
    'Dejé el aire o el ventilador encendido en un cuarto vacío',
    'Me fui a dormir con luces y equipos encendidos',
    'Vi a alguien gastando energía de más y no le dije nada',
  ],
  calor: [
    'Pasé horas bajo el sol sin tomar agua ni buscar sombra',
    'Salí con ropa oscura y pesada, sin gorra, en las horas de más calor',
    'Dejé a un niño, a un adulto mayor o a una mascota un momento dentro de un carro cerrado',
    'Dejé a mis mascotas sin agua fresca ni sombra',
    'Me olvidé de un vecino mayor o enfermo en un día de calor fuerte',
    'Dejé el suelo y las plantas totalmente secos y sin cobertura verde',
    'Pasé el día sin tomar agua hasta sentir sed',
    'Hice ejercicio o trabajo pesado al aire libre al mediodía',
    'Comí muy pesado (fritos y comidas abundantes) en un día de calor fuerte',
    'Dejé las cortinas abiertas con el sol pegando directo en la casa',
    'Tomé alcohol o muchas bebidas azucaradas con mucho calor',
    'Ignoré el mareo, la piel muy caliente o la confusión en alguien con calor',
    'Salí al sol sin protector solar (o dejé a un niño sin él)',
    'Aguanté el calor sin refrescarme la cara ni el cuello',
    'Dejé a un bebé o a un adulto mayor en un lugar muy caliente',
    'Salí de la casa sin llevar agua',
    'Dejé el patio de tierra recalentándose, sin regarlo',
    'Ignoré los consejos para sobrellevar el calor',
  ],
  fuego: [
    'Hice una quema o dejé fuego abierto en una zona seca',
    'Arrojé una colilla o un vidrio en un lote, una ladera o una carretera',
    'Salí de casa sin revisar la estufa ni cerrar la llave del gas',
    'Dejé el extintor (o el balde con agua o arena) tapado por objetos, difícil de alcanzar',
    'Dejé pasar el día sin hablar con mi familia de la salida de emergencia',
    'Pensé «a mí no me pasa» y no repasé qué hacer si hay fuego',
    'Dejé cables dañados o enchufes sobrecargados',
    'Dejé una vela prendida al dormir o fósforos al alcance de los niños',
    'Dejé acumular grasa en la estufa y en la campana de la cocina',
    'Dejé comida cocinando sin vigilancia',
    'Usé una manguera o un regulador de gas con grietas o fugas',
    'Dejé sin probar (o sin pilas) el detector de humo',
    'Guardé alcohol, gasolina o thinner abiertos cerca del calor',
    'Dejé un equipo cargando bajo una almohada o una cobija',
    'Dejé que un niño jugara con fuego, fósforos o encendedores',
    'Dejé la salida o el pasillo lleno de objetos',
    'Dejé sin anotar el 123 y la dirección de mi casa junto al teléfono',
    'Dejé pasar otra semana sin practicar cómo salir agachados si hay humo',
  ],
  sismo: [
    'Dejé pasar el día sin identificar la zona segura ni el punto de encuentro',
    'Dejé muebles altos y objetos pesados sin asegurar a la pared',
    'Dejé sin aprender dónde se cierran el gas, el agua y la luz',
    'Dejé de recorrer la ruta de evacuación con mi familia',
    'Dejé los números de emergencia solo en la memoria',
    'Dejé la mochila incompleta, con ítems vencidos o sin pilas',
    'Dejé muebles estorbando una salida',
    'Dejé la cama junto a una ventana o bajo una repisa con objetos pesados',
    'No practiqué «agáchate, cúbrete y sujétate»: mi reacción sería correr',
    'Dejé sin acordar un contacto fuera de la ciudad para avisar que estoy bien',
    'Dejé los zapatos lejos de la cama y sin una linterna a mano',
    'Vi una grieta nueva en una pared o en el techo y no la reporté',
    'Dejé vencer el agua, la comida o las pilas de la mochila',
    'Nunca miré cuáles son los lugares seguros de mi trabajo o colegio',
    'Pospuse otra vez el simulacro familiar',
    'No le enseñé a nadie más a cerrar el gas, el agua y la luz',
    'No conozco el plan de emergencia de mi barrio ni lo pregunté',
    'Dejé mis documentos solo en papel, sin copia digital',
  ],
};

/** @type {Record<string, import('./habitos.js').Habito[]>} */
export const HABITOS_MALOS = Object.fromEntries(Object.entries(TEXTOS).map(([nivel, textos]) => {
  const buenos = HABITOS[nivel];
  if (buenos.length !== textos.length) throw new Error(`El banco de descuidos de «${nivel}» debe tener ${buenos.length} elementos`);
  return [nivel, textos.map((texto, i) => ({ id: `m${LETRA[nivel]}${i + 1}`, icono: buenos[i].icono, texto }))];
}));
