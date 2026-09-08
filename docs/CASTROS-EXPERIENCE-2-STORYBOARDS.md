# CASTRO’S SERVICES — EXPERIENCE 2.0 STORYBOARDS

**Status:** DESIGN / PROPOSAL — NO PRODUCTION REDESIGN IMPLEMENTATION YET  
**Date:** 2026-09-08  
**Base main SHA:** `5dc046f534d671c6cb54a59b805133df6f18ccf5`

This document converts the approved Experience 2.0 research direction into three authored scene storyboards: Hero, Training and Spaces.

The objective is to define composition, hierarchy, media, interaction, motion, responsive behavior, accessibility and performance before implementation.

---

# 0. HARD LOCKS

These storyboards do **not** reopen the CASTRO’S identity system.

```text
Instrument Serif = editorial/public headings
Manrope          = body/navigation/forms/controls/UI
```

Preserve:

- approved navy / deep navy / teal / cream / off-white palette;
- editorial / institutional / human / spatial / calm / professional character;
- Motion `13.2.0` as the existing React motion foundation;
- real product and business data only;
- current route/product architecture;
- WCAG 2.2 AA target;
- reduced motion;
- mobile-first responsive intent;
- backend-authoritative availability/booking.

Do not introduce a typography-family change, alternate brand palette, synthetic Elizabeth likeness, fake photography, fake metrics, fake clients, fake testimonials or fake availability.

---

# 1. GLOBAL EXPERIENCE THREAD

The public experience should feel like one authored environment:

```text
ARRIVAL
→ HUMAN PRESENCE
→ KNOWLEDGE / SERVICES
→ ACTIVE TRAINING
→ ENTER THE SPACE
→ EXPLORE
→ CONFIGURE
→ INTENT
→ CONTACT / BOOK
```

The continuity device should come from **composition and state**, not from copying VEXEL’s persistent dark background.

Working continuity system:

1. a recurring editorial alignment line / frame;
2. a consistent media crop language;
3. stateful transitions between selection and detail;
4. one dominant visual anchor per scene;
5. restrained tonal scene changes rather than repeated blank-white resets;
6. CTAs that inherit known context;
7. motion that communicates entry, focus, continuity and progress.

---

# 2. STORYBOARD A — HERO / HUMAN PRESENCE

## Objective

The first viewport must immediately communicate that CASTRO’S is a real, human, professional practice — not a generic consulting template.

The hero should establish:

```text
PERSON
+ KNOWLEDGE
+ PLACE
```

without explaining the whole company at once.

## Current problem to solve

The existing public language relies heavily on large serif headings + empty space + supporting copy. The typography is strong but often has insufficient visual evidence beside it.

The redesign should keep the typography and remove the feeling of an empty editorial template.

## Desktop composition

Preferred initial composition:

```text
12-column logical grid

TEXT / IDENTITY          MEDIA / PRESENCE
7 columns                5 columns
```

### Left field

- CASTRO’S name / main statement in Instrument Serif;
- one concise Manrope supporting statement;
- one primary CTA;
- optional secondary text-link CTA only if justified by the actual journey;
- no metric strip;
- no testimonial strip;
- no generic badge collection.

### Right field

Production target:

- approved real Elizabeth/environment portrait or short silent ambient clip;
- editorial crop rather than rounded SaaS card;
- media may break the strict container edge in a controlled way;
- one thin spatial/editorial frame may connect the media to the next scene.

R&D fallback:

- explicit neutral media placeholder marked as placeholder;
- no synthetic Elizabeth image.

## Entry motion

Motion purpose: establish presence, not spectacle.

Sequence:

```text
1. page shell visible immediately
2. heading resolves with restrained opacity/y reveal
3. supporting copy follows
4. media mask/crop opens or settles
5. CTA becomes available
```

Recommended qualitative behavior:

- no word-by-word circus animation;
- no large parallax displacement;
- no rotating 3D logo/object;
- no infinite ambient motion in text;
- media movement, if present, should be extremely slow and optional.

## Scroll transition into the next scene

The hero should not simply end at a horizontal boundary.

Preferred continuity concept:

