# Producción y programación

## Plan de grabación (`#fabrica`, debajo de la aprobación por lotes)
- Si la semana guarda un plan escrito (`weeks.shootPlan`), la app muestra las estaciones, los materiales con SKU, la preparación del iPhone y una casilla por toma. Las casillas se guardan en `weeks.shootChecks`.
- Si no hay plan escrito, la app arma una lista automática de las tomas pendientes, agrupadas por producto.
- "Descargar plan (.txt)" genera una versión para leer sin conexión.
- La semana del 23 nov guarda un **plan esencial de 90 minutos** (`shootPlan`): 15 tomas en 4 bloques. A1 Ventana, A2 Escala y A3 Mesa de baby shower (60 min) cubren los Reels de lunes a jueves. B1 Látex (30 min, si alcanza) cubre sábado y domingo. El Reel del viernes 27 (arco perla) queda fuera de la sesión. El plan completo de 4 horas sigue guardado en `shootPlanFull`.
- En el editor de Reel, **Material recibido** solo se activa cuando el Reel tiene un video real. Quita el pendiente y deja el Reel en *Pendiente de aprobación*, nunca en *Terminado*.

## Paquete para programar (Instagram + Facebook)
El botón "Paquete para programar (IG + FB)" exporta las piezas aprobadas de la semana:

| Carpeta | Regla |
|---|---|
| `01_listos_para_programar/` | Sin material pendiente, sin `[confirmar…]` en el contenido y en estado *Terminado* |
| `02_requieren_confirmacion/` | Contenido con `[confirmar…]`, texto recortado en la imagen, pieza corregida pendiente de revisión del propietario (`ownerReview`) o sin aprobación final; trae `CONFIRMAR.txt` con el motivo |
| `03_requieren_material/` | Falta grabación o foto real; trae `PENDIENTE.txt` |

- **Nombres de carpeta:** `AAAA-MM-DD_HHMM_dia_formato_titulo/`, solo con caracteres ASCII.
- **Archivos:**
  - carruseles: `NN_1080x1350.jpg`;
  - Stories: `story_NN_1080x1920.jpg` (versión limpia, sin el recuadro guía del sticker) más `stickers.txt`;
  - Reels: portada o paquete CapCut;
  - copies: `copy_instagram.txt` y `copy_facebook.txt`.
- **`manifiesto_programacion.csv`:** una fila por pieza y red, con estas columnas: pieza, fecha, hora, zona horaria, día, red, tipo de publicación, archivos, texto, enlace, stickers, modo de publicación (`Automático` o `Manual: agregar stickers en la app`), estado, publicable (SI/NO), motivo y fuente del horario.
- **Horas:**
  - Si la semana tiene `bestTimes` (datos de Metricool), la app usa la hora de mayor actividad dentro de una ventana por formato: carrusel 9–11, Story 11–14, Reel 17–20.
  - Las ventanas las define Content HQ; las cifras vienen de Metricool.
  - Sin datos, usa 10:00, 12:00 y 18:00 y lo indica en la columna `fuente_horario`.
- **Formato:** todas las imágenes salen en JPEG, el único formato de imagen que acepta la publicación por API de Instagram.
- **Stories con sticker** (encuesta, quiz, preguntas, enlace): la API de Instagram y Facebook no coloca stickers interactivos, así que van como `Manual`. Se publican desde la app (en Metricool, con aviso al celular).
- **Revisión final del propietario:** una propuesta con `ownerReview` nunca sale como `LISTO`. Al marcarla como *Terminado* en el editor, ese indicador se limpia.
- **La app no publica ni programa.**

## Viabilidad de conectar Instagram y Facebook (revisión del 18 nov 2026, solo lectura)
- **Metricool:** el conector de esta sesión ve la marca *Balloon Store* con Instagram y Facebook conectados, zona America/Mexico_City.
  - `getBestTimeToPostByNetwork` funciona y ya alimenta las horas del manifiesto.
  - `createScheduledPost` existe, pero **exige URL públicas** para fotos y videos (o enlaces de Google Drive o Dropbox, si están vinculados en Metricool).
  - Los archivos de Content HQ son privados, así que no se pueden enviar directo.
  - Admite `draft: true` (borrador) y `autoPublish: false` (aviso en el celular para publicar a mano).
- **Ruta recomendada, cuando el propietario la autorice:** Claude Code sube solo las piezas `LISTO` a una carpeta de Google Drive del propietario y crea **borradores** en Metricool con la hora del manifiesto. El propietario revisa y confirma en Metricool. No se usa `autoPublish` sin aprobación.
- **Meta Graph API directa:** no se recomienda por ahora. Requiere una app de Meta, verificación del negocio y tokens; Metricool ya resuelve esa conexión.
- **No verificado:** si el plan de Metricool permite programar por API o por conector sin costo adicional. Se comprueba en el primer intento autorizado, con un solo borrador.

## Prueba de borrador en Metricool (18 nov 2026)
- **Pieza elegida:** el carrusel Orbz del lunes 23, a las 10:00 (5 JPEG de 1080×1350 más copy para Instagram y Facebook).
- **Ruta privada:** se creó la carpeta privada de Drive *Content HQ · prueba Metricool (privado)*, solo para el propietario y sin herencia de permisos.
- **Resultado: no se pudo subir.** Drive respondió *storage quota exceeded*, porque la cuenta no tiene espacio.
- **No se creó ningún borrador en Metricool, y nada se hizo público.**
- **Pendiente sin verificar:** si el plan de Metricool permite crear borradores por conector.

Alternativas seguras:
1. **Subida manual dentro de Metricool:** el propietario crea el borrador y arrastra los 5 JPEG. Es lo más seguro, porque nada sale de Metricool.
2. **Liberar espacio en Drive** y repetir la prueba privada. Solo funciona si Drive está vinculado dentro de Metricool. Si Metricool no puede leer el archivo privado, la prueba se detiene.
3. **Borrador solo con el copy por conector** y fotos agregadas a mano en Metricool. Esto sí verifica el permiso del plan.

Descartadas:
- carpetas públicas o "cualquiera con el enlace";
- subir archivos a Shopify Files (modifica la tienda).
