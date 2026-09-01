# Castro’s Services Platform — Chat Continuation Handoff

> Purpose: allow a new ChatGPT conversation to continue the work without reconstructing context from memory. This file is an operational handoff, not a replacement for source code or the implementation checklist.

## 1. Repository — start here

Repository: `rightware-corporations/castro-service`

GitHub: `https://github.com/rightware-corporations/castro-service`

Current active branch at the time of this handoff:

```text
feature/security-hardening-batch
```

Current active PR:

```text
PR #16 — Security hardening and mandatory multi-organization regression batch
https://github.com/rightware-corporations/castro-service/pull/16
```

HEAD confirmed when this handoff was prepared:

```text
044c429f227b746127025623de58c3d9f9c38753
```

Important: fetch the PR and branch again before making any change because the HEAD may have moved after this file was written.

## 2. Immediate execution state

Workflow confirmed for HEAD `044c429f227b746127025623de58c3d9f9c38753`:

```text
Workflow: Integration CI
Run number: #179
Run ID: 33502319354
Status: completed
Conclusion: failure
```

Jobs:

```text
Frontend quality gates          SUCCESS
Backend quality gates           SUCCESS
PostgreSQL integration gates    FAILURE
PostgreSQL job ID               99838269064
```

The failing step is:

```text
Run mandatory PostgreSQL security and regression suite
```

Do not guess the cause. The next conversation must fetch the decoded logs for job `99838269064` or another concrete test report, identify the exact failing test/error, make the smallest correct fix, push to the same branch, wait for a new workflow, and repeat until all three gates are green.

Do not merge PR #16 before all three gates are green.

## 3. Required execution discipline

The user specifically does not want repeated planning messages without visible execution.

For each work cycle:

1. fetch current PR/HEAD;
2. fetch current workflow/jobs;
3. obtain the exact failing error before modifying code;
4. change the smallest correct set of files;
5. create a real commit;
6. verify the new workflow and every gate;
7. only merge when all required gates are green;
8. report exact PR, commit SHA, workflow ID/run number, gate status and merge SHA;
9. continue automatically to the next agreed block without asking the user to say “avança” after every tiny step.

Never claim background work. Never claim a CI gate is green without tool evidence. Never claim a PR was merged without tool evidence.

## 4. Source of truth

Primary completion source of truth:

```text
docs/implementation-checklist.md
```

Status semantics used there:

```text
[x] implemented and previously validated by CI
[ ] still required
[~] implemented on current branch/PR and awaiting green gate or merge
```

Nothing should be marked `[x]` merely because a route, shell or partial implementation exists.

The checklist must be refreshed after PR #16 merges because the current file is stale relative to several hardening and isolation changes already implemented on recent branches.

## 5. Repository architecture

Monorepo:

```text
castro-service/
├─ frontend/        # React + TypeScript + Vite
├─ backend/         # Spring Boot + PostgreSQL/Flyway
├─ infra/           # deployment/infrastructure assets
├─ docs/            # architecture and implementation tracking
├─ .github/         # CI/CD workflows
├─ .gitignore
└─ README.md
```

Repository-root rule: root is for cross-project documentation, orchestration and CI/CD. Frontend package manifests/config/source live inside `frontend/`.

### Frontend architecture target

```text
frontend/src/
├─ app/             # router/providers/layout composition only
├─ features/        # domain-owned product capabilities
├─ api/             # typed HTTP contracts/adapters
├─ domain/          # transport-independent domain rules/types
├─ design-system/   # primitives/patterns/tokens
├─ pages/           # temporary legacy route-level area only
├─ styles/          # global/composition styles
├─ utils/           # truly cross-feature helpers only
├─ test/            # shared test setup/fixtures only
└─ main.tsx
```

Rules:

- new product functions go under `features/<domain>`;
- `app/` is composition only;
- `api/` is transport only;
- `domain/` must not depend on React/HTTP;
- `design-system/` must not import feature code;
- `utils/` is only for genuinely cross-feature helpers;
- migrate legacy `pages/` incrementally;
- do not add new frontend source/config to repository root;
- frontend redesign is intentionally deferred until functional/security/reliability work is closed.

See also:

```text
docs/frontend-architecture.md
```

