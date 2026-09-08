# CASTRO’S SERVICES — VEXEL AGENT EXECUTION HANDOFF

**Status:** CANONICAL EXECUTION HANDOFF FOR THE AGENT THAT BUILT VEXEL  
**Date:** 2026-09-08  
**Repository:** https://github.com/rightware-corporations/castro-service  
**Default branch:** `main`  
**Stable main SHA at handoff:** `3ea79efd38dec4dfc6f8d9932b00acd3b5d47c54`  
**Latest verified post-merge Integration CI:** `#304` — Frontend / Backend / PostgreSQL = GREEN

---

# 0. WHO THIS HANDOFF IS FOR

This handoff is specifically for the agent that previously built **VEXEL**.

The user wants the same level of execution discipline, authored continuity, motion quality and visual ambition demonstrated in VEXEL — **without copying VEXEL’s visual identity**.

Your task is not to start a new product or redesign CASTRO’S from memory. Continue the existing CASTRO’S repository from its live state, preserve the product architecture and approved design system, and execute the Experience 2.0 direction already researched and storyboarded.

---

# 1. REPOSITORY — SOURCE OF TRUTH

Use this repository only:

```text
https://github.com/rightware-corporations/castro-service
```

Canonical live baseline at handoff:

```text
main
3ea79efd38dec4dfc6f8d9932b00acd3b5d47c54
```

Latest verified post-merge Integration CI:

```text
#304
Frontend quality gates   GREEN
Backend quality gates    GREEN
PostgreSQL integration   GREEN
```

Before changing anything, re-fetch live `main`, open PRs and current CI. Live GitHub state always wins over stale SHA/branch metadata in documentation.

---

# 2. REQUIRED WORKFLOW

Always preserve:

```text
AUDIT LIVE STATE
→ CREATE SHORT-LIVED FEATURE BRANCH
→ IMPLEMENT ONE CONTROLLED BLOCK
→ SMALL COMMITS BY CONCERN
→ TEST
→ PR
→ REQUIRED CI 3/3 GREEN
→ NORMAL MERGE COMMIT
→ POST-MERGE MAIN CI 3/3 GREEN
→ UPDATE LIVING HANDOFF / CONTINUATION
```

Never:

- commit directly to `main`;
- force-push;
- rebase away traceable history;
- squash by default;
- bypass CI;
- weaken tests to make CI green;
- silently introduce unrelated backend changes;
- claim a merge or green CI without live evidence.

---

# 3. READ THIS BEFORE IMPLEMENTATION

Read in this order:

1. `docs/00-CURRENT-CONTINUATION.md`
2. `docs/CASTROS-VEXEL-AGENT-EXECUTION-HANDOFF.md` — this file
3. `docs/CASTROS-EXPERIENCE-2-MASTER-HANDOFF.md`
4. `docs/CASTROS-EXPERIENCE-2-PHASE-1-RESEARCH.md`
5. `docs/CASTROS-EXPERIENCE-2-STORYBOARDS.md`
6. `docs/CASTRO_DESIGN_QUALITY_CONTRACT_V1.md`
7. `docs/CASTROS_VISUAL_INTERACTION_SYSTEM.md`
8. `docs/CASTROS-EXPERIENCE-REFERENCE-REGISTER.md`
9. `docs/CASTROS-SERVICES-MASTER-HANDOFF.md` for historical product context only
10. source code + live GitHub/CI as final technical truth

Do not skip directly from this file into code without checking the storyboards and quality contract.

---

# 4. PRODUCT TRUTH — DO NOT CHANGE

There are exactly four experiences/personas:

1. **Cliente** — public user.
2. **Secretária / Operations** — `/app`.
3. **CEO / Owner** — Elizabeth Castro under `/owner`.
4. **RIGHTWARE Super Admin** — `/platform`.

Do not create a fifth persona.

CASTRO’S is a real product system:

```text
PUBLIC DISCOVERY
→ INTENT
→ CONTACT / REGISTRATION / BOOKING
→ SECRETARY OPERATIONS
→ CUSTOMER FOLLOW-UP
→ CEO VISIBILITY
→ RIGHTWARE PLATFORM CONTROL
```

Experience 2.0 must improve the public experience without breaking this chain.

---

# 5. YOUR VEXEL EXPERIENCE — WHAT TO TRANSFER

Transfer the execution principles that made VEXEL strong:

- one authored experience instead of disconnected sections;
- strong focal hierarchy;
- visual demonstrations instead of generic descriptive cards;
- motion that communicates focus, progression and causality;
- scene continuity through scroll;
- each major product idea having a distinct visual representation;
- deliberate transitions instead of arbitrary entrance effects;
- strong responsive composition;
- visual polish tied to the product story.

Central transferable principle:

> **Show the relationship/system instead of only describing it.**

CASTRO’S equivalents:

```text
service   → human consultation / service context
training  → active knowledge / session progression / real media
spaces    → spatial overview / photography / 360 / configuration
booking   → date → loading → slots → selection → details → review
```

---

