# Castro’s Platform — Full Implementation Checklist

This document is the source of truth for functional completion and final delivery. Nothing is considered delivered merely because a shell or route exists.

Status:
- `[x]` implemented and validated by CI / merged evidence
- `[ ]` still required
- `[~]` implemented on the current branch/PR and awaiting a green gate or merge

Delivery classification for unchecked items:
- **BLOCKER** — required before the final Castro’s presentation / handoff.
- **CONDITIONAL** — only required if the confirmed Castro’s business requirement needs it.
- **V2** — intentionally deferred and does not block the V1 presentation.
- **TECH-DEBT** — engineering cleanup that must remain tracked but does not block the V1 presentation unless it creates a functional or security defect.

## Current delivery position

The V1 architecture is now locked around exactly four experiences:

| Experience | Access | Namespace | Status |
|---|---|---|---|
| Client / Customer | Public, no account/login required in V1 | `/`, `/servicos`, `/formacao`, `/espacos`, `/contacto`, `/reservar/...` | [x] |
| Secretary / Operations | Authenticated tenant user | `/app/...` | [x] |
| CEO / Owner | Authenticated tenant user with `OWNER` experience | `/owner/...` | [x] |
| RIGHTWARE Super Admin | Separate platform identity, not a Castro’s tenant role | `/platform/...` | [x] |

There is no separate Manager persona. See `docs/PERSONA-SCREEN-ARCHITECTURE.md`.

### Final presentation blockers — executive list

The remaining V1 presentation work is concentrated in delivery quality rather than core product architecture:

- [ ] **BLOCKER** Final responsive QA across the required viewport matrix.
- [ ] **BLOCKER** Final accessibility pass across public, Secretary, CEO and Super Admin experiences.
- [ ] **BLOCKER** Final visual QA and polish across public, `/app`, `/owner` and `/platform`.
- [ ] **BLOCKER** Final Castro-approved facts/copy audit; remove or replace any `[CONTENT TBD]`/temporary presentation content visible in the final environment.
- [ ] **BLOCKER** Integrate approved real photography/media where the public experience is expected to show real Castro’s assets.
- [ ] **BLOCKER** Run frontend + Spring backend + PostgreSQL together in a production-like environment and smoke-test the complete presentation path.
- [ ] **BLOCKER** Smoke-test all final public and authenticated presentation routes, including login routing for Secretary, CEO and RIGHTWARE Super Admin.
- [ ] **BLOCKER** Provision the real presentation/deployment accounts through deployment secrets; never hardcode passwords.
- [ ] **BLOCKER** Validate external deployment/secrets configuration in the actual presentation/production environment.
- [ ] **BLOCKER** Final checklist reconciliation with no unaccounted V1 item.

### Explicit V2 / non-blocking scope

These items remain tracked but do not delay the V1 presentation unless Castro’s confirms them as immediate requirements:

- [ ] **V2** Advanced scene/layout switching driven by richer real assets.
- [ ] **V2** Evaluate Three.js/R3F only if the real spatial interaction requires it.
- [ ] **V2** AR experience.
- [ ] **CONDITIONAL** Availability linkage to layouts/resources when operational capacity rules require it.
- [ ] **CONDITIONAL** Additional organization settings only after requirements are confirmed.
- [ ] **CONDITIONAL** Outbox/event-delivery wiring where an actual external delivery integration requires guaranteed asynchronous delivery.

## Evidence baseline

