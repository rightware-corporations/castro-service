# Castro’s Services Platform

Monorepo for the Castro’s Services public product, Operations/Admin frontend, Spring Boot backend and deployment infrastructure.

## Repository structure

```text
castro-service/
├─ frontend/        # React + TypeScript + Vite
├─ backend/         # Spring Boot + PostgreSQL/Flyway
├─ infra/           # deployment/infrastructure assets
├─ docs/            # architecture and implementation tracking
└─ .github/         # CI/CD workflows
```

The repository root is reserved for cross-project documentation, orchestration and CI/CD. Frontend package manifests, Vite configuration and source code live inside `frontend/`.

## Frontend

```bash
cd frontend
npm install
npm run dev
```

Quality gates:

```bash
cd frontend
npm run lint
npm run typecheck
npm run test
npm run build
```

Frontend environment:

```bash
cd frontend
cp .env.example .env.local
# VITE_API_BASE_URL=http://localhost:8080
```

Architecture rules are documented in `docs/frontend-architecture.md`.

## Backend

```bash
cd backend
./mvnw spring-boot:run
```

Backend verification:

```bash
cd backend
./mvnw -B clean verify
```

## Frontend architecture

```text
frontend/src/
├─ app/             # composition root, router, providers, app layouts
├─ features/        # domain-owned product capabilities
├─ api/             # typed HTTP contracts/adapters
├─ domain/          # transport-independent domain rules/types
├─ design-system/   # primitives, patterns and tokens
├─ pages/           # legacy route-level area being migrated into features
├─ styles/          # global/composition styles
├─ utils/           # cross-feature generic helpers only
└─ test/            # shared test setup/fixtures only
```

New functionality must be feature-owned. The generic `pages/` area must not continue growing; existing Operations/Admin pages are migrated domain-by-domain while functionality is completed.

## Integration contract

The frontend uses the Spring `/api/v1` contract through typed adapters. Browser authentication is session-based, HTTP requests send credentials, state-changing requests use CSRF, and retry-sensitive booking/request submissions support idempotency keys.

Missing Castro-specific business information must not be fabricated. Unconfirmed copy, media, equipment, prices, policies, metrics, testimonials and operational facts remain explicitly pending until approved.

## CI

Pull requests targeting `main` run two independent quality gates:

- frontend: `npm ci`, lint, typecheck, tests and production build from `frontend/`;
- backend: Maven clean verify from `backend/`.

The implementation completion source of truth is `docs/implementation-checklist.md`.
