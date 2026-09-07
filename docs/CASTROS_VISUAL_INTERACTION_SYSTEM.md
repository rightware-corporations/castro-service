# Castro’s Services — Visual & Interaction System

Status: **Foundation v0.2 — governed by Design Quality Contract v1**

This document records the approved public-experience direction for Castro’s Services. Concrete grid, measure, rhythm, scene, focus, media, responsive, motion, performance, accessibility and CSS-ownership rules are governed by `docs/CASTRO_DESIGN_QUALITY_CONTRACT_V1.md`.

This system complements the existing design system; it does not replace product truth, backend contracts, booking rules, permissions or content approval.

## 1. Experience objective

The public product should feel like a continuous exploration rather than a stack of unrelated landing-page sections.

Primary journey:

`ENTRY → DISCOVERY → EXPLORATION → INTENT → ACTION → BOOKING → CONFIRMATION`

Product continuity should connect:

`HERO → SERVICES → TRAINING → SPACES → EXPLORATION → AVAILABILITY → BOOKING → CONFIRMATION`

Routes may remain separate. Continuity is created through shared visual language, preserved context, media, interaction and motion.

## 2. Canonical visual language

Preserve:

- Instrument Serif for public/editorial headings;
- Manrope for body copy, navigation, controls and operational information;
- deep navy, teal, cream, off-white and approved semantic colors;
- editorial hierarchy;
- generous whitespace;
- real photography when approved assets exist;
- calm contrast and restrained depth;
- functional interaction;
- WCAG-oriented focus and reduced-motion behaviour.

Reject:

- generic SaaS composition;
- card farms as the default information architecture;
- glassmorphism as a visual system;
- neon, particles, meteors or decorative technology motifs;
- arbitrary gradients;
- fake metrics, testimonials, customers, photography or availability;
- motion that exists only for spectacle.

## 3. Scene architecture

The public experience uses a small set of scene roles rather than treating every section as a white block.

### EDITORIAL

Purpose: establish meaning, hierarchy and narrative.

Typical surfaces: paper/off-white, strong serif typography, controlled measure, generous spacing.

### PHOTOGRAPHIC

Purpose: give people and spaces visual authority.

Photography is an architectural element, not automatically an image inside a card.

### IMMERSIVE

Purpose: bring the visitor closer to a physical space or exploration tool.

Reserved for Spaces / Explorer contexts where real media exists.

### FOCUSED

Purpose: give one service, course, space, date or option priority without losing surrounding context.

### OPERATIONAL

Purpose: make selection, availability, booking and form states precise and calm.

### CONVERSION

Purpose: clarify the next action with less visual spectacle as user commitment increases.

## 4. Scene continuity

The scene system should alternate tonal surfaces deliberately instead of repeatedly resetting to pure white.

Canonical scene variables are design-system tokens:

- `--scene-paper`
- `--scene-warm`
- `--scene-warm-strong`
- `--scene-ink`
- `--scene-line`
- `--scene-line-strong`
- `--scene-shadow`
- `--scene-focus-shadow`

These variables remain derived from the Castro’s palette. They are not authorization for a second color system.

## 5. Interaction language

Every interaction should communicate at least one of the following:

- what changed;
- what has focus;
- what was selected;
- what is related;
- what appeared or disappeared;
- where the user is moving;
- what action follows.

Implementation motion levels are:

1. **MICRO** — hover, press, focus, tabs, buttons, slots.
2. **OBJECT** — service, course or space gains priority; drawers/sheets; configuration changes.
3. **SCENE** — scene reveal, hierarchy shift and restrained narrative continuity.

Continuity between selection, detail, configuration, availability and booking may combine OBJECT and SCENE motion, but product state remains owned by React/domain logic.

Motion follows state. Motion never becomes product state.

## 6. Focus behaviour

A focused object should feel prioritised, not merely recolored.

Allowed cues, used selectively:

- small elevation;
- controlled translation or scale;
- stronger media emphasis;
- border/accent progression;
- directional CTA movement;
- nearby-content de-emphasis;
- information reveal when content already exists.

Keyboard focus must receive equivalent visual priority. Hover-only essential information is prohibited.

## 7. Content-family identity

### Services

Target journey:

`BROWSE → FOCUS → UNDERSTAND → REQUEST`

The dedicated Services visual phase now implements the editorial index/focus model while preserving real published service data and routing.

### Training

Target journey:

