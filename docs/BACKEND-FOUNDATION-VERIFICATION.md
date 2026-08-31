# Backend Foundation Verification

**Repository:** `rightware-corporations/castro-service`
**Branch:** `backend/foundation`
**Verification commit before these documentation changes:** `e78903d732452c553790a6d4a26112774da3284f`
**Scope:** Verification and documentation only. `main` was not modified.

## 1. Toolchain and build verification

The active checkout is `backend/foundation`, tracking `origin/backend/foundation`, with a clean working tree before this verification pass. The toolchain used for the full build was:

| Tool | Version |
|---|---|
| Java runtime/compiler | Eclipse Temurin `26.0.2.1` |
| Maven | Apache Maven `3.9.11`, invoked through `backend/mvnw` |
| Spring Boot | `4.1.1`, declared in `backend/pom.xml` |
| Java release target | `26`, declared in `backend/pom.xml` |

The full command was:

```bash
cd backend
./mvnw -B clean verify
```

The command completed with `BUILD SUCCESS`. It compiled main and test sources with release 26, executed four tests with zero failures and zero errors, and packaged the Spring Boot JAR. The run emitted JDK/Maven warnings about Mockito self-attaching a Java agent and Maven/Guice reflective access; these warnings did not fail the build and should be cleaned up before a hardened production build.

## 2. Runtime OpenAPI export

The current runtime OpenAPI document is exported at [`docs/openapi.json`](openapi.json). It is an OpenAPI `3.1.0` document with title `OpenAPI definition`, version `v0`, and generated server URL `http://localhost:8080`.

The application was started against a temporary local PostgreSQL service for route introspection. Normal startup with the empty temporary database reached Hibernate schema validation and reported a missing `amenities` table before the application became ready. The OpenAPI export was therefore generated in verification-only mode with `spring.jpa.hibernate.ddl-auto=none` and `spring.flyway.enabled=false`; this does not change repository configuration or the exported controller contract, but it means the normal migration-first runtime path still requires investigation before production use.

## 3. Current REST endpoints

The following list is derived from the exported runtime OpenAPI document and the current controller mappings. There are 15 paths and 15 operations.

| Method | Path | Current access rule | Response shape |
|---|---|---|---|
| GET | `/api/v1/public/config` | Public | Object containing `businessTimezone` |
| GET | `/api/v1/services` | Public | Array of `CatalogItem` |
| GET | `/api/v1/services/{slug}` | Public | `CatalogItem` |
| GET | `/api/v1/courses` | Public | Array of `CourseItem` |
| GET | `/api/v1/courses/{slug}` | Public | `CourseItem` |
| GET | `/api/v1/courses/{id}/sessions` | Public | Array of session objects |
| GET | `/api/v1/spaces` | Public | Array of `SpaceItem` |
| GET | `/api/v1/spaces/{slug}` | Public | `SpaceItem` |
| GET | `/api/v1/availability` | Public | `AvailabilityResult` |
| POST | `/api/v1/bookings` | Intended public; CSRF caveat applies | `BookingResponse` |
| GET | `/api/v1/bookings/{reference}` | Public | `PublicBookingLookup` |
| POST | `/api/v1/requests` | Intended public; CSRF caveat applies | Object containing `id` and `status` |
| POST | `/api/v1/auth/login` | Public | Object containing `email` and `authenticated` |
| POST | `/api/v1/auth/logout` | Public; CSRF caveat applies | Object containing `loggedOut` |
| GET | `/api/v1/auth/me` | Authenticated | Object containing `email` and `authenticated` |

The current OpenAPI export does not describe the standard error response on each operation, does not define an OpenAPI security scheme, and represents some `Map<String,Object>` responses as generic objects. Those are documentation gaps, not claims that an unimplemented contract exists.

## 4. Request and response DTOs

### Authentication

`LoginInput` is accepted by `POST /api/v1/auth/login` and contains `email` and `password`. Both fields are required; `email` also has email-format validation. A successful response is a generic object containing the authenticated email and `authenticated: true`. The authentication implementation stores the security context in the HTTP session. `POST /api/v1/auth/logout` returns `loggedOut: true`. `GET /api/v1/auth/me` returns the authenticated email and `authenticated: true`.

### Public catalog

`CatalogItem` contains `id`, `name`, `slug`, `description`, `durationMinutes`, and `bookingEnabled`. `CourseItem` contains `id`, `name`, `slug`, and `description`. `SpaceItem` contains `id`, `name`, `slug`, `description`, `location`, `capacityMin`, and `capacityMax`. `GET /api/v1/courses/{id}/sessions` currently returns generic session objects with `id`, `startAt`, and `endAt`.

### Availability