# 6. WHAT MUST NOT BE COPIED FROM VEXEL

Do not carry VEXEL’s identity into CASTRO’S.

Reject:

- dark-tech styling;
- violet/blue glow;
- glassmorphism as a visual system;
- orbital objects;
- decorative data particles;
- waveform motifs without a real function;
- generic GlassCard architecture;
- VEXEL metrics, copy, claims or product metaphors;
- technology-first aesthetic.

CASTRO’S must remain human, editorial, institutional, spatial, calm and professional.

---

# 7. IDENTITY LOCK — TYPOGRAPHY MUST NOT CHANGE

The user explicitly reinforced that typography is **not open for silent redesign**.

Hard lock:

```text
Instrument Serif = editorial/public headings
Manrope          = body/navigation/forms/controls/UI
```

Do not replace either family during Experience 2.0 implementation.

You may refine:

- scale;
- hierarchy;
- line length;
- line breaks;
- tracking where appropriate;
- relationship between text and media;
- responsive typography;
- kinetic treatment using the same families.

You may not silently introduce a new heading/body family.

Any future typography-family change requires explicit user approval and must be treated as a separate brand decision.

---

# 8. COLOR / BRAND LOCK

Preserve the approved CASTRO’S palette centered on:

- deep navy / navy;
- teal;
- cream / warm cream;
- off-white;
- existing semantic colors.

You may build richer tonal scenes, depth, media integration, contrast and transitions from these tokens.

Do not replace the brand with a palette inspired by VEXEL, Lando Norris, Awwwards or another reference.

---

# 9. EXPERIENCE 2.0 DIRECTION

Working concept:

# **CASTRO’S — HUMAN SPATIAL EXPERIENCE**

Three real anchors:

```text
PERSON
Elizabeth / people / conversation / presence

KNOWLEDGE
consulting / leadership / communication / training

SPACE
meetings / workshops / physical environment / configuration
```

Desired public journey:

```text
ARRIVAL
→ HUMAN PRESENCE
→ KNOWLEDGE / SERVICES
→ ACTIVE TRAINING
→ ENTER THE SPACE
→ EXPLORE
→ CONFIGURE
→ INTENT
→ CONTACT / BOOK
→ CONFIRMATION
```

Routes may remain separate. The public experience should still feel continuous through composition, media, state, motion, context preservation and scene transitions.

---

# 10. EXECUTION TARGETS — THREE PRIMARY SCENES

## A. HERO / HUMAN PRESENCE

Goal:

```text
PERSON
+ KNOWLEDGE
+ PLACE
```

The first viewport must immediately feel like a real professional practice, not a generic consulting landing page.

Direction:

- keep Instrument Serif as the dominant editorial voice;
- introduce one strong human/media anchor;
- use approved real Elizabeth/environment media when available;
- until real media exists, use honest neutral placeholders;
- no synthetic Elizabeth likeness;
- one clear CTA based on real product intent;
- transition from **person → practice** through authored continuity;
- no decorative 3D object in the hero unless a later isolated prototype proves product value.

## B. TRAINING / ACTIVE KNOWLEDGE

Target journey:

```text
DISCOVER
→ FEEL THE ACTIVITY
→ UNDERSTAND
→ SEE A REAL SESSION
→ REGISTER
```

Training must stop feeling like a polished information board or equal-card catalog.

Current confirmed course truth:

```text
Oratória e Comunicação Eficaz
Start: 12 October 2026
Format: presencial
Duration: 1 month
Tue/Thu: 17h–19h
Sat: 09h–13h
Price: 1,200 MZN
Registration/certificate included
```

Do not invent trainer biographies, course capacity, venue detail, outcomes or new course facts.

## C. SPACES / SIGNATURE SPATIAL EXPERIENCE

Target journey:

```text
DISCOVER
→ ORIENT
→ REAL MEDIA
→ 360 / HOTSPOTS
→ CONFIGURE
→ AVAILABILITY
→ BOOK
```

Spaces should become the signature experiential part of CASTRO’S.

Three.js is allowed only as an isolated research/prototype candidate until it proves:

- real spatial UX value;
- acceptable mobile/touch behavior;
- reduced-motion and non-WebGL fallback;
- performance viability;
- maintainability;
- a meaningful relationship to the real room/configurator.

Do not add decorative 3D simply because it looks advanced.

---

# 11. MEDIA POLICY

Production media must be truthful.

Allowed:

- approved real Castro photography;
- approved real Elizabeth photography/video;
- approved training/workshop media;
- approved room/office media;
- real 360/media sources;
- honest placeholders while assets are missing.

Not allowed:

- synthetic Elizabeth likeness;
- invented customer photography;
- invented workshops presented as real;
- invented testimonials;
- invented client logos;
- fake metrics;
- fake availability or bookings.

A visually ambitious concept is allowed; false business evidence is not.

---

# 12. MOTION SYSTEM

Existing engine:

```text
motion@13.2.0
```

Keep Motion as the React motion foundation unless a later ADR proves another engine is required.

Existing semantic categories:

