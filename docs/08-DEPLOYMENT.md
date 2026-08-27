# Deployment

Local PostgreSQL and the backend can be started with `docker compose -f infra/docker-compose.yml up --build`. Runtime configuration is environment-driven; `backend/.env.example` contains placeholders only. Spring Boot’s Flyway starter owns schema evolution and Hibernate is configured with `ddl-auto=validate`, so automatic production schema mutation is disabled. On a completely empty PostgreSQL database, Flyway now applies `V1`, `V2`, and `V3` before Hibernate validation, and the application reaches readiness.

The booking transaction rechecks availability before persistence. PostgreSQL protects active-resource overlap with an exclusion constraint over a half-open `tstzrange`, while the application translates constraint conflicts into a stable 409 error. This prevents the check-then-insert race from creating two overlapping active bookings when all writers use the same database.

Availability no longer assumes `08:00–17:00` in production. A missing rule or date exception returns no slots. The development fallback can be explicitly enabled with `AVAILABILITY_DEVELOPMENT_FALLBACK=true`; it defaults to `false`.

Session cookies are HTTP-only and `SameSite=Lax` by default. Set `SESSION_COOKIE_SECURE=true` behind HTTPS, configure the browser origin through `ALLOWED_ORIGINS`, and use the CSRF cookie/header contract documented in `04-SECURITY.md`.

The real PostgreSQL integration suite is environment-gated. With a fresh database and PostgreSQL credentials, run:

```bash
CASTROS_RUN_POSTGRES_IT=true \
CASTROS_IT_DATABASE_URL=jdbc:postgresql://localhost:5432/castros_it \
CASTROS_IT_DATABASE_USERNAME=castros \
CASTROS_IT_DATABASE_PASSWORD=castros \
./backend/mvnw -B -Dtest=PostgresIntegrationTest test
```

Production hardening still required includes TLS termination, secret-manager integration, request correlation IDs, rate limiting, session-store review, database backup/restore procedures, full organization authorization, complete outbox/audit wiring, and deployment-level PostgreSQL integration execution in CI.