- PR #16 merged into `main` at `1701bc2a2880591147010d263d5621fb5641784a` after Integration CI run #185 (`33507644988`) completed with Backend, Frontend and PostgreSQL integration gates green on exact tested head `c9258ee2b7cc20abc116ec1722cd7672ee6d73f4`.
- PR #19 replaced Draft PR #17 without changing code and merged the 13-commit production-readiness/governance consolidation into `main` at `b7c7a60bd56616173209f19b08385aec9fc5b5e5`; Integration CI #196 passed all three gates on exact head `e7b000e3476814d82e3c0148a4b3ed6cdf4b0364`, and post-merge Integration CI #197 (`33517754323`) passed all three gates again on that exact `main` commit.
- PR #20 reconciled repository governance/checklist evidence and merged into `main` at `9c569896b167adf9a75cfae5d89fd0614731f4f5`; post-merge Integration CI #199 passed all three gates.
- PR #21 added the full public booking-flow regression and PostgreSQL-backed availability CRUD regression suite. Integration CI #203 passed all three gates on exact PR head `9d216ce45c24d2c6d089b02dc8394ca26656c080`; the PR merged into `main` at `1eeaf6790ab3240dc88bd09fa21acd6960455d1f`, and post-merge Integration CI #204 passed all three gates again.
- PR #23 added the final public booking error-state regression audit. Integration CI #207 (`33660436908`) passed all three gates on exact PR head `c1364dcc52568e1744716b205e2017acbdaf2c3d`; the PR merged into `main` at `ca41e9b7348694caae54f3dad688a7aa7bfe5af8`, and post-merge Integration CI #208 (`33660585834`) passed all three gates again.
- PR #25 added the final public navigation regression audit for the real router, public shell and Spaces destinations. Integration CI #211 (`33661420217`) passed all three gates on exact PR head `f9ed78badf01d5658011f8efd129c7f21c638b13`; the PR merged into `main` at `2fe52a5f771d7ec281815a6dd9b09c0cfc229c12`, and post-merge Integration CI #212 (`33661591195`) passed all three gates again.
- PR #27 added the public 404 and deferred system-state regression audit. Integration CI #215 (`33662224225`) passed all three gates on exact PR head `af55aeddbec605c3fbcb56571a5bae6ad553befc`; the PR merged into `main` at `37988b485ae5010251fffd0d58baa63a92677702`, and post-merge Integration CI #216 (`33662383903`) passed all three gates again.
- PR #29 added the public Loading/Error/Empty quality-state regression audit across Services, Formation, Spaces, Homepage, Contact and Booking. Integration CI #219 (`33762319293`) passed all three gates on exact PR head `b8e5d021400d03e808706a629c019a7aa664133a`; the PR merged into `main` at `a8bfbe9b3c3380ebabeb6158d48a972a77480379`, and post-merge Integration CI #220 (`33762457298`) passed all three gates again.
- PR #31 separated Secretary/Operations and CEO/Owner experiences. Integration CI #225 (`33770561159`) passed Backend, Frontend and PostgreSQL gates on exact head `70074166a615d61d3519e1bd6aaf1cef5fb05409`. The PR merged into `main` at `1a56d49c6728dc8bd1fc6afa88d669638cb29649`; post-merge Integration CI #226 (`33770814610`) finished 3/3 green after re-running a transient `setup-java` Backend job that had failed before `Verify` executed.
- PR #32 added the isolated RIGHTWARE Super Admin security boundary, persisted platform account, one-time bootstrap, `/platform/login`, `/platform` control plane, platform overview/organization inventory/audit APIs and regressions. Integration CI #227 (`33772457639`) passed all three gates on exact PR head `ff7b564ce087e8c902dd29d396c0e2519af850b3`. The PR merged into `main` at `710112659ce66595873f485c5f7d21534340f9a6`; post-merge Integration CI #228 (`33772622245`) passed Backend, Frontend and PostgreSQL gates on that exact `main` commit.
- Repository ruleset `Protect main` (ID `22020960`) is active for the default branch and requires pull requests, an up-to-date branch, the three mandatory CI checks, merge commits only, and blocks force-push/deletion with no bypass actors.

## P0 — Stability, integration and contracts

