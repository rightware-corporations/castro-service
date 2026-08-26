# API Contract

The first backend foundation exposes versioned routes under `/api/v1`. Public catalog and request/booking flows are transport DTO based; JPA entities are not returned directly. OpenAPI is available at `/v3/api-docs` and Swagger UI at `/swagger-ui.html`.

| Method | Route | Purpose |
|---|---|---|
| GET | `/api/v1/services` | List active services |
| GET | `/api/v1/services/{slug}` | Read one active service |
| GET | `/api/v1/courses` | List active courses |
| GET | `/api/v1/courses/{slug}` | Read one active course |
| GET | `/api/v1/courses/{id}/sessions` | List active course sessions |
| GET | `/api/v1/spaces` | List active spaces |
| GET | `/api/v1/spaces/{slug}` | Read one active space |
| GET | `/api/v1/availability` | Generate advisory availability slots |
| POST | `/api/v1/bookings` | Revalidate and create a booking |
| GET | `/api/v1/bookings/{reference}` | Privacy-limited public lookup |
| POST | `/api/v1/requests` | Create a public request |
| POST | `/api/v1/auth/login` | Establish a session using credentials |
| POST | `/api/v1/auth/logout` | End the current session |
| GET | `/api/v1/auth/me` | Read the current authenticated identity |

Errors use `{code,message,status,timestamp,details}`. Booking conflicts return `BOOKING_SLOT_UNAVAILABLE` with HTTP 409. Collection pagination for administrative endpoints remains a follow-up because those endpoints are not yet included in this foundation pass.
