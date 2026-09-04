# CASTRO’S SERVICES — MASTER HANDOFF

**Status:** Canonical continuation handoff  
**Repository:** `rightware-corporations/castro-service`  
**Default branch:** `main`  
**Active feature branch at handoff:** `feature/public-intent-context`  
**Active PR:** #36 — `feat: connect scheduling, booking recovery, and training registrations`  
**Date:** 2026-09-04

---

# 0. READ THIS FIRST — NON-NEGOTIABLE PRODUCT TRUTH

## There are exactly FOUR user experiences/personas

1. **Cliente** — public user, no internal login.
2. **Secretária / Operations** — daily operator of Castro’s Services.
3. **CEO / Owner** — Elizabeth; executive owner, not the daily operator.
4. **RIGHTWARE Super Admin** — platform authority/control plane.

> **THERE IS NO “GESTOR” PERSONA. DO NOT CREATE OR REINTRODUCE ONE.**

The management responsibilities that might otherwise be called “gestor” are intentionally distributed between the **Secretária** (daily operational management) and the **CEO/Owner** (executive oversight/decisions).

Do not invent extra roles/personas merely because a generic SaaS normally has them.

---

# 1. REPOSITORY AND ENGINEERING WORKFLOW

Repository:

```text
https://github.com/rightware-corporations/castro-service
```

`main` is the protected source of truth.

Required workflow:

```text
AUDIT LIVE STATE
→ CREATE/USE SHORT-LIVED FEATURE BRANCH
→ SMALL SEPARATE COMMITS BY CONCERN
→ TEST
→ PR
→ REQUIRED CI 3/3
→ NORMAL MERGE COMMIT
→ POST-MERGE CI 3/3
→ UPDATE CHECKLIST/DOCS WHEN VERIFIED
```

Do not:

- commit directly to `main`;
- squash the work;
- rebase away the commit history;
- force-push;
- bypass required CI;
- claim something is merged or green without live verification.

Required status checks on `main`:

- `Backend quality gates`
- `Frontend quality gates`
- `PostgreSQL integration gates`

All three must pass before a normal merge.

The user explicitly wants multiple traceable commits instead of one giant commit.

---

# 2. CURRENT LIVE STATE AT THIS HANDOFF

## Last known stable `main`

PR #35 was merged to:

```text
513c4828fe1dcd1fffa7a9e126c2163093b454db
```

Post-merge CI #234 was verified **3/3 green**.

## Current open PR #36

URL:

```text
https://github.com/rightware-corporations/castro-service/pull/36
```

Live state before this handoff commit:

```text
PR: #36
Title: feat: connect scheduling, booking recovery, and training registrations
State: OPEN
Base: main
Base SHA: 513c4828fe1dcd1fffa7a9e126c2163093b454db
Head branch: feature/public-intent-context
Previous head SHA: 9905345bc6109bd8583c3b7f31c27ddcafcf3a43
Commits before this handoff: 54
Changed files before this handoff: 66
```

This handoff is being committed as a separate documentation commit on the same feature branch, therefore **re-fetch PR #36 and its new head SHA before any merge/fix work**.

### CI state before this handoff commit

Integration CI run #238:

```text
Run ID: 33872668385
Backend quality gates: PASS
Frontend quality gates: PASS
PostgreSQL integration gates: FAIL
Failing PostgreSQL job id: 101022112356
```

Do **not** invent the failure reason. The next chat must fetch the current/latest PostgreSQL job logs and diagnose the exact failing assertion/exception before editing code.

### Immediate unfinished task

The first task in the new chat is NOT design and NOT the RIGHTWARE control plane.

It is:

```text
1. Re-fetch PR #36 and current head.
2. Fetch latest CI run/jobs for the current head.
3. Read the PostgreSQL integration failure logs.
4. Fix the proven failure in a separate commit.
5. Re-run/observe CI until 3/3 green.
6. Normal merge PR #36 preserving all commits.
7. Verify post-merge main CI = 3/3 green.
```

