# CASTRO’S SERVICES — RECOVERY HANDOFF — 2026-09-05

**Status:** Current continuation handoff after the September 4 implementation/recovery cycle  
**Repository:** `https://github.com/rightware-corporations/castro-service`  
**Default branch:** `main`  
**Current verified main at handoff creation:** `a8d43f10416ba34374c04fc7a162891f7b58638b`  
**Latest merged PR:** #41 — `fix: enforce canonical public design system`  
**Latest verified main CI:** Integration CI run #270 (`33917360933`) — Backend ✅ / Frontend ✅ / PostgreSQL ✅

This file supersedes the stale execution-state sections of `docs/CASTROS-SERVICES-MASTER-HANDOFF.md`. The original master handoff remains valuable for product architecture and historical decisions, but its sections that still say “finish PR #36 first” are no longer current.

---

# 0. READ THIS FIRST — WHAT WENT WRONG AND WHAT MUST NOT HAPPEN AGAIN

The project lost time because implementation drifted away from the agreed public design and because local preview behavior was confused with production/backend behavior.

The concrete errors were:

1. **Public visual drift was introduced.**
   - A newer founder-led hero replaced the previously established editorial homepage composition.
   - Typography and visual rhythm appeared inconsistent with the existing Castro’s design system.
   - The user correctly identified that the result looked like a different design rather than an evolution of the approved system.

2. **The real Oratory course was technically implemented but did not appear in the user’s local mock preview.**
   - Backend seed/API work existed, but local mock mode initially returned an empty/older training catalog.
   - The user opened `/formacao` locally and saw no confirmed `Oratória e Comunicação Eficaz` course.
   - This made completed backend work look absent from the actual product preview.

3. **The assistant spent too long discussing/fixing CI without moving the user-facing result forward clearly.**
   - PR #39 had PostgreSQL integration failures during development.
   - The work eventually reached green and was merged, but the interaction made the user repeatedly wait for the same blocker.
   - Future work must inspect the exact live failing job, make the minimum proven correction, and report concrete progress instead of repeating plans.

4. **Local startup instructions became confusing.**
   - The user did not have Docker available (`docker` command not found).
   - The assistant initially mixed frontend/backend/PostgreSQL startup steps even though the user’s immediate goal was only to see the current UI.
   - Correct rule: for first visual review, use frontend mock mode only. Backend/PostgreSQL are a separate validation step.

5. **The user reviewed an outdated feature branch instead of the repaired `main`.**
   - Local branch shown by the user: `feature/training-system-completion` at `225d424515d0e358a78f8fcc844e3483895967dd`.
   - That branch predates PR #40 and PR #41, which specifically repaired the visual/course-preview regressions.
   - New chat must not continue visual review from that branch. Use current `main` unless implementing a new isolated change.

These failures are now part of the canonical project history. Do not hide or reinterpret them. The next chat must preserve the lessons.

---

# 1. CURRENT LIVE REPOSITORY STATE

## Stable `main`

```text
main = a8d43f10416ba34374c04fc7a162891f7b58638b
```

This is the merge commit for PR #41:

```text
fix: enforce canonical public design system
```

Latest verified `main` Integration CI:

```text
Run #270
Run ID: 33917360933
Backend quality gates: PASS
Frontend quality gates: PASS
PostgreSQL integration gates: PASS
```

Therefore the current main is 3/3 green at this handoff.

## Important instruction for local work

The user’s local repo was last seen on:

```text
feature/training-system-completion
HEAD 225d424515d0e358a78f8fcc844e3483895967dd
```

That is not the current visual baseline.

Before the next visual review, use:

```powershell
git status
git fetch origin
git switch main
git pull --ff-only origin main
git log -1 --oneline
```

Expected current main at this handoff:

```text
a8d43f10416ba34374c04fc7a162891f7b58638b
```

If `git status` is not clean, do not overwrite local work; inspect first.

---

# 2. MERGED MILESTONES — PR #36 TO #41

## PR #36 — Scheduling, booking recovery, training registrations

Merged normally.

```text
PR #36
Title: feat: connect scheduling, booking recovery, and training registrations
Merge SHA: 352163f5c950044e26296c71ea5069f0da00ffef
```

Delivered:

