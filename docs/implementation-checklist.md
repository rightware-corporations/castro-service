# Castro’s Platform — Full Implementation Checklist

This document is the source of truth for functional completion. Nothing is considered delivered merely because a shell or route exists.

Status:
- `[x]` implemented and validated by CI / merged evidence
- `[ ]` still required
- `[~]` implemented on the current branch/PR and awaiting a green gate or merge

Evidence baseline:
- PR #16 merged into `main` at `1701bc2a2880591147010d263d5621fb5641784a` after Integration CI run #185 (`33507644988`) completed with Backend, Frontend and PostgreSQL integration gates green on exact tested head `c9258ee2b7cc20abc116ec1722cd7672ee6d73f4`.
- PR #19 replaced the Draft PR #17 without changing code and merged the 13-commit production-readiness/governance consolidation into `main` at `b7c7a60bd56616173209f19b08385aec9fc5b5e5` after Integration CI run #196 passed all three gates on exact head `e7b000e3476814d82e3c0148a4b3ed6cdf4b0364`.
- Integration CI run #197 (`33517754323`) then passed Backend, Frontend and PostgreSQL integration gates again on the exact post-merge `main` commit `b7c7a60bd56616173209f19b08385aec9fc5b5e5`.
- PR #20 reconciled repository governance/checklist evidence and merged into `main` at `9c569896b167adf9a75cfae5d89fd0614731f4f5`; post-merge Integration CI run #199 passed all three gates on that exact `main` commit.
- PR #21 added the full public booking-flow regression and PostgreSQL-backed availability CRUD regression suite. Integration CI run #203 passed all three gates on exact PR head `9d216ce45c24d2c6d089b02dc8394ca26656c080`; the PR merged into `main` at `1eeaf6790ab3240dc88bd09fa21acd6960455d1f`, and post-merge Integration CI run #204 passed all three gates again on that exact `main` commit.
- PR #23 added the final public booking error-state regression audit. Integration CI run #207 (`33660436908`) passed Backend, Frontend and PostgreSQL integration gates on exact PR head `c1364dcc52568e1744716b205e2017acbdaf2c3d`; the PR merged into `main` at `ca41e9b7348694caae54f3dad688a7aa7bfe5af8`, and post-merge Integration CI run #208 (`33660585834`) passed all three gates again on that exact `main` commit.
- PR #25 added the final public navigation regression audit for the real router, public shell and Spaces destinations. Integration CI run #211 (`33661420217`) passed all three gates on exact PR head `f9ed78badf01d5658011f8efd129c7f21c638b13`; the PR merged into `main` at `2fe52a5f771d7ec281815a6dd9b09c0cfc229c12`, and post-merge Integration CI run #212 (`33661591195`) passed all three gates again on that exact `main` commit.
- PR #27 added the public 404 and deferred system-state regression audit. Integration CI run #215 (`33662224225`) passed all three gates on exact PR head `af55aeddbec605c3fbcb56571a5bae6ad553befc`; the PR merged into `main` at `37988b485ae5010251fffd0d58baa63a92677702`, and post-merge Integration CI run #216 (`33662383903`) passed all three gates again on that exact `main` commit.
- PR #29 added the public Loading/Error/Empty quality-state regression audit across Services, Formation, Spaces, Homepage, Contact and Booking. Integration CI run #219 (`33762319293`) passed Backend, Frontend and PostgreSQL integration gates on exact PR head `b8e5d021400d03e808706a629c019a7aa664133a`; the PR merged into `main` at `a8bfbe9b3c3380ebabeb6158d48a972a77480379`, and post-merge Integration CI run #220 (`33762457298`) passed all three gates again on that exact `main` commit.
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
- [ ] Migrate remaining generic `pages/` ownership into domain features
- [ ] Move feature-specific global CSS into owning feature modules where practical
- [ ] Targeted regression suite covering all critical functional domains
- [x] Full multi-organization isolation integration suite for implemented Operations/Admin domains

## P1 — Public product
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
- [ ] Approved real photography/media integration
- [x] 360 scenes management and display foundation
- [x] Hotspots management and display foundation
- [x] Layout configurations administration
- [x] Space resources/amenities administration
- [ ] Public display of approved layouts/resources
- [ ] V2 scene/layout switching where supported by real assets
- [ ] Evaluate Three.js/R3F only if the actual spatial requirement justifies it
- [ ] AR remains future scope, not a V1 blocker

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
- [ ] Final booking responsive/accessibility audit