Only after that is complete should the next architecture/delivery block begin.

---

# 3. PRODUCT DEFINITION

Castro’s Services is not merely a landing page and not merely an admin dashboard.

The target product is a connected system:

```text
PUBLIC DISCOVERY
→ INTENT CAPTURE
→ REQUEST / BOOKING / REGISTRATION
→ SECRETARY OPERATIONS
→ FOLLOW-UP / CUSTOMER RELATIONSHIP
→ CEO EXECUTIVE VISIBILITY
→ RIGHTWARE PLATFORM CONTROL
```

The product should feel like:

```text
Customer Acquisition
+ Context-aware Lead Capture
+ Scheduling / Booking
+ Training Registration
+ Operations Workspace
+ CRM / Follow-up
+ Executive Oversight
+ Platform Administration
```

Core UX principle:

> **Never ask the user to repeat something the system already knows.**

Examples:

- If the visitor came from a specific training, the request already knows the training.
- If the visitor configured a room for 12 people, the booking already knows 12.
- If the visitor selected a date/time, later steps preserve it.
- If the Secretary opens a booking, customer/contact/context must be immediately visible.
- If the customer returns, history should become useful rather than restarting context from zero.

---

# 4. THE FOUR OFFICIAL EXPERIENCES

## 4.1 Cliente — Public Experience

The Cliente does **not** need an internal employee login.

Public product areas:

```text
Homepage
Services
Service detail
Training catalog
Training detail
Published training sessions
Spaces catalog
Space detail
360 explorer
Room configurator
Contact / Requests
Space reservation
Schedulable consultation appointment
Training session registration
Confirmation states
```

The public site must evolve beyond a text-heavy institutional landing page. It should still be editorial/professional, but richer with approved Castro media/content and context-aware conversion flows.

Public experience priorities:

- discovery;
- trust;
- visual understanding of spaces/services/training;
- clear CTAs;
- contextual intent capture;
- scheduling where appropriate;
- human fallback via configured Castro phone/WhatsApp;
- no dead ends.

## 4.2 Secretária / Operations

Primary daily internal user.

Current/target route family:

```text
/app
```

This is the highest-frequency internal UX.

Core operational areas:

```text
Operational dashboard
Agenda / Calendar
Requests inbox
Bookings / Appointments
Customers / Leads / Contacts
Tasks / Follow-ups
Notifications
Operational reports
Services administration
Training / sessions administration
Spaces administration
Availability
Blocked periods
Content/media operations
```

Scheduling responsibilities:

- see daily/monthly/weekly agenda;
- see appointments/reservations;
- click a day to inspect everything scheduled;
- click a booking to see customer/contact/context/status;
- confirm;
- cancel;
- reschedule;
- create/manual representation where required;
- block time already taken by phone/WhatsApp/offline arrangements;
- manage weekly availability rules/exceptions/block periods;
- manage catalog/content that is operationally appropriate.

The Secretary should NOT control platform security architecture.

Do not give Secretary UX for:

- creating arbitrary roles;
- designing permissions;
- RIGHTWARE platform configuration;
- platform administrator lifecycle;
- unrestricted system-level administration.

## 4.3 CEO / Owner — Elizabeth

Current route family:

```text
/owner
```

Elizabeth is the owner/CEO but is **not expected to operate the company’s daily admin workflow**.

Her UX should prioritize:

```text
Executive dashboard
Overview / attention signals
Agenda
Business activity
Customers / leads visibility
Reports
Operational health / key follow-up signals
```

Principle:

```text
SEE → UNDERSTAND → DECIDE
```

not:

```text
manually edit every booking
manually configure every slot
manually maintain every customer
manually edit every media asset
```

Do not overload the Owner experience with generic SaaS admin menus.

Do not invent fake revenue, conversion metrics, testimonials, or KPIs when real data is not available.

## 4.4 RIGHTWARE Super Admin

This is a **platform identity**, not a Castro tenant role.

Existing foundation from PR #32 includes concepts such as:

```text
platform_administrators
platform_audit_events
platform.admin authority
platform authentication/session
/platform UI/API foundation
```

Target evolution is a proper **RIGHTWARE Control Plane**.

Conceptual target surface:

```text
ops.rightware.co.mz
```

or another explicit RIGHTWARE-controlled hostname chosen at deployment time.

The Super Admin should have:

```text
Platform dashboard
Organizations / tenants
Castro’s Services tenant overview
Platform health
Security
Platform audit
Support controls
Platform users/admin identities
Deployment/environment metadata where appropriate
Future time-bound support access
```

Do not implement the Super Admin as:

```text
Castro role = SUPER_ADMIN
```

Do not share the CEO’s account/password.

Each authorized RIGHTWARE administrator should eventually have an individual platform identity so privileged actions are auditable.

---

# 5. PRODUCTION ACCESS AND TRUST ARCHITECTURE

The user explicitly wants us to design for real production, not MVP shortcuts.

## 5.1 Public Web

Target example:

```text
castrosservices.<final-domain>
```

Purpose:

- public website;
- indexed/shared customer experience;
- public catalog;
- contextual request flows;
- booking/registration entry points.

The public site must NOT expose internal navigation merely because the routes exist in the same codebase.

## 5.2 Staff Application

Target example:

```text
app.castrosservices.<final-domain>
```

This is where authenticated Castro staff enters.

The Staff App serves the two existing Castro internal experiences:

```text
Secretária / OPERATIONS → /app
CEO / OWNER             → /owner
```

Do NOT create separate Secretary and CEO domains unless a real deployment requirement later demands it.

The same authenticated staff surface can resolve the user’s experience from the membership/persona already stored in the system.

No public employee signup.

## 5.3 API

Target example:

```text
api.castrosservices.<final-domain>
```

Trust boundaries should remain explicit:

```text
Public API
Authenticated tenant/internal API
Platform API
```

Security must not rely on a hidden route.

Discovering an endpoint must not grant access.

Frontend guards are UX controls; actual protection must remain on the server and database boundary.

## 5.4 RIGHTWARE Control Plane

Target example:

```text
ops.rightware.co.mz
```

This is distinct from the Castro staff application.

Target controls:

- platform authentication;
- mandatory/strong MFA readiness;
- platform authorization;
- audit;
- eventual Zero Trust/Cloudflare Access or equivalent outer boundary;
- no reuse of Castro tenant credentials;
- future support sessions should be scoped/time-bound and audited rather than giving permanent silent tenant access.

## 5.5 Production Security Principles

Security does NOT depend on URL secrecy.

Target defense stack:

```text
Edge / WAF / rate limiting
→ authentication
→ secure sessions
→ CSRF/CORS boundaries
→ MFA readiness
→ authorization/permissions
→ organization/tenant isolation
→ database constraints
→ audit
```

Sessions/cookies should use appropriate production properties such as:

```text
Secure
HttpOnly
SameSite
correct domain/path scope
```

Employee provisioning is invite/admin controlled, not public signup.

The eventual deployment topology can still use one repository/build system if useful; the important constraint is **trust/surface separation**, not artificial repository duplication.

---

# 6. SCHEDULING / BOOKING ARCHITECTURE

The Clinic Flow reference was useful for UX patterns, but its fake/random frontend slot generation must NOT be copied.

## 6.1 One scheduling engine, different business semantics

### Space

```text
SPACE
→ exclusive resource reservation
→ participants/capacity
→ layout/resources/context
→ date
→ valid slot
→ contact data
→ review
→ reservation confirmation/pending
```

### Schedulable Consultation / Service

A service is schedulable **only if Castro explicitly configures it as schedulable**.

```text
SERVICE
→ consultation already known from context
→ date
→ valid slot
→ contact data
→ review
→ appointment
```

Semantic UX:

- Space: **Reservar**
- Consultation: **Agendar uma conversa / Agendar consultoria**

Both may use the same backend availability engine.