- media anchor gently reframes or shifts its crop;
- the editorial frame/rule extends into the next scene;
- a small contextual phrase introduces the transition from **person → practice**;
- Services/Practice content enters in the same alignment system.

This is the first candidate for a restrained `NARRATIVE` motion prototype.

## Interaction

Primary CTA should move toward a meaningful user intent already supported by the product.

Possible intent categories already present in the system:

- explore services;
- explore training;
- explore spaces;
- contact / request.

The exact hero CTA wording must come from existing approved content or later user approval. Do not invent a new business claim.

## Mobile recomposition

Do not simply stack desktop 7/5 blocks.

Target mobile sequence:

```text
small identity/context line
→ main serif statement
→ primary CTA
→ media occupying strong vertical area
→ supporting copy / secondary navigation cue
```

The image/video becomes a full-width authored scene, not a small thumbnail beneath text.

Mobile rules:

- keep heading line length controlled;
- avoid viewport-height traps around mobile browser chrome;
- do not auto-play heavy media without policy/fallback;
- preserve CTA visibility without sticky obstruction;
- touch targets >= 44px.

## Reduced motion

- show the final composition immediately;
- no crop travel or spatial translation required;
- media may remain static/poster-only;
- preserve hierarchy and CTA state.

## Accessibility

- actual media must have accurate alt text when semantically meaningful;
- decorative media gets empty alt;
- video with speech requires captions/transcript;
- focus order follows visual order;
- CTA cannot depend on hover animation for meaning.

## Performance gate

Before production video is accepted:

- poster image defined;
- responsive sources/encoding defined;
- preload only if it is genuinely LCP-critical;
- lazy-load non-LCP media;
- measure LCP/CLS/INP on mobile and desktop;
- no 3D/WebGL in the hero unless an isolated prototype proves substantial UX value.

---

# 3. STORYBOARD B — TRAINING / ACTIVE KNOWLEDGE

## Objective

Training should feel like a real learning experience, not a course catalog rendered as cards.

Target journey:

```text
DISCOVER
→ FEEL THE ACTIVITY
→ UNDERSTAND THE TRAINING
→ SEE A REAL SESSION
→ REGISTER
```

## Product truth to preserve

For the currently confirmed course:

```text
Oratória e Comunicação Eficaz
Start: 12 October 2026
Format: presencial
Duration: 1 month
Tue/Thu: 17h–19h
Sat: 09h–13h
Price: 1,200 MZN
Registration/certificate included
```

No additional topics, trainer biography, capacity, venue detail or outcomes may be invented unless present in approved source data.

## Scene structure

### Beat 1 — Training entry

Composition:

- Instrument Serif heading gives the category identity;
- Manrope supporting copy explains the training offer using approved text;
- a media field introduces the energy of training/workshop activity;
- published sessions remain visible without turning into a card wall.

Preferred layout:

```text
EDITORIAL INDEX        ACTIVE MEDIA / FOCUS
4 columns              8 columns
```

This preserves the existing index/focus concept but gives the focused side stronger media and hierarchy.

### Beat 2 — Focused course

When a course receives focus:

- title hierarchy strengthens;
- real metadata becomes structured beside/over the media field;
- schedule information appears as a clear progression/rail;
- CTA becomes contextual to the selected course/session;
- nearby content de-emphasizes without disappearing.

Do not animate the data itself as if it were changing.

### Beat 3 — Session progression

Instead of generic cards, the published session can be represented as an editorial schedule composition:

```text
12 OCT 2026
START

TUE / THU
17h–19h

SAT
09h–13h

1 MONTH
PRESENCIAL

1,200 MZN
```

This may use type scale, spacing, lines and focus motion, while preserving the exact real data.

### Beat 4 — Registration transition

The current abrupt switch into an administrative form should become a continuity transition.

The registration route/sheet should inherit:

- selected course;
- published session;
- schedule summary;
- price;
- prior context.

The form itself becomes calmer as commitment increases:

```text
EDITORIAL / MEDIA
→ FOCUSED SESSION
→ CONVERSION SURFACE
```

No unnecessary visual spectacle inside the form.

## Motion

Motion categories:

