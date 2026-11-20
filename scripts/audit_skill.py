#!/usr/bin/env python3
"""Static, read-only review of a third-party skill or plugin folder before installing it.

It never executes or imports the code it inspects. It reports: license, skills found,
`allowed-tools` grants, code files, risky patterns (network, subprocess, eval, install
hooks, curl|sh), auto-run hooks and API keys the code expects.

Usage: python3 -I scripts/audit_skill.py <folder> [<folder> ...] [--json]
"""
import json
import re
import sys
from pathlib import Path

CODE_EXT = {".py", ".js", ".mjs", ".cjs", ".ts", ".tsx", ".sh", ".bash", ".ps1", ".rb", ".go"}
SKIP_DIRS = {".git", "node_modules", "dist", "build", "__pycache__", ".venv"}
RISK = {
    "network": r"\b(urllib\.request|requests\.|http\.client|socket\.|fetch\(|axios|XMLHttpRequest|https?\.request\()",
    "subprocess": r"\b(subprocess\.|os\.system|os\.popen|child_process|execSync|spawn\(|exec\()",
    "dynamic-code": r"\b(eval\(|new Function\(|__import__\(|pickle\.loads)",
    "pipe-to-shell": r"(curl|wget)[^\n|]*\|\s*(ba|z)?sh",
    "writes-home": r"(~/\.|expanduser\(|os\.homedir\(|\$HOME)",
}
KEY_RE = re.compile(r"\b([A-Z][A-Z0-9_]*(?:API_KEY|TOKEN|SECRET)[A-Z0-9_]*)\b")


def files(root):
    for p in sorted(root.rglob("*")):
        if p.is_file() and not any(part in SKIP_DIRS for part in p.parts):
            yield p


def frontmatter(text):
    m = re.match(r"---\n(.*?)\n---", text, re.S)
    return m.group(1) if m else ""


def audit(root):
    root = Path(root).resolve()
    lic = next((p for p in root.iterdir() if p.name.upper().startswith(("LICENSE", "LICENCE", "COPYING"))), None)
    lic_head = lic.read_text(errors="replace").strip().splitlines()[0] if lic else ""
    out = {"path": str(root), "license": lic_head or "NINGUNA (no se puede redistribuir)", "skills": [], "allowed_tools": {},
           "code_files": [], "risks": {}, "auto_run": [], "api_keys": set()}
    for p in files(root):
        rel = str(p.relative_to(root))
        try:
            text = p.read_text(errors="replace")
        except OSError:
            continue
        if p.name == "SKILL.md":
            fm = frontmatter(text)
            name = re.search(r"^name:\s*(.+)$", fm, re.M)
            out["skills"].append(name.group(1).strip() if name else rel)
            tools = re.search(r"allowed-tools:\s*((?:\n\s*-.*)+|.+)", fm)
            if tools:
                grants = [t.strip(" -'\"") for t in re.split(r"[\n,]", tools.group(1)) if t.strip(" -")]
                out["allowed_tools"][rel] = grants
        if p.suffix in CODE_EXT:
            out["code_files"].append(rel)
            for k, rx in RISK.items():
                if re.search(rx, text):
                    out["risks"].setdefault(k, []).append(rel)
        if p.suffix == ".json" and re.search(r'"(PreToolUse|PostToolUse|UserPromptSubmit|SessionStart|Stop|Notification)"', text):
            out["auto_run"].append(rel + " (hooks de Claude Code)")
        elif "hooks" in p.parts[:-1] and p.suffix == ".sh":
            out["auto_run"].append(rel)
        if p.name == "package.json":
            try:
                scripts = json.loads(text).get("scripts", {})
            except ValueError:
                scripts = {}
            for k in ("preinstall", "install", "postinstall", "prepare"):
                if k in scripts:
                    out["auto_run"].append(f"{rel}: {k} → {scripts[k]}")
        if p.name in ("install.sh", "setup.sh"):
            out["auto_run"].append(rel)
        out["api_keys"].update(KEY_RE.findall(text))
    out["api_keys"] = sorted(out["api_keys"])
    broad = [g for gs in out["allowed_tools"].values() for g in gs if re.fullmatch(r"Bash(\((python3?|node|npx|sh|bash) \*\))?", g)]
    out["broad_grants"] = broad
    return out


def main(argv):
    as_json = "--json" in argv
    results = [audit(a) for a in argv if a != "--json"]
    if as_json:
        print(json.dumps(results, ensure_ascii=False, indent=1))
        return 0
    for r in results:
        print(f"## {r['path']}")
        print(f"- Licencia: {r['license']}")
        print(f"- Skills ({len(r['skills'])}): {', '.join(r['skills'][:20])}{' …' if len(r['skills']) > 20 else ''}")
        print(f"- Archivos de código: {len(r['code_files'])}")
        for k, v in r["risks"].items():
            print(f"- Riesgo {k}: {len(v)} archivo(s), p. ej. {', '.join(v[:3])}")
        if r["broad_grants"]:
            print(f"- Permisos amplios en allowed-tools: {', '.join(r['broad_grants'])}")
        if r["auto_run"]:
            print(f"- Se ejecuta solo (hooks/instalación): {'; '.join(r['auto_run'][:5])}")
        if r["api_keys"]:
            print(f"- Claves que espera: {', '.join(r['api_keys'][:8])}")
        print()
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