## 6. Local commands

Frontend:

```bash
cd frontend
npm install
npm run dev
```

Quality gates:

```bash
cd frontend
npm run lint
npm run typecheck
npm run test
npm run build
```

Backend:

```bash
cd backend
./mvnw spring-boot:run
```

Backend verification:

```bash
cd backend
./mvnw -B clean verify
```

On Windows PowerShell the Maven wrapper may be run as:

```powershell
cd backend
.\mvnw.cmd spring-boot:run
```

## 7. CI contract

Pull requests targeting `main` use three primary quality gates:

```text
Frontend quality gates
Backend quality gates
PostgreSQL integration gates
```

Frontend gate runs install/lint/typecheck/tests/build from `frontend/`.

Backend gate runs Maven verification from `backend/`.

PR #16 intentionally changed the PostgreSQL job from a small named subset to the complete integration test family:

```bash
./mvnw -B '-Dtest=*IntegrationTest' test
```

This broader gate is expected to expose hidden integration issues; failures must be fixed, not bypassed by reducing the suite.

## 8. Product/business relationship

Business context:

- RIGHTWARE is the parent technology/IP/legal structure.
- Vexel is the separate commercial/delivery brand.
- Castro’s Services is a Vexel proof-social/prospect project.
- Elizabeth Castro is the decision-maker for Castro-specific business facts.
- Technical/operational requirements can be designed here, but unknown Castro business facts must remain explicitly pending.

Do not invent or infer unconfirmed Castro information such as:

- prices;
- exact capacity beyond what is confirmed below;
- equipment beyond what is confirmed;
- opening hours;
- policies;
- testimonials;
- clients;
- metrics;
- certifications;
- staff bios;
- photography/media not actually supplied/approved;
- business claims not present in approved source material.

## 9. Confirmed Castro facts

Confirmed service/signage wording:

```text
Atendimento ao Cliente
Consultoria em Ética | Liderança Organizacional
Palestras, Workshops e Formação
Treinamento Corporativo Personalizado
```

Confirmed physical room facts:

- suitable for meetings, training and workshops;
- fully equipped;
- air-conditioned;
- approximately 10–12 people;
- easy access.

Do not extend these facts into unsupported claims about specific equipment, accessibility certification, exact room dimensions, parking, catering or other facilities.

## 10. Brand / visual direction

Confirmed palette:

```text
Navy        #17184F
Deep Navy   #10133B
Teal        #22BBAE
Green       #64C98A
Warm Cream  #F1DEAE
Off White   #FAF9F5
White       #FFFFFF
Charcoal    #20232A
Muted       #6B7280
Border      #E6E7EB
```

Typography:

```text
Instrument Serif — public/display/editorial
Manrope          — UI/body/internal
```

Later redesign direction:

- editorial;
- institutional;
- human;
- spatial;
- calm;
- photography-led.

Avoid:

- generic SaaS/card-heavy layouts;
- glass/neon aesthetics;
- excessive gradients;
- excessive animation;
- generic AI people;
- fabricated social proof.

Important: do not start the major frontend redesign yet. The agreed order is functionality, structural correctness, security and reliability first; redesign comes last.

## 11. Functional platform scope already established

The platform includes a public product plus authenticated Operations/Admin functionality.

### Public

Established areas include:

- homepage;
- header/footer;
- services catalog/detail;
- formation/course catalog/detail;
- published course sessions;
- spaces catalog/detail;
- contact;
- unified booking flow for `SPACE`, `SERVICE`, `COURSE_SESSION`;
- real availability lookup;
- booking date/time/customer/review/confirmation;
- booking reference lookup;
- client-persisted booking draft;
- stable idempotency key for logical retry;
- service duration seeding;
- course-session fixed date/duration specialization;
- space purpose/participants carried into booking;
- space explorer/configurator/shareable state foundation.

### Operations

Established areas include:

- authenticated Operations layout;
- permission-aware navigation;
- logout;
- real dashboard summary;
- requests list/detail/status workflow;
- bookings list/detail/status workflow;
- manual booking creation;
- customers list/detail/history foundation;
- calendar populated from real bookings;
- tasks/follow-up;
- notifications;
- reports.