- [x] Frontend and Spring backend integrated in one repository
- [x] Frontend isolated into explicit `frontend/` deployable workspace
- [x] Frontend architecture rules documented (`docs/frontend-architecture.md`)
- [x] Frontend CI: lint, typecheck, tests, build
- [x] Backend CI: Maven verify
- [x] PostgreSQL + Flyway migrations
- [x] Browser session authentication
- [x] CSRF contract for state-changing browser requests
- [x] Credentialed CORS contract
- [x] Public booking idempotency
- [x] Public contact-request idempotency
- [x] Organization-scoped permission model
- [x] Backend method authorization for implemented internal APIs
- [x] Frontend route-level permission guard / no-access state
- [x] Preserve intended internal route through login
- [x] Distinguish unauthenticated session from backend/session validation failure
- [x] Full multi-organization isolation integration suite for implemented Operations/Admin domains
- [x] Canonical Persona → Responsibility → Screen → Action → Permission → Role architecture
- [x] Organization membership experience independent from RBAC role (`OPERATIONS` / `OWNER`)
- [x] RIGHTWARE platform identity independent from tenant users/RBAC
- [ ] **TECH-DEBT** Migrate remaining generic `pages/` ownership into domain features where useful
- [ ] **TECH-DEBT** Move remaining feature-specific global CSS into owning feature modules where practical
- [ ] **BLOCKER** Final targeted regression inventory proving every presentation-critical functional domain is covered or explicitly smoke-tested

## P1 — Public product — Client / Customer

### Authentication boundary
- [x] V1 customer journey is public and does not require a customer account/login
- [x] Public visitor cannot enter tenant Operations, Owner or Platform administration without authentication

### Navigation and discovery
- [x] Homepage
- [x] Public header/footer
- [x] Services catalog
- [x] Service detail
- [x] Formation/course catalog
- [x] Course detail
- [x] Published course sessions
- [x] Spaces catalog
- [x] Space detail
- [x] Contact page
- [x] Final public navigation audit

### Space experience
- [x] Space explorer shell based on truthful media state
- [x] Space configurator
- [x] Shareable purpose/participants configuration state
- [x] Configuration carried into booking context
- [ ] **BLOCKER** Approved real photography/media integration for the presentation experience
- [x] 360 scenes management and display foundation
- [x] Hotspots management and display foundation
- [x] Layout configurations administration
- [x] Space resources/amenities administration
- [ ] **BLOCKER** Public display of approved layouts/resources when these are part of the presentation content
- [ ] **V2** Scene/layout switching beyond the current truthful foundation where richer assets support it
- [ ] **V2** Evaluate Three.js/R3F only if the actual spatial requirement justifies it
- [ ] **V2** AR experience

### Public booking
- [x] Unified bookable types: SPACE / SERVICE / COURSE_SESSION
- [x] Date step
- [x] Real availability lookup
- [x] Time step
- [x] Customer-data step
- [x] Review step
- [x] Confirmation page/reference lookup
- [x] Draft survives refresh/deep-link using safe client persistence
- [x] Stable idempotency key across logical retry
- [x] Service duration seeding
- [x] Course session fixed date/duration specialization
- [x] Space purpose/participants carried into booking
- [x] Dedicated full booking-flow component/integration tests
- [x] Final booking error-state audit
- [ ] **BLOCKER** Final booking responsive/accessibility audit

### Public quality states and content
- [x] Loading-state audit across every public route
- [x] Error-state audit across every public route
- [x] Empty-state audit across every public route
- [x] 404/system-state audit
- [ ] **BLOCKER** Final content validation against Castro-approved facts
- [ ] **BLOCKER** Final visible-copy audit for temporary/TBD content in the presentation environment

## P2 — Secretary / Operations

### Experience boundary
- [x] Authenticated tenant access
- [x] Dedicated `/app` Operations experience
- [x] Dedicated Secretary daily-work dashboard
- [x] `OPERATIONS` user is prevented from receiving the CEO `/owner` experience
- [x] Platform Super Admin is redirected away from `/app`

### Core workspace
- [x] Authenticated Operations layout
- [x] Permission-aware navigation
- [x] Logout
- [x] Dashboard with real operational summary
- [x] Requests list
- [x] Request detail
- [x] Request status workflow
- [x] Bookings list
- [x] Booking detail
- [x] Booking status workflow
- [x] Manual booking creation
- [x] Customers list
- [x] Customer detail/history foundation
- [x] Calendar populated from real bookings
- [x] Server-side pagination for requests/bookings/customers
- [x] Server-side search/filter contracts
- [x] Operational count queries instead of loading full collections for summaries