- Secretary month/week operational calendar;
- booking detail;
- confirm/cancel/reschedule;
- blocked periods for phone/WhatsApp/offline occupation;
- SERVICE/SPACE exclusive booking flow;
- real server-side availability/no-slot recovery;
- course registration model separate from exclusive booking;
- training registration lifecycle;
- idempotent public registration;
- operational notifications.

Critical invariant:

```text
COURSE_SESSION is NOT an exclusive booking resource.
```

Training uses `course_registrations` and supports multiple participants.

## PR #37 — Production Access & Trust Boundaries

Merged normally.

```text
PR #37
Title: security: complete production access and trust boundaries
Merge SHA: b822ad7f6122ac87ae2da6beef449e621ffea930
```

Delivered:

- exact four experiences preserved;
- tenant principal and platform principal type separation;
- authority string alone cannot cross trust boundary;
- public/staff/platform frontend surfaces via `VITE_APP_SURFACE`;
- Secretary no longer exposes tenant user/role/permission admin;
- separate tenant/platform CSRF/session/origin boundaries;
- separate `PLATFORM_ALLOWED_ORIGINS` direction;
- production trust documentation.

## PR #38 — CRM, founder story, real course launch

Merged normally.

```text
PR #38
Title: feat: connect CRM lifecycle, founder story, and real course launch
Merge SHA: 07e9c20f063fa01e557aeca02938f4de4b831640
```

Delivered CRM direction:

```text
Visitor → LEAD → QUALIFIED_LEAD → CUSTOMER → RETURNING_CUSTOMER
```

Implemented:

- anonymous visitor is not persisted as ghost customer;
- requests resolve/create CRM contact at LEAD;
- qualification/conversion can promote lifecycle;
- booking confirmation/completion can promote lifecycle;
- request owner;
- next follow-up;
- last contact;
- same-organization request-owner FK;
- Secretary CRM request detail workspace;
- source/intent/UTM context preservation.

Implemented confirmed course data:

```text
Oratória e Comunicação Eficaz
Start: 12 October 2026
Modality: Presencial
Duration: 1 month
Schedule: Tue/Thu 17h–19h; Sat 09h–13h
Investment: 1,200 MZN
Registration/certificate included
```

Learning outcomes/topics supplied by Castro:

- Comunicação eficaz e assertiva
- Técnicas de oratória e expressão verbal
- Linguagem corporal e presença
- Organização e estrutura de discursos
- Como falar em público com confiança

Founder direction implemented:

- CASTRO’S remains the master brand;
- Elizabeth Castro is founder/public trust anchor, not a competing brand;
- approved label: `Fundadora · Consultora · Formadora`;
- `/sobre` without invented biography;
- `/insights` foundation;
- configurable portrait via `VITE_ELIZABETH_PORTRAIT_URL`;
- placeholder until approved original image exists.

### Error introduced during this phase

The new founder-led homepage composition drifted from the previously approved public design language. This was not acceptable and required PR #40 and #41 repairs.

## PR #39 — Reusable Training System Completion

Merged normally after CI corrections.

```text
PR #39
Title: feat: complete reusable training system
Head before merge: 225d424515d0e358a78f8fcc844e3483895967dd
Merge SHA: 1b529701ca572db34e04b0ff808385448bd04a6d
```

Delivered:

- reusable course marketing fields in protected Course Admin;
- modality;
- duration;
- schedule summary;
- investment amount/currency;
- certificate flag;
- learning outcomes;
- featured flag;
- reusable edition/session labels;
- Secretary `/app/configuracoes/formacao` edits the same data used by public cards/details;
- removed per-course phone from backend/domain;
- general Castro contact remains organization-scoped;
- migration removes legacy `courses.contact_phone`;
- regression proof for multiple materially different courses using the same administration/public contract.

### CI problems encountered in PR #39

During development, Backend and Frontend were green while PostgreSQL integration failed.

The failures were treated as mandatory blockers; merge was not allowed until corrected.

Important lesson:

- do not weaken PostgreSQL tests;
- do not bypass the integration gate;
- do not assume “connection problem” without reading the failing job/test;
- fix the exact regression and rerun until 3/3 green.

The final branch included test alignment for the reusable catalog contract and was ultimately merged.

