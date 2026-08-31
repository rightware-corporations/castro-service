# Castro’s Digital Platform — Backend Foundation Engineering Report

**Author:** Manus AI
**Branch:** `backend/foundation`
**Commit:** `f2d2449`
**Overall status:** **PARTIAL**

## 1. Status

The repository was audited before implementation. Its initial state contained only `README.md` on the `main` branch; there was no existing backend, frontend, migration, build, test, or infrastructure implementation to preserve. A first backend foundation was added under the permitted `backend/`, `docs/`, `infra/`, and `README.md` scope. No frontend files were created or modified.

The result is intentionally classified as **PARTIAL**, not DONE. The core Spring Boot, PostgreSQL/Flyway, catalog, customer/request, availability, booking, authentication, OpenAPI, Docker, and test foundations are present. Full permission enforcement, organization-membership authorization, production rate limiting, outbox wiring from business transactions, audit emission, administration APIs, and PostgreSQL integration/concurrency tests remain incomplete.

## 2. Architecture

The application uses domain-oriented packages rather than a single controller/service/repository hierarchy. The implemented areas are `shared`, `api`, `organization`, `user`, `customer`, `request`, `catalog`, `availability`, `booking`, and `platform`.

The most important decisions are as follows:

| Decision | Implementation |
|---|---|
| Framework | Spring Boot 4.1.1 with Java release target 26 |
| Persistence | Spring Data JPA backed by PostgreSQL |
| Schema authority | Flyway migrations; Hibernate is configured with `ddl-auto: validate` |
| Time | UTC persistence and configurable business timezone, defaulting to `Africa/Maputo` |
| Booking conflict protection | Application recheck plus PostgreSQL GiST exclusion constraint on active half-open time ranges |
| Authentication | Spring Security HTTP session with BCrypt password hashing |
| Contracts | Explicit DTOs and versioned `/api/v1` routes |
| Public customer matching | Organization-scoped email match first, then phone match; otherwise create a customer |
| Media | Metadata-only relational foundation with storage key abstraction represented in the model |
| Future events | Outbox and audit table foundations are present; business-event emission is a follow-up |

Spring Boot 4.1.1 officially requires at least Java 17 and is compatible with Java versions through Java 26 [1].

## 3. Files

The major deliverables are `backend/pom.xml`, the Maven Wrapper, the Spring Boot application and domain packages, `backend/src/main/resources/application.yml`, the two Flyway migrations, behavior tests, `backend/Dockerfile`, `backend/.env.example`, `infra/docker-compose.yml`, and the backend-specific documents under `docs/`.

The implementation map is in `docs/01-IMPLEMENTATION-MAP.md`. The API, security, and deployment documents are in `docs/03-API-CONTRACT.md`, `docs/04-SECURITY.md`, and `docs/08-DEPLOYMENT.md`.

## 4. Database

`V1__foundation.sql` creates organizations, users, customers, services, courses, course sessions, spaces, scenes, hotspots, availability rules, exceptions, blocked periods, bookings, and requests. `V2__supporting_foundation.sql` adds roles, permissions, organization members, role-permission links, catalog category/layout/amenity extensions, content, media, outbox, and audit tables.

The migrations include organization-scoped unique slugs, unique booking references, membership and permission uniqueness, foreign keys, booking time validity, lookup indexes, and the `bookings_no_active_overlap` PostgreSQL exclusion constraint. The exclusion constraint applies only to active statuses and uses `[)` ranges, so a booking ending exactly when another begins does not overlap. The migrations are ordered and immutable in the repository.

## 5. APIs

The implemented routes are:

| Method | Route | Status |
|---|---|---|
| GET | `/api/v1/public/config` | Implemented |
| GET | `/api/v1/services` | Implemented |
| GET | `/api/v1/services/{slug}` | Implemented |
| GET | `/api/v1/courses` | Implemented |
| GET | `/api/v1/courses/{slug}` | Implemented |
| GET | `/api/v1/courses/{id}/sessions` | Implemented |
| GET | `/api/v1/spaces` | Implemented |
| GET | `/api/v1/spaces/{slug}` | Implemented |
| GET | `/api/v1/availability` | Implemented |
| POST | `/api/v1/bookings` | Implemented |
| GET | `/api/v1/bookings/{reference}` | Implemented with privacy-limited DTO |
| POST | `/api/v1/requests` | Implemented |
| POST | `/api/v1/auth/login` | Implemented |
| POST | `/api/v1/auth/logout` | Implemented |
| GET | `/api/v1/auth/me` | Implemented |

Errors are mapped to a stable `{code, message, status, timestamp, details}` response shape. DTOs are separate from JPA entities. Administrative CRUD and consistent pagination for growing internal collections are not yet implemented.

## 6. Security

Password authentication uses BCrypt with a cost factor of 12. Login creates a server-side HTTP session, logout clears the security context, and `/api/v1/auth/me` reports the current authenticated identity. CORS is driven by `ALLOWED_ORIGINS`, with credentials enabled and no wildcard default.

