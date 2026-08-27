# Security

The foundation uses Spring Security with BCrypt password hashing and server-side HTTP session authentication. The login endpoint authenticates against persisted users and saves the security context in the session. Logout clears the security context and session state. The public catalog, availability, booking creation, request creation, and privacy-limited booking lookup routes remain unauthenticated for the public website flow; this is an explicit foundation decision, not a claim that the surface is production-ready.

## Browser session contract

The browser calls `GET /api/v1/auth/csrf` before the first state-changing request. The response contains the CSRF token metadata and sets a readable `XSRF-TOKEN` cookie. The browser must send that cookie value in the `X-XSRF-TOKEN` header, or the compatibility header `X-CSRF-TOKEN`, on each state-changing request. Browser requests must use `credentials: 'include'`.

`JSESSIONID` is HTTP-only and `SameSite=Lax` by default. `SESSION_COOKIE_SECURE=true` is required when the backend is served over HTTPS. The backend accepts only configured origins from `ALLOWED_ORIGINS`, sets `Access-Control-Allow-Credentials: true`, and does not combine credentials with a wildcard origin. Allowed methods and headers include JSON requests, `X-XSRF-TOKEN`, and `X-CSRF-TOKEN`.

CSRF protection is active for all state-changing endpoints, including:

| Method | Path | Authentication | CSRF |
|---|---|---|---|
| POST | `/api/v1/auth/login` | Public | Required |
| POST | `/api/v1/auth/logout` | Public route; clears a session when present | Required |
| POST | `/api/v1/bookings` | Public | Required |
| POST | `/api/v1/requests` | Public | Required |

The CSRF delivery route is public and read-only. `GET /api/v1/auth/me` requires an authenticated session. Public GET catalog, availability, configuration, and booking lookup routes do not require authentication.

## Current controls and remaining gaps

Organization ownership is represented on major records and public operations resolve only an active organization. Full permission tables, membership loading, method-level organization authorization, and administrative controllers remain partial. Rate limiting for login, public requests, booking creation, and reference lookup is not implemented in-process and remains a deployment requirement. Production still needs an explicit session-store, secret-management, HTTPS, and abuse-monitoring decision.
