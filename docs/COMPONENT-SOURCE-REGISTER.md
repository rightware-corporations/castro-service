# Castro’s Services — Component Source Register

## Purpose

This register records third-party UI/runtime components deliberately approved for the Castro’s Services frontend. It is not a general dependency inventory and does not authorize additional libraries.

## Approved source — Motion

| Field | Value |
| --- | --- |
| Package | `motion` |
| Version | `13.2.0` |
| License | MIT |
| Origin | Motion / npm package `motion` |
| Surface | Frontend only |
| Status | Approved for the Functional Motion Foundation pilot |

### Approved usage

Motion is used only to add controlled functional motion to existing Castro’s Services UI patterns:

- application-level reduced-motion policy through `MotionConfig`;
- centralized motion durations, springs and presets;
- presence transitions for Dialog, ConfirmDialog, Drawer and BottomSheet;
- public mobile navigation and `/app` mobile sidebar transitions;
- Tabs selection/panel feedback;
- booking TimeSlot and Stepper/progress feedback;
- restrained editorial reveal on selected Homepage sections.

### Constraints

The Motion integration must not:

- change booking rules, availability, API contracts, permissions or backend behaviour;
- redesign the public hero or unrelated pages;
- introduce decorative animation systems, parallax, scroll-jacking, particles, glow effects, animated backgrounds or text-scramble effects;
- hide essential content when `prefers-reduced-motion` is enabled;
- replace existing accessible focus, keyboard, Escape or ARIA behaviour.

## Direct dependency policy

For the current pilot, `motion@13.2.0` is the only newly approved direct frontend dependency. Any additional direct dependency requires a separate audit and explicit approval.
