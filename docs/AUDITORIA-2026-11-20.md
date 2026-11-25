# Auditoría, referencias y avances (20 nov 2026)

## Fase A · Referencias analizadas

**Enlaces que no se pudieron abrir.** Las páginas no se pudieron leer porque la red de esta sesión no tiene esos dominios permitidos. No se afirma nada sobre lo que prometen.

- instagram.com/p/DfoGhl4s1xb
- nonlinear.lorenhogue.com
- thestartupmom.com
- canva.link
- justyn.ai
- theaotp.com
- tododeia.com

**Lo que se analizó con tus capturas (observado, no anunciado):**

| Referencia | Qué se ve | Qué adoptamos (sin copiar diseño ni textos) |
|---|---|---|
| «AI Marketer» de @aluncreative (Reel publicitario: 5,699 me gusta, 9,543 comentarios y 5,006 compartidos en tu captura) | Asistente en 4 pasos: **Brand** (colores, fuentes, banco de imágenes, «tus palabras»), **Hooks** (seis hooks sobre una sola toma, en varios estilos de texto), **Week** (tablero de 7 días con formato por pieza) y **Everything** («one idea, every channel»: carrusel de 10, Reel y Story; «reel first, the rest comes from it»). Pide comentar «TEAM». | Pantalla **Estudio** (`#flujo`) con los mismos 4 pasos, construida sobre lo que ya existía: marca de `profile.json`, banco de imágenes de la Biblioteca, hooks del banco y del investigador semanal, tablero semanal y «Una idea → todos los formatos». |
| Campaña VALTRA de @alluredesignsstudio_ | Una idea → mood board en Pinterest → prompts en ChatGPT → imágenes con Higgsfield (Nano Banana, Seedream) → animación con Kling o Seedance → montaje en CapCut. | El flujo «una idea → campaña» sí. La generación de imágenes y video con IA **no**: es de pago y la regla de marca prohíbe sustituir productos reales con imágenes generadas. |
| Planner mensual de @clarmstrong (capturas del 18 nov) | Calendario con miniaturas, cuadrícula de Instagram, aprobación y referencia «Inspired by» con métricas. | Ya existía desde el sprint anterior (Calendario, Ficha, banco de ideas con evidencia). |

## Lo que ya existía y se reutilizó

- **Inteligencia y análisis:** Inteligencia, Resultados IG, Diagnóstico, Competencia, Inspiración (guardar, analizar y adaptar), Banco de ideas e Investigador semanal (Metricool solo lectura, historial).
- **Planeación y diseño:**
  - Calendario mensual con miniaturas.
  - Ficha de publicación.
  - Editor de diseño por capas para carruseles y Stories (lo que se ve es lo que se descarga).
  - Reel con tomas reales y paquete CapCut.
- **Skills y memoria:** skills propias y de terceros revisadas (`docs/SKILLS-TERCEROS.md`), memoria de decisiones (`docs/DECISIONES.md`).

## Lo que se mejoró en este sprint

1. **Estudio (`#flujo`)**, en 4 pasos:
   - Marca: colores, tipografías, banco de imágenes y tus palabras.
   - Hooks: un hook en 4 estilos sobre la misma foto.
   - Semana: tablero de 7 días con arrastrar y soltar.
   - Todo.
2. **«Una idea → todos los formatos»:** solo con ideas aprobadas, crea en borrador un Reel (guion por beats y tomas pendientes), un carrusel ya editable por capas, Stories con stickers sugeridos, copy de Instagram y Facebook, y un **email solo como borrador**: no se envía ni toca Omnisend. Funciona con Claude dentro del Artifact o con una plantilla sin IA.
3. **Editor de Reel (`#video`)**, un editor real y no un ZIP de instrucciones:
   - Vista previa de las tomas reales en un canvas, con recortes (inicio y duración), orden, subtítulos con estilo, hook en pantalla y portada en JPG.
   - **Exportación de video desde el navegador:** MP4 cuando el navegador lo permite (probado: MP4 H.264 + AAC, 1080×1920), si no WebM.
   - **Versiones:** v1, v2… con nota. Se puede restaurar cualquiera sin perder las demás.
   - **Corrección por instrucción:** Claude edita la línea de tiempo con las tomas existentes y guarda antes la versión anterior.
   - **Proyecto para render en la nube:** un JSON.
