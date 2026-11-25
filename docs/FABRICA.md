# Fábrica semanal de contenido

## 1. Catálogo (`#catalogo`)
- **Fuente:** el conector de Shopify de solo lectura. `catalog/source.json` guarda nombre, SKU, marca, tipo, etiquetas, descripción corta y la URL de la foto oficial. **No incluye precios, inventario ni costos.**
- **Construcción:** `scripts/catalog_build.py` descarga las fotos solo desde `cdn.shopify.com` y las convierte a JPEG de 900 px. También quita frases de precio, existencias o garantías y genera:
  - `catalog/catalog.json`: los metadatos, guardados en Git;
  - `catalog/import/catalogo-balloon-store.json`: el archivo que importa la app, con las fotos incrustadas. Git lo ignora.
- **Importación en la app:** botón "Importar catálogo (.json)". Al volver a importar se actualizan los datos sin volver a subir fotos repetidas (las compara por su huella SHA-256).
- **Foto en Biblioteca:** "Usar foto" crea un acceso a la foto oficial sin duplicarla. Si borras ese acceso, la foto del catálogo no se borra.
- **Shopify en vivo:** solo dentro de claude.ai. Usa `search_products` con tu conexión y muestra nombre, SKU y estado. La app no puede cargar imágenes de `cdn.shopify.com` por su política de seguridad, así que un producto nuevo se guarda como "Solicitar importación" en la colección `requests`.

### Actualizar el catálogo
Pídele a Claude Code: "actualiza el catálogo de Content HQ" o "importa los productos solicitados". El proceso es:
1. Claude Code lee Shopify con el conector de solo lectura y actualiza `catalog/source.json`.
2. Ejecuta `python scripts/catalog_build.py`.
3. Importas el `.json` generado en Catálogo. Claude Code también puede subir directamente las fotos y los datos al Artifact.

## 2. Producción semanal (`#fabrica`)
- **Plan fijo de 21 piezas:** cada día 1 Reel, 1 carrusel y 1 Story.
  - Reel: alterna educativo y demostrativo.
  - Carrusel: alterna producto y consejo.
  - Story: rota novedad, interacción y venta.
- **Productos:** puedes elegirlos o dejar el modo automático, que elige 7 productos variados con foto, en orden estable.
- **Plan guardado:** el plan exacto se guarda al copiar o generar las instrucciones, así cada respuesta queda unida al producto con el que se escribió, aunque recargues la página.
- **Directo:** 7 solicitudes a Claude, una por día y de 2 en 2. **Asistido:** copias la semana completa en claude.ai y pegas la respuesta.
- **Estado de cada pieza (lo decide la app, no la IA):**
  - Reel sin video real del producto en Biblioteca: **Falta grabación**.
  - Carrusel o Story sin foto real: **Falta foto**.
  - Cualquier `[confirmar con catálogo real]`: **Datos por confirmar**.
- **Aprobación por lotes:** seleccionar todas, solo las listas o ninguna; regenerar una pieza con una indicación; descartar o recuperar.
- **Al aprobar,** cada pieza se convierte en contenido con su fecha y queda en el calendario:
  - archivos completos y sin datos por confirmar: **Terminado**;
  - archivos completos pero con datos por confirmar: **Pendiente de aprobación**;
  - le falta material: **Borrador**, con la lista de lo que falta. En el calendario aparece con borde punteado.
- **ZIP semanal:** `listos/` contiene las piezas con archivos completos y `pendientes/` las que llevan `PENDIENTE.txt`. Incluye `RESUMEN.csv` y `LEEME.txt`. Cada pieza trae copy para Instagram y versión para Facebook.
- **No publica ni programa nada** en cuentas externas.

## 3. Resultados (`#resultados`)
- **Captura manual por pieza:** plataforma (Instagram, Facebook o ambas), alcance, me gusta, comentarios, guardados, compartidos, visitas al perfil, clics, mensajes, pedidos atribuidos y ventas atribuidas (MXN).
- **Comparación** por formato, objetivo, producto, pilar, plataforma o día. Muestra:
  - alcance promedio;
  - tasa de interacción: (me gusta + comentarios + guardados + compartidos) ÷ alcance;
  - clics entre alcance;
  - pedidos y ventas.
- **Sin conexión verificada con Meta:** se mantiene la captura manual. El CSV exporta todos los campos.
