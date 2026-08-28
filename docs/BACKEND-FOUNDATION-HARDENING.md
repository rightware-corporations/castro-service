# Backend Foundation Hardening

**Repository:** `rightware-corporations/castro-service`
**Branch:** `backend/foundation`
**Scope:** Hardening only; no merge to `main` and no broad product functionality.

## Executive summary

The backend foundation now starts correctly from a completely empty PostgreSQL database. The root cause was that the project included Flyway engine artifacts directly but did not include Spring Boot 4.1.1’s Flyway starter, so Flyway auto-configuration was not active. The dependency was corrected to `spring-boot-starter-flyway` while retaining PostgreSQL-specific Flyway support. Spring Boot documents `FlywayAutoConfiguration` as the migration auto-configuration, and the Boot 4.1.1 starter supplies the corresponding integration module.[1] [2]

The hardening also applies cookie-backed CSRF protection to state-changing endpoints, makes availability fallback behavior explicit and disabled by default, standardizes bookable types, adds `COURSE_SESSION` validation, adds scoped idempotency to public bookings and requests, replaces remaining practical generic response shapes with DTOs, defines the session-cookie security scheme, and adds PostgreSQL integration coverage.

## Clean database startup proof

The verification path was executed against a newly created empty PostgreSQL database. The application then ran the three Flyway migrations, Hibernate validated the resulting schema, and the readiness health endpoint returned `UP`.

| Step | Result |
|---|---|
| Empty database | Created from scratch for verification |
| Flyway | Three migrations validated and applied through version `v3` |
| Hibernate | `ddl-auto=validate` completed successfully |
| Application | `CastrosApplication` reached `Started` |
| Readiness | `/actuator/health` returned HTTP 200 with `status: UP` |

The repeatable integration command is:

```bash
CASTROS_RUN_POSTGRES_IT=true \
CASTROS_IT_DATABASE_URL=jdbc:postgresql://localhost:5432/castros_it \
CASTROS_IT_DATABASE_USERNAME=castros \
CASTROS_IT_DATABASE_PASSWORD=castros \
./backend/mvnw -B -Dtest=PostgresIntegrationTest test
```

The integration suite is intentionally environment-gated so the ordinary Maven verification does not require a developer machine to have PostgreSQL credentials. When enabled, it executes against real PostgreSQL rather than an in-memory substitute.

## Database migrations and entities

| Migration | Purpose |
|---|---|
| `V1__foundation.sql` | Organizations, users, customers, services, courses, course sessions, spaces, amenities, layouts, bookings, requests, availability rules, exceptions, blocked periods, and the booking overlap exclusion constraint. |
| `V2__supporting_foundation.sql` | Supporting authorization, catalog extension, media, audit, outbox, and related foundation tables, indexes, and uniqueness constraints. |
| `V3__idempotency.sql` | Nullable idempotency key and SHA-256 request fingerprint columns for bookings and requests, with organization-scoped partial unique indexes. |

The JPA model now uses `BookableType` for bookings, availability rules, availability exceptions, blocked periods, and repository queries. Supported values are `SERVICE`, `SPACE`, `COURSE_SESSION`, and `CONSULTATION`. `CONSULTATION` is retained as a compatibility enum value but public booking creation rejects it and instructs clients to represent consultations through `SERVICE`; no pricing or commercial behavior was added.

## Session and CSRF browser contract

The application retains session-based authentication. The browser contract is as follows.

1. The browser first calls `GET /api/v1/auth/csrf` with credentials included. The response returns a token DTO and sets a readable `XSRF-TOKEN` cookie.
2. For every state-changing request, the browser sends the session cookie automatically and copies the `XSRF-TOKEN` cookie value into the `X-XSRF-TOKEN` request header. `X-CSRF-TOKEN` is also accepted for compatibility.
3. The browser must use `credentials: 'include'` or the equivalent client-library setting.
4. The frontend origin must be listed in `ALLOWED_ORIGINS`. CORS allows credentials, configured HTTP methods, JSON content, and the CSRF headers; wildcard origins are not used.
5. `JSESSIONID` is HTTP-only and `SameSite=Lax` by default. `SESSION_COOKIE_SECURE=true` must be used when the application is served over HTTPS.
6. The following public mutations require a valid CSRF token: `POST /api/v1/bookings`, `POST /api/v1/requests`, `POST /api/v1/auth/login`, and `POST /api/v1/auth/logout`. The CSRF delivery endpoint itself is public and read-only.

