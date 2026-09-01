# Castro’s Platform — Full Implementation Checklist

This document is the source of truth for functional completion. Nothing is considered delivered merely because a shell or route exists.

Status:
- `[x]` implemented and previously validated by CI
- `[ ]` still required
- `[~]` implemented on the current branch/PR and awaiting a green gate or merge

## P0 — Stability, integration and contracts
- [x] Frontend and Spring backend integrated in one repository
- [~] Frontend isolated into explicit `frontend/` deployable workspace
- [~] Frontend architecture rules documented (`docs/frontend-architecture.md`)
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
- [ ] Full multi-organization isolation integration suite

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
- [ ] Final public navigation audit

### Space experience
- [x] Space explorer shell based on truthful media state
- [x] Space configurator
- [x] Shareable purpose/participants configuration state
- [x] Configuration carried into booking context
- [ ] Approved real photography/media integration
- [ ] 360 scenes management and display
- [ ] Hotspots management and display
- [~] Layout configurations administration
- [~] Space resources/amenities administration
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
- [ ] Dedicated full booking-flow component/integration tests
- [ ] Final booking error-state audit
- [ ] Final booking responsive/accessibility audit

### Public quality states
- [ ] Loading-state audit across every public route
- [ ] Error-state audit across every public route
- [ ] Empty-state audit across every public route
- [ ] 404/system-state audit
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
- [ ] Server-side pagination for requests/bookings/customers
- [ ] Server-side search/filter contracts
- [ ] Operational count queries instead of loading full collections for summaries

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
- [ ] Availability CRUD regression tests
- [ ] Conflict/edge-case tests for buffers, notice and max advance

### Access administration
- [x] Users backend
- [x] Users UI
- [x] Roles backend
- [x] Roles UI
- [x] Permission catalog backend
- [x] Permission matrix through role editing
- [ ] Access-admin integration tests
- [ ] Prevent/handle dangerous self-lockout scenarios where appropriate

### General/settings/content
- [x] Organization general settings backend
- [x] Organization general settings UI
- [x] Organization business timezone persistence
- [x] Content administration model
- [x] Content administration UI
- [ ] Approved public copy/media publishing workflow
- [ ] Remaining organization settings only when real requirements are known

### Space administration expansion
- [~] Space layouts domain/API/UI
- [~] Space resources/amenities domain/API/UI
- [ ] Space scenes domain/API/UI
- [ ] Scene hotspots domain/API/UI
- [ ] Availability linkage to layouts/resources where required

### Audit
- [ ] Audit event model
- [ ] Audit persistence
- [ ] Audit read API protected by `audit.read`
- [ ] Audit trail UI

## P4 — Security and production readiness
### Authorization and organization isolation
- [x] Granular permission catalog
- [x] Organization-scoped implemented Operations/Admin reads
- [x] Organization-scoped manual booking resource validation
- [ ] Two-organization integration fixtures
- [ ] Prove cross-org isolation for requests
- [ ] Prove cross-org isolation for bookings
- [ ] Prove cross-org isolation for customers
- [ ] Prove cross-org isolation for catalog administration
- [ ] Prove cross-org isolation for availability administration
- [ ] Prove cross-org isolation for users/roles/settings
- [ ] Database-level organization-membership integrity hardening

### Production infrastructure
- [ ] Production-grade shared session store
- [ ] Rate limiting / abuse controls
- [ ] Secrets management/deployment validation
- [ ] HTTPS secure-cookie configuration validation
- [ ] Production CORS allowed-origin validation
- [ ] Environment-specific safe configuration defaults
- [ ] Health/readiness deployment checks
- [ ] Secure initial administrator provisioning
- [ ] Remove any need for hardcoded production credentials

### Reliability/audit
- [ ] Outbox/event delivery wiring where operational mutations require it
- [ ] Audit wiring for privileged mutations
- [ ] Idempotency review for all retry-sensitive mutations
- [ ] Database indexes/query review for operational scale

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
- [ ] Run PostgreSQL + Spring backend + frontend together locally
- [ ] Smoke test every public route
- [ ] Smoke test every implemented Operations/Admin route
- [ ] Verify migrations from an empty PostgreSQL database
- [ ] Verify production build artifacts
- [ ] Final CI green on main
- [ ] Final security/configuration audit
- [ ] Final Castro content/facts audit
- [ ] Final implementation checklist review: no unaccounted projected item