### Training Session

Training is NOT an exclusive slot booking.

```text
COURSE_SESSION
→ dedicated registration model
→ multiple people/organizations may register
→ does not consume the entire session as one exclusive booking
```

Invariant:

> `COURSE_SESSION` must remain excluded from the exclusive SERVICE/SPACE booking-slot engine.

### Training without published session

```text
Training
→ Receive next dates
→ contextual lead/request
```

### Corporate Training

```text
Training
→ Training for my organization
→ contextual corporate request
```

## 6.2 Availability Engine

Real server-side availability must consider:

- weekly rules;
- day exceptions;
- blocked periods;
- existing bookings;
- buffers;
- minimum notice;
- maximum advance window;
- duration;
- resource/service availability policy;
- conflict prevention.

The backend is the authority.

A manipulated frontend request must not be able to create a booking at an interval that the availability engine would never generate.

## 6.3 External/offline bookings

The Secretary must be able to mark a period unavailable because the arrangement came through another channel:

```text
phone
WhatsApp
walk-in/offline
manual corporate arrangement
```

Use blocked periods / appropriate manual operational representation so the public slot engine does not offer already occupied time.

## 6.4 Double-booking protection

Race scenario:

```text
A sees 10:00 available
B sees 10:00 available
A confirms first
B confirms moments later
```

The server must re-check and PostgreSQL constraints/transaction logic remain the last line of defense.

B receives a safe `slot unavailable` outcome and recovery options.

## 6.5 No-slot recovery

Do not dead-end.

Target:

```text
No slots on selected date
→ search next real availability
→ choose next available
→ request another time
→ configured Castro phone
→ contextual WhatsApp
```

## 6.6 Google Calendar

Google Calendar is **optional V2 synchronization only**.

Architecture:

```text
Castro DB = source of truth
        ↓
optional sync/mirror
        ↓
Google Calendar
```

Do not make Google Calendar the primary scheduling database.

---

# 7. INTENT CONTEXT / PUBLIC JOURNEY

The public site should preserve context rather than repeatedly asking the visitor what they want.

Useful session context includes:

```text
entry page
referrer
utm_source
utm_medium
utm_campaign
source type
source entity id
CTA/action
last relevant public context
```

Do not create identifiable “ghost customers” simply because an anonymous browser visited pages.

Anonymous journey context may live in session storage/client context until a person performs a real conversion action such as:

- request;
- booking;
- training registration;
- explicit interest capture.

Then persist relevant context.

Examples:

```text
Training X
→ Receive next dates
→ request already knows Training X
```

```text
Service X
→ Talk about this service
→ contact form already knows Service X
```

```text
Space X
→ configured for 12 participants
→ booking preserves Space X + participants + purpose
```

Configured phone/WhatsApp should be available as human fallback, ideally with contextual text rather than a blank chat.

---

# 8. REQUESTS / CRM / CUSTOMER LIFECYCLE DIRECTION

The current system must evolve away from treating every identifiable contact as an unquestioned “Customer”.

Target lifecycle direction:

```text
VISITOR
→ LEAD
→ QUALIFIED LEAD
→ CUSTOMER
→ RETURNING CUSTOMER
```

Potential simplified Castro UI labels may be:

```text
Potencial
Em acompanhamento
Cliente
Cliente recorrente
```

Do not silently over-engineer the number of stages before checking the existing schema/workflows.

## Requests as a real commercial inbox

A Request should become operational/commercial, carrying:

```text
origin/context
interest
contact
status
responsible person
next follow-up
history/activity
linked service/training/space when relevant
```

The Secretary needs to know **why the person contacted Castro**, not merely see a generic message.

## Opportunities / next action

Do not add crude buttons named “UPSELL” or “DOWNSELL”.

Prefer a next-action/opportunity concept, e.g.:

```text
Last interaction
Current interest
Next follow-up
Possible relevant offer (only from real configured Castro offerings)
```

---

# 9. TASKS AND NOTIFICATIONS