### Follow-up and work management
- [x] Tasks/follow-up domain model
- [x] Tasks list
- [x] Task create/edit/complete
- [x] Link task to customer/request/booking where applicable
- [x] Due dates/ownership
- [x] Notifications domain
- [x] Internal notifications UI
- [x] Reports domain and endpoints
- [x] Reports UI using real operational data only

## P3 — CEO / Owner and organization administration

### CEO / Owner experience
- [x] Authenticated tenant access with `OWNER` membership experience
- [x] Dedicated `/owner` route namespace
- [x] Dedicated executive layout/navigation
- [x] Executive dashboard based on real supported data only
- [x] Executive agenda overview
- [x] Executive activity overview
- [x] Executive customers overview
- [x] Executive reports access according to permission
- [x] Owner session redirected away from the Secretary primary workspace
- [x] Platform Super Admin redirected away from `/owner`

### Catalog administration
- [x] Services administration backend
- [x] Services administration UI
- [x] Formation/courses administration backend
- [x] Formation/courses administration UI
- [x] Course sessions administration backend
- [x] Course sessions administration UI
- [x] Spaces administration backend
- [x] Spaces administration UI

### Availability
- [x] Weekly availability rules backend
- [x] Weekly rules UI
- [x] Exceptions backend/UI
- [x] Blocked periods backend/UI
- [x] Resource selector using real catalog entries
- [x] Availability CRUD regression tests
- [x] Conflict/edge-case tests for buffers, notice and max advance

### Access administration
- [x] Users backend
- [x] Users UI
- [x] Roles backend
- [x] Roles UI
- [x] Permission catalog backend
- [x] Permission matrix through role editing
- [x] Membership experience assignment independent from role assignment
- [x] Access-admin organization-isolation integration tests
- [x] Prevent dangerous self-lockout by self-deactivation, role removal, weak-role reassignment or stripping own management permissions

### General/settings/content
- [x] Organization general settings backend
- [x] Organization general settings UI
- [x] Organization business timezone persistence
- [x] Content administration model
- [x] Content administration UI
- [ ] **BLOCKER** Approved public copy/media publishing workflow sufficient for the final presentation content
- [ ] **CONDITIONAL** Remaining organization settings only when real requirements are known

### Space administration expansion
- [x] Space layouts domain/API/UI
- [x] Space resources/amenities domain/API/UI
- [x] Space scenes domain/API/UI
- [x] Scene hotspots domain/API/UI
- [ ] **CONDITIONAL** Availability linkage to layouts/resources where required by real Castro’s capacity rules

### Tenant audit
- [x] Audit event model
- [x] Audit persistence
- [x] Audit read API protected by `audit.read`
- [x] Audit trail UI

## P4 — RIGHTWARE Super Admin, security and production readiness

### RIGHTWARE Platform Control
- [x] Separate `platform_administrators` persistence; Super Admin is not stored as a Castro’s organization role
- [x] Separate `platform_audit_events` persistence
- [x] One-time platform administrator bootstrap through deployment secrets
- [x] No hardcoded platform password
- [x] Bootstrap refuses replay after a platform administrator exists
- [x] Bootstrap rejects a platform email already assigned to a tenant user
- [x] Dedicated `/api/v1/platform/auth/login`
- [x] Dedicated `platform.admin` authority
- [x] Tenant users receive the separate `tenant.user` boundary marker
- [x] `/api/v1/platform/**` restricted to `platform.admin`
- [x] `/api/v1/operations/**` restricted to tenant users; platform sessions do not silently become Castro’s operators
- [x] Platform session restoration through authenticated session endpoint
- [x] Dedicated `/platform/login`
- [x] Dedicated `/platform` layout and dashboard
- [x] Platform overview uses real organization/user/database state
- [x] Organization inventory uses administrative metadata only
- [x] Platform privileged login/bootstrap audit trail
- [x] Platform routing and bootstrap regression coverage
- [x] No tenant impersonation or silent cross-tenant operational access in V1
- [ ] **BLOCKER** Provision the actual presentation/deployment RIGHTWARE Super Admin using deployment secrets and remove bootstrap password after first successful provisioning

