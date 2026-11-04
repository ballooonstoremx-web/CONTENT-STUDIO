# Integration and credential status

Observed 2026-11-04 in this Codex session. Recheck in every new task; these are
observations, not configuration that connects a service.

| Capability | Evidence / status | What remains |
|---|---|---|
| GitHub Git | Fetch of main succeeded using native platform authentication | Verify push separately; API access is distinct |
| GitHub CLI/API | gh installed; API request blocked by proxy HTTP 403 | api.github.com added to draft allowlist; apply network setting, then retry API access and PR creation |
| Higgsfield MCP | No Higgsfield tool names in actual tool inventory | User connects authenticated MCP at https://mcp.higgsfield.ai/mcp in supported client settings; rediscover tools |
| Higgsfield image generation | Not run, no cost authorization | Verify models_explore, generate_image, generate_image_batch, jobs_wait, show_generation_by_ids, media_upload, media_confirm; preflight gpt_image_2 and cost |
| Higgsfield video | No callable tools found; carousel skill does not cover video | Discover actual video tools and model schemas before defining provider calls |
| Blotato MCP/plugin | No callable Blotato tools found | Optional, only for future explicitly approved publishing: connect https://mcp.blotato.com/mcp and verify read-only accounts |
| Blotato REST | No BLOTATO_API_KEY in execution environment or configured secret bindings | Optional alternative, not implemented in this offline tool; secure binding for backend.blotato.com only, never chat or Git |
| OpenAI image tool | image_gen tool callable in session | Separate possible image workflow; not a substitute for skill-mandated Higgsfield; no generation invoked |
| Canva / CapCut | No callable integrations found | Manual import/edit/export if user has access; no account, app installation or subscription assumed |
| Local Python / Pillow | Python 3.12 and pinned Pillow 13.0.0 installed and exercised | Reproduce with scripts/setup.sh |
| FFmpeg / ffprobe | Local binaries available | Required only for rendered Reel validation, not campaign planning |
| Cloud downloads | Local authenticated ZIP download route implemented and tested | External reachability is not provided by onboarding; use workspace file download or an authenticated platform tunnel when available |

The setup inspected configured binding metadata and variable presence only.
An existing GH_TOKEN variable is present, but its value is never inspected or
copied. The existing HTTPS Git proxy supplies Git authentication; do not ask for
a PAT solely because an API call fails. No Higgsfield or Blotato key was present.

## Secure connection process

1. Prefer authenticated MCP connections in client settings. Server URLs alone do
   not connect tools. Re-discover actual tools and make a read-only service call.
2. Read current tool schemas and official provider documentation. Confirm actual
   upload/output hostnames before adding network destinations. Do not guess
   wildcard CDNs, weaken TLS, bypass the proxy, or treat a saved draft as active.
3. If an API route is deliberately selected later, declare only the documented
   variable names and exact destination requirements through environment settings.
   Enter values securely there. Proxy placeholders may not work as raw local keys.
4. Keep secrets out of profiles, prompts, provenance, logs, archives and PR text.
   This project does not include API clients, secret declarations, or fake keys
   for disconnected optional services.
5. Recheck access after settings are applied. Account listings, cost preflight,
   paid generation and publication are different permissions and checks.

No service was purchased, no provider generation was submitted, no content was
published, and no app was deployed during setup. Future runtime availability must
always be rechecked.
