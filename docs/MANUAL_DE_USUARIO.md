# Manual de usuario — NIDO · ¿Y si pasa hoy?

**Un juego serio de ARCADE · Olimpiadas Unadistas**
Versión del prototipo: octubre de 2026

---

## 1. ¿Qué es NIDO?

**NIDO** es un acrónimo: **N**os · **I**nformamos · **D**ecidimos · **O**rganizamos, en familia. Su eslogan es «¿Y si pasa hoy?». Informarse (con fuentes oficiales y EL JEFE), decidir (qué hábito hacer hoy) y organizarse (el ranking y los ánimos de la familia) son los tres pasos del juego.

Es un juego web, interactivo y adaptable a celular, computador y tableta. Sirve para crear **hábitos diarios** que preparan a tu hogar frente a **El Niño** y otros desastres en la **Zona Occidente y Dosquebradas**: ahorrar agua y energía, cuidarse del calor, prevenir el fuego y estar listo ante un sismo.

Está pensado para **familias de la Zona Occidente y Dosquebradas**: cada integrante juega con su propio *nickname*, y la familia compara quién va mejor y quién necesita una mano.

> **Importante.** Es un juego educativo. Sus consejos son generales y **no reemplazan** las indicaciones de los bomberos, del IDEAM ni de la gestión del riesgo de tu municipio. **En una emergencia llama al 123.**

### Quiénes lo diseñan

El equipo **ARCADE** (Semillero): los profesores Natalia Elizabeth Pérez, Henrry Borrero, Jaime Jose Garcia y Nelson Serna, y la estudiante semillerista Valentina Rengifo, en el reto de las Olimpiadas Unadistas.

---

## 2. Cómo empezar

### 2.1 Presentación inicial

Al abrir el juego se muestra una presentación de unos 12 segundos:

1. **El equipo (5 s):** el logo de ARCADE, quiénes lo diseñan, el logo de las Olimpiadas Unadistas y una barra de carga.
2. **El juego (7 s):** «Cargando el juego…», para quién es y en qué consiste, y los cinco niveles.

Puedes pasar de largo con **Saltar**, con **Entrar al juego** o con la tecla **Esc**. Solo se muestra una vez por sesión.

### 2.2 La portada

- **Cómo se juega:** una línea con lo esencial y tres pasos.
- **Empieza hoy con un solo hábito → Entrar al juego:** el botón principal.
- **Saber más:** tres secciones plegables (¿Qué es y para qué se usa?, El Niño en la Zona Occidente y Dosquebradas (con una tabla de riesgos y sus fuentes), EL JEFE y sus salvadores). Toca una para abrirla.
- **Llévalo en tu bolsillo** (al final, en letra pequeña): instalar la app desde el navegador. También se ve el botón del APK de Android, que es solo una propuesta para el futuro. Ver el apartado 12.

### 2.3 Tu nickname

Al tocar **Entrar al juego** por primera vez se te pide un **nickname**:

- De 2 a 16 caracteres: letras, números, guion (`-`) o guion bajo (`_`). **Sin espacios.**
- **No uses tu nombre completo ni datos personales.**
- No puede repetirse dentro de tu familia.
- Si ya estás inscrito, elige tu nickname de la lista «¿Ya estás inscrito?».

Si tocas **Ahora no**, vuelves a la portada.

---

### 2.4 ¿Está lista tu familia? (la narrativa de EL JEFE)

**Al pulsar «Entrar al juego»** en la portada (y después de poner tu nickname) aparece primero un **panel traslúcido de estilo tecnológico**, con el juego desenfocado detrás, que cuenta EL JEFE en **seis escenas**. Si no quieres verlo cada vez, marca **«No mostrar al entrar»** (se recuerda en tu dispositivo). Para verlo cuando quieras, usa el botón **«¿Está lista tu familia? · Escucha a EL JEFE»** de la portada o el chip «¿Está lista tu familia?» en **Retos**. Pasa de una a otra con **Siguiente / Anterior** o con las **flechas del teclado**; **Esc** o **Cerrar** la cierran.

