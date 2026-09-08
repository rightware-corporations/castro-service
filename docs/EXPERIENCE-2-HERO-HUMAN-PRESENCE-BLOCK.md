# CASTRO’S SERVICES — EXPERIENCE 2.0 HERO / HUMAN PRESENCE BLOCK

**Status:** IMPLEMENTATION NOTE  
**Date:** 2026-09-08  
**Branch:** `feat/experience-2-hero-human-presence`

## Objective

Execute the first controlled Experience 2.0 production block after the live repository audit.

The block establishes the Hero / Human Presence scene as the visual grammar for later Training and Spaces refinement, while preserving CASTRO’S identity, product architecture, Motion foundation, typography and approved palette.

## Live reconciliation

- `docs/00-CURRENT-CONTINUATION.md`: matched in intent, but its historical stable-main SHA is superseded by current live `main`.
- `docs/CASTROS-VEXEL-AGENT-EXECUTION-HANDOFF.md`: matched and governs execution.
- `docs/CASTROS-EXPERIENCE-2-STORYBOARDS.md`: matched; Hero / Human Presence is the recommended first block.
- `docs/CASTRO_DESIGN_QUALITY_CONTRACT_V1.md`: already implemented/merged before this block; do not recreate it.
- Existing Hero implementation: partially aligned with Experience 2.0; preserve route/content contracts and refine authored human-presence composition rather than rebuilding the page.

## Preservation lock

Keep:

- Instrument Serif for public/editorial headings;
- Manrope for body/UI;
- approved navy/deep navy/teal/cream/off-white palette;
- `motion@13.2.0`;
- current Home data/query contracts;
- current public routes and CTA destinations;
- reduced-motion behavior;
- current functional loading/error/empty states;
- truthful placeholder behavior while approved real media is missing.

Do not:

- add VEXEL styling;
- add glassmorphism/orbits/particles/glow;
- fabricate Elizabeth imagery;
- fabricate metrics/testimonials;
- introduce a second animation framework;
- alter backend/API contracts.

## Hero acceptance criteria

The first viewport should communicate:

```text
PERSON
+ KNOWLEDGE
+ PLACE
```

without becoming a generic SaaS hero.

### Desktop

- preserve editorial 7/5 composition;
- one dominant human/media anchor;
- one primary CTA, optional existing secondary link;
- no metric strip;
- no generic badges;
- transition visually toward person → practice.

### Mobile

Recompose as:

```text
identity/context
→ editorial statement
→ CTA
→ strong media scene
→ supporting context
```

Do not merely compress desktop columns.

### Motion

Use restrained sequence only:

```text
shell
→ heading
→ supporting copy
→ media settle/reveal
→ CTA availability
```

Reduced motion shows final state immediately.

### Accessibility

- focus order follows visual order;
- CTA meaning does not depend on hover;
- truthful media placeholder remains semantically clear;
- real production media must use correct alt semantics when supplied.

### Performance

No new dependency is authorized in this block.

Production photography/video remains a separate asset dependency and must not be synthesized.

## Open dependency

Approved real Elizabeth / environment media is not present in the live repository at this checkpoint.

Until supplied, use an honest placeholder whose geometry matches the final media contract.