- `FOCUS`: selected training gains priority;
- `SELECTION`: selected session state is explicit;
- `CONTINUITY`: selected course/session persists into registration;
- `PROGRESS`: form step/progression only if the current flow actually has steps;
- `SUCCESS` / `ERROR`: current real registration states.

Potential motion pattern:

- media crop or object shifts slightly when focus changes;
- metadata enters in a short stagger by semantic group, not by every line;
- CTA travels minimally with the focused content;
- selected context is visually retained on registration.

## Mobile recomposition

Mobile should become:

```text
training heading
→ focused media
→ compact course/session selector
→ real metadata
→ CTA
```

Avoid horizontal carousels for essential session facts unless accessibility and discoverability are proven.

## Real media requirement

Production target should eventually include approved:

- workshop/training photography;
- speaker/participant activity;
- short silent clips;
- classroom/environment detail.

Until approved assets exist, use explicit placeholders.

## Accessibility / performance

- schedule remains readable without animation;
- no essential info in hover states;
- image crop does not hide the only meaningful subject;
- video has poster/fallback;
- registration focus order remains conventional;
- no autoplay audio.

---

# 4. STORYBOARD C — SPACES / SIGNATURE SPATIAL EXPERIENCE

## Objective

Spaces should become the most distinctive experiential area because CASTRO’S has a real physical environment that can justify spatial interaction.

Target journey:

```text
DISCOVER
→ ORIENT
→ FOCUS
→ SEE REAL MEDIA
→ EXPLORE 360
→ CONFIGURE
→ AVAILABILITY
→ BOOK
```

## Current problem to solve

The structural flow exists, but missing real media limits the current experience. Placeholders cannot carry the final premium spatial identity.

The new direction should make space itself the visual anchor.

## Beat 1 — Spaces entry

Composition:

- strong editorial heading;
- one dominant spatial/media field;
- minimal catalog/index information;
- no generic room-card grid as the main impression.

The known physical facts remain limited to what is confirmed:

- suitable for meetings, training and workshops;
- fully equipped;
- air-conditioned;
- approximately 10–12 people;
- easy access.

Do not invent room size, furniture inventory, parking, catering or accessibility certification.

## Beat 2 — Spatial orientation

Research concept:

A simplified room representation may appear before real media.

Possible implementation later:

- 2D/SVG floor-plan abstraction; or
- isolated Three.js/WebGL room overview if proven useful.

The representation should answer:

> Where am I and what can I configure/explore?

Not:

> Can we put a cool spinning object here?

## Beat 3 — Focus / real media

When the visitor focuses on a meaningful zone/layout:

- real photography becomes dominant;
- the spatial representation becomes supporting orientation;
- details appear only from approved real content;
- hotspot relationships can connect plan → photo → 360.

Preferred continuity:

```text
ABSTRACT ORIENTATION
→ REAL PHOTOGRAPHY
→ 360 EXPERIENCE
```

This gives the visitor increasing evidence rather than keeping them in an abstract 3D world.

## Beat 4 — 360 explorer

The 360 experience should be integrated into the journey, not launched as an unrelated novelty.

Required UI states:

- loading;
- guidance / drag cue;
- hotspot focus;
- fallback if media/WebGL fails;
- mobile/touch behavior;
- reduced-motion behavior;
- exit/back to context;
- connection to configuration/booking when relevant.

Do not implement fake hotspots before real media/data supports them.

## Beat 5 — Configuration

Configuration should feel causal:

```text
SELECT CONFIGURATION
→ VISUAL STATE CHANGES
→ PARTICIPANT/PURPOSE CONTEXT PRESERVED
→ CONTINUE TO AVAILABILITY
```

The UI should not become a dense admin configurator.

Use:

- one focused spatial state;
- clear controls;
- precise labels;
- explicit selected state;
- simple summary of what will carry into booking.

## Beat 6 — Availability / booking handoff

The transition into availability should preserve all valid known context:

- selected space;
- participant count if already provided;
- purpose/context if already provided;
- configuration if it maps to existing product data;
- selected date/time after selection.

The backend remains authoritative for slot truth.

Motion can explain cause/effect but cannot simulate availability.

## Three.js research gate

Three.js is only approved for isolated prototyping at this stage.