### Public quality states
- [x] Loading-state audit across every public route
- [x] Error-state audit across every public route
- [x] Empty-state audit across every public route
- [x] 404/system-state audit
- [ ] Final content validation against Castro-approved facts

## P2 — Operations
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

## P3 — Administration
### Catalog
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
- [x] Access-admin organization-isolation integration tests
- [x] Prevent dangerous self-lockout by self-deactivation, role removal, weak-role reassignment or stripping own management permissions

### General/settings/content
- [x] Organization general settings backend
- [x] Organization general settings UI
- [x] Organization business timezone persistence
- [x] Content administration model
- [x] Content administration UI
- [ ] Approved public copy/media publishing workflow
- [ ] Remaining organization settings only when real requirements are known

### Space administration expansion
- [x] Space layouts domain/API/UI
- [x] Space resources/amenities domain/API/UI
- [x] Space scenes domain/API/UI
- [x] Scene hotspots domain/API/UI
- [ ] Availability linkage to layouts/resources where required

### Audit
- [x] Audit event model
- [x] Audit persistence
- [x] Audit read API protected by `audit.read`
- [x] Audit trail UI

## P4 — Security and production readiness
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
- [ ] External secrets-management/deployment validation in the real production environment
- [x] HTTPS secure-cookie configuration validation
- [x] Production CORS allowed-origin validation
- [x] Environment-specific fail-closed production configuration validation
- [x] Health/readiness deployment checks with explicit database readiness behavior
- [x] Secure initial administrator provisioning regression test
- [x] Remove any need for hardcoded production credentials and reject default database credentials in production

### Reliability/audit
- [ ] Outbox/event delivery wiring where operational mutations require it
- [x] Audit wiring for privileged mutations
- [ ] Idempotency review for all retry-sensitive mutations
- [x] Database indexes/query review for operational scale

## P5 — Responsive, accessibility and visual delivery
### Required responsive matrix
- [ ] 320x568
- [ ] 360x800
- [ ] 390x844
- [ ] 430x932
- [ ] 768x1024
- [ ] 820x1180
- [ ] 1024x768
- [ ] 1180x820
- [ ] 1280x720
- [ ] 1366x768
- [ ] 1440x900
- [ ] 1536x864
- [ ] 1646x928
- [ ] 1920x1080

### Public visual QA
- [ ] Homepage screenshot and critique
- [ ] Services list/detail screenshot and critique
- [ ] Formation list/detail screenshot and critique
- [ ] Spaces list/detail/explorer/configurator screenshot and critique
- [ ] Booking flow screenshot and critique
- [ ] Contact screenshot and critique
- [ ] Header/footer final pass
- [ ] Instrument Serif display usage consistency
- [ ] Manrope UI/body consistency
- [ ] Typography hierarchy
- [ ] Spacing/rhythm
- [ ] CTA hierarchy
- [ ] Photography/media treatment
- [ ] No generic SaaS/card-heavy visual regression

### Operations/Admin visual QA
- [ ] Dashboard
- [ ] Requests list/detail
- [ ] Bookings list/detail/manual create
- [ ] Customers list/detail
- [ ] Calendar
- [ ] Tasks/notifications/reports
- [ ] Services admin
- [ ] Formation/sessions admin
- [ ] Spaces admin
- [ ] Availability admin
- [ ] Users/roles/permissions
- [ ] General settings/content/audit
- [ ] Desktop sidebar behavior
- [ ] Collapsed sidebar behavior
- [ ] Tablet off-canvas behavior
- [ ] Mobile navigation behavior
- [ ] Tables → mobile entity cards
- [ ] Mobile forms + sticky CTA behavior

### Accessibility
- [ ] Keyboard navigation pass
- [ ] Focus visibility/order
- [ ] Dialog/sheet focus management audit
- [ ] Labels and form errors
- [ ] Semantic headings/landmarks
- [ ] Contrast audit
- [ ] Reduced-motion behavior
- [ ] Screen-reader status/error announcements

## P6 — Final validation and delivery
- [ ] Run PostgreSQL + Spring backend + frontend together locally or in an equivalent production-like composed environment
- [ ] Smoke test every public route
- [ ] Smoke test every implemented Operations/Admin route
- [x] Verify migrations from an empty PostgreSQL database through mandatory PostgreSQL CI
- [x] Verify backend/frontend production build artifacts through CI quality gates
- [x] Final CI green on `main` after the production-readiness merge
- [x] Final security/configuration audit for implemented production controls
- [ ] Final Castro content/facts audit
- [ ] Final implementation checklist review: no unaccounted projected item