The public POST endpoints remain unauthenticated for the current product foundation, but they are no longer CSRF-exempt. Authentication and role/organization authorization are separate future controls and are not being inferred here.

## Availability behavior

Availability now returns no slots when neither an active weekly rule nor a date-specific exception exists. The former `08:00–17:00` fallback is available only when `AVAILABILITY_DEVELOPMENT_FALLBACK=true`; the default is `false`. This prevents production from silently treating unspecified hours as business hours.

When a weekly rule exists, the current implementation uses its configured opening time, closing time, slot interval, buffers, minimum notice, and maximum advance days. A closed date exception returns no slots; an open date exception must supply both opening and closing times. Existing bookings and blocked periods mark intersecting slots as `BOOKED`. The implementation does not add capacities, prices, equipment rules, cancellation periods, or additional opening-hour assumptions.

## Booking and request idempotency

`POST /api/v1/bookings` and `POST /api/v1/requests` accept an optional `Idempotency-Key` header.

| Retry condition | Behavior |
|---|---|
| Same organization, same key, same request fingerprint | Returns the original resource result. |
| Same key with a different request fingerprint | Returns `409` with code `IDEMPOTENCY_KEY_REUSED`. |
| Concurrent same-key insert | Database partial unique index allows only one committed key; the losing request re-reads and replays the winner. |
| No key supplied | Existing non-idempotent behavior remains; clients should supply a key for retryable public submissions. |
| Key longer than 255 characters | Returns `400` with validation error. |

The booking fingerprint includes the normalized request fields and business timezone. The request fingerprint includes the public request fields. These semantics are retry protection only and do not establish payment, pricing, cancellation, or capacity rules.

## OpenAPI hardening

`docs/openapi.json` was regenerated from the current running application after Flyway migration and Hibernate validation completed successfully. The specification now includes the `sessionCookie` API-key security scheme for the `JSESSIONID` cookie, the `XSRF-TOKEN`/`X-XSRF-TOKEN` browser contract in the scheme description, typed authentication, CSRF, request, public configuration, and course-session responses, and `ProblemDetailResponse` references on relevant error responses.

The practical public mutation contract now includes the optional `Idempotency-Key` header on booking and request creation. `BookableType` is represented as an enum in the API model, and course sessions are represented by `CourseSessionResponse` rather than an untyped map.

## Integration coverage

The real PostgreSQL integration suite contains eight passing tests when enabled:

| Coverage | Test evidence |
|---|---|
| Empty database, Flyway, Hibernate validation, readiness | `emptyDatabaseRunsFlywayHibernateValidationAndReadiness` |
| Booking overlap exclusion | `bookingOverlapConstraintRejectsOverlappingActiveBooking` |
| Concurrent booking attempts | `concurrentBookingAttemptsLeaveOnlyOneCommitted` |
| Persisted availability rule and blocked period | `availabilityUsesPersistedRuleAndBlockedPeriod` |
| Public request CSRF and validation | `publicMutationRequiresCsrfAndInvalidRequestIsRejectedWithToken` |
| CSRF token cookie delivery | `csrfEndpointDeliversReadableTokenCookie` |
| Login, session, `/me`, logout, and CSRF | `loginSessionMeAndLogoutWorkWithCsrf` |
| Public booking idempotency replay | `publicBookingRetryWithSameIdempotencyKeyReplaysOriginalBooking` |

The ordinary Java 26 Maven gate also passes:

```text
./mvnw -B clean verify
Tests run: 13, Failures: 0, Errors: 0, Skipped: 8
BUILD SUCCESS
```

The eight skipped tests are the PostgreSQL integration suite when `CASTROS_RUN_POSTGRES_IT` is not enabled. With a fresh PostgreSQL database and that flag enabled, all eight integration tests pass.

## Remaining blockers

The foundation is materially safer but is not a claim of full production readiness. Remaining blockers include production-grade role and organization authorization, rate limiting and abuse controls for public mutations, explicit session-store and secret-management decisions, complete outbox/audit event wiring, richer catalog/resource validation, and deployment-level HTTPS/cookie configuration. The current application still does not infer commercial rules such as pricing, capacity, equipment, cancellation windows, or payment behavior.

## References

[1]: https://docs.spring.io/spring-boot/api/java/org/springframework/boot/flyway/autoconfigure/FlywayAutoConfiguration.html "Spring Boot 4.1.1 FlywayAutoConfiguration API"

[2]: https://central.sonatype.com/artifact/org.springframework.boot/spring-boot-starter-flyway/4.1.1 "Spring Boot 4.1.1 spring-boot-starter-flyway artifact"
