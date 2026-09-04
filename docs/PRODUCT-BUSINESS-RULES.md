# Castro’s Services — Product Business Rules

This document records business decisions confirmed during product review. It complements the implementation checklist and persona architecture.

## 1. Public experiences

The public product is not only a landing page. It combines discovery, lead capture, service/training interest, space exploration and space booking.

The system must preserve context between discovery and conversion. A visitor must not be required to re-select information the system already knows from the page, entity or CTA that originated the flow.

## 2. V1 booking scope

Public time-slot booking in V1 is a **Space** capability.

- `SPACE` → public availability, date/time selection and booking flow.
- `SERVICE` → public request/interest flow unless Castro’s later confirms a real appointment model for that service.
- `COURSE_SESSION` → training interest/registration context unless Castro’s later confirms that a published session should use booking semantics.

The backend may retain reusable booking primitives, but the public product must not expose unsupported booking journeys merely because the technical model can represent them.

## 3. Training without published dates

A training page must never become a dead end when no session is published. It should support contextual conversion such as:

- receive future dates;
- request information about the selected training;
- request tailored corporate training.

The selected training context must carry into the resulting request/lead.

## 4. Lead and customer lifecycle

A website visitor is not automatically a customer.

The target product lifecycle is:

`Visitor → Lead → Qualified → Customer → Returning Customer`

The exact persistence migration is implemented incrementally to preserve existing production-safe data and contracts.

## 5. Secretary authority

The Secretary operates the business day to day. The experience may include requests, space bookings, calendar, contacts/customers, tasks, notifications, reports, services, training, spaces, availability and approved public content/media.

The Secretary must not administer platform/identity security:

- create internal users;
- define roles;
- edit permission matrices.

Those controls belong to RIGHTWARE Platform Administration.

## 6. CEO / Owner authority

The CEO/Owner receives an executive experience focused on visibility, agenda, demand, customers/leads and reports. It is intentionally simpler than the operational workspace.

## 7. RIGHTWARE Super Admin

The Super Admin is a platform identity separate from Castro’s organization roles. It owns technical access administration and platform security boundaries.

## 8. Calendar architecture

The Castro’s database and booking/availability engine remain the source of truth.

A future Google Calendar integration may receive or synchronize confirmed events from the Castro’s system, but Google Calendar must not become the primary booking database or business-rule engine.

Google Calendar integration is optional and does not block V1 delivery or presentation.

## 9. Navigation behavior

Changing to a new route should open the destination at the top of the page. Normal browser scrolling remains available. Dedicated decorative scroll-navigation controls are not required.