## PR #40 — Restore public design + confirmed training preview

Merged normally.

```text
PR #40
Title: fix: restore public design and confirmed training preview
Merge SHA: 0e5ccff75891fac018988cf1b2b301a90d81669c
```

This PR exists specifically because the user’s visual review exposed that the previous result did not match the agreed product.

Repairs:

- restored canonical editorial homepage composition;
- retained Instrument Serif headings and Manrope body/UI through established tokens;
- integrated Elizabeth into the existing visual language instead of creating a competing homepage style;
- kept CASTRO’S as master brand;
- kept intentional portrait placeholder until approved original image exists;
- local mock mode now exposes the confirmed Oratory course;
- `/formacao` uses the reusable card system;
- local mock mode includes a confirmed course edition/session;
- local flow can now be exercised:

```text
/formacao
→ course detail
→ Inscrever-me
→ registration
```

- Secretary training workspace can preview the same course/edition in mock mode.

## PR #41 — Canonical public design-system lock

Merged normally.

```text
PR #41
Title: fix: enforce canonical public design system
Merge SHA / current main: a8d43f10416ba34374c04fc7a162891f7b58638b
```

Repairs:

- final public design-system lock loaded after feature styles;
- Instrument Serif enforced for public editorial headings;
- Manrope enforced for body/UI;
- public backgrounds/dark sections normalized to canonical tokens;
- course cards kept inside the same editorial hierarchy;
- internal/development-state language removed from public copy;
- footer development label replaced with Castro pillars;
- founder-led strategy preserved without turning Castro’s into a personal brand;
- no backend/domain/security behavior changed.

Current verified main after this repair is 3/3 green.

---

# 3. ABSOLUTE PRODUCT / PERSONA RULE

Exactly FOUR experiences:

1. **Cliente** — public, no internal employee login.
2. **Secretária / Operations** — daily operator, `/app`.
3. **CEO / Owner** — Elizabeth, executive `/owner`, not daily operator.
4. **RIGHTWARE Super Admin** — separate platform identity/control plane.

There is NO “Gestor” persona.

Do not create a fifth persona.

---

# 4. PUBLIC DESIGN SYSTEM — DO NOT DRIFT AGAIN

The public visual direction is already established and must be treated as a system, not redesigned per new feature.

Canonical typography:

```text
Instrument Serif → editorial/public headings
Manrope          → body, UI, navigation, forms
```

Target character:

- institutional;
- editorial;
- premium;
- calm;
- deliberate;
- functional;
- not generic SaaS.

Avoid:

- replacing the whole hero when adding one founder section;
- introducing a different typography system for one feature;
- generic card farms;
- gratuitous glassmorphism;
- neon;
- arbitrary blue-purple gradients;
- fake metrics/testimonials;
- AI-slop visuals;
- feature CSS that overrides canonical tokens unpredictably.

### Founder rule

Founder strategy is valid, but hierarchy is:

```text
CASTRO’S = company / institution / master brand
Elizabeth Castro = founder / expert / public face / trust anchor
```

Not:

```text
Elizabeth personal brand replacing CASTRO’S
```

Use:

```text
Elizabeth Castro — Fundadora · Consultora · Formadora
```

Do not invent biography, awards, experience years or achievements.

### Portrait rule

- Do not use Instagram screenshot as final hero asset.
- Do not synthesize/fake Elizabeth’s likeness.
- Production requires approved original high-resolution image.
- Until then use intentional editorial placeholder.

---

# 5. TRAINING SYSTEM — WHAT THE USER EXPECTS VISUALLY AND FUNCTIONALLY

Training must behave as a reusable system.

The course page `/formacao` must contain actual published courses when data exists.

Every course uses the same reusable card/template system.

A future course changes data, not the component architecture.

Course card/detail data can include:

- name;
- short description;
- modality;
- duration;
- schedule summary;
- investment;
- currency;
- certificate included;
- learning outcomes;
- featured flag;
- sessions/edition labels.

Expected public flow:

```text
/formacao
→ reusable course card
→ Ver curso e inscrição
→ reusable course detail
→ Inscrever-me
→ registration form
→ registration state
```

Future payment insertion point:

```text
Course
→ Registration data
→ Payment
→ Confirmed/paid registration
→ Secretary operations
```

