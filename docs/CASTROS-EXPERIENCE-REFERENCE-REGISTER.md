# CASTRO’S SERVICES — EXPERIENCE REFERENCE REGISTER

**Status:** Living research register  
**Owner:** Public Experience / Creative Direction  
**Last updated:** 2026-09-08  
**Repository:** `rightware-corporations/castro-service`

This file exists so visual and interaction research is preserved in Git instead of being lost across chats. It is a research register, not a license to copy any referenced product, layout, brand, code, motion system or aesthetic.

## 1. Evidence labels

Every future research note should use one of these labels:

- `USER_PROVIDED_REFERENCE` — the user supplied the reference for study.
- `VERIFIED_IN_SOURCE` — a behavior or implementation was confirmed directly in source code.
- `VERIFIED_VISUALLY` — a behavior or composition was confirmed from screenshots/video/site inspection.
- `DOCUMENTED_BY_ORIGINAL_CHAT` — recorded in prior project discussion but not independently re-verified.
- `INFERRED` — reasoned conclusion; do not treat as source fact.
- `UNKNOWN` — not yet verified.

Do not upgrade a reference note to `VERIFIED_*` without actually inspecting the relevant material.

## 2. Benchmark policy

References exist to answer questions such as:

- Why does the experience feel coherent?
- How is attention directed?
- How are media, motion, typography and interaction sequenced?
- How does desktop recompose on mobile?
- How is 3D used functionally rather than decoratively?
- How are scroll, scene transitions and persistent objects authored?
- What contributes to perceived performance and premium execution?

Do **not** inherit automatically:

- layout;
- visual identity;
- palette;
- typography;
- dark-tech styling;
- glassmorphism;
- glow;
- orbit/particle motifs;
- component shapes;
- brand language;
- fake business data;
- third-party code or assets.

CASTRO’S keeps its own identity: Instrument Serif + Manrope, approved navy/teal/cream/off-white palette, editorial/institutional/human/spatial tone, and real Castro content/media when available.

## 3. Current reference set

| Reference | URL / research target | Status | What to study | What not to copy |
|---|---|---|---|---|
| VEXEL website | project-provided source/screens | `VERIFIED_IN_SOURCE` + `VERIFIED_VISUALLY` | execution discipline, hierarchy, spacing, persistent atmosphere, bespoke demos, controlled motion | dark-tech identity, violet/blue glow, orbital motifs, glass cards, product-specific visuals |
| Arounda Agency | https://arounda.agency/ | `USER_PROVIDED_REFERENCE` | creative direction, premium composition, brand/product presentation, interaction polish | agency identity/layout |
| 3D Websites | https://3dwebsites.design/ | `USER_PROVIDED_REFERENCE` | 3D web patterns, camera/object interaction, spatial composition, performance patterns | arbitrary 3D spectacle |
| Webflow Seamless | https://webflow.com/made-in-webflow/seamless | `USER_PROVIDED_REFERENCE` | seamless scene continuity, scroll transitions, persistent objects | template cloning |
| Webflow | https://webflow.com/ | `USER_PROVIDED_REFERENCE` | interaction ecosystem and implementation references | platform-specific design language |
| Awwwards Animation | https://www.awwwards.com/websites/animation/ | `USER_PROVIDED_REFERENCE` | award-level animation patterns, art direction, transition vocabulary | award-site excess, unusable navigation, scroll hijacking |
| Webflow Animation | https://webflow.com/made-in-webflow/animation | `USER_PROVIDED_REFERENCE` | motion/scroll examples and composition patterns | direct cloning |
| Motion Array | https://motionarray.com/ | `USER_PROVIDED_REFERENCE` | production references for motion/video/editing | stock assets as final Castro identity |
| MotionVid AI | https://motionvid.ai/ | `USER_PROVIDED_REFERENCE` | concept generation and motion ideation | synthetic business claims/people presented as real |
| Three.js | https://threejs.org/ | `USER_PROVIDED_REFERENCE` | WebGL/3D primitives, panorama, object/camera interaction, performance | adding 3D without product purpose |
| Lando Norris website | `TO_VERIFY_URL` | `USER_PROVIDED_REFERENCE` | cinematic web narrative, media integration, scroll-led storytelling, premium sports-personality presentation | sports/F1 identity |
| Ousmane Dembélé — Né Pour Briller | `TO_VERIFY_URL` | `USER_PROVIDED_REFERENCE` | human storytelling, chronology, photography/video, scroll narrative, emotion | football identity/content |

