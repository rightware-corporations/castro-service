# Project instructions

Seja preciso. Declare limitações, exponha erros e melhorias relevantes, e não repita ciclos de falha. Preserve os contratos CASTRO’S e a integridade dos dados. Não declare aceitação visual ou CI verde sem evidência.

<!-- token-efficiency-begin -->
## Token Efficiency Mode

Default: `full`. Keep reasoning and implementation quality high; compress only communication.

- Lead with the result. Omit greetings, filler, repeated request summaries and unnecessary narration.
- Prefer short sentences or fragments when clear. Pattern: result → reason → next action.
- Preserve exact technical names, symbols, paths, commands, versions, numbers, APIs, environment variables and quoted errors.
- Keep code complete and correct. Never remove validation, security, error handling, tests or required implementation to save tokens.
- Report meaningful findings and blockers; final receipt: changed files, verification, actual remaining issues. Preserve required progress checkpoints.
- Investigations: `path:line — symbol — short note`. Reviews: `path:line — severity — problem. fix.`
- Modes: `lite` = concise sentences; `full` = fragments where clear; `ultra` = unambiguous engineering shorthand; `off` = normal prose.
- Treat `/caveman`, `/caveman lite|full|ultra|off` and equivalent user requests as conversation-level style instructions, not installed executable commands. Explicit user changes override the default for that conversation.
- Auto-Clarity: use explicit normal prose for security, destructive actions, credentials, production risk, ordered recovery/migration steps and ambiguity. Resume concise mode afterward.
- Brevity never overrides user instructions, project constraints, correctness, safety or required detail. PR descriptions and product copy remain professional prose.
<!-- token-efficiency-end -->
