# Castro’s Services — Design Quality Contract v1

Status: **Approved implementation contract**

This document turns the approved RIGHTWARE Web Experience Standard and the existing Castro visual system into concrete, versionable frontend rules. It is a quality contract, not a redesign brief.

VEXEL remains a benchmark for execution discipline only. Castro keeps its own identity, information architecture, product architecture, typography, palette and interaction model.

## 1. Non-negotiable identity

Preserve:

- Instrument Serif for editorial/public headings;
- Manrope for body, navigation, controls, forms and operational surfaces;
- approved navy / deep navy / teal / green / warm cream / off-white palette;
- editorial, institutional, human, spatial, calm and professional character;
- real photography when approved assets exist;
- Motion as the only React motion engine unless a future measured need proves otherwise.

Reject:

- dark-tech styling;
- blue/violet glow;
- glassmorphism as a visual system;
- orbit/particle decoration;
- fake metrics, testimonials, people or business media;
- CSS overrides added only to defeat older CSS;
- page-by-page grid invention.

## 2. Layout / grid contract

### 2.1 Canonical widths

Public composition uses three semantic measures:

- `--layout-max-wide: 82.5rem` — 1320px public wide container;
- `--layout-max-content: 64rem` — 1024px content container;
- `--layout-max-reading: 45rem` — 720px long-form reading measure.

The generic `.container` must resolve from the canonical layout token. A public page must not override `.container` with a competing max-width.

### 2.2 Gutters

- Desktop, `>= 1280px`: `2rem` / 32px.
- Tablet / small desktop, `768px–1279px`: `1.5rem` / 24px.
- Mobile, `360px–767px`: `1.25rem` / 20px.
- Narrow mobile, `< 360px`: `1rem` / 16px.

No feature may introduce a new page gutter token.

### 2.3 Logical grid

The design language uses a logical grid rather than forcing every component to declare literal tracks:

- desktop: 12-column logic;
- tablet: 8-column logic;
- mobile: 4-column logic.

Approved two-column proportions:

- balanced: 6/6;
- editorial: 7/5;
- content-dominant: 8/4;
- index/focus: 4/8.

A feature may deviate only when the content model or interaction requires it, and the reason must be documented in the owning stylesheet/component.

## 3. Text measure contract

Canonical measures:

- display heading: `12ch`;
- major section heading: `14ch`;
- wide/compact heading: `18ch`;
- lead: `38rem`;
- standard copy: `42rem`;
- editorial prose: `46rem`;
- supporting/meta copy: `32rem`.

These are upper bounds, not mandatory widths. Features may use a smaller measure when composition requires it, but should not invent arbitrary larger measures.

## 4. Vertical rhythm contract

The existing base spacing scale remains authoritative. Semantic aliases define scene-level rhythm:

- `--rhythm-content-gap`: local content spacing;
- `--rhythm-group-gap`: grouped controls/content;
- `--rhythm-transition-gap`: transition between related regions;
- `--rhythm-scene-small`;
- `--rhythm-scene-medium`;
- `--rhythm-scene-large`;
- `--rhythm-hero`.

Public routes should compose from these aliases before introducing local `clamp()` values.

## 5. Scene contract

Approved scene roles:

### EDITORIAL

Purpose: meaning, hierarchy and narrative.

- density: low to medium;
- media: supporting;
- motion: restrained reveal;
- CTA: integrated with copy.

### PHOTOGRAPHIC

Purpose: give people and spaces visual authority.

- density: low;
- media: dominant;
- motion: media/object only when useful;
- CTA: contextual.

### IMMERSIVE

Purpose: exploration of a physical/spatial experience.

- density: low;
- media/environment: primary;
- motion: subordinate to user navigation;
- CTA: contextual/floating only when relevant.

### FOCUSED

Purpose: one service/course/space/option gains priority.

- density: medium;
- media: optional;
- motion: OBJECT;
- CTA: tied to selected context.

### OPERATIONAL

Purpose: selection, availability, forms, booking and precise tasks.

- density: medium/high;
- media: secondary;
- motion: MICRO / causal OBJECT transitions;
- CTA: explicit and functional.

### CONVERSION

Purpose: reduce distraction near commitment/confirmation.

- density: low;
- media: minimal;
- motion: MICRO;
- CTA: dominant and unambiguous.

