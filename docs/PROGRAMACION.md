# Producción y programación

## Plan de grabación (`#fabrica`, debajo de la aprobación por lotes)
- Si la semana guarda un plan escrito (`weeks.shootPlan`), la app muestra las estaciones, los materiales con SKU, la preparación del iPhone y una casilla por toma. Las casillas se guardan en `weeks.shootChecks`.
- Si no hay plan escrito, la app arma una lista automática de las tomas pendientes, agrupadas por producto.
- "Descargar plan (.txt)" genera una versión para leer sin conexión.
- En el editor de Reel, **Material recibido** solo se activa cuando el Reel tiene un video real. Quita el pendiente y deja el Reel en *Pendiente de aprobación*, nunca en *Terminado*.

## Paquete para programar (Instagram + Facebook)
El botón "Paquete para programar (IG + FB)" exporta las piezas aprobadas de la semana:

| Carpeta | Regla |
|---|---|
| `01_listos_para_programar/` | Sin material pendiente, sin `[confirmar…]` en el contenido y en estado *Terminado* |
| `02_requieren_confirmacion/` | Contenido con `[confirmar…]` o sin aprobación final; trae `CONFIRMAR.txt` con cada dato |
| `03_requieren_material/` | Falta grabación o foto real; trae `PENDIENTE.txt` |

- **Nombres de carpeta:** `AAAA-MM-DD_HHMM_dia_formato_titulo/`, solo con caracteres ASCII.
- **Archivos:**
  - carruseles: `NN_1080x1350.png`;
  - Stories: `story_NN_1080x1920.png` más `stickers.txt`;
  - Reels: portada o paquete CapCut;
  - copies: `copy_instagram.txt` y `copy_facebook.txt`.
- **`manifiesto_programacion.csv`:** una fila por pieza y red, con estas columnas: pieza, fecha, hora, zona horaria, día, red, tipo de publicación, archivos, texto, enlace, stickers, estado, publicable (SI/NO), motivo y fuente del horario.
- **Horas:**
  - Si la semana tiene `bestTimes` (datos de Metricool), la app usa la hora de mayor actividad dentro de una ventana por formato: carrusel 9–11, Story 11–14, Reel 17–20.
  - Las ventanas las define Content HQ; las cifras vienen de Metricool.
  - Sin datos, usa 10:00, 12:00 y 18:00 y lo indica en la columna `fuente_horario`.
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