Tasks are operational work items, potentially linked to:

- Request;
- Booking;
- Customer/Lead;
- follow-up.

Future/remaining value:

- reminders;
- recurring tasks where justified;
- due today/overdue attention;
- automatic follow-up tasks where a real business rule exists.

Notification events already targeted/implemented in PR #36 include:

```text
BOOKING_CREATED
BOOKING_RESCHEDULED
BOOKING_CANCELLED
COURSE_REGISTRATION_CREATED
```

The broader notification system should eventually support meaningful operational attention, not notification spam.

Examples:

- new request;
- booking awaiting confirmation;
- booking cancelled/rescheduled;
- task assigned/due/overdue;
- lead/request waiting too long for follow-up;
- training interest/registration.

In-app notifications are sufficient for V1 unless a real requirement justifies external push/email/WhatsApp automation.

---

# 10. MEDIA / CONTENT / PUBLIC PRODUCT QUALITY

The current public site is a solid visual/technical foundation but has been judged too text-heavy/simple for the final product.

Final public experience should become richer through **approved real Castro content/media**, not invented assets/facts.

Need operational support for appropriate media/content such as:

```text
service cover/media
training cover/media
space gallery
space cover
360 panoramas/scenes
layouts/resources
publish/unpublish state
```

Do not invent Castro metrics, testimonials, pricing, certifications, capacity, business facts, schedules, or photographs.

When approved data is unavailable, keep truthful empty/deferred states.

---

# 11. DESIGN DIRECTION

Typography direction:

```text
Instrument Serif — headings/editorial moments
Manrope — body/UI
```

Target feel:

- professional;
- institutional;
- editorial;
- premium but functional;
- responsive;
- deliberately designed.

Avoid:

- generic SaaS dashboard look;
- card farms;
- gratuitous glassmorphism;
- neon;
- arbitrary blue-purple gradients;
- AI-slop graphics;
- fake statistics/testimonials;
- gratuitous animation.

Clinic Flow reference patterns worth learning from:

- stepper/progress;
- persistent appointment summary;
- date → slot flow;
- confirmation page;
- no-slot recovery;
- visible contact fallback.

Do NOT copy:

- random frontend availability;
- clinic-specific professional selection when Castro does not need it;
- clinic prices when Castro has not provided prices;
- making every service schedulable;
- hardcoded 14-day windows/hours as business truth;
- clinic semantics/branding.

---

# 12. WHAT PR #36 IS INTENDED TO DELIVER

Current PR summary includes:

## Secretary scheduling workspace

- month/week operational calendar;
- day-level bookings and blocked periods;
- booking detail with customer/contact/time/status;
- confirm/cancel/reschedule;
- reschedule checks real availability while excluding the booking being moved;
- create/remove external blocked periods for phone/WhatsApp/offline scheduling.

## Public booking

- SERVICE/SPACE exclusive-slot flows;
- four-step journey with persistent summary;
- no-slot next-availability recovery up to 30 days;
- contextual request-another-time + phone/WhatsApp fallback;
- pending/confirmed confirmation state.

## Notifications

- BOOKING_CREATED;
- BOOKING_RESCHEDULED;
- BOOKING_CANCELLED;
- COURSE_REGISTRATION_CREATED.

## Training registration

- dedicated `course_registrations` persistence;
- PENDING → CONFIRMED/CANCELLED;
- idempotent public registration;
- multi-participant/group registration does not create an exclusive booking;
- public session registration page;
- internal registration management;
- next-date interest and corporate training request.

## Regression coverage targeted

- public routing for training registration;
- training enquiry/session paths;
- registration + idempotent retry;
- no-slot recovery;
- Secretary calendar interactions;
- PostgreSQL registration lifecycle;
- notification assertions;
- training registration creates no exclusive booking;
- reschedule self-exclusion;
- collision protection;
- cancellation notification;
- blocked-period enforcement.

**Do not mark this block complete until PR #36 and post-merge `main` are both 3/3 green.**

---