`GET /api/v1/availability` accepts the query parameters `bookableType`, `bookableId`, `date`, and `durationMinutes`. `durationMinutes` must be at least 1 at the transport boundary. The response is `AvailabilityResult`, containing `date`, `timezone`, and `slots`. Each `AvailabilitySlot` contains `start`, `end`, and `status`, where the implementation currently emits `AVAILABLE` or `BOOKED`.

### Booking

`BookingRequest` contains `bookableType`, `bookableId`, `date`, `startTime`, `endTime`, `participants`, `customer`, `spaceConfiguration`, and `notes`. `CustomerInput` contains `firstName`, `lastName`, `email`, and `phone`. `SpaceConfiguration` contains `layoutId`, `purpose`, and `amenityIds`.

`BookingResponse` contains `id`, `reference`, `status`, `startAt`, and `endAt`. `PublicBookingLookup` intentionally contains only `reference`, `status`, `startAt`, and `endAt`; it does not expose internal notes or customer data. The current DTO does not annotate most booking fields with Bean Validation constraints, so business validation remains in application code and is incomplete in several areas.

### Requests

`RequestInput` contains required `firstName`, `lastName`, `email`, and `type`, plus optional `phone` and `message`. `type` is one of `CONSULTATION`, `CORPORATE_PROPOSAL`, `TRAINING_INFO`, `SPACE_INFO`, or `GENERAL`. The current response is a generic object containing the created request `id` and its initial `status`.

## 5. Standard API error format

The standard error response is `ProblemDetailResponse`:

```json
{
  "code": "BOOKING_SLOT_UNAVAILABLE",
  "message": "The selected time slot is no longer available.",
  "status": 409,
  "timestamp": "2026-08-26T18:00:00Z",
  "details": {}
}
```

The current handler maps application exceptions to their declared status and code, Bean Validation failures to `VALIDATION_FAILED` with field details, database integrity conflicts to `DUPLICATE_RESOURCE`, and unhandled exceptions to `INTERNAL_ERROR`. The handler does not expose Java class names, SQL details, stack traces, or arbitrary exception messages. The OpenAPI document does not yet attach these error schemas and responses to each operation.

## 6. Booking state model

`BookingStatus` currently contains:

| Status | Current evidence |
|---|---|
| `PENDING` | Default status assigned when a booking is constructed |
| `CONFIRMED` | Treated as an active booking for overlap checks |
| `COMPLETED` | Treated as an active booking for overlap checks |
| `CANCELLED` | Excluded from active overlap checks |
| `NO_SHOW` | Treated as an active booking for overlap checks |

The current foundation does not implement an explicit transition service, cancellation policy, confirmation workflow, no-show workflow, or completion workflow. No cancellation periods or other product rules are inferred here.

## 7. Availability calculation rules

The current implementation uses the configured business timezone, defaulting to `Africa/Maputo`. It queries active weekly availability rules for the requested bookable type, resource ID, and day of week. If no rule is found, the current code falls back to `08:00`–`17:00`, a 30-minute slot interval, zero buffers, zero minimum notice, and a 90-day maximum advance. These are existing implementation defaults, not newly approved business rules, and should be replaced with explicitly configured data before production.

A date-specific availability exception is then checked. A closed exception returns no slots. A non-closed exception replaces the opening and closing times with the values stored in that exception. Past dates and dates beyond the configured maximum advance return no slots.

Slots start at opening time, advance by the configured interval, and are emitted while the requested duration ends no later than closing time. A slot is marked `BOOKED` when it is inside the minimum-notice window, overlaps an active booking, or overlaps a blocked period. The overlap predicate is half-open: `start < otherEnd && end > otherStart`, so exact end/start boundaries do not overlap.

Booking creation separately checks `startAt < endAt`, searches for active booking overlaps, searches for overlapping blocked periods, verifies that a service or space is active when those types are used, rechecks availability inside a transaction, and relies on the PostgreSQL exclusion constraint for concurrent active-resource overlap protection. Resource resolution for `COURSE_SESSION` and `CONSULTATION` is not yet implemented. Capacity, prices, equipment, cancellation windows, and opening-hour policies beyond the current code are not asserted.

## 8. Database migrations and schema entities

The current migration set is:

| Migration | Main schema entities |
|---|---|
| `V1__foundation.sql` | `organizations`, `users`, `customers`, `services`, `courses`, `course_sessions`, `spaces`, `space_scenes`, `space_hotspots`, `availability_rules`, `availability_exceptions`, `blocked_periods`, `bookings`, `requests` |
| `V2__supporting_foundation.sql` | `roles`, `permissions`, `organization_members`, `role_permissions`, `service_categories`, `course_categories`, `space_layouts`, `amenities`, `space_amenities`, `space_configurations`, `outbox_events`, `audit_records`, `content_entries`, `media_assets`, `space_media` |

The booking table includes a start-before-end check, unique human-readable references, foreign keys, lookup indexes, and a PostgreSQL GiST exclusion constraint over active booking ranges. Hibernate is configured with `ddl-auto: validate`; Flyway is intended to own schema evolution.

