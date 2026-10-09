/**
 * Punto de entrada de «NIDO».
 *
 * Arquitectura en capas (cada capa solo conoce a las de abajo):
 *
 *   ui/        Interfaz: crea y repinta el DOM, atiende eventos.   (importa de abajo)
 *   estado/    Persistencia del progreso en localStorage.
 *   dominio/   Reglas del juego, sin DOM ni almacenamiento (probadas con `npm test`).
 *   datos/     Contenido: niveles, hábitos, insignias, mochila…    (datos puros)
 *   config.js  Constantes.   util/  Utilidades.
 *
 * Patrón: «el estado manda». Cada acción cambia el estado (`estado/almacen.js`), lo guarda y llama a
 * `renderTodo()`, que repinta las secciones a partir de él.
 *
 * @module main
 */
import { cargar, consumirAnimo } from './estado/almacen.js';
import { avisar } from './ui/avisos.js';
import { iniciarCaso } from './ui/caso.js';
import { iniciarSonido } from './ui/sonido.js';
import { iniciarChat } from './ui/chat/panel.js';
import { iniciarInstalacion, registrarServiceWorker } from './ui/instalacion.js';
import { iniciarMochila } from './ui/mochila.js';
import { iniciarMusica } from './ui/musica.js';
import { iniciarNavegacion, ir } from './ui/navegacion.js';
import { iniciarPresentacion } from './ui/presentacion.js';
import { iniciarReinicio } from './ui/ranking.js';
import { renderTodo } from './ui/render.js';
import { iniciarRetos } from './ui/retos.js';
import { montarTarjetas } from './ui/tarjetas.js';

window.__ysph = true;    // avisa a la red de seguridad de index.html de que el juego arrancó
cargar();                 // 1. leer el progreso guardado
montarTarjetas();         // 2. tarjetas de personajes (portada y Agentes)
iniciarRetos();           // 3. tarjetas de los cinco niveles
iniciarMochila();
iniciarSonido();          // botón de sonido y efectos
iniciarMusica();          // música de fondo (respeta el botón de sonido)
iniciarCaso();            // narrativa «¿Tu familia está lista?» (botones con data-caso)
iniciarReinicio();
iniciarChat();            // 4. EL JEFE (personaje flotante y chat)
iniciarInstalacion();     // 5. fila de instalación / APK
registrarServiceWorker();
iniciarNavegacion();      // 6. navegación y menús
iniciarPresentacion();    // 7. presentación inicial (una vez por sesión)

renderTodo();             // 8. primer dibujo
ir('home');
const animo = consumirAnimo(); // un ánimo que dejaron mientras no estabas
if (animo) avisar(`${animo.from} te mandó ánimo: ¡tú puedes!`);