# 13. PRODUCTION ACCESS ARCHITECTURE — NEXT MAJOR BLOCK AFTER PR #36

Once PR #36 is merged cleanly, implement/audit production access as a coherent system — **not only the RIGHTWARE Control Plane**.

The block must cover ALL four experiences and their trust boundaries:

```text
A. PUBLIC WEBSITE / CLIENTE
B. STAFF APP / SECRETÁRIA
C. STAFF APP / CEO OWNER
D. RIGHTWARE CONTROL PLANE / SUPER ADMIN
E. API TRUST BOUNDARIES BETWEEN THEM
```

Suggested target topology:

```text
Internet
  │
  ├── castrosservices.<domain>
  │      Public Client Web
  │
  ├── app.castrosservices.<domain>
  │      Staff App
  │      ├── Secretária → /app
  │      └── CEO/Owner → /owner
  │
  └── api.castrosservices.<domain>
         Public + authenticated tenant API boundaries

RIGHTWARE staff
  │
  └── ops.rightware.co.mz
         RIGHTWARE Control Plane
         └── platform API/security boundary
```

Required audit/implementation topics:

1. Host/surface-aware frontend routing/deployment.
2. Staff login entry that does not require navigating through the public website.
3. No public staff signup.
4. Existing `OPERATIONS` vs `OWNER` experience routing preserved.
5. Platform identity remains independent from tenant identity.
6. Platform surface separated from Castro public/staff surfaces.
7. API trust boundary review.
8. Cookie/session scope review.
9. CORS/CSRF review for real host topology.
10. MFA readiness for CEO and RIGHTWARE; ideally staff too.
11. Rate limiting/WAF readiness.
12. Platform audit/support-access roadmap.
13. Tests proving a public/tenant/platform session cannot cross boundaries incorrectly.

Do not perform a broad rewrite if the existing code can support this with controlled host/routing/security changes.

---

# 14. P5 — RESPONSIVE, ACCESSIBILITY, VISUAL DELIVERY

After core architecture/workflows stabilize, complete P5 rather than continuing to add unbounded features.

Required responsive matrix from the checklist includes:

```text
320x568
360x800
390x844
430x932
768x1024
820x1180
1024x768
1180x820
1280x720
1366x768
1440x900
1536x864
1646x928
1920x1080
```

Public visual QA:

- Homepage;
- Services list/detail;
- Training list/detail/registration;
- Spaces list/detail/explorer/configurator;
- Booking;
- Contact;
- header/footer;
- typography hierarchy;
- spacing/rhythm;
- CTA hierarchy;
- real media treatment;
- no generic SaaS/card-heavy regression.

Internal visual QA:

- Secretary dashboard;
- Requests;
- Bookings;
- Calendar;
- Customers/leads;
- Tasks/notifications/reports;
- catalog/content/availability;
- CEO dashboard/agenda/activity/customers/reports;
- RIGHTWARE platform/control surface;
- desktop/tablet/mobile navigation;
- tables → mobile entity views/cards;
- forms and sticky mobile actions where appropriate.

Accessibility:

- keyboard navigation;
- focus visibility/order;
- modal/drawer focus management;
- labels and errors;
- headings/landmarks;
- contrast;
- reduced motion;
- screen-reader status/error announcements.

Some accessibility foundation was already merged in PR #34. Audit before duplicating.

---

# 15. P6 — FINAL VALIDATION / DELIVERY

Before presentation/production claim:

```text
Run PostgreSQL + backend + frontend in a production-like composed environment
Smoke every public route
Smoke Secretary/Operations routes
Smoke CEO/Owner routes
Smoke RIGHTWARE platform/control routes
Validate login/logout/session boundaries
Validate real booking flows
Validate request/contact flows
Validate scheduling conflicts
Validate training registration
Validate content/facts/media
Validate secrets/deployment configuration
Final implementation checklist reconciliation
```

Do not mark “production ready” from builds alone.

---

# 16. PRESENTATION NARRATIVE

