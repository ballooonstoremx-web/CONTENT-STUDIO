"""Skills de terceros: copias sin modificar, con licencia, sin choques de nombre y sin copia paralela de la marca."""
import hashlib
import json
import os
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
MAN = json.loads((ROOT / "skills" / "third_party" / "manifest.json").read_text(encoding="utf-8"))


class ThirdPartySkillTests(unittest.TestCase):
    def test_files_match_recorded_checksums(self):
        for src in MAN["sources"]:
            self.assertTrue((ROOT / "skills" / "third_party" / src["name"] / "LICENSE").is_file(), src["name"])
            self.assertRegex(src["commit"], r"^[0-9a-f]{40}$")
            for sk in src["skills"]:
                base = ROOT / "skills" / "third_party" / src["name"] / sk["name"]
                on_disk = {str(p.relative_to(base)) for p in base.rglob("*") if p.is_file() and "__pycache__" not in p.parts}
                self.assertEqual(on_disk, set(sk["files"]), sk["name"])
                for rel, digest in sk["files"].items():
                    self.assertEqual(hashlib.sha256((base / rel).read_bytes()).hexdigest(), digest, f"{sk['name']}/{rel}")
            for res in src.get("resources", []):
                for rel, digest in res["files"].items():
                    self.assertEqual(hashlib.sha256((ROOT / res["path"] / rel).read_bytes()).hexdigest(), digest, rel)

    def test_links_and_no_name_conflicts(self):
        own = {p.name for p in (ROOT / "skills").iterdir() if p.is_dir() and p.name != "third_party"}
        for src in MAN["sources"]:
            for sk in src["skills"]:
                self.assertNotIn(sk["name"], own)
                target = f"../../skills/third_party/{src['name']}/{sk['name']}"
                self.assertEqual(os.readlink(ROOT / ".agents" / "skills" / sk["name"]), target)
                claude = ROOT / ".claude" / "skills" / sk["name"]
                self.assertEqual(claude.is_symlink(), sk["claude_code"], sk["name"])

    def test_brand_context_is_a_pointer_not_a_copy(self):
        text = (ROOT / ".agents" / "product-marketing.md").read_text(encoding="utf-8")
        self.assertIn("brand/BRAND-BRAIN.md", text)
        self.assertIn("brand/profile.json", text)
        self.assertLess(len(text), 1200)
        self.assertEqual((ROOT / "CLAUDE.md").read_text(encoding="utf-8").strip(), "@AGENTS.md")

    def test_auditor_flags_risky_patterns(self):
        import subprocess, sys, tempfile
        with tempfile.TemporaryDirectory() as tmp:
            d = Path(tmp)
            (d / "SKILL.md").write_text("---\nname: x\nallowed-tools:\n  - Bash(python3 *)\n---\n", encoding="utf-8")
            (d / "run.py").write_text("import urllib.request, subprocess\nsubprocess.run(['ls'])\nOPENAI_API_KEY=1\n", encoding="utf-8")
            (d / "h.json").write_text('{"hooks":{"Stop":[]}}', encoding="utf-8")
            out = json.loads(subprocess.run([sys.executable, "-I", str(ROOT / "scripts" / "audit_skill.py"), str(d), "--json"], capture_output=True, text=True, check=True).stdout)[0]
            self.assertIn("network", out["risks"]); self.assertIn("subprocess", out["risks"])
            self.assertEqual(out["broad_grants"], ["Bash(python3 *)"]); self.assertIn("OPENAI_API_KEY", out["api_keys"])
            self.assertTrue(out["auto_run"]); self.assertTrue(out["license"].startswith("NINGUNA"))


if __name__ == "__main__":
    unittest.main()
