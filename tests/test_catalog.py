"""Catalog builder: verified Shopify data without prices or stock, official photos as JPEG."""
import json
import sys
import tempfile
import unittest
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "scripts"))
import catalog_build  # noqa: E402


class CatalogTests(unittest.TestCase):
    def test_description_drops_price_stock_and_guarantee_claims(self):
        text = "Globo de 45 cm. Somos los proveedores con los mejores precios garantizados. Hay existencias hoy. Ideal para arcos."
        self.assertEqual(catalog_build.clean_description(text), "Globo de 45 cm. Ideal para arcos.")

    def test_rejects_price_or_inventory_fields(self):
        for bad in ("price", "inventoryQuantity", "totalInventory"):
            with self.assertRaises(ValueError):
                catalog_build.validate({"title": "x", "handle": "x", "image": "a.png", bad: 1})
        with self.assertRaises(ValueError):
            catalog_build.validate({"title": "x", "handle": "../x", "image": "a.png"})

    def test_only_shopify_cdn_or_local_images(self):
        with self.assertRaises(ValueError):
            catalog_build.fetch("https://example.com/a.png", ROOT)

    def test_build_offline_produces_metadata_and_import_bundle(self):
        with tempfile.TemporaryDirectory() as tmp:
            tmp = Path(tmp)
            Image.new("RGBA", (1200, 800), (234, 69, 102, 128)).save(tmp / "p.png")
            (tmp / "source.json").write_text(json.dumps({"fetchedAt": "2026-11-18", "products": [{
                "id": "1", "title": "34\" Número QA", "handle": "numero-qa", "vendor": "Anagram", "type": "Globo Metálico",
                "tags": ["Números", "Globo Metálico"], "skus": [["QA-1", "0"], ["", "1"]],
                "description": "Número de 86 cm. Los mejores precios del mercado.", "image": "p.png", "alt": "QA"}]}))
            n = catalog_build.build(tmp / "source.json", tmp / "out", tmp / "import.json")
            self.assertEqual(n, 1)
            meta = json.loads((tmp / "out" / "catalog.json").read_text())
            prod = meta["products"][0]
            self.assertEqual(prod["url"], "https://balloonstoreco.com/products/numero-qa")
            self.assertEqual(prod["skus"], [{"sku": "QA-1", "variant": "0"}])
            self.assertEqual(prod["description"], "Número de 86 cm.")
            self.assertNotIn("Globo Metálico", prod["tags"])
            bundle = json.loads((tmp / "import.json").read_text())
            self.assertEqual(bundle["kind"], "catalog")
            self.assertTrue(bundle["products"][0]["images"][0]["dataUrl"].startswith("data:image/jpeg;base64,"))
            img = Image.open(tmp / "out" / "images" / "numero-qa.jpg")
            self.assertEqual((img.format, max(img.size)), ("JPEG", 900))
            self.assertNotRegex(json.dumps(bundle), r'"(price|inventory|precio)')

    def test_committed_catalog_has_no_prices(self):
        meta = json.loads((ROOT / "catalog" / "catalog.json").read_text(encoding="utf-8"))
        self.assertGreaterEqual(meta["count"], 30)
        text = json.dumps(meta, ensure_ascii=False)
        self.assertNotRegex(text, r'"(price|inventory)|\$\s?\d|precio')
        for p in meta["products"]:
            self.assertTrue(p["url"].startswith("https://balloonstoreco.com/products/"))


if __name__ == "__main__":
    unittest.main()