| Escena | Qué cuenta |
|---|---|
| 1 · **La pregunta** | Hay cosas que no controlas (cuándo llega un fenómeno, qué tan fuerte es) y otras que sí (agua guardada, ruta de salida, mochila). |
| 2 · **Los frentes** | Cuando algo así golpea llegan varios retos juntos: agua, energía, calor, fuego y sismo. Son los cinco niveles del juego. |
| 3 · **Caso hipotético** | Un jueves de El Niño en Dosquebradas, de la mañana a la noche: se acaba el agua, el calor aprieta, hay humo en la ladera, se va la luz y llega un temblor. |
| 4 · **Las consecuencias** | Con el botón **«Si no se prepara» / «Si se prepara»** ves los dos finales de cada momento: la misma familia, el mismo día, preparada o no. |
| 5 · **El reto** | Un hábito concreto para cambiar el final de cada momento, y el reto de cubrir los cinco frentes. |
| 6 · **Tu estado** | Cuántos de los cinco **frentes** cubre tu familia hoy. Un frente cuenta como cubierto cuando **ganas al menos una jugada** en ese nivel. **«Aceptar el reto»** te lleva a Retos. |

**Narrador con voz.** En el panel hay un botón **«Escuchar a EL JEFE»**: reproduce el **audio** de la escena, que cuenta lo que dice EL JEFE y el contenido de la escena (los momentos del caso, los finales, los hábitos…). **«Detener la voz»** lo corta. Con el selector **«Velocidad de la voz»** (Normal, Más rápida, Rápida) lo escuchas al ritmo que prefieras. Si marcas **«Narrar y avanzar solo»**, EL JEFE narra cada escena y pasa a la siguiente cuando termina (se recuerda en tu dispositivo). Al cerrar la ventana o cambiar de escena, la voz se calla.

> Los audios son **voz grabada** y están en `src/assets/audio/narrador/`, uno por escena. Se pueden cambiar guardando el archivo con el mismo nombre. Si un audio no existe, el juego lee el texto con la voz de tu navegador o celular.

> El caso es **ilustrativo**: no es un pronóstico ni una alerta oficial. Sirve para imaginar qué pasaría en tu casa y por qué los hábitos pequeños importan.

---

## 3. Moverse por el juego

Dentro del juego, arriba a la derecha, está tu **insignia y tus XP** y el botón de **menú (☰)**. Al tocarlo se despliega el menú con cinco secciones:

| Sección | Para qué sirve |
|---|---|
| **Retos** | Marcar tus hábitos y combatir a los enemigos. |
| **Mochila** | Armar tu kit de emergencia. |
| **Agentes** | Conocer a EL JEFE, a los salvadores y a los enemigos. |
| **Familia** | Inscribir a tu familia y ver su ranking. |
| **Ranking** | Ver tu progreso personal y tu escalera de insignias. |

El menú se cierra al elegir una sección, con **Esc** o al tocar fuera de él. La sección en la que estás aparece resaltada.

---

## 4. Retos: el corazón del juego

### 4.1 Cinco niveles

Hay un nivel por tema. Cada uno tiene su **salvador** (tu aliado), su **enemigo** y su propia serie de hábitos:

| Nivel | Salvador | Enemigo |
|---|---|---|
| 1 · **Agua** | H2O Guardian | Voraz Sequía |
| 2 · **Energía** | Robot de energía | Derroche Vampiro |
| 3 · **Calor** | H2O Guardian | Solazo |
| 4 · **Fuego** | Fuego Guardian | La Chispa |
| 5 · **Sismo** | Sismo | Réplica |

### 4.2 Una «jugada»: 3 hábitos buenos contra 3 descuidos

Cada nivel muestra **6 tarjetas a la vez**: **3 hábitos buenos** y **3 descuidos**. A ese conjunto se le llama **jugada**. Es una **carrera entre dos barras de vida de 3**: la de tu **enemigo** y la de tu **salvador**.

