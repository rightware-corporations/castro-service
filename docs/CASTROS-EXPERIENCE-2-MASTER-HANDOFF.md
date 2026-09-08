# CASTRO’S SERVICES — EXPERIENCE 2.0 MASTER HANDOFF

**Status:** CANONICAL LIVING HANDOFF FOR PUBLIC EXPERIENCE / CREATIVE DIRECTION  
**Last updated:** 2026-09-08  
**Repository:** `rightware-corporations/castro-service`  
**Default branch:** `main`  
**Stable main baseline before this documentation branch:** `2031316286ea212564aabe7188ba8bd5d096bdb2`  
**Latest verified post-merge Integration CI at that baseline:** run #298 / success / Frontend + Backend + PostgreSQL green  
**Current documentation branch:** `docs/experience-2-master-handoff`

> This document exists so a new agent can continue CASTRO’S without reconstructing the creative/product state from chat memory. It is a living continuation file. Future agents working on the public experience must update it as part of each completed block.

---

# 0. START HERE — CURRENT DECISION

The public experience is **not accepted as final**.

The product/backend/security/booking foundations are valuable and must be preserved, but the user reviewed the current localhost implementation on 2026-09-08 and explicitly rejected the current level of public frontend execution as insufficiently ambitious.

Do **not** continue blindly by styling the next route in the same existing visual formula.

Immediate direction:

```text
FREEZE LARGE PUBLIC REDESIGN IMPLEMENTATION
→ DEEP EXPERIENCE RESEARCH
→ CREATIVE DIRECTION 2.0
→ STORYBOARD / MOTION / MEDIA / 3D CONCEPTS
→ THREE HIGH-FIDELITY CONCEPT SCENES
→ USER VALIDATION
→ CONTROLLED IMPLEMENTATION
```

Booking remains functionally important, but the next major public redesign is intentionally paused until the new experience direction is validated.

---

# 1. NON-NEGOTIABLE PRODUCT TRUTH

There are exactly FOUR experiences/personas:

1. **Cliente** — public user.
2. **Secretária / Operations** — daily operator under `/app`.
3. **CEO / Owner** — Elizabeth Castro under `/owner`.
4. **RIGHTWARE Super Admin** — platform/control-plane authority under `/platform`.

Do not create a fifth “Gestor” persona.

CASTRO’S is not only a landing page. The product connects:

```text
PUBLIC DISCOVERY
→ INTENT
→ CONTACT / REGISTRATION / BOOKING
→ SECRETARY OPERATIONS
→ CUSTOMER FOLLOW-UP
→ CEO VISIBILITY
→ RIGHTWARE PLATFORM CONTROL
```

The public creative redesign must not break or trivialize the underlying product.

---

# 2. ENGINEERING WORKFLOW — ALWAYS PRESERVE

`main` is the source of truth.

Required workflow:

```text
AUDIT LIVE STATE
→ SHORT-LIVED FEATURE BRANCH
→ SMALL COMMITS BY CONCERN
→ TEST
→ PR
→ REQUIRED CI 3/3 GREEN
→ NORMAL MERGE COMMIT
→ POST-MERGE MAIN CI 3/3 GREEN
→ UPDATE THIS HANDOFF / DECISION LOG
```

Never:

- commit directly to `main`;
- force-push;
- rebase away traceable history;
- squash by default;
- bypass required CI;
- weaken tests to make a branch green;
- claim a merge or green CI without live evidence;
- mix unrelated backend changes into visual work.

Required CI families:

- Frontend quality gates
- Backend quality gates
- PostgreSQL integration gates

---

# 3. CURRENT STABLE PRODUCT / TECHNICAL BASELINE

Stable `main` before this handoff branch:

```text
2031316286ea212564aabe7188ba8bd5d096bdb2
```

This baseline includes the merged public Spaces Explorer/Configurator refinement from PR #53.

The post-merge Integration CI #298 was verified successful across Frontend, Backend and PostgreSQL.

## Frontend stack

Preserve unless a future ADR proves a compelling reason to change:

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

The frontend architecture remains feature-oriented under `frontend/src/features/`, with `app/`, `api/`, `domain/`, `design-system/`, `styles/` and temporary legacy `pages/` responsibilities already documented elsewhere.

## Backend stack

Preserve:

- Java 26
- Spring Boot 4.x
- Spring Web
- Spring Security
- Spring Data JPA
- PostgreSQL
- Flyway
- Spring Session JDBC
- Validation / Actuator / OpenAPI

