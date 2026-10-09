/**
 * Banco de hábitos BUENOS: 18 por nivel (6 jugadas de 3). Cada jugada toma 3 hábitos buenos (y los 3 descuidos del
 * mismo lote, ver `habitos-malos.js`); al ganarla pasa a la siguiente y, tras la sexta, vuelve a la primera (repaso).
 *
 * Para AÑADIR un hábito: agrégalo al final de la lista de su nivel con un `id` nuevo y único (nunca reutilices
 * un id: el progreso guardado se identifica por él), mantén la cantidad en múltiplos de 3 y agrega también su
 * descuido opuesto en `habitos-malos.js` (los dos bancos deben tener el mismo tamaño).
 *
 * @module datos/habitos
 */

/**
 * @typedef {Object} Habito
 * @property {string} id      Identificador estable (se guarda en el progreso).
 * @property {string} icono   Clave de `ICONOS_HABITO`.
 * @property {string} texto   Lo que la persona debe hacer.
 * @property {string} [grupo] Subtítulo bajo el que se agrupa en la lista (solo nivel Fuego).
 */

/** @type {Record<string, Habito[]>} */
export const HABITOS = {
  agua: [
    // Jugada 1
    { id: 'a1', icono: '34', texto: 'Cierra la llave mientras te cepillas o enjabonas' },
    { id: 'a2', icono: '10', texto: 'Revisa y reporta una fuga (grifo, tanque o tubería)' },
    { id: 'a3', icono: '23', texto: 'Reutiliza agua: la del enjuague sirve para regar o limpiar' },
    { id: 'a4', icono: '31', texto: 'Riega tus plantas temprano o al atardecer' },
    { id: 'a6', icono: '23', texto: 'Lava frutas y verduras en un recipiente, sin dejar el chorro abierto' },
    { id: 'a5', icono: '34', texto: 'Guarda agua en recipientes limpios y tapados (balde, garrafón)' },
    // Jugada 2
    { id: 'a7', icono: '34', texto: 'Toma duchas de menos de 5 minutos' },
    { id: 'a8', icono: '10', texto: 'Usa el sanitario solo para lo necesario: no lo uses de basurero' },
    { id: 'a9', icono: '34', texto: 'Lava el carro o la moto con balde, no con manguera' },
    { id: 'a10', icono: '34', texto: 'Barre el patio y la acera en vez de lavarlos con manguera' },
    { id: 'a11', icono: '23', texto: 'Recoge agua lluvia en baldes para regar o limpiar' },
    { id: 'a12', icono: '10', texto: 'Revisa los empaques de los grifos y cambia los que goteen' },
    // Jugada 3
    { id: 'a13', icono: '23', texto: 'Pon la lavadora solo con carga completa' },
    { id: 'a14', icono: '34', texto: 'Enjabona los platos con el grifo cerrado y enjuaga todos juntos' },
    { id: 'a15', icono: '10', texto: 'Pídele a tu familia o vecinos que cierren la llave y reporten fugas' },
    { id: 'a16', icono: '10', texto: 'Anota la lectura del medidor al acostarte y al levantarte para detectar fugas ocultas' },
    { id: 'a17', icono: '31', texto: 'Cubre la tierra de las matas con hojas secas para que retenga humedad' },
    { id: 'a18', icono: '31', texto: 'Elige plantas que resistan la sequía para tu balcón o patio' },
  ],
  energia: [
    // Jugada 1
    { id: 'e1', icono: '13', texto: 'Apaga las luces al salir de un cuarto' },
    { id: 'e2', icono: '40', texto: 'Desconecta cargadores y equipos que no usas' },
    { id: 'e3', icono: '21', texto: 'Abre cortinas y ventila antes de encender el ventilador' },
    { id: 'e4', icono: '13', texto: 'Cambia los bombillos dañados por LED, que gastan menos' },
    { id: 'e5', icono: '40', texto: 'Plancha y lava en tandas: junta la ropa en vez de usar el equipo por poco' },
    { id: 'e6', icono: '40', texto: 'Revisa que la puerta de la nevera cierre bien y no esté junto a una fuente de calor' },
    // Jugada 2
    { id: 'e7', icono: '13', texto: 'Aprovecha la luz natural: abre cortinas de día en vez de encender bombillos' },
    { id: 'e8', icono: '40', texto: 'Apaga el televisor y el computador; no los dejes en espera' },
    { id: 'e9', icono: '21', texto: 'Limpia las aspas del ventilador y los bombillos: el polvo les resta rendimiento' },
    { id: 'e10', icono: '40', texto: 'Cocina con las ollas tapadas y apaga un poco antes de terminar' },
    { id: 'e11', icono: '40', texto: 'Desconecta el celular cuando llegue al 100 %' },
    { id: 'e12', icono: '40', texto: 'Descongela los alimentos en la nevera, no con agua ni con el microondas' },
    // Jugada 3
    { id: 'e13', icono: '40', texto: 'Planifica el horno: cocina varias cosas en una sola tanda' },
    { id: 'e14', icono: '21', texto: 'Seca la ropa al aire en vez de usar secadora' },
    { id: 'e15', icono: '40', texto: 'Mira la etiqueta de consumo de energía antes de comprar un electrodoméstico' },
    { id: 'e16', icono: '21', texto: 'Usa el ventilador o el aire a una temperatura moderada y apágalo al salir' },
    { id: 'e17', icono: '13', texto: 'Haz una ronda nocturna: apaga luces y equipos antes de dormir' },
    { id: 'e18', icono: '13', texto: 'Enséñale a un niño o a un vecino un gesto concreto para ahorrar energía' },
  ],
  calor: [
    // Jugada 1
    { id: 'f3', icono: '14', texto: 'Hidrátate y busca sombra en las horas de más calor' },
    { id: 'f12', icono: '14', texto: 'Sal con ropa clara y liviana, y con gorra o sombrero' },
    { id: 'f11', icono: '14', texto: 'Nunca dejes a niños, adultos mayores ni mascotas dentro de un carro cerrado' },
    { id: 'f13', icono: '14', texto: 'Deja agua fresca y sombra para tus mascotas y animales' },
    { id: 'f14', icono: '14', texto: 'Pregunta a un vecino mayor o enfermo si está hidratado y fresco' },
    { id: 'f4', icono: '31', texto: 'Siembra o cuida una planta: la cobertura verde ayuda' },
    // Jugada 2
    { id: 'f15', icono: '14', texto: 'Toma agua en pequeños sorbos durante el día, aunque no tengas sed' },
    { id: 'f16', icono: '14', texto: 'Planea las tareas al aire libre para la mañana temprano o el final de la tarde' },
    { id: 'f17', icono: '14', texto: 'Come liviano: frutas, verduras y ensaladas' },
    { id: 'f18', icono: '21', texto: 'Cierra las cortinas del lado donde pega el sol en las horas de más calor' },
    { id: 'f19', icono: '14', texto: 'Evita el alcohol y las bebidas muy azucaradas cuando hace mucho calor' },
    { id: 'f20', icono: '14', texto: 'Aprende las señales de un golpe de calor (mareo, piel caliente, confusión): sombra, agua y 123' },
    // Jugada 3
    { id: 'f21', icono: '14', texto: 'Usa protector solar y cuida la piel de los niños' },
    { id: 'f22', icono: '14', texto: 'Refresca la cara y el cuello con agua fresca para bajar la temperatura' },
    { id: 'f23', icono: '14', texto: 'Revisa que los adultos mayores y los bebés estén frescos e hidratados' },
    { id: 'f24', icono: '14', texto: 'Lleva siempre una botella de agua cuando salgas' },
    { id: 'f25', icono: '31', texto: 'Riega la tierra del patio al atardecer para bajar el calor del suelo' },
    { id: 'f26', icono: '14', texto: 'Comparte con tu familia un consejo para sobrellevar el calor' },
  ],
  fuego: [
    // Jugada 1
    { id: 'f1', icono: '41', grupo: 'Prevención del fuego', texto: 'No hagas quemas ni dejes fuego abierto en zonas secas' },
    { id: 'f2', icono: '14', grupo: 'Prevención del fuego', texto: 'No arrojes colillas ni vidrio en lotes, laderas o carreteras' },
    { id: 'f5', icono: '41', grupo: 'Prevención del fuego', texto: 'Revisa la estufa y el gas: llaves cerradas al salir y nada inflamable cerca' },
    { id: 'f8', icono: '24', grupo: 'Listo para la emergencia', texto: 'Ubica el extintor (o un balde con agua o arena) y comprueba que sea accesible' },
    { id: 'f9', icono: '24', grupo: 'Listo para la emergencia', texto: 'Acuerda con tu familia la salida y el punto de encuentro si hay fuego' },
    { id: 'f10', icono: '24', grupo: 'Listo para la emergencia', texto: 'Repasa en familia qué hacer: salir, no volver por objetos y llamar al 123' },
    // Jugada 2
    { id: 'f6', icono: '40', grupo: 'Prevención del fuego', texto: 'Revisa cables y enchufes: nada dañado ni sobrecargado' },
    { id: 'f7', icono: '41', grupo: 'Prevención del fuego', texto: 'Apaga las velas al dormir y guarda fósforos y encendedores lejos de los niños' },
    { id: 'f27', icono: '41', grupo: 'Prevención del fuego', texto: 'Limpia la grasa de la estufa y de la campana de la cocina' },
    { id: 'f28', icono: '41', grupo: 'Prevención del fuego', texto: 'No dejes comida cocinando sin vigilancia' },
    { id: 'f29', icono: '41', grupo: 'Prevención del fuego', texto: 'Revisa la manguera y el regulador del gas: sin grietas ni fugas (agua jabonosa)' },
    { id: 'f30', icono: '24', grupo: 'Listo para la emergencia', texto: 'Si tienes detector de humo, prueba que funcione' },
    // Jugada 3
    { id: 'f31', icono: '41', grupo: 'Prevención del fuego', texto: 'Guarda alcohol, gasolina y thinner en recipientes cerrados y lejos del calor' },
    { id: 'f32', icono: '40', grupo: 'Prevención del fuego', texto: 'No dejes equipos cargando bajo almohadas, sofás ni cobijas' },
    { id: 'f36', icono: '41', grupo: 'Prevención del fuego', texto: 'Enseña a los niños que el fuego no es un juguete y que deben avisar a un adulto' },
    { id: 'f33', icono: '24', grupo: 'Listo para la emergencia', texto: 'Mantén libres de objetos la salida y el pasillo de tu casa' },
    { id: 'f34', icono: '24', grupo: 'Listo para la emergencia', texto: 'Anota el 123 y la dirección exacta de tu casa junto al teléfono' },
    { id: 'f35', icono: '24', grupo: 'Listo para la emergencia', texto: 'Practica con tu familia salir agachados si hay humo' },
  ],
  sismo: [
    // Jugada 1
    { id: 's1', icono: '24', texto: 'Identifica la zona segura de tu casa y el punto de encuentro' },
    { id: 's5', icono: '24', texto: 'Asegura a la pared los muebles altos, repisas y objetos pesados' },
    { id: 's6', icono: '24', texto: 'Aprende dónde cerrar el gas, el agua y la luz, y enséñaselo a tu familia' },
    { id: 's2', icono: '24', texto: 'Recorre la ruta de evacuación con tu familia' },
    { id: 's3', icono: '24', texto: 'Anota los números de emergencia en papel y en el celular' },
    { id: 's4', icono: '24', texto: 'Revisa que tu mochila esté completa (ve a la pestaña Mochila)' },
    // Jugada 2
    { id: 's7', icono: '24', texto: 'Mantén despejadas las salidas, sin muebles que estorben' },
    { id: 's8', icono: '24', texto: 'Ubica tu cama lejos de ventanas y de repisas con objetos pesados' },
    { id: 's9', icono: '24', texto: 'Practica «agáchate, cúbrete y sujétate» en familia' },
    { id: 's10', icono: '24', texto: 'Acuerda un contacto fuera de la ciudad para avisar que estás bien' },
    { id: 's11', icono: '24', texto: 'Deja zapatos cerrados y una linterna junto a la cama' },
    { id: 's12', icono: '24', texto: 'Revisa grietas en paredes y techos y repórtalas' },
    // Jugada 3
    { id: 's13', icono: '24', texto: 'Revisa las fechas de vencimiento de tu mochila: agua, comida y pilas' },
    { id: 's14', icono: '24', texto: 'Identifica los lugares seguros de tu trabajo o colegio' },
    { id: 's15', icono: '24', texto: 'Haz un simulacro familiar y mide cuánto tardan en llegar al punto de encuentro' },
    { id: 's16', icono: '24', texto: 'Enséñale a un vecino o familiar a cerrar el gas, el agua y la luz' },
    { id: 's17', icono: '24', texto: 'Conoce el plan de emergencia de tu barrio o conjunto' },
    { id: 's18', icono: '24', texto: 'Guarda copias digitales de tus documentos en un lugar seguro' },
  ],
};
