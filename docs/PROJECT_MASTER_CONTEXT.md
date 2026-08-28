# Castro’s Services — Project Master Context

## Purpose

This repository is the implementation source of truth for Castro’s Services. It contains the public experience, booking platform, operations/admin foundations and the Java Spring Boot backend.

## Product direction

The public product is organized around three experiences:

1. **Serviços** — consulting and professional services.
2. **Formação** — courses, workshops and corporate training.
3. **Espaços** — physical-space discovery, exploration, configuration and booking.

The differentiated conversion journey is:

`Discovery → Exploration → Configuration → Booking → Conversion`

A complete LMS, payments, AR and complex 3D are outside the current launch scope.

## Visual direction

Castro’s must feel editorial, institutional, human and spatial rather than like a generic SaaS template.

### Typography

- **Instrument Serif** — editorial/display headings, hero statements and institutional moments.
- **Manrope** — body text, navigation, controls, forms, operations and administration.

These type choices are retained.

### Palette

- Navy `#17184F`
- Deep Navy `#10133B`
- Teal `#22BBAE`
- Green `#64C98A`
- Warm Cream `#F1DEAE`
- Off White `#FAF9F5`
- White `#FFFFFF`
- Charcoal `#20232A`
- Muted `#6B7280`
- Border `#E6E7EB`

### Art direction rules

Use generous editorial typography, strong media, controlled asymmetry, spatial rhythm and subtle geometry derived from the Castro’s connected-node symbol. Avoid glassmorphism, neon, decorative gradients, floating SaaS cards, generic blobs, fake metrics, fake testimonials and fabricated business facts.

The existing Phase 3A public screens are considered **functional foundations, not final visual approval**. Their routing, data hooks, accessibility infrastructure and state handling should be preserved, while their public compositions should be substantially enriched.

## Repository branches

- `main` — stable baseline; do not use for active integration work until the platform is validated.
- `frontend/foundation` — frontend foundation, design system, Phase 3A and public API integration history.
- `backend/foundation` — Spring Boot foundation and backend hardening history.
- `integration/castros-platform` — active integrated development branch containing both histories. This is the current working branch.

## Repository layout

```text
/
├── src/                 React/TypeScript frontend
├── package.json
├── vite.config.ts
├── backend/             Java 26 / Spring Boot backend
├── docs/                contracts and project context
├── infra/
└── README.md
```

## Frontend stack

- React + TypeScript
- Vite
- React Router
- TanStack Query
- React Hook Form
- Zod
- date-fns
- lucide-react
- Vitest
- CSS custom-property design tokens

The design system separates primitives from reusable patterns. Pages should remain thin; domain behavior belongs in features and API boundaries.

## Backend stack

- Java 26
- Spring Boot 4.1.1
- Spring Web
- Spring Security
- Spring Data JPA
- PostgreSQL
- Flyway
- Springdoc OpenAPI
- Actuator

The backend hardening proved clean PostgreSQL startup through Flyway migrations, Hibernate validation and readiness.

## Public backend contract

Current public surface includes:

```text
GET  /api/v1/public/config
GET  /api/v1/services
GET  /api/v1/services/{slug}
GET  /api/v1/courses
GET  /api/v1/courses/{slug}
GET  /api/v1/courses/{id}/sessions
GET  /api/v1/spaces
GET  /api/v1/spaces/{slug}
GET  /api/v1/availability
POST /api/v1/bookings
GET  /api/v1/bookings/{reference}
POST /api/v1/requests
GET  /api/v1/auth/csrf
POST /api/v1/auth/login
POST /api/v1/auth/logout
GET  /api/v1/auth/me
```

### Browser security contract

State-changing browser requests use:

- `credentials: include`
- `GET /api/v1/auth/csrf`
- readable `XSRF-TOKEN` cookie
- `X-XSRF-TOKEN` request header

Public booking and request creation support `Idempotency-Key`. One logical submission must reuse its key when retried.

### Public bookable types

The public frontend exposes only:

- `SERVICE`
- `SPACE`
- `COURSE_SESSION`

`CONSULTATION` remains a backend compatibility enum but is not a public booking option; consultation booking is represented as a service.

## Availability rule

No configured weekly rule or date exception means **no available slots**. Development-only fallback hours are disabled by default. The frontend must treat zero slots as a valid empty state, not as an API failure.

## Current frontend state

Implemented public routes:

```text
/
/servicos
/servicos/:slug
/formacao
/formacao/:slug
/contacto
```

Foundation routes/placeholders also exist for spaces, booking, auth, operations and administration.

Phase 3A must not be treated as final public art direction. Existing screenshots are intentionally conservative and lack the richness required for the final Castro’s experience.

## Current priority

1. Verify and correct frontend/backend DTO alignment in the integrated branch.
2. Build **Public V2** with significantly richer composition while retaining Instrument Serif + Manrope.
3. Implement Spaces catalog and detail.
4. Implement 360 Explorer architecture with polished fallback when real panoramas are absent.
5. Implement shareable room configuration.
6. Implement real booking flow against availability and booking APIs.
7. Complete responsive visual QA across mobile, tablet and desktop.
8. Add the most valuable operations screens after the public conversion journey is strong.

## No-invention rule

Do not invent or present as facts:

- prices
- business opening hours
- cancellation policies
- room equipment
- room layouts
- capacities beyond backend/approved data
- clients
- metrics
- awards
- instructors
- testimonials
- partners
- company history
- response-time SLAs

Development fixtures may be used to exercise UI composition, but must remain clearly non-production data and isolated from product components.

## Responsive quality bar

Mobile must be recomposed, not scaled down. Tables become list/card patterns where appropriate; drawers and dialogs become mobile sheets/fullscreen experiences; booking CTAs remain reachable; space viewer controls are touch-first.

Primary QA widths include 360/390/430 mobile, 768/820/1024 tablet and 1280/1440/1920 desktop, with additional edge-width checks before release.

## Current delivery strategy

Prioritize depth over superficial screen count. A strong public experience, spaces explorer/configurator and real booking journey are more valuable for the immediate demonstration than dozens of unfinished CRUD screens.
