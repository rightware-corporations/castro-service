# Castro’s Services Frontend

Greenfield frontend foundation for Castro’s Services. The public experience is editorial, human and photographic; the authenticated experience is operational, compact and permission-aware. Both contexts share design tokens and accessibility principles without being forced into the same layout density.

## Stack

- React + TypeScript
- Vite
- React Router
- TanStack Query
- React Hook Form + Zod
- date-fns
- lucide-react
- CSS tokens and responsive composition without a visual UI framework

## Development

```bash
npm install
npm run dev
```

Quality commands:

```bash
npm run lint
npm run typecheck
npm run test
npm run build
```

## Architecture

```text
UI
→ domain/application hooks
→ service layer
→ typed API client
→ HTTP API
```

`src/api/contracts/` contains backend DTOs and explicit DTO-to-domain mappers. The frontend domain models live in `src/domain/models.ts` and should not inherit backend naming or status values without mapping.

`src/api/client/adapters.ts` contains interchangeable `MockApiAdapter` and `HttpApiAdapter` implementations behind explicit API ports. `HttpApiClient` always sends `credentials: 'include'` for session-based integration and converts Spring ProblemDetail payloads into `ApiError`. No CSRF handling is assumed while that backend contract is being hardened.

Verified endpoint paths are centralized in `src/api/client/routes.ts`. They currently cover public config, services, courses, course sessions, spaces, availability, bookings, requests and authentication. No frontend-only endpoint aliases are added.

`src/domain/permissions.ts` provides the granular backend-driven `can(permission)` abstraction. It is intentionally independent from the current `/api/v1/auth/me` session DTO because that endpoint does not expose permissions yet.

The shared booking domain is `src/features/booking/` and supports `SPACE`, `SERVICE`, and `COURSE_SESSION` targets with explicit deep-link-safe route steps for selection, time, customer details, review and confirmation.

## Foundation and Contract Alignment scope

Foundation establishes routing, public/auth/operations shells, typography, design tokens, responsive navigation foundations, API/mock boundaries, permission evaluation and quality scripts. Phase 1.1 additionally aligns DTOs, mappings, backend error handling, availability serialization, session credentials and refresh-safe booking routes. Detailed product screens, business content and production integrations remain outside this phase.

All missing business information must remain labelled as `[CONTENT TBD]` or `[A confirmar]`. No prices, policies, metrics, room capacities, equipment, course data, availability or contact facts are fabricated in the Foundation.

## Design System Phase 2

Phase 2 provides reusable production UI infrastructure without implementing final product screens. The public context remains editorial and photography-led; operations and administration remain denser, Manrope-first and permission-aware. No glassmorphism, neon, decorative gradients or business facts are introduced. The only gradient is the functional skeleton shimmer.

### Component inventory

`src/design-system/primitives/` includes `Button`, `IconButton`, `Field`, `TextField`, `Textarea`, `Select`, `Checkbox`, `Radio`, `Switch`, `SearchInput`, `Badge`, `Divider`, `Avatar`, `Spinner` and `Skeleton`.

`src/design-system/patterns/` includes `Alert`, `InlineError`, `EmptyState`, `ErrorState`, `LoadingState`, `ConfirmDialog`, `Dialog`, `Drawer`, `BottomSheet`, `Popover`, `Tooltip`, `DropdownMenu`, `Breadcrumbs`, `Tabs`, `Stepper`, `Pagination`, `MobileTopbar`, `MobileBottomNavigation`, `DataTable`, `ResponsiveEntityList`, `EntityCard`, `DefinitionList`, `ActivityList`, `SearchToolbar`, `FilterGroup`, `FilterButton`, `ActiveFilterChips`, `ClearFilters`, `CalendarFoundation`, `DatePicker`, `TimeSlot`, `TimeSlotGroup`, `BookingStepper`, `BookingSummary`, `FormSection`, `FormActions`, `StickyMobileActions` and `FormSummary`.

The same data columns can render as `DataTable` on desktop/tablet and `EntityCard`/`ResponsiveEntityList` on mobile. The booking primitives expose presentation states only; backend availability remains authoritative. Form primitives accept native props and remain independent of React Hook Form, allowing registration to be composed at feature level.

The dev-only route `/__dev/components` is included only when `import.meta.env.DEV` is true. It is a QA harness, not a production public page, and uses only `[CONTENT TBD]` / `[A confirmar]` neutral values.

## Phase 3A — Public Core Experience

Phase 3A implements the public core for `/`, `/servicos`, `/servicos/:slug`, `/formacao`, `/formacao/:slug` and `/contacto`. Spaces, the 360 explorer, room configuration, booking business flows, operations and administration remain deferred and are represented only by explicit foundation placeholders.

Public feature ownership is separated by domain:

```text
src/features/home/
src/features/services/
src/features/courses/
src/features/spaces/
src/features/contact/
```

TanStack Query owns all public GET requests through feature hooks. Pages remain thin containers and pass typed query resources into reusable public views. The contact mutation uses React Hook Form, Zod, the verified `RequestRequestDto` shape and the existing `ApiError` boundary while retaining the mock adapter.

Catalog and detail states include loading, empty, error, success and not-found behavior where applicable. Course sessions use only backend-supported `startAt` and `endAt` values; no instructor, venue, capacity, format, price or date is invented. Service detail uses duration and booking indication only when supplied by the backend.

The homepage uses a restrained editorial composition with a three-experience selector, API/mock previews, an explicit media placeholder while approved photography is absent, institutional content structure and a contact CTA. The implementation deliberately avoids a generic SaaS card farm, decorative blobs, unverified marketing claims and fabricated business facts.

The responsive composition recomposes at mobile widths: hero actions become full-width, previews become linear, catalog rows become vertical, contact fields become one column and submit actions become sticky mobile actions. The visual QA matrix includes 390x844, 820x1180 and 1440x900 captures, with CSS foundations covering the full required width range.