4. **Render en la nube con FFmpeg** (`scripts/render_reel.py`), gratis y sin depender de tus computadoras:
   - Convierte ese JSON y tus archivos en un MP4 1080×1920 H.264/AAC.
   - Las fotos de producto quedan completas sobre fondo beige, sin márgenes blancos.
   - Agrega subtítulos con saltos de línea y el hook en los primeros 2.5 s.
   - Probado con fotos reales del catálogo (Orbz y Látex Surtido Perla).
5. **Pruebas automáticas:** 47 en verde, que cubren editor, versiones, corrección, exportación, formatos, Estudio y render.

## Qué se instaló y probó

- **Skills:** las 8 de marketing (MIT) y 5 de Instagram Agent para Codex (MIT), más `skill-auditor`. Ver `docs/SKILLS-TERCEROS.md`.
- **Remotion 4.0.540:** evaluado en la nube (MP4 1080×1920, sin costo, licencia de evaluación). No se adopta como motor principal mientras no se confirme el tamaño del equipo. Se eligió **FFmpeg** porque es libre y no tiene esa condición.
- **Tarea programada de Claude Code (prueba única, 20 nov 02:35 UTC):** se ejecutó en la nube sin la app abierta y **guardó el informe en la base de la app** (`reports/rep-prueba-programada-20261120`). Lo que **falló** fue Metricool: la sesión programada no tenía el conector y respondió «No matching deferred tools found». La causa es que una tarea creada desde esta sesión no hereda conectores. Tu rutina de correo, creada desde claude.ai, sí trae Metricool entre sus conectores. Conclusión: la ejecución sin la app abierta funciona. Para que lea Metricool, la rutina semanal debe crearse desde claude.ai › Rutinas con el conector de Metricool activado.

## Pendiente

- **Ejecución recurrente real:** una tarea creada desde una sesión sin conectores no lleva Metricool. Para el investigador semanal automático, la rutina debe crearse desde claude.ai (Rutinas) con el conector de Metricool, o desde una sesión que lo tenga.
- **Material propio:** subir clips reales a la Biblioteca para producir Reels; la app no genera videos ficticios.
- **Competidores en Metricool:** darlos de alta para tener métricas de competencia verificables.
- **Referencias bloqueadas:** permitir sus dominios si quieres un análisis de las páginas además de las capturas.
- **Claude Video Vision:** requiere Node 24 y un backend de audio. Pendiente de tu autorización y de un MP4 propio.

## Lo que no se puede lograr gratis

- Generar imágenes o video con IA: Higgsfield, Kling, Seedance y Midjourney.
- Render en la nube con servicios dedicados: Shotstack (unos USD 0.20–0.30 por minuto), Creatomate (desde USD 41–54 al mes) y Remotion Lambda (licencia y AWS).
- Remotion en producción si Balloon Store tiene 4 personas o más (licencia de empresa).
- Métricas de cuentas ajenas sin Metricool. El scraping no es una fuente autorizada.

## Cómo usar cada función nueva

- **Estudio:** menú Planear › Estudio. Recorre Marca → Hooks → Semana → Todo. En «Todo», pulsa «Una idea → todos los formatos» en una idea aprobada.
- **Una idea → formatos:** también desde el Banco de ideas, con el botón «Todos los formatos» en ideas aprobadas. Revisa cada pieza en el Calendario o en su Ficha y apruébala ahí.
- **Editor de Reel:**
  1. En Crear › Reel, elige las tomas reales.
  2. Pulsa «Vista previa y video», o entra por Crear › Editor de Reel.
  3. Ajusta inicio y duración, subtítulos, estilo y portada.
  4. Pulsa «Guardar versión».
  5. «Exportar video» graba el resultado en tiempo real.
  6. Para una corrección, escribe la instrucción y pulsa «Aplicar corrección».
