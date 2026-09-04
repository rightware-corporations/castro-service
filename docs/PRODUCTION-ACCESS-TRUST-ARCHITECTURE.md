# Castro’s Services — Production Access & Trust Architecture

Status: implemented architecture baseline following `CASTROS-SERVICES-MASTER-HANDOFF.md`.

## Official experiences

There are exactly four experiences:

1. **Client** — public website; no internal employee login.
2. **Secretary / Operations** — Castro staff application at `/app`.
3. **CEO / Owner** — executive Castro staff experience at `/owner`.
4. **RIGHTWARE Super Admin** — separate platform identity and Control Plane at `/platform`.

No additional internal persona is introduced by this architecture.

## Deployment surfaces

The frontend supports an explicit `VITE_APP_SURFACE` deployment boundary:

| Deployment | `VITE_APP_SURFACE` | Intended host | Routes shipped |
| --- | --- | --- | --- |
| Public web | `PUBLIC` | `castrosservices.<final-domain>` | public catalog, contact, booking and training registration |
| Staff app | `STAFF` | `app.castrosservices.<final-domain>` | `/login`, `/app`, `/owner` |
| RIGHTWARE Control Plane | `PLATFORM` | `ops.rightware.co.mz` or approved equivalent | `/platform/login`, `/platform` |
| Local/integration only | `ALL` | localhost/test | all surfaces for development |

Frontend route exclusion is a UX/deployment boundary only. It is not treated as the security control.

## API trust boundaries

The backend enforces principal type as well as authority:

- `/api/v1/operations/**` requires a Castro `UserAccount`, non-null organization context and `tenant.user`.
- `/api/v1/platform/**` requires a `PlatformPrincipal` and `platform.admin`.
- tenant session introspection/logout uses `/api/v1/auth/me` and `/api/v1/auth/logout`.
- platform session introspection/logout uses `/api/v1/platform/auth/me` and `/api/v1/platform/auth/logout`.
- tenant CSRF bootstrap uses `/api/v1/auth/csrf`.
- platform CSRF bootstrap uses `/api/v1/platform/auth/csrf`.

An authority string alone is therefore insufficient to cross a trust boundary.

## CORS and origins

Production configuration separates tenant/public origins from Control Plane origins:

- `ALLOWED_ORIGINS` — approved Castro public/staff origins.
- `PLATFORM_ALLOWED_ORIGINS` — approved RIGHTWARE Control Plane origins only.

Wildcard credentialed CORS remains forbidden.

For a Control Plane hosted on `ops.rightware.co.mz`, prefer a same-origin reverse proxy for `/api/v1/platform/**` to the backend. This avoids dependence on cross-site session cookies and preserves `SameSite=Lax`. If a dedicated RIGHTWARE platform API host is introduced later, it must remain a separate explicitly approved origin and trust boundary.

## Session and browser security

Production keeps:

- `Secure` session cookies;
- `HttpOnly` session cookies;
- `SameSite=Lax`;
- CSRF token + `X-XSRF-TOKEN` on state-changing requests;
- credentialed CORS restricted to explicit origins;
- session fixation protection;
- login rate limiting;
- HSTS and restrictive backend security headers.

## Persona constraints

- Secretary `/app` does not expose user, role or permission administration routes.
- Owner remains an executive experience and is redirected away from `/app` by the frontend guard.
- RIGHTWARE platform identities are stored separately in `platform_administrators`; they are not Castro tenant roles.
- There is no public employee signup.

## Production topology

```text
Public client
  -> PUBLIC frontend
  -> public API

Secretary / Operations
  -> STAFF frontend
  -> authenticated tenant API
  -> organization isolation + permissions + DB constraints

CEO / Owner
  -> STAFF frontend
  -> /owner executive experience
  -> authenticated tenant API

RIGHTWARE Super Admin
  -> PLATFORM frontend
  -> platform API
  -> PlatformPrincipal + platform.admin + platform audit
```

Security remains layered:

```text
Edge/WAF/rate limiting
-> authentication
-> secure session + CSRF/CORS
-> principal trust boundary
-> permissions
-> organization isolation
-> database constraints
-> audit
```

## Next production hardening stages

This baseline is MFA-ready architecturally but does not claim MFA is already implemented. Before public production launch, P6 must validate environment-specific domains, reverse-proxy behavior, WAF/rate-limit policy, secure cookies over HTTPS, origin allowlists, platform provisioning, tenant isolation and production-like smoke tests.
