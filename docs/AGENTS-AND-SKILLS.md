# Agents and skills

One brand source, many roles:

```
brand/profile.json      facts (palette, audience, product lines, hard rules)
brand/BRAND-BRAIN.md    rules, voice, visual system, approval states
skills/<role>/SKILL.md  portable skills (YAML name + description)
.claude/skills/<role>   → symlink to skills/<role>   (Claude Code)
.agents/skills/<role>   → symlink to skills/<role>   (Codex)
.claude/agents/*.md     Claude Code subagents; each loads Brand Brain + its skill
```

| Role | Skill | Claude Code subagent |
|---|---|---|
| Brand Brain | `brand-brain` | `brand-guardian` |
| Investigador de contenido | `content-researcher` | `content-researcher` |
| Guionista de Reels | `reel-scriptwriter` | `reel-scriptwriter` |
| Diseñador de carruseles | `carousel-designer` (+ original `social-carousel` when Higgsfield is approved) | `carousel-designer` |
| Especialista en anuncios | `ads-specialist` | `ads-specialist` |
| Analista de resultados | `results-analyst` | `results-analyst` |

Codex reads `AGENTS.md` and `.agents/skills`. Other tools can read
`skills/*/SKILL.md` directly. Subagents get no shell access; all roles draft
for owner approval and never publish or change external systems.
`skills/catalog.json` still tracks only the original attached skill and its checksum.
