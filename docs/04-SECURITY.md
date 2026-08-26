# Security

The foundation uses Spring Security with BCrypt password hashing and server-side HTTP session authentication. The login endpoint authenticates against persisted users and saves the security context in the session. Logout invalidates the context. Public catalog, availability, request, booking creation, and privacy-limited booking lookup routes are intentionally unauthenticated for the public website flow.

CORS is configuration-driven through `ALLOWED_ORIGINS`; credentials must not be paired with wildcard origins. CSRF is ignored only for the public stateless-style flows and login route in this initial pass; the session-authenticated administrative surface must receive a dedicated CSRF policy before production launch. Rate limiting for login, public requests, booking creation, and reference lookup is identified as a deployment requirement and is not yet implemented in-process.

Organization ownership is represented on major records and public operations resolve only an active organization. Full permission tables, membership loading, and method-level organization authorization are **partial** and are a required next task before exposing administrative routes.
