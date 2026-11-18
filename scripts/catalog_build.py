#!/usr/bin/env python3
"""Build the Content HQ product catalog from verified Shopify data (read-only).

Input:  catalog/source.json — products read from Shopify (title, handle, SKUs,
        tags, short description, official image URL). Never prices or stock.
Output: catalog/catalog.json            metadata committed to Git
        catalog/import/catalogo-balloon-store.json  in-app import file with the
        official photos embedded as JPEG data URLs (ignored by Git)

Update flow: refresh catalog/source.json from Shopify (Claude Code with the
read-only Shopify connector, or an Admin export), run this script, then import
the generated file in Content HQ → Catálogo → “Importar catálogo”.
"""
import argparse
import base64
import hashlib
import io
import json
import re
import sys
import urllib.request
from datetime import datetime, timezone
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
SITE = "https://balloonstoreco.com/products/"
FORBIDDEN_KEYS = {"price", "prices", "compareAtPrice", "inventory", "inventoryQuantity", "totalInventory", "cost", "precio", "existencias"}
RISKY = re.compile(r"(precio|\$\s?\d|existencia|inventario disponible|garantizad|descuento|env[ií]o gratis)", re.I)
HANDLE = re.compile(r"[a-z0-9]+(?:-[a-z0-9]+)*\Z")


def clean_description(text):
    """Drop sentences that make price, stock or guarantee claims."""
    sentences = re.split(r"(?<=[.!?])\s+", (text or "").strip())
    kept = [s for s in sentences if s and not RISKY.search(s)]
    return " ".join(kept).replace("...", "").strip()


def validate(product):
    bad = FORBIDDEN_KEYS & set(product)
    if bad:
        raise ValueError(f"{product.get('handle')}: forbidden fields {sorted(bad)}")
    if not HANDLE.match(product.get("handle", "")):
        raise ValueError(f"invalid handle {product.get('handle')!r}")
    if not product.get("title") or not product.get("image"):
        raise ValueError(f"{product.get('handle')}: title and image are required")


def fetch(src, base):
    if re.match(r"https://cdn\.shopify\.com/", src):
        req = urllib.request.Request(src, headers={"User-Agent": "content-hq-catalog/1.0"})
        with urllib.request.urlopen(req, timeout=30) as r:
            return r.read()
    if "://" in src:
        raise ValueError("only https://cdn.shopify.com images or local files are allowed")
    path = (base / src).resolve()
    return path.read_bytes()


def to_jpeg(raw, max_side=900):
    im = Image.open(io.BytesIO(raw))
    im.load()
    if im.mode in ("RGBA", "LA", "P"):
        im = im.convert("RGBA")
        bg = Image.new("RGB", im.size, (255, 255, 255))
        bg.paste(im, mask=im.split()[-1])
        im = bg
    else:
        im = im.convert("RGB")
    im.thumbnail((max_side, max_side))
    out = io.BytesIO()
    im.save(out, "JPEG", quality=85, optimize=True)
    return out.getvalue(), im.size


def build(source_path, out_dir, import_path):
    source = json.loads(Path(source_path).read_text(encoding="utf-8"))
    base = Path(source_path).resolve().parent
    images_dir = out_dir / "images"
    images_dir.mkdir(parents=True, exist_ok=True)
    meta, bundle = [], []
    for p in source["products"]:
        validate(p)
        jpg, (w, h) = to_jpeg(fetch(p["image"], base))
        name = p["handle"] + ".jpg"
        (images_dir / name).write_bytes(jpg)
        rec = {
            "id": "shopify-" + str(p["id"]),
            "shopifyId": str(p["id"]),
            "title": p["title"],
            "handle": p["handle"],
            "url": SITE + p["handle"],
            "vendor": p.get("vendor", ""),
            "type": p.get("type", ""),
            "tags": [t for t in p.get("tags", []) if t not in ("Globo Metálico", "Globo Látex")],
            "skus": [{"sku": s, "variant": v} for s, v in p.get("skus", []) if s],
            "description": clean_description(p.get("description", "")),
            "images": [{"file": name, "alt": p.get("alt") or p["title"], "width": w, "height": h,
                        "sha256": hashlib.sha256(jpg).hexdigest()}],
            "source": "shopify",
        }
        meta.append(rec)
        img = dict(rec["images"][0])
        img["dataUrl"] = "data:image/jpeg;base64," + base64.b64encode(jpg).decode()
        bundle.append({**rec, "images": [img]})
    stamp = {"source": source.get("source", "Shopify"), "fetchedAt": source.get("fetchedAt"),
             "builtAt": datetime.now(timezone.utc).isoformat(timespec="seconds"), "count": len(meta)}
    (out_dir / "catalog.json").write_text(json.dumps({**stamp, "products": meta}, ensure_ascii=False, indent=1), encoding="utf-8")
    import_path.parent.mkdir(parents=True, exist_ok=True)
    import_path.write_text(json.dumps({"app": "balloon-store-content-hq", "kind": "catalog", **stamp, "products": bundle}, ensure_ascii=False), encoding="utf-8")
    return len(meta)


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--source", default=str(ROOT / "catalog" / "source.json"))
    ap.add_argument("--out", default=str(ROOT / "catalog"))
    ap.add_argument("--import-file", default=str(ROOT / "catalog" / "import" / "catalogo-balloon-store.json"))
    a = ap.parse_args()
    try:
        n = build(a.source, Path(a.out), Path(a.import_file))
    except (ValueError, OSError) as e:
        print(f"Error: {e}", file=sys.stderr)
        return 1
    print(f"{n} productos → {a.import_file}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