### Admin

Established areas include:

- services;
- courses;
- course sessions;
- spaces;
- weekly availability rules;
- availability exceptions;
- blocked periods;
- users;
- roles;
- permission catalog/matrix;
- organization settings;
- content administration;
- layouts/resources work;
- later work has also addressed scenes/hotspots/audit in branches beyond the older checklist state; verify the actual branch/main before claiming completion.

## 12. Security already implemented before/around the current batch

Security work already present in the codebase includes, subject to verifying current `main`/branch:

- session authentication;
- CSRF protection;
- session fixation protection;
- organization-scoped permission model;
- method authorization;
- production startup validation for unsafe defaults;
- PostgreSQL-backed sessions;
- DB-backed rate limiting;
- trusted proxy controls;
- restrictive production CORS/cookie settings;
- no required hardcoded production administrator password;
- one-time initial administrator provisioning behind an explicit deployment flag;
- password policy for privileged account creation/update;
- session revocation work for changed user/role authorization;
- account-scoped login throttling work;
- health/readiness hardening work.

### Initial administrator provisioning

Expected deployment flag:

```text
BOOTSTRAP_ADMIN_ENABLED=true
```

Required bootstrap values include:

```text
BOOTSTRAP_ORGANIZATION_NAME
BOOTSTRAP_ORGANIZATION_SLUG
BOOTSTRAP_ADMIN_EMAIL
BOOTSTRAP_ADMIN_PASSWORD
BOOTSTRAP_ADMIN_FIRST_NAME
BOOTSTRAP_ADMIN_LAST_NAME
```

Provisioning is intended to be one-time. Deployment must disable/remove the bootstrap flag and password afterward.

### Production configuration

README currently documents explicit production hardening values including:

```text
PRODUCTION_MODE=true
DATABASE_URL=jdbc:postgresql://...
DATABASE_USERNAME=...
DATABASE_PASSWORD=<non-default secret>
ALLOWED_ORIGINS=https://<approved-frontend-origin>
SESSION_COOKIE_SECURE=true
SPRINGDOC_ENABLED=false
AVAILABILITY_DEVELOPMENT_FALLBACK=false
```

Optional controls include:

```text
SESSION_TIMEOUT=30m
LOGIN_RATE_LIMIT_PER_MINUTE=10
PUBLIC_MUTATION_RATE_LIMIT_PER_MINUTE=30
TRUST_PROXY_HEADERS=false
FORWARD_HEADERS_STRATEGY=none
```

Never place real production secrets in repository documentation.

## 13. Current large hardening batch — PR #16

PR #16 was intentionally structured as a large pre-redesign hardening batch with 12 logical commits.

Intended work in the batch:

1. multi-org isolation tests for catalog;
2. multi-org isolation tests for availability;
3. multi-org isolation tests for access/settings;
4. multi-org isolation tests for content/spaces;
5. multi-org isolation tests for audit;
6. production session/cookie hardening;
7. account brute-force/login protection;
8. production CORS/security headers hardening;
9. safer admin bootstrap and production defaults;
10. health/readiness checks;
11. booking/availability/idempotency regression coverage;
12. mandatory complete PostgreSQL integration suite in CI.

The 12 commit SHAs previously reported for this PR were:

```text
1d150dd0  test(security): expand multi-org isolation for catalog
edd5f07a  test(security): expand multi-org isolation for availability
a8b8157b  test(security): expand multi-org isolation for access and settings
49d91aeb  test(security): expand multi-org isolation for content and spaces
ed43be47  test(security): expand multi-org isolation for audit
ebb0e07a  feat(security): harden session and cookie production settings
4c8114d5  feat(security): add account brute-force protection
33af5ee2  feat(security): enforce secure production CORS and headers
57d8d4cd  feat(security): harden admin bootstrap and production defaults
6f5e22b8  feat(ops): add health and readiness production checks
46d9f78b  test(reliability): add booking availability and idempotency regression coverage
044c429f  chore(ci): make security and PostgreSQL regression suite mandatory
```

Verify these against GitHub before relying on them if the branch has changed.

## 14. Previous regression/isolation work

Recent work before PR #16 also added PostgreSQL-backed isolation coverage for core operations, including areas such as:

