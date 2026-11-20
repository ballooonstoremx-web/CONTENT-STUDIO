# Generar con IA (Claude) en Content HQ

Sección `#ia` de `web/content-hq.html`. No usa claves de API ni servicios
adicionales: la generación corre en la cuenta de Claude de quien abre la app.

## Dos caminos

| | Directo (en la app) | Asistido (copiar y pegar) |
|---|---|---|
| Dónde funciona | Solo en la app publicada en claude.ai | En cualquier lado, también en local (`studio.py web`) |
| Cómo llama a Claude | `claude.use("sample")` del runtime del Artifact; envía la foto como JPEG | Copias las instrucciones, las pegas en claude.ai y adjuntas la foto |
| Permiso | claude.ai lo pide la primera vez; si lo niegas, la app oculta este camino | No aplica |
| Costo | Consume tu uso de Claude (plan actual); nada nuevo que contratar | Igual: tu uso normal de Claude en el chat |
| Regreso a la app | Automático | Pegas la respuesta (JSON, con o sin bloque de código) y pulsas “Importar” |

## Qué es automático y qué requiere tu intervención

Automático:
- Armar las instrucciones con el Brand Brain, tus datos confirmados y la foto.
- (Camino directo) Enviar a Claude y recibir las propuestas.
- Leer la respuesta, validar su estructura y revisar reglas de marca: precios,
  existencias, descuentos, promesas de envío y hooks de más de 9 palabras.
- Convertir cada propuesta en un borrador: diapositivas con la foto real en las
  de producto, guion y toma del Reel, historias de Stories, notas con el
  “material real que falta” y lo que hay que confirmar.
- Exportar: carrusel (PNG 1080×1350), Reel (paquete CapCut) y Stories (PNG 1080×1920
  con recuadro donde va el sticker).

Requiere tu intervención:
- Escribir el nombre exacto del producto y pegar los datos confirmados de la ficha.
- Elegir la foto real de la biblioteca.
- Flujo asistido: copiar, pegar en claude.ai, adjuntar la foto y pegar la respuesta.
- Revisar cada propuesta, guardar o descartar, y resolver las alertas.
- Grabar las tomas reales que pide el Reel y poner los stickers de Stories en Instagram.
- Aprobar (`terminado`) y publicar manualmente. La app no publica.

## Pruebas
- `tests/e2e/web_e2e.mjs` prueba el camino directo con un simulador del contrato
  `sample` (prompt, foto JPEG, propuestas, permiso negado) y el asistido con una
  respuesta en bloque de código. La llamada real a Claude dentro de claude.ai no se
  puede ejecutar desde el entorno de pruebas.
- Recorrido real (asistido) con tres productos del catálogo de Shopify
  (lectura únicamente): Estrella 18" Iridiscente Pastel (Reel), Número 34" Rosa Gold
  (carrusel) y 17" Tie Dye Birthday (Stories), con exportaciones verificadas.
