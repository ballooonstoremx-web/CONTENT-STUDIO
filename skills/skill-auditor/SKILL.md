---
name: skill-auditor
description: Reviews a third-party skill, plugin, MCP server or connector before it is installed in this repository. Checks license, code, dependencies, permissions (allowed-tools), auto-run hooks, install scripts, network calls and API keys, then recommends install, adapt or reject. Use whenever someone wants to add an external skill or tool.
---

# Skill auditor

Project-authored. Never install or run third-party code before this review.

## Steps
1. Get the source read-only. Clone into an empty scratch folder outside the repo
   (`git clone --depth 1`), record the commit, and never run its install,
   setup, `npm install`, `postinstall` or hooks.
2. Run the static review, which does not import or execute the code:
   `python3 -I scripts/audit_skill.py <folder>`.
   Use `--json` if you need the result as data.
3. Read every flagged file yourself. A regex hit is a lead, not a verdict.
   Check for:
   - **License:** no license means it cannot be redistributed, so link to it, do not copy it.
   - **Broad `allowed-tools`:** for example `Bash`, `Bash(python3 *)`.
   - **Hooks that run on every session:** `hooks.json` with PreToolUse, Stop or SessionStart.
   - **Network calls and the hosts they reach.**
   - **Paid APIs and the keys they expect.**
   - **Writes outside the project:** for example `~/.claude/...`.
   - **`curl | sh`.**
4. Compare with what already exists: `skills/`, `skills/third_party/manifest.json`,
   `.claude/agents/`, and the plugins visible in the session. Do not add a second skill
   for a job one already covers. Adapt the useful part into the existing skill instead.
5. Classify the skill:
   - already installed;
   - adapt into an existing skill;
   - install as a new skill;
   - needs an external connection;
   - needs a cloud render environment;
   - not recommended now.
6. Install only with the owner's approval:
   - Copy the original folder byte for byte into `skills/third_party/<source>/<skill>/`,
     with the source `LICENSE`.
   - Add the files' SHA-256, the repo URL and the commit to `skills/third_party/manifest.json`.
   - Symlink the folder into `.agents/skills/` (Codex), and into `.claude/skills/` (Claude Code)
     unless an org plugin already provides the same skill there.
7. Brand context stays single-source. When a skill asks for `voice.md`,
   `product-marketing.md` or a brand profile, it reads `brand/BRAND-BRAIN.md` and
   `brand/profile.json`. Never create a second copy of those facts.
8. Record the decision in `docs/DECISIONES.md` and the row in `docs/SKILLS-TERCEROS.md`.

Never connect accounts, add API keys, enable paid services or turn on hooks without
explicit approval from the owner.
