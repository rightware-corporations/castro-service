# Castro’s Platform — Implementation Checklist

Working branch: `integration/castros-platform`

## P0 — Stability and integration
- [x] Integration branch combining frontend and backend foundations
- [x] Frontend CI: lint, typecheck, test, build
- [x] Backend CI: Maven verify
- [x] Session hydration, CSRF and credentialed requests
- [x] Organization-scoped permissions for Operations foundation
- [x] Public booking flow connected to backend
- [x] Booking idempotency key reuse across logical retries
- [x] Contact-request idempotency key reuse across logical retries
- [x] Availability weekly rules, exceptions and blocked periods
- [x] Availability resource selectors using real public catalog data
- [ ] Add targeted regression tests for booking, availability admin and internal catalog CRUD

## P1 — Public product
- [x] Homepage V2
- [x] Services catalog/detail V2
- [x] Courses catalog/detail V2
- [x] Spaces catalog/detail/explorer/configurator V2
- [x] Contact V2
- [x] Booking date/time/customer/review/confirmation
- [x] Service detail → booking context with published duration seeding
- [x] Course-session booking specialization with fixed published date/duration
- [ ] Space configurator → booking context final QA
- [ ] Public empty/error/loading state audit
- [ ] Responsive visual QA across target breakpoint matrix

## P2 — Operations
- [x] Authentication guard and logout
- [x] Dashboard connected to real summary
- [x] Requests workspace connected to backend
- [x] Bookings workspace connected to backend
- [x] Customers workspace connected to backend
- [x] Calendar populated from real bookings
- [x] Request detail workflow and status actions
- [x] Booking detail workflow and status actions
- [x] Customer detail/history foundation
- [ ] Manual booking creation for operations
- [ ] Tasks/follow-up backend domain and UI
- [ ] Notifications
- [ ] Reports

## P3 — Administration
- [x] Availability administration backend
- [x] Availability rules UI
- [x] Exceptions UI
- [x] Blocked-periods UI
- [x] Services administration backend contract
- [x] Services administration frontend UI
- [x] Courses administration backend + UI
- [x] Course sessions administration backend + UI
- [x] Spaces administration backend + UI
- [ ] Space scenes / hotspots / layouts / resources management
- [ ] Content administration
- [ ] Users administration
- [ ] Roles administration
- [ ] Permission matrix
- [ ] General organization settings
- [ ] Audit trail wiring

## P4 — Security and production readiness
- [x] Granular permission catalog
- [x] Backend method authorization on initial Operations/Admin APIs
- [x] Organization scoping on initial Operations/Admin APIs
- [ ] Integration tests proving cross-organization isolation on every internal domain
- [ ] Production session store
- [ ] Rate limiting / abuse controls
- [ ] Secrets and deployment hardening
- [ ] HTTPS + secure-cookie production configuration validation
- [ ] Outbox / audit event wiring
- [ ] Production CORS origin verification

## P5 — Design QA and delivery
- [ ] Clone/pull `integration/castros-platform` into a runnable local workspace
- [ ] Run frontend + PostgreSQL + Spring backend together
- [ ] Capture real screenshots for public pages
- [ ] Capture real screenshots for Operations/Admin pages
- [ ] Screen-by-screen design critique
- [ ] Fix typography, spacing, hierarchy and responsive defects
- [ ] Accessibility pass
- [ ] Final content validation: no invented business facts
- [ ] Final CI gate
- [ ] Prepare merge/PR without changing `main` until approved

## Execution order
1. Add manual operations booking and close remaining booking/context QA.
2. Add targeted booking/catalog regression and organization-isolation tests.
3. Implement users, roles, permission matrix and general settings.
4. Implement space scenes/hotspots/layouts/resources and content administration.
5. Implement tasks/follow-up, then notifications/reports only where backed by real domain contracts.
6. Close production security blockers: sessions, rate limiting, secrets, secure deployment, CORS, audit/outbox.
7. Run the full product locally and generate screenshots.
8. Perform visual/design QA and responsive correction.
9. Complete accessibility and final content validation.
10. Final gate and merge preparation.

This file is the running execution list. Completed items should be checked in as implementation lands; no commercial facts should be invented to satisfy an unchecked item.