The public catalog, availability, booking creation, request creation, and privacy-limited booking lookup routes are intentionally permitted for the public website flow. The roles, permissions, membership, and role-permission tables are present, but permission loading and organization-membership checks are not yet wired into service/API authorization. This is a **security blocker before production administrative exposure**. Login rate limiting and a production-grade external session-store decision are also still required.

## 7. Booking Engine

Availability generation considers configured weekly rules, date exceptions, blocked periods, existing active bookings, requested duration, slot interval, buffers, minimum notice, maximum advance, and the `Africa/Maputo` business timezone by default. Booking creation converts local date/time inputs into offset timestamps, validates active service/space resources, rechecks availability inside the transaction, associates a customer, generates a human-friendly `CST-XXXXXXXX` reference, and persists the booking.

The application overlap query uses half-open interval semantics. PostgreSQL additionally enforces the invariant across concurrent writers through a GiST exclusion constraint. A database constraint violation is translated into `BOOKING_SLOT_UNAVAILABLE` with HTTP 409 rather than exposing SQL details. External notification delivery is not part of booking transaction success.

The customer matching strategy is deliberately conservative: an organization-scoped normalized email match is preferred, then an organization-scoped phone match; otherwise a new customer is created. Automatic merging of conflicting identities is not performed.

## 8. OpenAPI

The project includes springdoc OpenAPI configuration. The runtime contract is exposed at `/v3/api-docs`, with Swagger UI at `/swagger-ui.html`. The initial controller routes and DTOs are versioned under `/api/v1`. A dedicated OpenAPI snapshot test and generated-contract diff gate are follow-up tasks.

## 9. Tests

The Java 26 verification run executed four tests with zero failures and zero errors. Coverage includes default slot generation, exact-boundary interval behavior, existing-booking conflict rejection, blocked-period rejection, and basic interval semantics.

The current suite does not yet include PostgreSQL-backed Flyway/JPA integration tests, concurrent booking requests, security integration tests, full exception/minimum-notice/max-advance matrices, or end-to-end API tests. Those are required before production readiness can be claimed.

## 10. Build

The exact successful validation command was:

```bash
cd backend
JAVA_HOME=/home/ubuntu/tools/<extracted-jdk-26-directory> ./mvnw -B clean verify
```

The build compiled main and test sources with `javac [release 26]`, ran all four tests successfully, packaged the Spring Boot JAR, and completed with `BUILD SUCCESS`. The sandbox’s system Java remains Java 21, so `./mvnw -B test` without the Java 26 `JAVA_HOME` override correctly fails with `release version 26 not supported`; this is an environment fact, not a project downgrade.

## 11. Docker / Infrastructure

`backend/Dockerfile` provides a Maven build stage and non-root Java 26 runtime stage. `infra/docker-compose.yml` provisions PostgreSQL 17 and the backend with environment-driven configuration. `backend/.env.example` contains placeholders only.

Docker was not executable in the sandbox because the Docker CLI/daemon was unavailable. Therefore, the compose deployment was prepared but not runtime-validated in this environment.

## 12. Documentation

The repository now contains the implementation map, API contract, security notes, deployment guide, and this final engineering report. The security and deployment documents explicitly identify incomplete production requirements rather than presenting the foundation as a finished platform.

## 13. Git

All changes are committed on the dedicated branch `backend/foundation` in commit `f2d2449` (`feat: add Castro backend foundation`). The working tree is clean. The final diff contains no frontend paths and no detected credential, token, or production connection-string patterns.

## 14. Blockers

| Classification | Blocker | Consequence |
|---|---|---|
| BLOCKED_BY_ENVIRONMENT | Docker is unavailable in the sandbox | Compose runtime and PostgreSQL integration could not be executed here |
| BLOCKED_BY_SECURITY_DECISION | Permission/membership enforcement is only a model foundation | Administrative APIs must not be exposed until permission checks and organization isolation are wired and tested |
| BLOCKED_BY_PRODUCT_DECISION | Public booking idempotency semantics are documented but not implemented | Client retry behavior needs an approved idempotency contract |
| BLOCKED_BY_DATABASE_DECISION | Outbox and audit schemas exist but are not emitted by all business transitions | Event durability and audit completeness need an application-level implementation pass |

## 15. Next Tasks

The next priority is to implement permission-based authorization and organization isolation at the application boundary, including role/permission loading, membership checks, protected administrative routes, and security integration tests. The second priority is PostgreSQL-backed integration testing for Flyway, the exclusion constraint, booking transactions, and concurrent attempts. The third priority is to wire transactional outbox and append-only audit records into booking, request, availability, user, and catalog mutations.

After those foundations, implement rate limiting and approved public-booking idempotency, complete content/media storage adapters, add administrative APIs with pagination and OpenAPI contract tests, and execute the Docker/PostgreSQL deployment validation in an environment with a working container runtime.

## References

[1]: https://docs.spring.io/spring-boot/system-requirements.html "Spring Boot System Requirements"