### Authorization and organization isolation
- [x] Granular permission catalog
- [x] Organization-scoped implemented Operations/Admin reads
- [x] Organization-scoped manual booking resource validation
- [x] Two-organization integration fixtures
- [x] Prove cross-org isolation for requests
- [x] Prove cross-org isolation for bookings
- [x] Prove cross-org isolation for customers
- [x] Prove cross-org isolation for catalog administration
- [x] Prove cross-org isolation for availability administration
- [x] Prove cross-org isolation for users/roles/settings
- [x] Prove cross-org isolation for content/space experience/audit domains
- [x] Database-level organization-membership integrity hardening

### Production infrastructure
- [x] Production-grade shared JDBC session store via Spring Session
- [x] Persistent rate limiting / abuse controls with regression coverage
- [ ] **BLOCKER** External secrets-management/deployment validation in the real presentation/production environment
- [x] HTTPS secure-cookie configuration validation
- [x] Production CORS allowed-origin validation
- [x] Environment-specific fail-closed production configuration validation
- [x] Health/readiness deployment checks with explicit database readiness behavior
- [x] Secure initial organization administrator provisioning regression test
- [x] Secure platform administrator provisioning regression test
- [x] Remove any need for hardcoded production credentials and reject default database credentials in production

### Reliability/audit
- [ ] **CONDITIONAL** Outbox/event delivery wiring where operational mutations require guaranteed external delivery
- [x] Audit wiring for privileged tenant mutations
- [x] Separate audit path for platform privileged bootstrap/login activity
- [ ] **BLOCKER** Idempotency review for all presentation-critical retry-sensitive mutations; explicitly document any intentionally non-idempotent administrative mutation
- [x] Database indexes/query review for operational scale

## P5 — Responsive, accessibility and visual delivery

P5 is a **presentation blocker**. Functional CI does not replace visual/responsive/accessibility QA.

### Required responsive matrix
- [ ] **BLOCKER** 320x568
- [ ] **BLOCKER** 360x800
- [ ] **BLOCKER** 390x844
- [ ] **BLOCKER** 430x932
- [ ] **BLOCKER** 768x1024
- [ ] **BLOCKER** 820x1180
- [ ] **BLOCKER** 1024x768
- [ ] **BLOCKER** 1180x820
- [ ] **BLOCKER** 1280x720
- [ ] **BLOCKER** 1366x768
- [ ] **BLOCKER** 1440x900
- [ ] **BLOCKER** 1536x864
- [ ] **BLOCKER** 1646x928
- [ ] **BLOCKER** 1920x1080

### Public visual QA
- [ ] **BLOCKER** Homepage screenshot/visual review and correction
- [ ] **BLOCKER** Services list/detail review
- [ ] **BLOCKER** Formation list/detail review
- [ ] **BLOCKER** Spaces list/detail/explorer/configurator review
- [ ] **BLOCKER** Booking flow review
- [ ] **BLOCKER** Contact review
- [ ] **BLOCKER** Header/footer final pass
- [ ] **BLOCKER** Instrument Serif display usage consistency
- [ ] **BLOCKER** Manrope UI/body consistency
- [ ] **BLOCKER** Typography hierarchy
- [ ] **BLOCKER** Spacing/rhythm
- [ ] **BLOCKER** CTA hierarchy
- [ ] **BLOCKER** Photography/media treatment
- [ ] **BLOCKER** No generic SaaS/card-heavy visual regression

