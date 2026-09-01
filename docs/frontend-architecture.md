# Frontend Architecture

This repository is a monorepo. Deployable applications must live in explicit workspaces instead of mixing application source and package manifests at repository root.

## Repository layout

```text
castro-service/
├─ frontend/        # React/Vite deployable application
├─ backend/         # Spring Boot deployable application
├─ infra/           # deployment/infrastructure assets
├─ docs/            # architecture, contracts and implementation tracking
└─ .github/         # CI/CD workflows
```

Repository root is reserved for cross-project documentation, orchestration and CI/CD configuration.

## Frontend source layout

```text
frontend/src/
├─ app/             # composition root: providers, router, application layouts
├─ features/        # business/product capabilities grouped by domain
├─ api/             # typed backend contracts and HTTP adapters
├─ domain/          # frontend domain types and rules independent from transport
├─ design-system/   # reusable primitives, patterns and tokens
├─ pages/           # temporary route-level legacy area; migrate pages into owning features
├─ styles/          # global/composition styles; feature-specific styles belong to features
├─ utils/           # truly cross-feature helpers only
├─ test/            # shared test setup/fixtures only
└─ main.tsx         # browser entry point
```

## Ownership rules

1. New product functionality goes under `features/<domain>/`.
2. A feature owns its route components, hooks, schemas, local components and feature-specific styles.
3. `app/` must only compose features and application-wide providers/layouts; it must not contain business rules.
4. `api/` contains transport contracts/adapters only. Business behavior must not be implemented in the HTTP client.
5. `domain/` cannot import React or HTTP-specific modules.
6. `design-system/` cannot import product features.
7. `utils/` is only for generic utilities used by more than one feature. Feature helpers stay inside their feature.
8. Avoid a growing generic `pages/` folder. Existing Operations/Admin pages will be migrated domain-by-domain into `features/operations/` and `features/admin/` as functionality is completed.
9. Tests should live next to the code they validate unless they are shared integration fixtures.
10. No new frontend package/config/source files should be added to repository root.

## Target feature organization

```text
features/
├─ auth/
├─ home/
├─ services/
├─ courses/
├─ spaces/
│  ├─ public/
│  ├─ admin/
│  ├─ layouts/
│  ├─ resources/
│  ├─ scenes/
│  └─ hotspots/
├─ booking/
├─ contact/
├─ operations/
│  ├─ dashboard/
│  ├─ requests/
│  ├─ bookings/
│  ├─ customers/
│  ├─ calendar/
│  ├─ tasks/
│  ├─ notifications/
│  └─ reports/
└─ admin/
   ├─ access/
   ├─ availability/
   ├─ content/
   ├─ settings/
   └─ audit/
```

The migration is incremental: structural moves must preserve behavior and pass lint, typecheck, tests and build before feature development resumes.