Payment was intentionally NOT added in PR #39. Do not redesign the card system when payment is integrated.

General Castro phone belongs to organization/public config, not to individual course records.

---

# 6. SCHEDULING / CLINIC FLOW LEARNINGS THAT MUST BE PRESERVED

The Clinic Flow reference was never meant to be copied visually or semantically. It supplied UX patterns.

Preserve:

- clear stepper/progress;
- persistent booking summary;
- date → real available slot;
- review/confirmation;
- no-slot recovery;
- contextual human fallback;
- preserve previous selections/context.

Do not copy:

- fake/random frontend slots;
- clinic-specific doctor/professional selection;
- clinic pricing;
- hardcoded schedule windows as Castro business truth;
- clinic visual identity.

### Space

```text
SPACE
→ configure context/participants/resources where applicable
→ date
→ valid real slot
→ contact
→ review
→ reservation
```

### Schedulable service/consultation

```text
SERVICE
→ only if explicitly configured schedulable
→ date
→ valid real slot
→ contact
→ review
→ appointment
```

### Training

```text
COURSE_SESSION
→ registration
→ multiple participants allowed
→ not exclusive slot booking
```

If no session:

```text
Receive next dates
→ contextual lead/request
```

Corporate training:

```text
Training for my organization
→ contextual commercial request
```

PostgreSQL and backend remain authoritative for scheduling conflicts.

---

# 7. CRM / COMMERCIAL OPERATIONS

Do not regress CRM into a generic contact list.

Lifecycle direction:

```text
Visitor
→ Lead
→ Qualified Lead
→ Customer
→ Returning Customer
```

Rules:

- anonymous browsing does not create ghost customers;
- conversion actions persist relevant context;
- preserve origin/service/course/space/CTA/UTM where available;
- requests need owner/responsible person;
- next follow-up;
- history/activity;
- meaningful lifecycle promotion;
- same-org isolation remains mandatory.

Secretary is the operational user for follow-up.

CEO sees executive signals, not daily CRUD.

---

# 8. LOCAL DEVELOPMENT / PREVIEW — KEEP IT SIMPLE

The user’s immediate visual-review workflow does NOT require Docker.

Frontend mock mode exists specifically for local UI review.

From repo root:

```powershell
cd frontend
$env:VITE_API_BASE_URL=""
$env:VITE_APP_SURFACE="ALL"
npm ci
npm run dev
```

Expected Vite URL:

```text
http://localhost:5173
```

The Vite port is 5173.

Do not tell the user that the frontend itself runs on 8080.

`8080` is the default local Spring Boot backend target only when HTTP/backend mode is intentionally enabled:

```text
VITE_API_BASE_URL=http://localhost:8080
```

But backend mode requires backend + PostgreSQL to be available.

### Docker status observed

On the user’s machine, `docker` was not available at the time of review:

```text
docker: CommandNotFoundException
```

Therefore do not start by requiring Docker merely to inspect the UI.

---

# 9. CURRENT USER-VISIBLE REVIEW PRIORITY

The next chat should first prove that the current repaired `main` actually matches the expected visual/product state.

Do NOT immediately add another major feature.

First:

1. move local repo from old feature branch to current `main`;
2. run frontend in mock mode;
3. visually inspect current homepage;
4. inspect `/formacao` and confirm the Oratory course card appears;
5. click course detail;
6. click `Inscrever-me` and follow registration flow;
7. inspect typography and confirm canonical Instrument Serif / Manrope hierarchy;
8. inspect founder placement/placeholder;
9. inspect services/spaces/contact public pages for visual consistency;
10. identify remaining gaps against the agreed system before coding further.

If the user still sees an old/incorrect page after switching to main, investigate cache/Vite process/branch before editing code.

Useful verification commands:

```powershell
git branch --show-current
git log -1 --oneline
git status
```

Expected branch:

```text
main
```

Expected main at this handoff:

```text
a8d43f10416ba34374c04fc7a162891f7b58638b
```

---

# 10. REMAINING DELIVERY WORK AFTER VISUAL RECOVERY IS CONFIRMED

Do not assume all final delivery is complete just because main is green.

Remaining major categories:

## A. Content / approved assets