The Experience 2.0 initiative is not authorization to rewrite backend business logic.

---

# 4. DOCUMENT AUTHORITY MAP

Read these before public-experience implementation:

1. `docs/CASTROS-EXPERIENCE-2-MASTER-HANDOFF.md` — **current continuation state and creative direction**.
2. `docs/CASTRO_DESIGN_QUALITY_CONTRACT_V1.md` — grid, gutters, measures, rhythm, scenes, focus, media, responsive, motion, accessibility, performance and CSS ownership contract.
3. `docs/CASTROS_VISUAL_INTERACTION_SYSTEM.md` — established public interaction language and scene concepts.
4. `docs/CASTROS-EXPERIENCE-REFERENCE-REGISTER.md` — research/reference evidence and study queue.
5. `docs/CASTROS-SERVICES-MASTER-HANDOFF.md` — broader historical/product handoff; do not trust its old branch/PR state as current live Git state.
6. `docs/implementation-checklist.md` — implementation completion source of truth where applicable.
7. Source code + live GitHub/CI — final technical truth.

When documents conflict on live branch/PR/SHA, **live GitHub wins**.

When this Experience 2.0 handoff conflicts with older public visual implementation direction, this handoff governs the current creative R&D phase while the Design Quality Contract continues to govern technical quality.

---

# 5. CASTRO’S IDENTITY — PRESERVE

Canonical identity remains:

- **Instrument Serif** — editorial/public headings.
- **Manrope** — body, navigation, forms, controls and operational UI.
- Approved palette centered on deep navy, teal, cream/off-white and supporting semantic colors.
- Editorial.
- Institutional.
- Human.
- Spatial.
- Elegant.
- Calm.
- Professional.

Do not transform CASTRO’S into:

- a generic SaaS site;
- a VEXEL clone;
- a dark-tech landing page;
- a glassmorphism system;
- a neon/glow/particle experience;
- a finance/trading aesthetic;
- an award-site experiment that sacrifices usability.

VEXEL remains a benchmark of **execution discipline**, not an identity template.

---

# 6. USER VISUAL CHECKPOINT — 2026-09-08

The user inspected the current public localhost implementation and supplied screenshots covering:

- Contact hero and form;
- Contact footer;
- Spaces hero/list/detail/experience section;
- Training catalog/focus experience;
- Training course detail;
- Training registration;
- Services exploration/focus section.

## User conclusion

The current public frontend is not yet at the desired quality level. The user wants a substantially more memorable, world-class experience and is willing to rethink the creative direction before continuing page-by-page implementation.

## Current visual strengths to preserve

- Consistent Castro typography.
- Clear navy/teal/cream identity.
- Readable content hierarchy.
- Good functional foundations.
- Honest media placeholders instead of fake business photography.
- Services/Training focus interactions are better than generic card grids.
- Real course/session data is presented clearly.
- Spaces/Explorer/Configurator now respect published media/data instead of fabricating content.

## Current weaknesses observed

### A. Repeated composition formula

Too many public scenes reduce to:

```text
LARGE SERIF HEADING
+ LARGE EMPTY AREA
+ THIN RULE
+ SMALL TEAL LABEL
+ SUPPORTING COPY
+ NAVY / CREAM BLOCK
```

This is coherent but not sufficiently distinctive or immersive.

### B. Negative space without a visual anchor

Whitespace is being used at a premium/editorial scale, but several scenes do not yet contain enough photography, media, object interaction or narrative tension to justify it.

### C. Limited human presence

The experience is intended to be human/institutional, yet the current public site has little or no real human media. This makes the system feel designed but emotionally distant.

### D. Training still feels like a polished information board

Training has an improved index/focus interaction, but the experience lacks the energy of real learning: people, activity, video, movement, progression and story.

### E. Spaces still depends heavily on missing media

The structural journey is stronger, but without approved photography/360/3D representation the current placeholder presentation cannot carry the intended premium spatial experience.

### F. Contact/registration become administrative too abruptly

The transition from editorial public experience into forms feels like a switch into a back-office interface. Conversion should feel like the natural continuation of the visitor’s context.

### G. Page-to-page continuity is still insufficient

Good individual sections exist, but the experience does not yet feel like a single authored journey across Home → Services → Training → Spaces → Explorer → Configurator → Booking/Contact.

---

# 7. EXPERIENCE 2.0 VISION

Working direction:

# **CASTRO’S — HUMAN SPATIAL EXPERIENCE**