A production proposal must prove:

1. the spatial representation clarifies the room;
2. touch/mobile use remains usable;
3. non-WebGL fallback preserves the same journey;
4. reduced motion removes unnecessary camera movement;
5. loading cost is acceptable;
6. real asset pipeline is defined;
7. user approves the concept after seeing it.

If a 2D/SVG solution communicates the space more clearly and cheaply, prefer it.

## Mobile recomposition

Mobile target:

```text
space identity
→ strong media
→ simple orientation control
→ focus/details
→ 360 if supported
→ configuration
→ availability CTA
```

Avoid tiny plan interactions or requiring precision pointer input.

## Accessibility / performance

- keyboard-accessible hotspot alternatives;
- textual equivalent for spatial information;
- visible focus;
- no essential state communicated by movement alone;
- progressive loading;
- no heavy 3D before it enters the relevant viewport/intent;
- avoid layout shifts when 360/3D initializes.

---

# 5. NAVIGATION CONTINUITY

Navigation should support exploration without becoming an award-site puzzle.

Target properties:

- persistent, restrained public navigation;
- clear current-route/state indication;
- mobile menu fully functional;
- contextual CTA may evolve with route intent, but must not constantly mutate unpredictably;
- page transitions should be short and subordinate to navigation speed;
- no hidden navigation gestures.

Potential continuity detail:

The editorial alignment/frame used in the Hero may subtly reappear in section labels, active nav state and media framing, creating continuity without adding another logo/motif.

---

# 6. TYPOGRAPHY APPLICATION — PRESERVE FAMILIES, IMPROVE COMPOSITION

The redesign may improve typography without replacing it.

## Instrument Serif

Use for:

- hero display statements;
- major public scene headings;
- selected editorial statements;
- important training/space focus titles.

Do not use it for:

- dense metadata;
- form labels;
- operational controls;
- schedules that require rapid scanning.

## Manrope

Use for:

- navigation;
- body copy;
- metadata;
- schedules;
- buttons/controls;
- forms;
- booking states;
- captions.

## What can change

- type scale;
- line breaks;
- column relationship;
- maximum measure;
- placement over/adjacent to media;
- responsive hierarchy;
- reveal timing.

## What cannot change without explicit approval

- font families;
- brand type identity;
- replacement by a trendy display face because a reference used one.

---

# 7. MOTION ARCHITECTURE FOR THESE STORYBOARDS

Use the minimum motion level required by the interaction.

```text
MICRO
buttons / focus / tabs / slots

OBJECT
selected service / course / space / media focus

SCENE
section hierarchy / media entry / scene reframe

NARRATIVE (R&D only)
one meaningful anchor persists/reframes across related story beats
```

No continuous decorative motion should compete with reading.

Primary implementation primitives should remain transform/opacity where possible.

Avoid:

- scroll hijacking;
- large involuntary camera moves;
- motion on every text line;
- looping decorative objects;
- multiple animation engines without a proven need.

---

# 8. VALIDATION MATRIX BEFORE PRODUCTION

Each storyboard must answer all of the following before implementation:

| Area | Hero | Training | Spaces |
|---|---|---|---|
| Real business truth preserved | required | required | required |
| Typography families preserved | required | required | required |
| Mobile recomposition defined | required | required | required |
| Reduced-motion path defined | required | required | required |
| Keyboard/focus path defined | required | required | required |
| Media fallback defined | required | required | required |
| Performance risk identified | required | required | required |
| Context preserved into next action | required | required | required |
| 3D/WebGL justification | n/a by default | n/a | prototype gate |

---

# 9. NEXT DELIVERY AFTER STORYBOARD APPROVAL

Do not jump directly into full-route production.

Preferred next sequence:

```text
1. HERO high-fidelity static concept
2. TRAINING high-fidelity static concept
3. SPACES high-fidelity static concept
4. user visual review
5. isolated motion prototype(s)
6. isolated spatial/Three.js prototype only if still justified
7. user review
8. controlled production implementation by route/feature
```

The static concepts must prove composition and hierarchy first. Motion must enhance an already strong frame rather than rescue a weak layout.

This document is a design proposal and implementation gate, not production approval.