- **MP4 garantizado en la nube:** descarga «Proyecto para render en la nube» y pide a Claude Code: «renderiza este proyecto con scripts/render_reel.py». Comparte también tus archivos.

## Verificación del 24 nov 2026
- **Prueba programada.** Evidencia: transcripción de la sesión `session_01PpyLmiVuhGGG7FgJzLb3qZ` (origen `scheduled_trigger`, 02:35:03–02:35:26 UTC) y documento `reports/rep-prueba-programada-20261120` (versión 1, escrito 02:35:21 UTC).
  - Se ejecutó sin la app abierta.
  - **No tuvo Metricool:** `ToolSearch` respondió «No matching deferred tools found» dos veces y la tarea no lleva conectores (`mcp_connections: []`).
  - Sí guardó el informe, con ese error registrado.
  - La tarea ya no se repetirá (`ended_reason: run_once_fired`, desactivada).
  - **No se crearán más tareas programadas** hasta que la rutina se cree desde claude.ai › Rutinas con el conector de Metricool.
- **Error encontrado y corregido en el Editor de Reel.** Con proyectos de solo fotos, la exportación del navegador grababa menos de 1 segundo: Chrome deja de emitir cuadros de un canvas fuera del documento. Ahora el canvas se coloca en el documento, se envía cada cuadro y se agrega una pista de audio silenciosa. Resultado: 7.76 s, 450 cuadros, con audio. Una prueba automática cubre este caso.
- **Las fotos en el navegador ahora coinciden con el render en la nube:** producto completo sobre beige, sin márgenes, y hook con contorno legible.
- **Proyecto de ejemplo en Content HQ:** `items/reel-ejemplo-fotos-reales`, con 3 fotos reales de tu Biblioteca (Número 34" Rosa Gold, Estrella iridiscente pastel, Tie Dye Happy Birthday) y la versión v1 guardada.

## Investigador semanal automático (24 nov 2026)
- **Acceso a Metricool en esta sesión:** comprobado con consultas de solo lectura a la marca de Balloon Store (`getBrandSettings` y `getAnalyticsDataByMetrics`). Filas leídas del 25 ago al 23 nov:
  - Reels de Instagram: 27.
  - Publicaciones de Instagram: 13.
  - Publicaciones de Facebook: 16.
  - Reels de Facebook: 29.
  - Competidores, del 25 oct al 23 nov: 0 filas en cuentas, publicaciones y Reels, porque no hay competidores configurados en Metricool.
- **Conectores en rutinas:** una rutina conserva los conectores que tiene guardados. Por ejemplo, la de correo (`trig_015o6RtQ6SBFDRYDkLi3xRj6`) guarda Metricool y se ejecuta bien. Una tarea creada desde esta sesión no puede guardar conectores (`mcp_connections: []`).
- **Solución:** la rutina semanal está **vinculada a esta sesión** (`session_01PpyLmgy71H6tk2nsqzbvJU`), que ya tiene Metricool y la base de Content HQ.
  - Tarea: `trig_01P63oFN8UwryMN5fRbc85oh`, «Investigador semanal de Balloon Store (lunes)».
  - Horario: lunes 7:43, hora de Ciudad de México. Próxima ejecución: 30 nov.
  - Es la única tarea del investigador. La rutina de correo no se tocó.
- **Prueba completa (disparo manual, 24 nov, 02:01 UTC):** leyó Metricool y Content HQ y guardó `reports/rep-semanal-20261124-prueba` (versión 1, `scheduled: true`).
  - Contenido: 10 referencias, 5 ideas, 10 hooks, 3 metas y el plan del miércoles 25.
  - Se volvió a leer y es idéntico a lo enviado.
  - Se ve en la pantalla Semanal sin errores.
  - `settings/researcher` quedó como «activa», lunes 7:43.
- **Límites:**
  - La rutina depende de que esta sesión siga existiendo. Si se archiva, hay que crear la rutina desde claude.ai › Rutinas con el conector de Metricool.
  - Las métricas de competencia requieren dar de alta competidores en Metricool.
- **Error encontrado (sin corregir todavía):** «Guardar inspiración» no detecta como duplicado un enlace con el parámetro `cnvx`, porque falta en `URL_JUNK`. Por eso el Reel `Df2dfn_JWSG` aparece dos veces (`insp-planner-reel` y `mwobihk72lwjk6`). No se borró nada.

## Duplicados en Inspiración (25 nov 2026)

**Causa.** La detección comparaba los enlaces después de quitar una lista corta de parámetros. Esa lista no incluía `cnvx`, así que el Reel `Df2dfn_JWSG` de @clarmstrong se guardó dos veces: `insp-planner-reel` y `mwobihk72lwjk6`.

**Corrección (solo en Guardar inspiración):**

- `inspoKey()` es una clave nueva:
  - En Instagram, TikTok, YouTube, Facebook y Pinterest usa solo el identificador de la publicación. En Instagram, `/p/`, `/reel/`, `/reels/` y `/tv/` cuentan como la misma publicación, y el código distingue mayúsculas.
  - En otros sitios quita los parámetros de seguimiento y ordena los que quedan.
- **Parámetros de seguimiento que se quitan:** `cnvx`, `igsh`, `igshid`, todos los `utm_*`, `fbclid`, `gclid`, `msclkid`, `ttclid`, `mibextid`, `si`, `_r`, `_t`, `ig_rid` y otros.
- **Cada ficha nueva guarda tres enlaces:**
  - `urlOriginal`: tal cual se pegó.
  - `url`: limpio, para abrirlo.
  - `urlNorm`: la clave para detectar duplicados.
- La búsqueda de duplicados compara contra el enlace, el enlace original y el historial de enlaces de cada ficha.
- La ficha ahora muestra el enlace original y la clave.
- **Sin cambios:**
  - `normUrl`, que usa el Investigador semanal.
  - La rutina del Investigador.
  - Los datos guardados: no se reescribió ninguna ficha.

**Pruebas:**

- `tests/test_inspo_urls.py` y `tests/e2e/url_norm.mjs`: 34 casos.
  - Casos de mismo post: `cnvx`, `igsh`, `utm_*` y otros parámetros de seguimiento.
  - Casos de publicaciones distintas: otro código, mayúsculas, carruseles, historias, TikTok, YouTube, Facebook y un `id` web.
- El recorrido en navegador ahora incluye `cnvx` con `/p/`.
- Total: 49 pruebas en verde.

**Las dos fichas de @clarmstrong** siguen intactas. La fusión se propone y no se ha ejecutado.

### Fusión de las dos fichas de @clarmstrong (25 nov 2026, autorizada por la dueña)

- **Ficha principal:** `insp-planner-reel`, pasó de la versión 1 a la 2.
  - Sin cambios: captura (`thumbRef`), notas con las métricas de la captura, título, creador, colección, estado «adaptar» y enlace.
  - Se agregaron:
    - La etiqueta «AI».
    - Los dos enlaces originales de la segunda ficha, en «Enlaces anteriores».
    - Su único análisis, marcado como **sin captura, confianza baja**.
    - Sus dos entradas de historial, marcadas «[ficha fusionada …]».
    - Una entrada «Fusión: …».
- **Segunda ficha:** `mwobihk72lwjk6`, pasó de la versión 2 a la 3.
  - Estado «descartada», con `mergedInto: insp-planner-reel` y una entrada de historial.
  - Conserva todas sus etiquetas, enlaces, análisis e historial. No se borró ningún campo ni ningún documento.
- **Enlace entre fichas:** la ficha muestra «Fusionada en» y «Incluye la ficha fusionada», con botones para abrir la otra ficha. Es el único cambio en la app.
- **Cómo revertir:** cada ficha guarda en `mergeUndo.snapshot` una copia completa de cómo estaba antes. Para revertir, se escribe esa copia sobre cada ficha (ArtifactData `set` con `if_version`). La ficha descartada vuelve a «adaptar» y la principal a su versión 1.
- **Verificado sobre los datos guardados:**
  - Sin notas, métricas, análisis ni historial repetidos.
  - La búsqueda encuentra la ficha principal con cada etiqueta, por el creador y por el título.
  - El filtro «Descartada» muestra la segunda ficha.
  - Los botones abren una ficha desde la otra.
  - Las copias completas de ambas fichas son idénticas a las originales.
- **Pruebas:** 50 en verde.

## Prueba del flujo completo con `insp-planner-reel` (25 nov 2026)

**Cómo se hizo.** Se usó una copia de los datos reales de Content HQ en la app local, siguiendo los botones de la interfaz. El resultado se guardó en Content HQ con ArtifactData y se volvió a abrir desde los datos guardados.

- No se modificó código.
- Las respuestas de los botones de Claude (Analizar, Crear idea original, Todos los formatos) las redactó Claude en la sesión y pasaron por el código real de la app. En el Artifact, esos botones llaman a Claude directamente.

**Pasos:**

1. **Inspiración.** Se analizó con la captura y las notas (`basadoEn: captura + notas`, confianza media). El análisis anterior, sin captura, quedó en el historial. Las notas, la captura y la fusión no cambiaron.
2. **Idea.** «Un cumpleaños, tres niveles: arma tus paquetes con los mismos globos».
   - Toma de la referencia la mecánica de escalera, sin precios ni regalos.
   - Producto: Número 34" Rosa Gold.
   - Fotos reales: Tie Dye Happy Birthday, Estrella iridiscente y Número Rosa Gold.
3. **Banco de ideas.** La idea `mwwf6ui0hfpb8q` está enlazada a la inspiración y la inspiración registra la idea. La aprobó Claude para poder seguir el flujo; queda indicado en la idea y en las decisiones.
4. **Reel `mwwf6w6oc5maei` (2 dic).** Tiene 4 tomas de fotos reales con subtítulos y la versión v1 guardada. Se exportó en el navegador un MP4 de 1080×1920, 10.3 s, con audio.
5. **Carrusel `mwwf6w6vid1x05` (4 dic) y Stories `mwwf6w6v0mha00` (3 dic).**
   - Carrusel: 5 diapositivas editables por capas, con la foto oficial del producto en la portada.
   - Stories: 3 cuadros con encuesta y enlace sugeridos.
6. **Calendario.** Las 3 piezas aparecen como borrador y «Pendiente» de aprobación. Ninguna se aprobó, programó ni publicó.
7. **Fichas.** Las 3 abren, se editan, guardan y muestran la referencia a @clarmstrong con el enlace al Reel original. La ficha de inspiración muestra la idea creada.
8. **Persistencia.**
   - Al cerrar y abrir la app, todo sigue igual.
   - En Content HQ: 7 documentos escritos (3 piezas, 1 idea, 1 imagen de catálogo, 1 decisión y la inspiración). Las 8 piezas anteriores quedaron sin cambios.

**Pendiente manual:**

- Revisar y aprobar o pedir cambios en cada pieza.
- Fotos reales para las diapositivas 2 a 4 del carrusel y para las Stories.
- Una toma real del montaje con los 3 niveles.
- Confirmar la edad del número.
- Publicar o programar en Metricool.

**Hallazgo:** desde una pieza no hay un botón que abra la ficha de inspiración dentro de la app. Se vuelve por Inspiración (o Banco de ideas). La pieza solo enlaza al Reel original en Instagram.