The public site should be built around three real strengths of the business:

```text
PERSON
Elizabeth / people / conversations / presence

KNOWLEDGE
consulting / leadership / communication / training

SPACE
meetings / workshops / physical environment / configuration
```

The desired feeling is not “a premium template”.

The visitor should feel that they are entering and exploring CASTRO’S.

Working journey:

```text
ARRIVAL
→ HUMAN PRESENCE
→ CONTEXT / SERVICES
→ LEARNING / TRAINING
→ ENTER THE SPACE
→ EXPLORE / CONFIGURE
→ INTENT
→ CONTACT / BOOK
→ CONFIRMATION
```

Routes may remain separate. The experience should still feel continuous through persistent visual anchors, media, state, motion, scene transitions and preserved context.

---

# 8. NEW CREATIVE AMBITION

The next concept phase should investigate, not blindly implement, these capabilities.

## 8.1 Real human media

Potential use:

- Elizabeth portrait/environment photography;
- short silent ambient video loops;
- real workshop/training footage;
- office/room preparation footage;
- optional spoken founder video;
- captions/transcripts/poster-image fallbacks;
- responsive/mobile media treatment.

**Do not synthesize Elizabeth’s likeness.** If the real person is represented, use approved real media.

Concept prototypes may use clearly labeled neutral placeholders, but production routes must not present synthetic people or invented activity as real Castro evidence.

## 8.2 3D / spatial web

Three.js is a serious research candidate specifically because CASTRO’S has a real spatial product.

Potential functional uses:

- simplified room/floor-plan object;
- camera transitions;
- layout/configuration visualization;
- transition from 3D overview → real photography → 360 explorer;
- hotspot relationships;
- transformation from exploration → configuration → booking context.

3D must answer a product question. Do not add rotating decorative objects simply to appear advanced.

## 8.3 Seamless narrative

Study a narrative layer beyond MICRO / OBJECT / SCENE:

### NARRATIVE — research layer

A visual anchor may persist while the surrounding scene changes:

```text
OBJECT APPEARS
→ USER SCROLLS
→ OBJECT PERSISTS
→ OBJECT TRANSFORMS / REFRAMES
→ NEW CONTEXT ARRIVES
→ CTA BECOMES RELEVANT
```

No aggressive scroll hijacking.

Reduced motion must preserve the same content/journey without requiring spatial transforms.

## 8.4 Video and motion storytelling

Video should not become a decorative background everywhere.

Potential high-value scenes:

- Hero / Elizabeth / environment;
- Training / workshop activity;
- Spaces / room transition;
- Contact / human conversational context.

The system needs poster images, loading strategy, data-saving/mobile behavior, captions where speech exists and performance budgets.

---

# 9. THREE CONCEPT SCENES — NEXT VALIDATION GATE

Before redesigning the full public site, create three authored concept scenes.

## CONCEPT A — HERO / HUMAN PRESENCE

Goal: establish CASTRO’S immediately as human, premium and specific.

Investigate:

- strong editorial type;
- founder/environment media;
- controlled video or photographic motion;
- one primary visual anchor;
- scene transition into the next story beat;
- mobile recomposition;
- reduced-motion fallback.

Do not reuse a VEXEL orbital/tech object.

## CONCEPT B — TRAINING / ACTIVE KNOWLEDGE

Goal: make training feel lived and active rather than catalog-like.

Investigate:

- real/placeholder workshop media architecture;
- typography interacting with media;
- session/schedule progression;
- narrative transition from promise → content → real session → registration;
- stateful focus without a generic card farm.

Preserve all real course/session facts and current registration logic.

## CONCEPT C — SPACES / 3D + REAL MEDIA

Goal: make Spaces the signature experiential part of the public product.

Investigate:

```text
DISCOVER
→ 3D / SPATIAL OVERVIEW
→ REAL MEDIA
→ 360 / HOTSPOTS
→ CONFIGURE
→ AVAILABILITY
→ BOOK
```

Prototype Three.js only in isolation first. Do not merge a new 3D dependency into production before performance/accessibility and UX value are demonstrated.

---

# 10. REFERENCE / RESEARCH PROGRAM

Canonical register:

`docs/CASTROS-EXPERIENCE-REFERENCE-REGISTER.md`

Current user-provided references include:

- https://arounda.agency/
- https://3dwebsites.design/
- https://webflow.com/made-in-webflow/seamless
- https://webflow.com/
- https://www.awwwards.com/websites/animation/
- https://webflow.com/made-in-webflow/animation
- https://motionarray.com/
- https://motionvid.ai/
- Three.js
- Lando Norris website — research target
- Ousmane Dembélé — “Né Pour Briller” — research target
- VEXEL source/screens already supplied in the project discussion

Future research must record evidence using:

```text
USER_PROVIDED_REFERENCE
VERIFIED_IN_SOURCE
VERIFIED_VISUALLY
DOCUMENTED_BY_ORIGINAL_CHAT
INFERRED
UNKNOWN
```

Do not turn visual inspiration into undocumented implementation assumptions.

---

# 11. TECHNOLOGY POSITION

## Motion

`motion@13.2.0` remains approved and existing.

Current foundation includes reduced-motion handling and existing MICRO / OBJECT / SCENE use.

Do not remove it just because other reference websites use other animation systems.

## Three.js

Status: **RESEARCH CANDIDATE**.

Required gate before adoption:

1. isolated prototype;
2. real UX purpose;
3. mobile/touch behavior;
4. reduced-motion/non-WebGL fallback;
5. performance measurement;
6. asset/loading strategy;
7. user approval of the concept.

## GSAP / ScrollTrigger

Status: **RESEARCH CANDIDATE ONLY**.

Only introduce if a concrete narrative prototype proves that Motion’s existing scroll/layout primitives are insufficient or substantially less maintainable.

Do not duplicate responsibilities across Motion and GSAP without an ADR.

## Rive

Status: **OPTIONAL RESEARCH CANDIDATE**.

Use only if CASTRO’S receives an authored vector/brand animation that actually benefits from Rive.

## Webflow

Status: **REFERENCE / PROTOTYPING SOURCE**, not an automatic platform migration.

The React/Vite product architecture remains authoritative unless a separate migration decision is explicitly approved.

---

# 12. DESIGN QUALITY CONTRACT STILL APPLIES

Creative ambition does not suspend engineering quality.

The following remain required:

- single layout/grid authority;
- approved gutters/measures/rhythm;
- responsive recomposition instead of simple stacking;
- WCAG 2.2 AA target;
- visible focus;
- keyboard journeys;
- reduced motion;
- 44px touch targets;
- media loading rules;
- LCP/CLS/INP measurement;
- CSS ownership by feature;
- no new global override layer;
- progressive retirement of historical cascade debt.

Experience 2.0 should use the Design Quality Contract as a constraint that improves execution, not work around it.

---

# 13. CONTENT / DATA POLICY DURING R&D

The user wants freedom to design ambitious concepts even while some real Castro data/media is still missing.

Allowed in isolated design/R&D prototypes:

- clearly labeled placeholder photography/video frames;
- abstract spatial geometry;
- demonstrative transitions;
- temporary content placeholders that cannot be mistaken for approved business facts.

Not allowed in production/public routes without approval:

- fake testimonials;
- fake clients;
- fake metrics;
- fake availability;
- invented capacities/prices/schedules;
- invented staff/founder biography;
- synthetic Elizabeth Castro imagery presented as real;
- fabricated photos of the real office/training activity presented as evidence.

The concept phase may prove the **container and interaction** before final media arrives.

---

# 14. CURRENT IMPLEMENTATION — PRESERVE VS RE-EVALUATE

## Preserve

- backend/API/security architecture;
- four-persona model;
- real routes and product flows;
- booking domain logic and backend-authoritative availability;
- registration logic;
- current Spaces published-media truth rules;
- Explorer/Configurator data contracts;
- Motion foundation;
- Design Quality Contract tokens/principles;
- Instrument Serif + Manrope;
- approved Castro palette;
- accessibility primitives;
- feature architecture.

## Re-evaluate creatively

- public Home composition;
- public page rhythm;
- Services visual storytelling;
- Training presentation;
- Spaces discovery/detail presentation;
- Contact page composition;
- route-to-route continuity;
- role of photography/video;
- role of 3D;
- narrative motion;
- transition from editorial content to forms;
- footer/closing scenes;
- media-first responsive behavior.

## Do not extend blindly

Do not keep generating additional large serif + blank space + thin rule + navy panel scenes simply because earlier pages use them.

Existing pages are a functional baseline, not a locked art direction.

---

# 15. NEXT EXECUTION PLAN

## R0 — Freeze / capture baseline

Before new public creative implementation:

- confirm live `main`;
- retain screenshot baseline of current public pages;
- record current bundle/build metrics;
- do not delete working functionality.

## R1 — Deep benchmark research