## 4. VEXEL findings already established

The VEXEL reference is the best-understood benchmark so far.

Confirmed principles worth transferring:

1. Persistent visual continuity across the page.
2. Strong hierarchy with one dominant object or idea per scene.
3. Slow ambient motion used selectively.
4. Important concepts receive their own visual representation instead of generic cards.
5. Repeated grid/spacing/typography rules create perceived quality.
6. Motion changes attention in sequence rather than animating everything equally.
7. CTA placement is integrated into composition.
8. Product demonstrations make abstract claims tangible.

Do not transfer VEXEL’s dark-tech visual language to CASTRO’S.

## 5. CASTRO’S research themes

Future research should be grouped into these themes.

### A. Human presence

Study:

- founder/personality-led websites;
- portrait and environmental video;
- silent ambient loops;
- optional spoken video;
- human-to-interface transitions;
- accessibility/transcripts/captions;
- poster-image fallback;
- mobile video behavior.

Goal: Elizabeth and real Castro activity can become part of the architecture once approved media exists.

### B. Spatial experience

Study:

- 3D room/floor-plan presentation;
- camera transitions;
- real-photo + 3D continuity;
- panorama/360 interaction;
- hotspot systems;
- layout/configuration visualization;
- fallback when 3D/WebGL is unavailable;
- touch/mobile controls;
- reduced-motion equivalents.

Goal: Spaces should progress naturally from discovery to exploration, configuration, availability and booking.

### C. Seamless narrative

Study:

- sticky/persistent objects;
- scroll-driven scene transitions;
- shared visual anchors between sections;
- object transformation across scenes;
- route-to-route continuity without hiding browser behavior;
- narrative progress indicators;
- non-hijacked scrolling.

Goal: CASTRO’S should feel like one connected exploration rather than unrelated sections.

### D. Training storytelling

Study:

- workshop/course storytelling;
- motion typography;
- video/photo sequences;
- chronology/session visualization;
- transition from inspiration to real schedule/registration;
- content density management.

Goal: training should feel active and human while preserving real course/session data.

### E. Contact/conversion

Study:

- intent-led contact experiences;
- contextual form adaptation;
- progressive disclosure;
- preserved context from previous pages;
- human media beside conversion without distracting from completion;
- success/error/confirmation transitions.

Goal: contact and booking should feel like the natural continuation of exploration, not a sudden admin form.

## 6. Candidate technology register — evaluation only

These technologies are not automatically approved dependencies.

| Technology | Current position | Possible role | Gate before adoption |
|---|---|---|---|
| Motion (`motion@13.2.0`) | **Approved / existing** | UI state, MICRO/OBJECT/SCENE motion, overlays, selections, booking | preserve current tests/reduced motion |
| Three.js | **Research candidate** | true 3D/spatial/panorama scenes | isolated prototype + performance + accessibility fallback |
| GSAP / ScrollTrigger | **Research candidate only** | authored scroll narrative if Motion primitives are insufficient | prove need first; do not duplicate existing motion responsibilities |
| Rive | **Optional research candidate** | reusable vector/brand animation if specifically designed | real design use case required |
| Webflow | **Reference / prototype tool** | research and visual interaction benchmarking | not a mandate to replace React/Vite architecture |

No dependency should be added merely because a reference uses it.

## 7. Explicit non-Castro concepts

The user also discussed financial/trading concepts in the same brainstorming message: 3D charts, coins, market/trading visuals and TradingView-like concepts.

**These are not part of CASTRO’S unless the user explicitly reassigns them to this project.**

Only the abstract lessons — richer 3D, meaningful interaction, concentration, seamless motion and premium execution — may inform CASTRO’S research.

## 8. Research-note template

Future agents should append findings using this structure:

```md
### Reference / date

Evidence: VERIFIED_VISUALLY | VERIFIED_IN_SOURCE | INFERRED | ...

Observed:
- ...

Why it works:
- ...

Potential Castro adaptation:
- ...

Do not inherit:
- ...

Performance/accessibility notes:
- ...
```

Do not delete older research notes when a direction changes. Mark them `REJECTED`, `SUPERSEDED` or `DEFERRED` so the decision history survives.