// Pruebas de la detección de duplicados en Inspiración (inspoKey, cleanUrl, findDupInspo) con el código real de la app.
import fs from "node:fs";
import vm from "node:vm";

const html = fs.readFileSync(process.argv[2], "utf8");
const start = html.indexOf("const URL_JUNK=");
const end = html.indexOf("function platformOf(");
const dupStart = html.indexOf("const inspoKeys=");
const dupEnd = html.indexOf("const histAdd=");
if (start < 0 || end < 0 || dupStart < 0 || dupEnd < 0) { console.log("FALTA código de URLs en la app"); process.exit(1); }
const ctx = { URL, URLSearchParams, S: { inspo: [] } };
vm.createContext(ctx);
vm.runInContext(html.slice(start, end) + html.slice(dupStart, dupEnd) + ";this.inspoKey=inspoKey;this.cleanUrl=cleanUrl;this.normUrl=normUrl;this.findDupInspo=findDupInspo;", ctx);
const { inspoKey, cleanUrl, normUrl, findDupInspo } = ctx;

let fails = 0;
const ok = (c, m) => { console.log((c ? "OK   " : "FALLA") + " " + m); if (!c) fails++; };
const same = (a, b, m) => ok(inspoKey(a) === inspoKey(b), `${m}: ${inspoKey(a)} = ${inspoKey(b)}`);
const diff = (a, b, m) => ok(inspoKey(a) !== inspoKey(b), `${m}: ${inspoKey(a)} ≠ ${inspoKey(b)}`);