Study references systematically and update the Reference Register.

Research dimensions:

- hierarchy;
- typography;
- grid/rhythm;
- navigation;
- media;
- 3D;
- scroll narrative;
- motion;
- mobile;
- reduced motion;
- performance;
- accessibility;
- implementation complexity.

## R2 — Experience Concept 2.0

Create a documented creative architecture covering:

- visual story;
- scene order;
- persistent anchors;
- media plan;
- motion levels including NARRATIVE research layer;
- 3D role;
- responsive behavior;
- fallback behavior;
- content/data boundaries.

## R3 — Storyboards

Produce frame-by-frame / scene-by-scene storyboards for:

1. Hero / Elizabeth;
2. Training;
3. Spaces.

## R4 — Isolated prototypes

Prototype the three concept scenes without rewriting the entire product.

Keep prototypes separable from production routes until approved.

## R5 — User direction gate

The user must be able to compare the concepts and decide whether the new execution is genuinely better before rollout.

## R6 — Controlled production implementation

Only after approval:

```text
Public shell / Home
→ Services
→ Training
→ Spaces
→ Explorer / Configurator
→ Contact / Booking continuity
→ Mobile recomposition
→ Accessibility acceptance
→ Performance acceptance
→ Full visual QA
```

---

# 16. UPDATE DISCIPLINE — MANDATORY FOR FUTURE AGENTS

This is a living handoff.

At the end of every completed Experience 2.0 work block, the implementing agent must update this file in the same PR or a dedicated docs commit.

At minimum update:

1. **Last updated date**.
2. **Current stable main SHA** after merge.
3. **Latest verified post-merge CI**.
4. **Current active branch/PR**, if work is still open.
5. **What changed**.
6. **What was validated**.
7. **Decision log**.
8. **Rejected/superseded ideas**.
9. **Open dependencies/assets**.
10. **Exact next action**.

Never leave stale branch/PR metadata presented as current truth.

When a section becomes historical, label it `HISTORICAL`, `SUPERSEDED`, `REJECTED` or `DEFERRED`; do not silently erase the rationale.

---

# 17. DECISION LOG

## 2026-09-08 — Public frontend quality checkpoint

Decision:

- Current public UI is functional but not accepted as final visual execution.
- Stop adding more pages in the same composition language without broader creative validation.
- Preserve product architecture and technical foundations.
- Begin Experience 2.0 R&D.

Reason:

The current site is coherent but too static/repetitive and insufficiently human, media-rich, spatial, interactive and memorable for the target ambition.

## 2026-09-08 — VEXEL benchmark interpretation

Decision:

Use VEXEL as a benchmark for discipline, hierarchy, rhythm, motion consistency and attention to detail.

Do not copy:

- dark-tech aesthetic;
- glass cards;
- glow;
- orbit motifs;
- VEXEL layout/components/branding.

## 2026-09-08 — 3D technology position

Decision:

Three.js is approved for research/prototyping, **not yet approved as a production dependency**.

Adoption requires a Spaces-specific UX proof plus performance/accessibility fallback.

## 2026-09-08 — Current Booking position

Decision:

Do not rush into the next Booking visual refactor while the broader public experience direction is under re-evaluation.

Booking logic remains preserved and will later be integrated into the approved narrative/conversion system.

---

# 18. OPEN DEPENDENCIES / ASSETS

The largest external dependency for final public quality is still real Castro media.

Needed eventually:

- approved Elizabeth portrait(s);
- optional approved Elizabeth video;
- room/office photography;
- room panoramas / 360 scenes;
- workshop/training photography/video;
- approved brand/space assets;
- factual confirmation for any still-unknown capacity/equipment/business information.

The lack of final media is **not** a reason to stop concept design. Use honest concept placeholders to design the system, then swap approved media in later.

---

# 19. EXACT NEXT ACTION

Do **not** start another broad public implementation branch immediately.

Next action:

```text
1. AUDIT / STUDY THE REFERENCE SET.
2. UPDATE CASTROS-EXPERIENCE-REFERENCE-REGISTER.md WITH VERIFIED FINDINGS.
3. PRODUCE CASTRO’S EXPERIENCE CONCEPT 2.0.
4. STORYBOARD HERO / TRAINING / SPACES.
5. PROPOSE TECHNOLOGY PER SCENE.
6. ONLY THEN PROTOTYPE.
```

The goal is to stop improvising one route at a time and create an authored experience system capable of world-class execution while remaining unmistakably CASTRO’S.