| Qué marcas | Qué pasa |
|---|---|
| Un **hábito bueno** (casilla de «Hábitos que hieren al enemigo») | Tu salvador lanza su señal y el enemigo pierde 1 de vida. Cada uno suma **20 XP**. |
| Un **descuido** (casilla de «¿Caíste en algún descuido hoy?»): marcas **«Lo hice hoy»** | El enemigo se **fortalece** (se agranda) y ataca: tu salvador pierde 1 de vida. Reconocerlo suma **2 XP** por honestidad (hasta 3 al día). |

**Gana quien llegue primero a 3:**

- **Victoria:** con tus **3 hábitos buenos** el enemigo cae. Aparece **«¡Jugada N completada!»** con tu **insignia** (ver el apartado 5) y los **3 hábitos buenos y 3 descuidos nuevos** de la siguiente jugada.
- **Derrota:** si reconoces los **3 descuidos antes**, tu salvador cae. Aparece **«¡Tu salvador cayó!»** y te explica **cómo corregir cada descuido** con su hábito opuesto. **No pierdes XP**: la jugada se **repite con los mismos hábitos** y puedes ganarla.

Puedes **desmarcar** cualquier casilla si te equivocaste: las barras vuelven a su estado anterior. Los descuidos **no cuentan** como hábitos buenos ni mantienen tu racha.

> **¿Por qué reconocer un descuido?** Porque ser sincero es parte del juego: te da un pequeño premio y te muestra cómo mejorar. Mentirse a uno mismo no ayuda a preparar a tu familia.

### 4.3 Banco de hábitos

Cada nivel guarda **18 hábitos buenos y 18 descuidos**, uno opuesto a cada hábito bueno. Una jugada usa 3 y 3, o sea que hay **6 jugadas distintas** por nivel. Cuando ganas una jugada, las tarjetas se reemplazan por 3 buenos y 3 descuidos nuevos. Al terminar la sexta jugada, el banco vuelve a empezar (repaso), y repetirlo sigue sumando XP.

El avance de una jugada **se conserva entre días**: no hace falta completarla el mismo día.

### 4.4 Animaciones de combate

Al marcar un hábito, **tu salvador lanza una señal al enemigo**, que cae al otro lado:

- **Agua:** gotas.
- **Energía:** un rayo.
- **Calor:** bruma fresca.
- **Fuego:** espuma de extintor.
- **Sismo:** ondas de choque.

Al impactar, el enemigo se sacude y su barra de vida parpadea. Con el tercer hábito bueno se desintegra.

Cuando reconoces un **descuido**, pasa al revés: el **enemigo se agranda y lanza una ráfaga de brasas** contra tu salvador, que se debilita y, con el tercer descuido, cae. Si tu dispositivo tiene activado el **movimiento reducido**, solo verás un destello breve.

### 4.4b Sonido

Las animaciones **suenan**: cada salvador tiene el sonido de su señal (gotas, rayo eléctrico, bruma, espuma, ondas graves), y hay sonidos para marcar un hábito, reconocer un descuido, el impacto, la caída del enemigo o del salvador, la victoria (con un destello extra si ganas una insignia), la derrota y la narrativa de EL JEFE.

- El botón de **altavoz** del encabezado (junto al menú) **silencia o activa** el sonido; también está la casilla «Efectos de sonido» en la narrativa. Se recuerda en tu dispositivo.
- **Música de fondo:** suena una pista suave en bucle, una para la portada y las secciones tranquilas, otra para los **Retos** y otra para la narrativa de EL JEFE. Baja el volumen cuando EL JEFE habla y se apaga con el mismo botón de altavoz. Empieza cuando tocas la pantalla por primera vez.
- Los **efectos** son sonidos suaves y cortos que se generan en tu dispositivo (no se descarga nada). El navegador solo deja sonar después de que tocas la pantalla, así que el primer sonido llega con tu primera acción.
- Los mismos sonidos existen como **archivos de audio etiquetados** por la parte del juego (carpeta `src/assets/audio/`, con su `LEEME.md`) para escucharlos o reutilizarlos.

