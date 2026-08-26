# Deployment

Local PostgreSQL and the backend can be started with `docker compose -f infra/docker-compose.yml up --build`. Runtime configuration is environment-driven; `.env.example` contains placeholders only. Flyway owns schema evolution and Hibernate is configured with `ddl-auto=validate`, so automatic production schema mutation is disabled.

The booking transaction rechecks availability before persistence. PostgreSQL protects active-resource overlap with an exclusion constraint over a half-open `tstzrange`, while the application translates constraint conflicts into a stable 409 error. This prevents the check-then-insert race from creating two overlapping active bookings when all writers use the same database.

Production hardening still required includes TLS termination, secret-manager integration, request correlation IDs, rate limiting, session store review, database backup/restore procedures, and a PostgreSQL-backed integration test run.