- dashboard summary by organization;
- requests list/count/detail/status isolation;
- bookings list/count/detail/status isolation;
- customers list/count/detail isolation;
- tasks isolation and assignment validation;
- notifications scoped to recipient/organization;
- reports scoped to authenticated organization;
- missing-authority `403` coverage on selected internal APIs.

Do not assume every domain is fully covered merely because one test exists; use the checklist and actual tests to determine remaining gaps.

## 15. Reliability work still requiring audit after the current PR

After PR #16 is green/merged, refresh the checklist and group the next large batch. Likely areas to inspect, not automatically mark complete:

- targeted regression suite for all critical domains;
- complete multi-org isolation coverage with two-org fixtures;
- access-admin integration tests;
- self-lockout scenarios;
- foreign-role assignment protection;
- complete session-revocation integration tests;
- account rate-limit behavior tests;
- bootstrap-enabled integration test;
- booking conflict/overlap/buffer/notice/max-advance cases;
- clean-database Flyway migration verification;
- idempotency review for retry-sensitive mutations;
- privileged mutation audit wiring;
- outbox/event delivery only where actually justified;
- PostgreSQL indexes/query review;
- pagination/search/filter/count-query work in Operations;
- final production configuration/security audit.

Important potential review item: if account rate limiting stores normalized email directly as a database key, consider hashing the normalized identifier to avoid retaining email PII in the rate-limit key. Verify implementation first; do not claim this is currently unresolved without inspecting the code.

## 16. Known checklist items that were historically pending

The current checklist on this branch still lists, among others:

- migrate remaining generic `pages/` ownership into domain features;
- move feature-specific global CSS where practical;
- targeted critical regression suite;
- full multi-org isolation suite;
- final public navigation/content/loading/error/empty/404 audits;
- approved real photography/media;
- full booking-flow integration tests;
- server-side pagination/search/filter/count optimization;
- availability CRUD/edge-case tests;
- access-admin integration tests/self-lockout handling;
- approved public copy/media publishing workflow;
- reliability/audit work;
- responsive/accessibility/visual QA matrix;
- final end-to-end delivery validation.

Because recent branches implement some items that the checklist still shows `[ ]`, the first post-merge documentation task must reconcile checklist status against actual code and green CI evidence.

## 17. What must remain deferred

Until the functional/security/reliability blocks are closed:

```text
DO NOT begin the major visual redesign.
```

The final design phase should come after:

- required functional flows are complete;
- critical regression is green;
- multi-org isolation is proven;
- production security controls are validated;
- migrations/builds are verified;
- implementation checklist is reconciled.

## 18. Suggested next-chat startup sequence

The next chat should execute, not merely summarize:

```text
1. Open repository rightware-corporations/castro-service.
2. Fetch PR #16.
3. Confirm current head SHA.
4. Fetch workflow runs for that SHA.
5. For the failing PostgreSQL gate, fetch job logs for job 99838269064 if it is still the active failure.
6. Extract the exact failing test/error.
7. Inspect only relevant source/test/config files.
8. Apply the smallest correct fix on feature/security-hardening-batch.
9. Commit the fix.
10. Confirm the newly triggered CI.
11. Repeat until Frontend + Backend + PostgreSQL are green.
12. Merge PR #16 only when green.
13. Fetch main after merge and record merge SHA.
14. Reconcile docs/implementation-checklist.md against actual code/CI.
15. Build a new large-batch proposal from remaining [ ] items.
16. Continue with the agreed next batch; redesign remains last.
```

## 19. Required status format in user-facing replies

Use a compact evidence block so the user always knows whether work actually happened:

```text
PR: #<n>
Branch: <branch>
Commit: <sha>
CI: <run number / run id>
Frontend: green/red/running
Backend: green/red/running
PostgreSQL: green/red/running
Exact current error: <error or “none”>
Action actually performed: <files/change>
Merge: yes/no
Main SHA: <sha if merged>
```

Do not replace this evidence with “vou continuar”, “estou a verificar” or similar planning-only responses.

## 20. Final principle

Functionality first. Security and correctness before polish. No fabricated Castro facts. No skipped checklist items. No merge without green gates. Redesign last.