### 4.5 Nivel Fuego: prevención y preparación

Los hábitos del nivel **Fuego** se agrupan en:

- **Prevención del fuego:** no quemas, no arrojar colillas, gas, cables, velas…
- **Listo para la emergencia:** extintor, salida de tu casa y qué hacer si hay fuego.

Sobre la lista aparece **«¿Estás listo para la emergencia de fuego?»** con tres marcas (extintor, salida, plan). Cuando las tres están completas, el mensaje confirma que sabes dónde está el extintor, por dónde salir y a quién llamar. Este medidor **no se reinicia** al cambiar de jugada.

### 4.6 Indicadores de arriba

En Retos verás cuatro tarjetas: **Hábitos buenos hoy**, **Jugadas ganadas**, **Racha** (días seguidos con al menos un hábito bueno) y **Experiencia** (XP).

---

## 5. Insignias

Las insignias son como las de los **exploradores**: se ganan con el esfuerzo y se van acumulando en una **escalera**. Cada hábito bueno que marcas suma **20 XP** y una jugada ganada (3 buenos) son **60 XP**. **Repetir** tus hábitos (jugada tras jugada, día tras día; el banco de cada nivel se repite al terminar) sigue sumando y te lleva más arriba.

| Insignia | XP | Equivale a |
|---|---|---|
| **Aspirante** | 0 | El punto de partida. |
| **Semilla** | 60 | Tu primera jugada ganada. |
| **Explorador** | 180 | Unas 3 jugadas. |
| **Guardián** | 400 | Unas 7 jugadas: los hábitos ya son costumbre. |
| **Centinela** | 750 | Unas 13 jugadas. |
| **Leyenda** | 1300 | Unas 22 jugadas: constancia ejemplar. |

**Dónde la ves:**

- **Al terminar un reto:** la ventana «¡Jugada N completada!» muestra tu insignia en un escudo. Si es **nueva**, lo dice y suelta confeti; si no, te cuenta cuánto te falta para la siguiente.
- **En cada nivel:** bajo el título, tu insignia y cuántas XP faltan.
- **En la cabecera:** tu insignia y tus XP, siempre a la vista.
- **En Ranking:** tu insignia en grande y la **escalera completa**: las que ya ganaste en color y las que faltan apagadas.

Si subes de insignia sin cerrar una jugada (por ejemplo, con ítems de la mochila o hábitos de varios niveles), aparece un aviso breve.


---

## 6. Mochila de emergencia

Con **Sismo** como guía, arma tu kit de emergencia: **16 ítems** en cinco grupos.

| Grupo | Ítems |
|---|---|
| Agua y comida | agua potable, alimentos no perecederos, abrelatas y cubiertos |
| Salud | botiquín, medicamentos, tapabocas e higiene |
| Luz y comunicación | linterna con pilas, radio de pilas, silbato, cargador portátil |
| Documentos y dinero | copias de documentos, contactos en papel, algo de efectivo |
| Abrigo y familia | ropa y calzado, cobija, lo que necesiten niños, adultos mayores o mascotas |

- Marca cada ítem cuando **ya lo tengas guardado** (suma **5 XP**).
- La mochila de la izquierda **se va llenando** y muestra el porcentaje.
- **Personas en casa:** usa **−** y **+** (de 1 a 12) para que Sismo te recuerde pensar en esa cantidad de personas al calcular agua y alimentos.
- Sismo te da un mensaje según cuánto lleves. Revisa tu mochila de vez en cuando: pilas, fechas de vencimiento y medicamentos.

---

## 7. Agentes

Aquí conoces a quienes juegan contigo:

- **EL JEFE:** el **único agente con inteligencia artificial**. Te acompaña siempre: te recuerda, adapta los retos a tu casa y te explica por qué cada hábito importa. Celebra tus avances y te ayuda a retomar el ritmo.
- **Los salvadores** (H2O Guardian, Robot de energía, Fuego Guardian y Sismo): sus subagentes. Cada uno se encarga de un nivel y lanza la señal contra el enemigo.
- **Los enemigos:** Voraz Sequía, Derroche Vampiro, Solazo, La Chispa y Réplica. Cada tarjeta explica de qué se alimentan, qué los debilita y por qué importa ese hábito.

> En este prototipo los mensajes de los agentes están **escritos de antemano**. En la versión final los generará la IA de EL JEFE según tus hábitos.

---

## 8. Familia

Aquí inscribes a tu familia para que **todos hagan las actividades** y puedan compararse.

### 8.1 Inscribir y organizar

1. **Nombre de la familia:** escribe uno (opcional) y toca **Guardar**.
2. **Inscribir a un integrante:** escribe su nickname y toca **Inscribir**. Aplican las mismas reglas del apartado 2.3.

### 8.2 Jugar como otro integrante

En este prototipo **la familia comparte el dispositivo**. Para que otra persona marque sus hábitos, toca **Jugar como [nickname]** en su fila. Verás de inmediato su progreso: retos, historia y mochila son propios de cada integrante.

### 8.3 El ranking familiar

Cada fila muestra el puesto, el nickname, la insignia y cuatro datos: **XP**, **racha**, **hábitos de hoy** y **jugadas**. Además indica un estado:

| Estado | Cuándo aparece |
|---|---|
| **Va liderando** | Es quien más XP tiene (cuando hay al menos dos integrantes). |
| **Al día** | Ha marcado hábitos recientemente. |
| **Necesita ayuda** | Lleva **2 o más días** sin marcar hábitos, **aún no ha empezado**, o va **muy atrás** del grupo (menos del 40 % de las XP del líder). |

Para quien necesita ayuda, toca **Dar ánimo**: la próxima vez que esa persona juegue verá un aviso «X te mandó ánimo». Con **Quitar** retiras a un integrante y **se borra su progreso** de este dispositivo (te pide confirmación).

> El ranking multi-dispositivo (cada persona desde su propio celular) requiere un servidor y llegará en la versión final. Los nicknames y el progreso se guardan solo en este dispositivo.

---

## 9. Ranking personal

Muestra **tu** progreso:

- **Insignia actual** y cuántas XP te faltan para la siguiente (la escalera completa está en el apartado 5).
- **Últimos 7 días:** barras con los hábitos marcados cada día.
- **Dominio esta semana:** el porcentaje que llevas en cada nivel.
- **Tu escalera de insignias:** las seis, con las ganadas en color.

### Reiniciar mi progreso

Al final hay un botón **Reiniciar mi progreso**. Toca una vez y luego **de nuevo para confirmar**. Se borran los hábitos y la mochila **del jugador activo** en este dispositivo. No afecta a los demás integrantes.

---

## 10. El JEFE (chat de apoyo)

El botón **EL JEFE** (abajo a la derecha) abre un chat. Tienes botones de preguntas rápidas o puedes escribir:

- *¿Cuál es mi siguiente reto?* — te dice qué nivel sigue y cuántos hábitos te faltan.
- *¿Estoy listo para el fuego?* — revisa tus tres pasos de preparación.
- *¿Cómo voy?* — XP, insignia, racha y jugadas completadas.
- Consejos sobre **agua, energía, calor, fuego, sismo, mochila, números de emergencia** y **El Niño**.
- *Huelo gas, ¿qué hago?* — no enciendas luces ni fósforos, abre ventanas, cierra la llave si es seguro, sal y llama al 123.

Si no entiende algo, te sugiere temas. Se cierra con la **×** o con **Esc**.

> En este prototipo responde con **textos predefinidos**. En la versión final lo atenderá la IA.

---

## 11. Si hay una emergencia real

El juego **no es un sistema de alertas**. Si hay fuego, olor a gas, un sismo o riesgo para alguien:

1. Ponte a salvo y sal con tu familia.
2. **Llama al 123.**
3. Sigue las indicaciones de bomberos y de la gestión del riesgo de tu municipio.