const R = "https://www.instagram.com/reel/Df2dfn_JWSG/";
// 1. Mismo post de Instagram con parámetros de seguimiento
same(R, "https://www.instagram.com/reel/Df2dfn_JWSG/?cnvx=NTc4MTIwNjQ2YQ%3D%3D", "cnvx");
same(R, "https://www.instagram.com/reel/Df2dfn_JWSG/?utm_source=ig_web_copy_link&cnvx=NTc4MTIwNjQ2YQ==", "utm_source + cnvx (caso real de @clarmstrong)");
same(R, "https://www.instagram.com/reel/Df2dfn_JWSG/?igsh=MXRjZ2h3b2Q0eW1xZA==", "igsh");
same(R, "https://instagram.com/reel/Df2dfn_JWSG?igshid=YmMyMTA2M2Y=", "igshid, sin www ni barra final");
same(R, "https://www.instagram.com/reel/Df2dfn_JWSG/?utm_medium=share_sheet&utm_campaign=x&utm_content=y&utm_term=z&utm_id=1", "todos los utm_*");
same(R, "https://www.instagram.com/reel/Df2dfn_JWSG/?fbclid=IwAR0abc&gclid=Cj0K&mibextid=Zxz2cZ&si=abc&_r=1&_t=2", "fbclid, gclid, mibextid, si, _r, _t");
same(R, "https://www.instagram.com/reel/Df2dfn_JWSG/?ig_rid=1&ig_mid=2&img_index=1&hl=es#comments", "otros parámetros y #fragmento");
same(R, "https://m.instagram.com/clarmstrong/reel/Df2dfn_JWSG/", "con usuario en la ruta y dominio móvil");
same(R, "https://www.instagram.com/reels/Df2dfn_JWSG/", "/reels/ = /reel/");
same(R, "https://www.instagram.com/p/Df2dfn_JWSG/", "/p/ y /reel/ con el mismo código son la misma publicación");
same(R, "  www.instagram.com/reel/Df2dfn_JWSG  ", "sin https y con espacios");
// 2. Publicaciones diferentes no se confunden
diff(R, "https://www.instagram.com/reel/Df2dfn_JWSH/", "otro código de Reel");
diff(R, "https://www.instagram.com/reel/df2dfn_jwsg/", "mismo código en minúsculas (los códigos distinguen mayúsculas)");
diff(R, "https://www.instagram.com/reel/Df2dfn_JWS/", "código más corto");
diff("https://www.instagram.com/p/DesgI-piNuO/?img_index=1", "https://www.instagram.com/p/DeFxtNCCrV2/?img_index=1", "dos carruseles distintos");
diff(R, "https://www.instagram.com/clarmstrong/", "Reel vs perfil del creador");
diff("https://www.instagram.com/stories/marca/3311111111111111111/", "https://www.instagram.com/stories/marca/3311111111111111112/", "dos historias distintas");
diff("https://www.tiktok.com/@deco/video/7311111111111111111?is_from_webapp=1", "https://www.tiktok.com/@deco/video/7311111111111111112", "dos videos de TikTok");
diff("https://www.youtube.com/watch?v=abcDEF12345", "https://www.youtube.com/watch?v=abcDEF12346", "dos videos de YouTube");
diff("https://blog.ejemplo.com/articulo?id=1", "https://blog.ejemplo.com/articulo?id=2", "parámetro que sí identifica la página (id)");
diff("https://www.facebook.com/reel/1154080226955329", "https://www.facebook.com/reel/1154080226955330", "dos Reels de Facebook");
// 3. Otras plataformas: mismo contenido con seguimiento
same("https://www.tiktok.com/@deco/video/7311111111111111111?is_from_webapp=1&sender_device=pc&_t=8abc", "https://tiktok.com/@deco/video/7311111111111111111", "TikTok con seguimiento");
same("https://youtu.be/abcDEF12345?si=xyz", "https://www.youtube.com/watch?v=abcDEF12345&feature=share", "YouTube corto y largo");
same("https://www.youtube.com/shorts/abcDEF12345?feature=share", "https://youtu.be/abcDEF12345", "YouTube Shorts");
same("https://www.facebook.com/reel/1154080226955329/?mibextid=abc&rdt=1", "https://www.facebook.com/watch/?v=1154080226955329", "Facebook reel y watch");
same("https://www.pinterest.com.mx/pin/123456789/?utm_source=x", "https://pinterest.com/pin/123456789/", "Pinterest por país");
same("https://blog.ejemplo.com/a?b=2&a=1&utm_source=x", "https://blog.ejemplo.com/a?a=1&b=2", "web: orden de parámetros y utm");
// 4. Enlace limpio que se guarda para abrir
ok(cleanUrl("https://www.instagram.com/reel/Df2dfn_JWSG/?utm_source=ig_web_copy_link&cnvx=NTc4MTIwNjQ2YQ==") === R, "cleanUrl deja el Reel sin parámetros");
ok(cleanUrl("https://blog.ejemplo.com/articulo?id=1&utm_source=x&gclid=1#top") === "https://blog.ejemplo.com/articulo?id=1", "cleanUrl conserva id y quita seguimiento");
// 5. Búsqueda de duplicados con fichas existentes (también por enlace original e historial)
ctx.S.inspo = [
  { id: "insp-planner-reel", url: R },
  { id: "mwobihk72lwjk6", url: "https://www.instagram.com/reel/Df2dfn_JWSG/?cnvx=NTc4MTIwNjQ2YQ%3D%3D", urlOriginal: "https://www.instagram.com/reel/Df2dfn_JWSG/?utm_source=ig_web_copy_link&cnvx=NTc4MTIwNjQ2YQ==" },
  { id: "vieja", url: "https://www.instagram.com/reel/NUEVO123/", urlHistory: ["https://www.instagram.com/p/ANTES456/?igsh=1"] },
];
ok((findDupInspo("https://www.instagram.com/reel/Df2dfn_JWSG/?igsh=zzz") || {}).id === "insp-planner-reel", "detecta la ficha existente con igsh");
ok((findDupInspo(R, "insp-planner-reel") || {}).id === "mwobihk72lwjk6", "al excluir una ficha encuentra la otra copia (el duplicado real de @clarmstrong)");
ok((findDupInspo("https://instagram.com/p/ANTES456") || {}).id === "vieja", "detecta por enlaces anteriores del historial");
ok(findDupInspo("https://www.instagram.com/reel/OTRO999/?cnvx=abc") == null, "no marca como duplicado un Reel distinto");
// 6. normUrl (lo usa el Investigador semanal) no cambia
ok(normUrl("https://www.instagram.com/reel/Df2dfn_JWSG/?cnvx=abc") === "instagram.com/reel/Df2dfn_JWSG?cnvx=abc", "normUrl del Investigador sin cambios");

console.log(fails ? `${fails} fallas` : "todas las pruebas de enlaces pasaron");
process.exit(fails ? 1 : 0);