Need confirmed Castro inputs where not yet supplied:

- approved Elizabeth portrait;
- confirmed founder biography/history/milestones;
- real photography of spaces;
- panoramas/360 media;
- confirmed institutional/contact information not already canonical;
- additional course/service content as approved.

## B. Public journey completion

Audit current main for any remaining incomplete public routes/CTAs, especially reservation/availability flows and any deferred placeholder experiences.

Do not expose “in development” language to final customers.

## C. CMS/content operations

Audit whether homepage/about/insights are sufficiently data-driven for Castro staff to update content without code changes.

Do not overbuild before identifying the actual missing operational requirement.

## D. Insights/inbound

Target future shape:

```text
Instagram/content topic
→ website insight/article
→ related service/course
→ contextual CTA
→ Lead / Registration / Booking
```

## E. P5 visual/responsive/accessibility QA

Audit all four experiences across mobile/tablet/desktop.

Public pages must include:

- homepage;
- services;
- training;
- course detail/registration;
- spaces;
- configurator/360 where available;
- booking/request/contact;
- header/footer.

Also audit:

- keyboard;
- focus;
- labels/errors;
- headings/landmarks;
- contrast;
- reduced motion;
- responsive tables/entity views.

## F. P6 production validation

Only after product/UI state is stable:

- production-like backend + PostgreSQL + frontend;
- public/staff/platform surface boundaries;
- session/login/logout;
- CORS/CSRF/cookies;
- real scheduling conflicts;
- training registration;
- tenant isolation;
- secrets/deployment config;
- final content/media validation.

---

# 11. GIT / CI RULES — ABSOLUTE

Main is source of truth.

Never:

- commit directly to main;
- force-push;
- squash/rebase away traceability;
- merge with a failing required gate;
- call a PR complete without live verification.

Workflow:

```text
AUDIT LIVE MAIN
→ SHORT-LIVED BRANCH
→ SMALL COMMITS
→ TEST
→ PR
→ 3/3 GREEN
→ NORMAL MERGE
→ MAIN POST-MERGE 3/3 GREEN
```

Required gates:

- Backend quality gates
- Frontend quality gates
- PostgreSQL integration gates

The user specifically does not want any hidden failure before pulling the code locally.

---

# 12. EXECUTION BEHAVIOR FOR THE NEXT ASSISTANT

When the user says:

```text
avança
continua
faça
implementa
corrige
```

execute the work using live GitHub state. Do not spend the response repeating a plan that was already approved.

Before edits:

- fetch live main/PR/branch state;
- inspect the exact current files involved;
- preserve existing hardened work;
- do not redesign unrelated areas.

When a CI job fails:

```text
fetch exact run
→ fetch exact failed job
→ read exact logs/test reports
→ identify proven root cause
→ minimal correction
→ rerun
```

Do not spend hours repeatedly guessing “PostgreSQL connection”.

---

# 13. IMMEDIATE CONTINUATION ORDER

The next chat starts here:

```text
1. Read this recovery handoff.
2. Fetch live main and verify whether it is still a8d43f10416ba34374c04fc7a162891f7b58638b or newer.
3. If newer, inspect what changed before any action.
4. Confirm PR #36–#41 are merged; do not reopen old work.
5. Help user switch local repo from feature/training-system-completion to current main without destroying local changes.
6. Run frontend mock preview only.
7. Audit the current repaired public experience visually and functionally.
8. Specifically confirm:
   - canonical typography/design system;
   - Oratory course visible in /formacao;
   - course detail;
   - Inscrever-me flow;
   - founder hierarchy;
   - public page consistency.
9. Build a concrete remaining-gap list from CURRENT main, not from old screenshots/branches.
10. Only then implement the next missing block on a new feature branch.
```

---

# 14. FINAL PRODUCT NARRATIVE

The system is one connected product:

```text
Cliente discovers
→ contextual request / booking / registration
→ Secretária receives and operates
→ CRM preserves context/follow-up
→ CEO sees executive state
→ RIGHTWARE administers platform separately
```

The final demo should prove this connected flow rather than showing isolated pages.

---

# END

This recovery handoff exists specifically to prevent another context reset, visual redesign, stale-branch review, or repeated CI diagnosis loop.