---

## 12. Instalar la app en el celular

La app funciona en el navegador de cualquier dispositivo y se puede **instalar** para abrirla a pantalla completa y usarla **sin conexión**.

| Dispositivo | Cómo |
|---|---|
| **Android / computador (Chrome, Edge)** | Al final de la portada toca **Instalar la app** (si aparece), o usa el menú del navegador → **Instalar app** / **Añadir a pantalla de inicio**. |
| **iPhone y iPad** | Abre la página en **Safari** → **Compartir** → **Añadir a pantalla de inicio**. |
| **APK de Android** | **Aún no existe.** El botón «APK para Android» de la portada es solo una **propuesta visual de desarrollo futuro**: no descarga nada. Por ahora instala la app desde el navegador, como en las filas de arriba. |

---

## 13. Accesibilidad

- Todo se puede usar con **teclado**: **Tab** para avanzar, **Enter** para activar, **Esc** para cerrar menús y ventanas.
- Las ventanas emergentes devuelven el foco al lugar donde estabas.
- Se respeta la preferencia de **movimiento reducido** del dispositivo.
- El diseño se adapta a pantallas de celular, tableta y computador.

---

## 14. Preguntas frecuentes

**¿Se pierde mi progreso si cierro el navegador?**
No. Se guarda en el dispositivo. Se pierde si borras los datos del navegador o si usas **Reiniciar mi progreso** o **Quitar**.

**¿Por qué no me sale el APK?**
Todavía no existe: es una propuesta para una versión futura y el botón de la portada es solo visual. Puedes instalar la app desde el navegador (apartado 12); es el mismo juego.

**¿Puedo jugar desde otro celular con mi misma familia?**
Todavía no: el ranking familiar funciona en un solo dispositivo. La sincronización llegará con la versión final.

**¿Tengo que completar la jugada el mismo día?**
No. El avance de la jugada se conserva entre días.

**¿Pierdo XP si cae mi salvador?**
No. La jugada se repite con los mismos hábitos. Además, reconocer un descuido suma 2 XP (hasta 3 al día).

**Marqué un hábito por error.**
Desmárcalo tocando la casilla de nuevo.

**No me deja crear mi nickname.**
Revisa que tenga de 2 a 16 caracteres, sin espacios, y que no esté ya inscrito en tu familia.

**¿Cuándo termina el juego?**
No termina: los hábitos no se acaban, cada nivel tiene 18 y se repiten. Repetirlos sigue sumando XP hasta llegar a la insignia **Leyenda** (1300 XP).

**¿Funciona sin internet?**
Sí, una vez instalada o cargada, la app guarda lo necesario para abrirse sin conexión. Las fuentes de texto externas pueden verse con una tipografía de respaldo.

---

## 15. Glosario

- **Nivel:** cada uno de los cinco temas (Agua, Energía, Calor, Fuego, Sismo).
- **Jugada:** 3 hábitos buenos y 3 descuidos de un nivel, en una carrera entre dos barras de vida.
- **Descuido:** un hábito negativo; marcarlo es reconocer que lo hiciste hoy y fortalece al enemigo.
- **Insignia:** peldaño de la escalera (Aspirante a Leyenda) que se gana con XP.
- **Salvador:** el aliado de cada nivel; lanza la señal contra el enemigo.
- **Enemigo:** la amenaza de cada nivel, que pierde vida con tus hábitos.
- **EL JEFE:** el agente con IA que te acompaña.
- **El JEFE:** el chat de apoyo.
- **XP:** puntos de experiencia (10 por hábito y 5 por ítem de la mochila).
- **Racha:** días seguidos con al menos un hábito marcado.
- **Nickname:** tu nombre en el juego y en el ranking familiar.

---

*NIDO (¿Y si pasa hoy?) es un juego serio diseñado por ARCADE. Prototipo en desarrollo; los consejos de seguridad son generales y no reemplazan las indicaciones de la gestión del riesgo municipal.*