Scene styling must derive from Castro tokens. Scene roles are not permission to create a second palette.

## 6. Focus / selection contract

### 6.1 Keyboard focus

Every keyboard-focusable control must have a clearly visible focus indication.

Default expectation:

- 3px teal outline;
- 3px offset;
- existing focus-ring shadow.

A feature can adapt shape/placement but cannot make focus less visible.

### 6.2 Selected objects

Selection must use at least two independent signals from:

- marker/accent;
- hierarchy;
- typography;
- elevation;
- position;
- CTA state;
- icon state;
- surface/background change.

Motion may reinforce state but must never be the sole indicator.

### 6.3 Hover

Hover may enhance, never gate, essential content. Equivalent information/action must remain available by keyboard and touch.

## 7. Media contract

### 7.1 Approved composition ratios

- portrait: `4 / 5`;
- editorial: `3 / 2`;
- landscape: `16 / 10`;
- wide: `16 / 9`;
- panorama: `2 / 1`.

The ratio is a composition target, not a requirement on original source files.

### 7.2 Crop rules

Default:

- `object-fit: cover`;
- `object-position: 50% 50%`.

Approved real assets may define separate desktop and mobile focal points. Focal points belong to asset/content metadata where possible, not random page CSS.

### 7.3 Loading policy

One principal above-the-fold image may be treated as the LCP candidate:

- `loading="eager"`;
- `fetchpriority="high"` where supported/appropriate;
- `decoding="async"`.

Other editorial media:

- `loading="lazy"`;
- `decoding="async"`.

Preferred delivery order when the asset pipeline supports it:

`AVIF → WebP → source fallback`.

Do not fabricate photography while approved media is unavailable. Preserve final aspect ratio and crop geometry through honest placeholders.

## 8. Responsive recomposition contract

Mobile is not reduced desktop.

Validation widths:

- 1440px — wide desktop;
- 1280px — desktop/laptop;
- 1024px — tablet landscape / small laptop;
- 768px — tablet portrait;
- 430px — large mobile;
- 390px — standard mobile;
- 360px — narrow mobile;
- 320px — minimum supported width.

Every major experience must deliberately define:

- content priority;
- navigation behavior;
- DOM/visual order;
- grid recomposition;
- media crop;
- CTA placement;
- sticky/fixed behavior;
- touch interaction;
- motion level.

A desktop grid collapsing to `1fr` is not, by itself, responsive acceptance.

## 9. Motion contract

The existing Motion timings, easings, springs and `MotionConfig reducedMotion="user"` remain authoritative.

### MICRO

For hover, focus, press, icon response, tabs, compact feedback and small selection.

Recommended duration: `100–200ms`.
Recommended displacement: `2–4px`.

### OBJECT

For selected services/courses/spaces, drawers, bottom sheets, media changes, step/configuration transitions.

Recommended duration: `200–420ms`, or existing selection/layout springs.
Typical scale envelope: approximately `0.98–1.02`.

### SCENE

For major section entry, narrative transitions and immersive continuity.

Recommended duration: `280–420ms`.
Recommended stagger: `40–70ms` for small sequences only.

SCENE motion is not a default `whileInView` effect for every element.

## 10. Reduced-motion contract

Responsibility hierarchy:

1. `MotionProvider` / MotionConfig owns the React/Motion preference.
2. `accessibility-foundation.css` owns global CSS fallback behavior.
3. Feature CSS contains only feature-specific reduced-motion alternatives that cannot be expressed globally.

When reduced motion is active:

- content remains visible;
- spatial transforms are removed when non-essential;
- parallax/continuous decorative motion is removed;
- essential state feedback remains;
- layout motion becomes immediate or near-immediate;
- keyboard/touch semantics do not change.

Do not duplicate a generic global reduced-motion reset in each feature stylesheet.

## 11. Initial performance budgets

These are initial guardrails. Performance is not considered accepted until browser measurements exist.

### Core Web Vitals target

- LCP: `<= 2.5s`;
- CLS: `<= 0.10`;
- INP: `<= 200ms`.

Target evaluation: mobile p75 under a documented reproducible method.

### Bundle guardrails

Before adding heavier public experiences, record the current baseline.

