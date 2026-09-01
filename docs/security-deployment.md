# Production security and first-administrator runbook

## Hardened production mode

Production deployments must set `PRODUCTION_MODE=true`. Startup fails when unsafe defaults remain, including insecure session cookies, wildcard/non-HTTPS CORS origins, default database credentials, enabled Swagger/OpenAPI UI, or the availability development fallback.

Required deployment values:

```text
PRODUCTION_MODE=true
DATABASE_URL=jdbc:postgresql://...
DATABASE_USERNAME=...
DATABASE_PASSWORD=<deployment secret>
ALLOWED_ORIGINS=https://<approved frontend origin>
SESSION_COOKIE_SECURE=true
SPRINGDOC_ENABLED=false
AVAILABILITY_DEVELOPMENT_FALLBACK=false
```

Rate limits and browser sessions are PostgreSQL-backed so multiple backend instances share the same protection state.

## One-time initial administrator provisioning

The application never ships a fixed production administrator or hardcoded production password. A clean deployment can explicitly enable one-time provisioning with deployment secrets:

```text
BOOTSTRAP_ADMIN_ENABLED=true
BOOTSTRAP_ORGANIZATION_NAME=<approved organization name>
BOOTSTRAP_ORGANIZATION_SLUG=<approved organization slug>
BOOTSTRAP_ADMIN_EMAIL=<administrator email>
BOOTSTRAP_ADMIN_PASSWORD=<strong secret, 12+ characters>
BOOTSTRAP_ADMIN_FIRST_NAME=<first name>
BOOTSTRAP_ADMIN_LAST_NAME=<last name>
```

The bootstrap operation creates or reuses the organization identified by the supplied slug, creates an administrator role containing the current permission catalog, hashes the password with the configured BCrypt encoder, creates the administrator, and assigns that role.

After the first successful start, remove at minimum `BOOTSTRAP_ADMIN_ENABLED` and `BOOTSTRAP_ADMIN_PASSWORD` from the deployment environment before restarting. If the supplied administrator already exists while bootstrap remains enabled, startup fails instead of silently reusing the bootstrap secret.

## Reverse proxy trust

`TRUST_PROXY_HEADERS=false` and `FORWARD_HEADERS_STRATEGY=none` are the safe defaults. Only enable forwarding-header trust behind a controlled reverse proxy that overwrites client-supplied forwarding headers.

## Health probes

Liveness checks application process state. Readiness includes the database health indicator so an instance is removed from traffic when its PostgreSQL dependency is unavailable. Health responses do not expose component details publicly.
