# API Contract

The backend foundation exposes versioned routes under `/api/v1`. Public catalog and request/booking flows use transport DTOs; JPA entities are not returned directly. The live OpenAPI contract is available at `/v3/api-docs`, Swagger UI at `/swagger-ui.html`, and the exported snapshot is `docs/openapi.json`.

## Endpoints

| Method | Route | Purpose | Access |
|---|---|---|---|
| GET | `/api/v1/services` | List active services | Public |
| GET | `/api/v1/services/{slug}` | Read one active service | Public |
| GET | `/api/v1/courses` | List active courses | Public |
| GET | `/api/v1/courses/{slug}` | Read one active course | Public |
| GET | `/api/v1/courses/{id}/sessions` | List active course sessions | Public |
| GET | `/api/v1/spaces` | List active spaces | Public |
| GET | `/api/v1/spaces/{slug}` | Read one active space | Public |
| GET | `/api/v1/public/config` | Read business timezone configuration | Public |
| GET | `/api/v1/availability` | Generate advisory availability slots | Public |
| POST | `/api/v1/bookings` | Revalidate and create a booking | Public plus CSRF |
| GET | `/api/v1/bookings/{reference}` | Privacy-limited public lookup | Public |
| POST | `/api/v1/requests` | Create a public request | Public plus CSRF |
| POST | `/api/v1/auth/login` | Establish a session using credentials | Public plus CSRF |
| POST | `/api/v1/auth/logout` | End the current session | Public route plus CSRF |
| GET | `/api/v1/auth/csrf` | Bootstrap the browser CSRF token | Public |
| GET | `/api/v1/auth/me` | Read the current authenticated identity | Authenticated session |

## Request and response DTOs

`POST /api/v1/auth/login` accepts `LoginInput { email, password }` and returns `AuthLoginResponse { email, authenticated }`. `GET /api/v1/auth/me` returns `AuthMeResponse { email, authenticated }`. `POST /api/v1/auth/logout` returns `AuthLogoutResponse { loggedOut }`. `GET /api/v1/auth/csrf` returns `CsrfTokenResponse { token, headerName, parameterName }` and also sets the `XSRF-TOKEN` cookie.

`GET /api/v1/services` and its detail route return `CatalogItem { id, name, slug, description, durationMinutes, bookingEnabled }`. Course listing returns `CourseItem { id, name, slug, description }`. Course sessions return `CourseSessionResponse { id, startAt, endAt }`. Spaces return `SpaceItem { id, name, slug, description, location, capacityMin, capacityMax }`. Public configuration returns `PublicConfigResponse { businessTimezone }`.

`GET /api/v1/availability` accepts `bookableType`, `bookableId`, `date`, and positive `durationMinutes`. `bookableType` is one of `SERVICE`, `SPACE`, `COURSE_SESSION`, or the compatibility value `CONSULTATION`. The response is `AvailabilityResult { date, timezone, slots[] }`, where each slot is `AvailabilitySlot { start, end, status }`.

`POST /api/v1/bookings` accepts `BookingRequest { bookableType, bookableId, date, startTime, endTime, participants, customer, spaceConfiguration, notes }`. `customer` is `CustomerInput { firstName, lastName, email, phone }`; `spaceConfiguration` is `SpaceConfiguration { layoutId, purpose, amenityIds }`. The response is `BookingResponse { id, reference, status, startAt, endAt }`. `COURSE_SESSION` resolves against an active persisted course session. `CONSULTATION` is rejected for booking and must be represented by a `SERVICE`; no commercial behavior is implied.

`POST /api/v1/requests` accepts `RequestInput { firstName, lastName, email, phone, type, message }`, where `type` is one of `CONSULTATION`, `CORPORATE_PROPOSAL`, `TRAINING_INFO`, `SPACE_INFO`, or `GENERAL`. The response is `RequestResponse { id, status }`.

## CSRF and idempotency headers

State-changing browser requests require the `XSRF-TOKEN` cookie value in the `X-XSRF-TOKEN` header; `X-CSRF-TOKEN` is accepted as a compatibility spelling. Requests must include credentials. Booking and request creation also accept an optional `Idempotency-Key` header. A repeated key with the same request fingerprint replays the original result. Reusing a key with different request data returns `409 IDEMPOTENCY_KEY_REUSED`.

## Error format

Errors use the standard foundation shape:

```json
{
  "code": "BOOKING_SLOT_UNAVAILABLE",
  "message": "The selected time slot is no longer available.",
  "status": 409,
  "timestamp": "2026-08-27T15:00:00Z",
  "details": {}
}
```

`ProblemDetailResponse` is referenced by relevant OpenAPI error responses. Validation failures use HTTP 400, unauthenticated protected requests use HTTP 401, CSRF failures use HTTP 403, missing resources use HTTP 404, and booking/idempotency conflicts use HTTP 409. Collection pagination for administrative endpoints remains a follow-up because those endpoints are not yet included in this foundation pass.