The final demo should tell one connected story instead of opening random screens:

```text
1. Cliente enters Castro public website
2. Discovers service/training/space
3. Makes contextual request / consultation appointment / space reservation / training registration
4. Secretária receives context and manages operation
5. Secretária uses Calendar / follow-up / confirmation / rescheduling
6. CEO sees executive state of the business
7. RIGHTWARE demonstrates controlled platform administration separately
```

This communicates that RIGHTWARE delivered:

```text
Public website
+ conversion system
+ scheduling
+ operations workspace
+ CRM direction
+ executive experience
+ platform control architecture
```

---

# 17. REMAINING BUSINESS-DEPENDENT INPUTS

Some final blockers require Castro-approved information and must not be invented:

- approved public copy/facts;
- real photography/media;
- actual services/training descriptions;
- actual space details/capacity where not formally confirmed;
- real schedules/availability policies;
- pricing if Castro chooses to publish it;
- final contact details;
- policies/cancellation language if required.

The engineering system should allow these to be populated without requiring a rewrite.

---

# 18. EXACT EXECUTION ORDER FOR THE NEXT CHAT

## Block A — Finish PR #36 first

```text
A1. Read this handoff.
A2. Fetch live PR #36 info and current head SHA.
A3. Fetch workflow runs for the CURRENT head (the docs commit may have started a new run).
A4. If current run is running, inspect it; if failed, fetch failing job logs.
A5. Specifically diagnose PostgreSQL integration gate.
A6. Fix only proven failures in separate commits.
A7. Repeat CI until Backend + Frontend + PostgreSQL = 3/3 green on exact current head.
A8. Normal merge PR #36, preserving commits.
A9. Fetch `main` merge SHA.
A10. Verify post-merge CI = 3/3 green.
```

## Block B — Production Access & Trust Architecture

Do NOT implement only RIGHTWARE Control Plane.

Implement/audit the full architecture:

```text
Public Cliente surface
Secretária Staff App
CEO/Owner Staff App
RIGHTWARE Control Plane
API/session/trust boundaries
```

Keep exactly the four official personas.

## Block C — CRM / commercial operations completion

Audit current DB/code first, then complete only missing pieces of:

```text
Visitor → Lead → Qualified → Customer → Returning
Requests inbox
follow-up/history/responsibility
customer conversion rules
next-action/opportunity logic
```

Preserve already-hardened functionality.

## Block D — Media/content completion

Complete approved media upload/publishing experience where code gaps remain.

## Block E — P5

Responsive + accessibility + visual QA across all four experiences.

## Block F — P6

Production-like smoke/security/content validation.

## Block G — Presentation

Prepare the final Castro demonstration following the narrative in section 16.

---

# 19. RULES FOR THE NEXT ASSISTANT / CHAT

1. Do not ask the user to repeat information already in this handoff.
2. Do not introduce a “Gestor” persona.
3. Do not replace live GitHub state with remembered SHA/state; always fetch live state before writes/claims.
4. When the user says `avança`, `continua`, `faça`, execute using GitHub tools rather than only returning a plan.
5. Report concrete branch, commits, PR, CI, merge and blockers.
6. Do not promise background work.
7. Do not weaken tenant/security boundaries for demo convenience.
8. Do not use mock-only behavior as proof of production behavior.
9. Do not invent Castro facts/media/data.
10. Do not make Google Calendar the source of truth.
11. Do not put training registration back into the exclusive slot-booking model.
12. Do not expose role/permission design to the Secretary.
13. Keep CEO UX executive, not daily operational.
14. Keep RIGHTWARE platform identity separate from tenant users.
15. Split commits by concern and preserve merge commits.
16. Required CI must be 3/3 green before merge.

---

# 20. COPY/PASTE PROMPT FOR A NEW CHAT

Copy everything inside the following block into the new Castro’s Services chat:

```text
Vamos continuar o projeto CASTRO’S SERVICES diretamente no repositório oficial:

https://github.com/rightware-corporations/castro-service

Antes de qualquer alteração, leia integralmente o ficheiro canónico:

docs/CASTROS-SERVICES-MASTER-HANDOFF.md

Esse handoff é a autoridade de continuidade do projeto. Não me peça para repetir o contexto que já estiver documentado ali.

REGRAS ABSOLUTAS:
- Existem exatamente 4 experiências/personas: Cliente, Secretária/Operations, CEO/Owner e RIGHTWARE Super Admin.
- NÃO EXISTE PERSONA “GESTOR”. Não invente uma quinta persona.
- Cliente usa a experiência pública.
- Secretária é a operadora diária e usa /app.
- CEO/Owner é Elizabeth, usa /owner e deve ter UX executiva, não administração diária.
- RIGHTWARE Super Admin é identidade de plataforma separada dos utilizadores Castro e evoluirá para um RIGHTWARE Control Plane.
- Não faça commit direto em main.
- Commits pequenos e separados por preocupação.
- PR + Backend quality gates + Frontend quality gates + PostgreSQL integration gates = todos verdes antes do merge.
- Merge normal; não squash/rebase.
- Validar CI pós-merge.
- Não inventar factos, media, métricas, horários ou preços da Castro.
- Não usar mock como prova de produção.
- Quando eu disser avança/continua/faça, execute no GitHub e não responda apenas com teoria.

PRIORIDADE IMEDIATA:
O PR #36 (`feat: connect scheduling, booking recovery, and training registrations`) estava aberto quando o handoff foi criado. A baseline main anterior era 513c4828fe1dcd1fffa7a9e126c2163093b454db com CI #234 3/3 verde. O PR #36 tinha Backend e Frontend verdes e PostgreSQL integration vermelho no CI #238 antes do commit do handoff.

1. Fetch live do PR #36 e do HEAD atual — não confie apenas nos SHAs históricos do handoff porque o commit do handoff alterou a branch.
2. Fetch dos workflow runs do HEAD atual.
3. Ler logs do PostgreSQL integration gate que estiver a falhar.
4. Corrigir o erro comprovado em commit separado.
5. Iterar CI até 3/3 verde.
6. Fazer merge normal do PR #36 preservando commits.
7. Verificar CI pós-merge em main até 3/3 verde.

DEPOIS DO PR #36:
Não trabalhe apenas no RIGHTWARE Control Plane. Implemente/audite a ARQUITETURA COMPLETA DE PRODUÇÃO descrita no handoff:
- Public Web para Cliente;
- Staff App para Secretária;
- Staff App para CEO/Owner;
- API trust/session boundaries;
- RIGHTWARE Control Plane separado para Super Admin.

A direção de produção é aproximadamente:
- castrosservices.<domain> = website público;
- app.castrosservices.<domain> = Staff App, com Secretária → /app e CEO/Owner → /owner;
- api.castrosservices.<domain> = API com public/internal boundaries;
- ops.rightware.co.mz = RIGHTWARE Control Plane, separado do tenant.

Segurança não pode depender de esconder URLs. Preserve/fortaleça autenticação, sessão, RBAC/permissões, isolamento da organização, CSRF/CORS, cookies seguros, rate limiting/WAF readiness, audit, no public employee signup e MFA readiness.

Depois siga a ordem do handoff:
A) fechar PR #36;
B) Production Access & Trust Architecture completa;
C) CRM/lifecycle/Requests/follow-up;
D) media/conteúdo real;
E) P5 responsive/accessibility/visual QA;
F) P6 production-like smoke/security/content validation;
G) apresentação final.

A apresentação final deve contar a história:
Cliente → conversão/agendamento/reserva/inscrição → Secretária gere → CEO acompanha → RIGHTWARE opera a plataforma.

Comece agora pelo live audit do PR #36 e execute até fechar o blocker real.
```

---

# END OF MASTER HANDOFF

This file should be updated when major architectural decisions or delivery state change. It is not a substitute for live GitHub verification; it is the canonical context for why the system is built the way it is.