### Secretary / Operations visual QA
- [ ] **BLOCKER** Secretary dashboard
- [ ] **BLOCKER** Requests list/detail
- [ ] **BLOCKER** Bookings list/detail/manual create
- [ ] **BLOCKER** Customers list/detail
- [ ] **BLOCKER** Calendar
- [ ] **BLOCKER** Tasks/notifications/reports
- [ ] **BLOCKER** Services admin
- [ ] **BLOCKER** Formation/sessions admin
- [ ] **BLOCKER** Spaces admin
- [ ] **BLOCKER** Availability admin
- [ ] **BLOCKER** Users/roles/permissions
- [ ] **BLOCKER** General settings/content/audit
- [ ] **BLOCKER** Desktop sidebar behavior
- [ ] **BLOCKER** Collapsed/sidebar compact behavior where supported
- [ ] **BLOCKER** Tablet navigation behavior
- [ ] **BLOCKER** Mobile navigation behavior
- [ ] **BLOCKER** Data tables → usable mobile entity presentation
- [ ] **BLOCKER** Mobile forms and primary-action behavior

### CEO / Owner visual QA
- [ ] **BLOCKER** Executive dashboard visual hierarchy and real-data integrity
- [ ] **BLOCKER** Agenda overview
- [ ] **BLOCKER** Activity overview
- [ ] **BLOCKER** Customers overview
- [ ] **BLOCKER** Executive reports
- [ ] **BLOCKER** Owner desktop navigation
- [ ] **BLOCKER** Owner tablet/mobile navigation
- [ ] **BLOCKER** Verify executive experience does not regress into generic Operations/admin navigation

### RIGHTWARE Super Admin visual QA
- [ ] **BLOCKER** `/platform/login` visual and responsive review
- [ ] **BLOCKER** `/platform` overview visual hierarchy
- [ ] **BLOCKER** Organization inventory responsive behavior
- [ ] **BLOCKER** Platform audit responsive behavior
- [ ] **BLOCKER** Platform desktop/tablet/mobile navigation
- [ ] **BLOCKER** Verify platform visual boundary is clearly distinct from Castro’s tenant administration

### Accessibility — all four experiences
- [ ] **BLOCKER** Keyboard navigation pass
- [ ] **BLOCKER** Focus visibility/order
- [ ] **BLOCKER** Dialog/sheet focus management audit where overlays exist
- [ ] **BLOCKER** Labels and form errors
- [ ] **BLOCKER** Semantic headings/landmarks
- [ ] **BLOCKER** Contrast audit
- [ ] **BLOCKER** Reduced-motion behavior
- [ ] **BLOCKER** Screen-reader status/error announcements

## P6 — Final validation, deployment and presentation

### Production-like validation
- [ ] **BLOCKER** Run PostgreSQL + Spring backend + frontend together in a production-like composed environment
- [ ] **BLOCKER** Smoke test every public presentation route
- [ ] **BLOCKER** Smoke test Secretary `/app` presentation routes with a real provisioned account
- [ ] **BLOCKER** Smoke test CEO `/owner` presentation routes with a real provisioned account
- [ ] **BLOCKER** Smoke test RIGHTWARE `/platform` routes with a real provisioned platform account
- [ ] **BLOCKER** Verify cross-experience redirects using real sessions: Operations ↔ Owner ↔ Platform
- [x] Verify migrations from an empty PostgreSQL database through mandatory PostgreSQL CI
- [x] Verify backend/frontend production build artifacts through CI quality gates
- [x] Post-PR #32 final CI green on `main` at `710112659ce66595873f485c5f7d21534340f9a6` through Integration CI #228 (`33772622245`)
- [x] Final security/configuration audit for implemented code-level production controls

### Content and presentation readiness
- [ ] **BLOCKER** Final Castro facts/content audit
- [ ] **BLOCKER** Confirm approved service names/descriptions, formation content, spaces content, contacts and booking facts in the presentation environment
- [ ] **BLOCKER** Confirm approved real media/photos used in final presentation screens
- [ ] **BLOCKER** Prepare final presentation route/story: Public → Booking → Secretary → CEO → RIGHTWARE Platform Control
- [ ] **BLOCKER** Final implementation checklist review: no unaccounted V1 item

### Delivery gate

V1 is presentation-ready only when every remaining **BLOCKER** above is either:
1. completed and evidenced; or
2. explicitly removed from V1 by a documented Castro’s business decision.

`CONDITIONAL`, `V2` and `TECH-DEBT` items do not block the presentation unless they are promoted to V1 by a confirmed requirement.
