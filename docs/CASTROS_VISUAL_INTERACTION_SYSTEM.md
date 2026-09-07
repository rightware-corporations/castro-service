# Castro’s Services — Visual & Interaction System

Status: **Foundation v0.1**

This document records the approved public-experience direction for Castro’s Services. It complements the existing design system; it does not replace product truth, backend contracts, booking rules, permissions, content approval or the public design lock.

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

Current foundation variables are additive aliases over approved design tokens:

- `--scene-paper`
- `--scene-warm`
- `--scene-warm-strong`
- `--scene-ink`
- `--scene-line`
- `--scene-line-strong`
- `--scene-shadow`
- `--scene-focus-shadow`

These variables must remain derived from the Castro’s palette. They are not authorization for a second color system.

## 5. Interaction language

Every interaction should communicate at least one of the following:

- what changed;
- what has focus;
- what was selected;
- what is related;
- what appeared or disappeared;
- where the user is moving;
- what action follows.

Interaction levels:

1. **Micro feedback** — hover, press, focus, tabs, buttons, slots.
2. **Object motion** — service, course or space gains priority.
3. **Scene motion** — scene reveal, hierarchy shift and restrained depth.
4. **Continuity motion** — selection to detail, configuration, availability and booking.

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

Services should evolve toward an editorial index/focus model rather than identical generic cards.

### Training

Target journey:

`DISCOVER → INSPECT → SESSION → REGISTER`

Training must retain real course/session metadata and have a distinct identity from Services and Spaces.

### Spaces

Target journey:

`DISCOVER → FOCUS → DETAIL → EXPLORE → CONFIGURE → AVAILABILITY → BOOK`

Approved real photography should progressively gain authority as the visitor moves deeper into the journey.

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

## 9. Motion language

The existing Functional Motion Foundation remains authoritative for base timing and reduced-motion behaviour.

Categories:

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

Use transform and opacity first. Avoid large displacement, continuous autoplay, aggressive parallax and scroll hijacking.

## 10. Reduced motion

When `prefers-reduced-motion: reduce` is active:

- remove spatial transforms where they are not essential;
- remove or simplify layout motion;
- keep content visible;
- preserve state feedback;
- make essential transitions immediate or nearly immediate;
- preserve focus, keyboard behaviour and click/touch targets.

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

## 12. Current implementation foundation

The first public-visual-foundation layer deliberately does **not** redesign the Hero or alter business logic.

It currently establishes:

- continuous tonal scene fields on selected Homepage sections;
- a stronger focus model for the three primary experience entries;
- editorial treatment for published Service/Training content;
- spatial depth for the Space teaser while retaining the honest placeholder;
- a connected visual rhythm for the process sequence;
- explicit reduced-motion fallbacks for new transforms.

Hero, Navigation, Services, Training, Spaces, Explorer/Configurator and Booking receive dedicated implementation phases after this foundation is validated.

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
- business logic and backend truth remain unchanged.