The runtime check against an empty temporary database exposed a migration/startup discrepancy: Hibernate reported `amenities` missing and no usable application readiness was obtained under normal configuration. This must be resolved and verified with a clean PostgreSQL database before production deployment.

## 9. Security and endpoint exposure

The current filter chain permits the public configuration, catalog, availability, booking lookup, login, logout, OpenAPI, Swagger UI, and health/readiness routes. It also permits public `POST /api/v1/bookings` and `POST /api/v1/requests` to support the intended visitor flow. `GET /api/v1/auth/me` and all other routes require authentication.

The implementation uses BCrypt with cost 12, server-side HTTP sessions, and a `UserDetailsService` backed by the `users` table. HTTP Basic support is also enabled in the current filter chain, so the implementation currently exposes both session and Basic authentication mechanisms. The roles, permissions, organization-member, and role-permission schema entities exist, but permission loading, membership authorization, and complete cross-organization isolation are not implemented.

CSRF is ignored for `/api/v1/public/**` and `/api/v1/auth/login`. The public booking, request, and logout routes are not included in that ignore list, despite being permitted by authorization rules. Their browser behavior therefore requires an explicit CSRF decision before production use. Rate limiting for login, public requests, booking creation, and booking-reference lookup is not implemented.

## 10. CORS strategy

CORS is configuration-driven through `ALLOWED_ORIGINS`, whose current default is `http://localhost:3000`. The allowed methods are `GET`, `POST`, `PUT`, `PATCH`, `DELETE`, and `OPTIONS`; the allowed headers are `Content-Type`, `Authorization`, `X-Requested-With`, and `X-CSRF-TOKEN`. Credentials are enabled. The implementation does not use a wildcard origin with credentials.

For the future frontend, production origins must be supplied explicitly through deployment configuration. Cookie/session behavior, CSRF token delivery, HTTPS, and the final choice between session and token-based authentication need to be aligned before frontend integration is considered production-ready.

## 11. Tests and coverage areas

The Java 26 verification run currently passes four tests:

| Test area | Covered behavior |
|---|---|
| `AvailabilityServiceTest` | Half-open interval boundary semantics |
| `AvailabilityServiceBehaviorTest` | Default slot generation, exact-boundary availability, existing-overlap rejection, blocked-period rejection |

No numeric line or branch coverage report is configured or generated. The current tests are unit-level Mockito tests and do not cover Flyway execution, real PostgreSQL constraints, API serialization, authentication flows, organization isolation, request validation through HTTP, or concurrent booking attempts.

## 12. Mocked, stubbed, or incomplete behavior

The following areas are foundations or placeholders rather than production-ready functionality:

| Area | Current state | Production implication |
|---|---|---|
| Authorization | Role, permission, and membership tables/models exist; enforcement is incomplete | Administrative exposure is not safe until permission and organization checks are wired and tested |
| Outbox | `outbox_events` table exists; business transitions do not emit all required events | Notifications and automation are not durably connected to domain changes |
| Audit | `audit_records` table exists; audit writes are not wired across sensitive mutations | Audit completeness is not established |
| Content/media | Metadata tables/models exist; no CMS administration, object-storage adapter, upload validation, or upload API | Media/content workflows are not production-ready |
| Catalog administration | Public read endpoints exist; create/update/delete APIs do not | Operations cannot manage catalog through this backend foundation |
| Course operations | Course/session read models exist; registrations, instructors, and LMS features do not | Training workflows are incomplete |
| Space operations | Space, scene, hotspot, layout, amenity, and configuration models exist; management APIs do not | Virtual-space and configuration flows are model-only |
| Booking types | Service and space validation is present; course-session and consultation resolution is not | Generic booking support is incomplete |
| Booking idempotency | No idempotency key contract is implemented | Client retry ambiguity remains |
| Capacity and commercial rules | No capacity, price, equipment, cancellation-window, or similar rule is implemented | These must not be assumed by clients or operators |
| Availability defaults | Hardcoded fallback hours and intervals are used when no rule exists | Configuration/data seeding must replace these defaults before launch |
| Rate limiting | Not implemented | Public/authentication abuse protection is missing |
| Database startup | Normal empty-database startup exposed missing `amenities` during Hibernate validation | Migration execution must be diagnosed with a clean database run |
| OpenAPI quality | Runtime JSON is exported, but errors/security/pagination are not fully described | Frontend generation should wait for contract hardening |

## 13. Verification conclusion

The backend foundation compiles and passes its current unit tests under Java 26. The current exported OpenAPI contract and this document accurately describe the implemented surface and its limitations. The foundation is **not yet production-ready** because the normal migration-first startup path, authorization and organization isolation, public CSRF behavior, outbox/audit wiring, database integration tests, rate limiting, and several domain workflows still require implementation and validation.