`DISCOVER → INSPECT → SESSION → REGISTER`

The dedicated Training visual phase now gives format discovery and published training a distinct identity while preserving real course/session metadata.

### Spaces

Target journey:

`DISCOVER → FOCUS → DETAIL → EXPLORE → CONFIGURE → AVAILABILITY → BOOK`

Approved real photography should progressively gain authority as the visitor moves deeper into the journey. This remains the next major public visual phase after the Design Quality Contract is established.

### Booking

Target journey:

`RESOURCE → DATE → SLOT → DETAILS → REVIEW → CONFIRMATION`

Availability and booking truth remain backend-authoritative. Visual transitions only explain causal state changes.

## 8. Photography architecture

Until approved real photography exists, use explicit placeholders. Do not synthesize business photography or Elizabeth Castro’s likeness.

When approved media arrives, the system should support:

- editorial crop;
- split composition;
- full-bleed moments where justified;
- media as foreground/background anchor;
- stable responsive aspect ratios;
- continuity from teaser to detail/explorer;
- accessible alt text based on the actual approved asset.

The existing `VITE_ELIZABETH_PORTRAIT_URL` remains the controlled portrait entry point.

Detailed ratios, crop rules, loading policy and image budgets live in `CASTRO_DESIGN_QUALITY_CONTRACT_V1.md`.

## 9. Motion language

The existing Functional Motion Foundation remains authoritative for base timing and reduced-motion behaviour.

Functional categories remain:

- ENTER
- EXIT
- REVEAL
- FOCUS
- SELECTION
- EXPANSION
- COLLAPSE
- CONTINUITY
- FEEDBACK
- PROGRESS
- SUCCESS
- ERROR

Implementation levels are MICRO / OBJECT / SCENE.

Use transform and opacity first. Avoid large displacement, continuous autoplay, aggressive parallax and scroll hijacking.

## 10. Reduced motion

When `prefers-reduced-motion: reduce` is active:

- remove spatial transforms where they are not essential;
- remove or simplify layout motion;
- keep content visible;
- preserve state feedback;
- make essential transitions immediate or nearly immediate;
- preserve focus, keyboard behaviour and click/touch targets.

Global ownership belongs to MotionProvider plus the accessibility foundation; feature styles should contain only feature-specific reduced-motion exceptions.

## 11. Responsive principles

Mobile is not reduced desktop.

For each major pattern decide deliberately:

- what becomes the first piece of information;
- which action is primary;
- what stacks;
- what becomes horizontally scrollable only when discoverable and accessible;
- what becomes a drawer/bottom sheet;
- what remains sticky;
- how keyboard/touch inputs affect booking and calendar layouts.

Desktop-only hover behaviour must never be required to understand or complete a task.

The concrete acceptance widths and recomposition rules are defined by the Design Quality Contract.

## 12. Current implementation foundation

Completed public visual phases:

- Functional Motion Foundation;
- Public Visual Foundations;
- Navigation + Hero;
- Services;
- Training.

The current foundation establishes:

- continuous tonal scene fields on selected Homepage sections;
- a stronger focus model for the three primary experience entries;
- an editorial/spatial Hero prepared for approved real photography;
- contextual public navigation;
- an editorial focus model for Services;
- a Training-specific discovery/catalog experience;
- spatial depth for the Space teaser while retaining the honest placeholder;
- a connected visual rhythm for the process sequence;
- explicit reduced-motion fallbacks.

Before Spaces, the Design Quality Contract consolidates the transversal rules and begins reducing historical cascade dependency without redesigning pages.

## 13. Reference-system rule

External/reference work may contribute reusable principles such as:

- persistent visual environment;
- focal-object hierarchy;
- object-specific interaction;
- causal flow visualisation;
- continuity across scenes.

Do **not** copy another product’s identity, dark-tech styling, glow, glass, orbit systems, fake metrics or proprietary content.

Reference principle → Castro’s adaptation → validation.

Never reference → clone.

## 14. Quality gate

Before accepting a visual change, verify:

- it has a clear purpose;
- it belongs to Castro’s;
- it supports the journey;
- the interaction communicates something useful;
- it works without motion;
- it works on mobile;
- it works with keyboard;
- reduced motion remains usable;
- content remains truthful;
- performance cost is proportionate;
- business logic and backend truth remain unchanged;
- the owning feature/design-system layer owns the rule rather than relying on a new final override.