- ENTER
- EXIT
- REVEAL
- FOCUS
- SELECTION
- EXPANSION
- COLLAPSE
- CONTINUITY
- FEEDBACK
- PROGRESS
- SUCCESS
- ERROR

Implementation levels:

1. `MICRO` — controls/buttons/tabs/slots.
2. `OBJECT` — selected service/course/space focus.
3. `SCENE` — hierarchy/media enter or reframe.
4. `NARRATIVE` — one meaningful anchor persists/reframes across related scenes.

Do not use `NARRATIVE` as permission for aggressive scroll hijacking.

Reduced motion must preserve the same information architecture and task completion.

---

# 13. TECH POSITION

Preserve current frontend stack unless a measured ADR proves otherwise:

- React 19
- TypeScript
- Vite
- React Router
- TanStack React Query
- React Hook Form
- Zod
- date-fns
- Lucide
- Motion `13.2.0`
- Vitest + Testing Library
- ESLint

Do not rewrite backend business logic as part of public creative work.

## Three.js

Status: **RESEARCH CANDIDATE**.

## GSAP / ScrollTrigger

Status: **RESEARCH CANDIDATE ONLY**.

Do not duplicate Motion responsibilities unless a concrete prototype proves a real limitation and an ADR justifies adoption.

## Rive

Optional research candidate only when a genuine authored vector/brand animation needs it.

---

# 14. DESIGN QUALITY CONTRACT — NON-NEGOTIABLE

Creative ambition does not override engineering quality.

Maintain:

- canonical grid/gutters/measures;
- responsive recomposition instead of naive stacking;
- WCAG 2.2 AA target;
- visible focus states;
- keyboard journeys;
- reduced motion;
- >=44px touch targets;
- media loading strategy;
- LCP/CLS/INP measurement;
- feature-level CSS ownership;
- progressive retirement of historical cascade debt;
- no new uncontrolled global override layer.

Read `docs/CASTRO_DESIGN_QUALITY_CONTRACT_V1.md` before implementation.

---

# 15. WHAT YOU SHOULD DO FIRST

Do **not** begin with a full-site rewrite.

Start with the current live repo and execute this order:

```text
1. AUDIT LIVE main + current public frontend
2. READ Experience 2.0 docs and existing source
3. MAP current Hero / Training / Spaces components and CSS ownership
4. IDENTIFY reusable product/data contracts that must survive
5. IMPLEMENT the first controlled high-fidelity scene block
6. TEST desktop/mobile/reduced-motion/keyboard behavior
7. PR + CI 3/3 green
8. NORMAL MERGE
9. POST-MERGE main CI 3/3 green
10. UPDATE living handoff with exact next action
```

Recommended first production block after audit:

**Hero / Human Presence**, because it establishes the visual grammar that Training and Spaces will inherit.

Do not blindly replace the existing hero before inspecting its current code, route contracts, test coverage and approved content.

---

# 16. DELIVERABLE STANDARD

Each implementation block must report:

```text
BASE MAIN SHA
BRANCH
FILES CHANGED
COMMITS
VISUAL / UX CHANGES
PRODUCT LOGIC PRESERVED
TYPOGRAPHY STATUS
MOTION BEHAVIOR
MOBILE BEHAVIOR
REDUCED MOTION
ACCESSIBILITY
PERFORMANCE / BUNDLE IMPACT
TEST RESULTS
PR
CI 3/3
MERGE SHA
POST-MERGE CI
OPEN DEPENDENCIES / MEDIA
EXACT NEXT ACTION
```

Do not call a visual block complete because it “looks better”. It must also remain structurally sound, accessible, responsive, truthful and testable.

---

# 17. LIVING HANDOFF RULE

This repository is the project memory.

After every completed Experience 2.0 block, update the living continuation so the next agent does not need chat history.

At minimum record:

- date;
- stable `main` SHA;
- verified CI state;
- active branch/PR if any;
- what changed;
- visual decisions;
- rejected directions;
- typography status;
- dependencies/assets still missing;
- exact next action.

Do not silently delete history. Mark superseded decisions as `HISTORICAL`, `SUPERSEDED`, `REJECTED` or `DEFERRED`.

---

# 18. FINAL EXECUTION BRIEF TO THE VEXEL AGENT

You built VEXEL. Bring that same execution discipline to CASTRO’S, but build **CASTRO’S**, not VEXEL again.

The target is:

```text
LESS TEMPLATE
MORE AUTHORED EXPERIENCE

LESS EMPTY EDITORIAL SPACE
MORE HUMAN / MEDIA EVIDENCE

LESS CARD CATALOG
MORE FOCUS / CONTEXT / NARRATIVE

LESS DECORATIVE MOTION
MORE CAUSAL MOTION

LESS PAGE-BY-PAGE FEEL
MORE CONTINUOUS JOURNEY
```

Preserve the current product, data, routes, booking logic, roles, typography and brand identity.

Use the existing research and storyboards as direction. Audit live code before implementation. Work in short feature branches. Keep every block reviewable. Merge only after CI is green. Update the handoff after every block.