- any new phase: no more than `+5% gzip` without explicit justification;
- target initial public JS after code-splitting work: `<= 200kB gzip`;
- target non-core route chunk: `<= 90kB gzip`;
- target global CSS: `<= 35kB gzip`.

A heavier Explorer/360 implementation must be lazy-loaded and must not become part of the initial public route cost.

### Image guardrails

- LCP/hero image: target `<= 300kB` optimized;
- ordinary editorial image: target `<= 200kB`;
- mobile variant: prefer `<= 180kB`.

Exceeding a budget requires a documented quality/performance reason.

### Font policy

Keep Instrument Serif + Manrope only. Do not add a third family. Audit loaded weights before adding new weights. Self-hosting is a later measured optimization decision, not part of this contract implementation.

## 12. Accessibility acceptance criteria

Target: **WCAG 2.2 AA**.

A public route is not accepted until the relevant journey passes:

- keyboard-only completion;
- logical focus order;
- clearly visible focus;
- no keyboard traps;
- focus return for overlays;
- Escape behavior when expected;
- 44x44 CSS px minimum touch target for primary interactive controls;
- 4.5:1 normal-text contrast;
- 3:1 large-text / essential UI contrast;
- errors associated with the affected control;
- no state communicated only by color;
- reduced-motion behavior;
- 200% zoom without lost content/action;
- 320px reflow without unintended page-level horizontal scrolling;
- meaningful landmark/heading structure;
- correct dialog/drawer semantics;
- complete mobile-menu journey;
- complete Booking journey;
- Explorer controls that do not require pointer-only input.

## 13. CSS ownership contract

### `design-system/tokens/`

Owns only global semantic design tokens: color, typography, spacing, layout, scene aliases, motion-compatible CSS variables, radius, elevation, z-index and accessibility sizing.

### `styles/global.css`

Owns reset/base HTML/body behavior, the canonical container primitive, truly global utilities and cross-product shell rules only.

It must progressively stop owning feature-specific public/operations component styling.

### `design-system/primitives/` and `design-system/patterns/`

Own reusable design-system component behavior and styles. They must not depend on product features.

### `features/home/`

Owns Home-only presentation.

### `features/services/`

Owns Services-only presentation.

### `features/courses/`

Owns Training/Courses-only presentation.

### `features/spaces/`

Owns Spaces, Explorer and Configurator presentation.

### `features/booking/`

Owns Booking-specific presentation.

### Migration rule

Do not create a new final override layer. For each migration:

`identify old rule → establish canonical owner → move/replace → remove superseded rule → verify visual/functional equivalence`.

## 14. Known consolidation targets

The following are consolidation targets, not instructions to delete blindly:

- competing `1240px` token vs public `1320px` container override;
- scene tokens currently declared inside `public-visual-foundations.css`;
- superseded Hero orbit/node styling in `public-v2.css`;
- `product-experience.css` hiding markup that should eventually be removed at source;
- `public-design-lock.css` as a transitional compatibility layer to decommission gradually;
- legacy `--font-display` and `--container-gutter` references in Booking;
- repeated reduced-motion resets across global and feature styles;
- feature-specific component CSS still living in `global.css`.

## 15. Implementation sequence

1. Baseline snapshot: current main SHA, build sizes, selectors/import graph, screenshots.
2. Commit this contract document.
3. Add semantic layout/measure/rhythm/scene tokens without redesigning pages.
4. Repoint the canonical container to the contract while preserving current public width.
5. Consolidate global reduced-motion responsibility and low-risk accessibility semantics.
6. Remove only confirmed dead/superseded rules.
7. Validate 1440/1280/1024/768/430/390/360/320, keyboard and reduced motion.
8. Record performance baseline and measurement method.
9. Merge only with no unintended visual or functional regression.
10. Begin Spaces only after this contract is established.

## 16. Contract acceptance gate

The contract is complete only when the codebase has:

- one container authority;
- one gutter contract;
- one text-measure contract;
- one semantic rhythm system;
- one scene vocabulary;
- one focus policy;
- one media policy;
- one responsive acceptance matrix;
- one Motion language;
- one reduced-motion responsibility hierarchy;
- initial measurable performance budgets;
- explicit accessibility acceptance criteria;
- clear CSS ownership;
- no newly-created override layer.

The first implementation should be visually neutral: better architecture first, then Spaces uses the contract for the next visual phase.
