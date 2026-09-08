# CASTRO’S SERVICES — CURRENT CONTINUATION ENTRYPOINT

**Current as of:** 2026-09-08

Any agent continuing CASTRO’S should start here before trusting older handoff branch/PR metadata.

## Current live baseline

```text
Repository: rightware-corporations/castro-service
Default branch: main
Stable main SHA before the active VEXEL-agent handoff branch:
3ea79efd38dec4dfc6f8d9932b00acd3b5d47c54
Latest verified post-merge Integration CI:
#304 — Frontend / Backend / PostgreSQL = GREEN
Active handoff branch:
docs/vexel-agent-execution-handoff
```

Always re-fetch live `main`, open PRs and CI before changing code.

## Current execution decision

The user clarified the operating plan: the **agent that built VEXEL is the intended executor for CASTRO’S Experience 2.0**.

The purpose of the current work is therefore to preserve a complete, repository-backed execution handoff so that the VEXEL agent can enter the CASTRO’S repository, audit the live implementation, understand all product/design constraints, and execute the redesign in controlled branches.

This chat should not independently reinvent a parallel visual direction. The repository documentation is the shared source of truth that keeps both agents aligned.

Primary executor handoff:

`docs/CASTROS-VEXEL-AGENT-EXECUTION-HANDOFF.md`

## Current product/creative state

The public frontend is **not accepted as final**. Experience 2.0 research and storyboards are now documented and should be used by the VEXEL agent as the execution basis.

The new agent must bring VEXEL-level execution discipline without cloning VEXEL’s visual identity.

### Identity lock during Experience 2.0

Do not silently alter the CASTRO’S identity.

```text
Instrument Serif = editorial/public headings
Manrope          = body/navigation/forms/controls/UI
```

The approved navy / deep navy / teal / cream / off-white palette remains authoritative. Composition, media, scene architecture, depth, interaction, motion and responsive behavior may be redesigned; typography families and core brand palette are not open for implicit replacement.

Any future brand-level typography replacement requires explicit user approval and a separate rationale.

## Read in this order

1. `docs/CASTROS-VEXEL-AGENT-EXECUTION-HANDOFF.md` — execution brief for the VEXEL agent.
2. `docs/CASTROS-EXPERIENCE-2-MASTER-HANDOFF.md` — broader Experience 2.0 state and decisions.
3. `docs/CASTROS-EXPERIENCE-2-PHASE-1-RESEARCH.md` — research conclusions and reference synthesis.
4. `docs/CASTROS-EXPERIENCE-2-STORYBOARDS.md` — Hero / Training / Spaces composition, motion, media, responsive and accessibility direction.
5. `docs/CASTROS-EXPERIENCE-REFERENCE-REGISTER.md` — references and research evidence.
6. `docs/CASTRO_DESIGN_QUALITY_CONTRACT_V1.md` — technical visual quality contract.
7. `docs/CASTROS_VISUAL_INTERACTION_SYSTEM.md` — established visual/interaction foundations.
8. `docs/CASTROS-SERVICES-MASTER-HANDOFF.md` — historical broader product handoff; old active branch/PR metadata is not current live state.
9. Source code + live GitHub/CI — final technical authority.

## Current next action

```text
HAND OFF TO THE VEXEL AGENT
→ VEXEL AGENT RE-FETCHES LIVE main / PRs / CI
→ AUDITS CURRENT PUBLIC FRONTEND
→ READS EXPERIENCE 2.0 RESEARCH + STORYBOARDS + QUALITY CONTRACT
→ MAPS HERO / TRAINING / SPACES SOURCE + CSS OWNERSHIP
→ EXECUTES FIRST CONTROLLED PRODUCTION BLOCK
→ TESTS DESKTOP / MOBILE / KEYBOARD / REDUCED MOTION
→ PR + CI 3/3 GREEN
→ NORMAL MERGE
→ POST-MERGE main CI 3/3 GREEN
→ UPDATES LIVING HANDOFF
```

Recommended first implementation block after the VEXEL agent's audit: **Hero / Human Presence**, unless the live audit reveals a stronger sequencing dependency.

## Living-handoff rule

Every agent that completes an Experience 2.0 block must update the living documentation with:

- current date;
- stable main SHA;
- verified CI state;
- branch/PR if still open;
- what changed;
- decisions/rejections;
- typography status;
- open dependencies/assets;
- exact next action.

Do not silently delete decision history. Mark old directions `HISTORICAL`, `SUPERSEDED`, `REJECTED` or `DEFERRED`.
