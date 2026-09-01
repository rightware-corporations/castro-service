# Repository Governance — Castro's Service

## Purpose

`main` is the production-grade integration branch and the repository source of truth. Changes must enter through traceable pull requests and must not bypass the mandatory quality gates during normal development.

## Active `main` ruleset

Repository ruleset `Protect main` (ID `22020960`) is active and targets the default branch, currently `main`.

Verified controls:

1. Pull requests are required before merging.
2. The following Integration CI status checks are required using these exact job names:
   - `Backend quality gates`
   - `Frontend quality gates`
   - `PostgreSQL integration gates`
3. Required status checks use the strict/up-to-date policy before merge.
4. Required approvals are currently `0`; review approval is therefore not a merge dependency in the present operating model.
5. Only the normal merge-commit method is allowed; squash and rebase merges are not allowed by the ruleset.
6. Force pushes are blocked.
7. Branch deletion is blocked.
8. No bypass actors are configured and the current user cannot bypass the ruleset.
9. A required check that is pending, cancelled or failing prevents merge.

If mandatory review approvals are introduced later, stale-review dismissal should be evaluated at the same time so new commits cannot retain obsolete approvals.

## Required workflow

```text
short-lived feature/fix/docs branch
      -> pull request to main
      -> Backend quality gates
      -> Frontend quality gates
      -> PostgreSQL integration gates
      -> update branch if main moved
      -> merge commit
      -> Integration CI runs again on main
      -> verify post-merge main
```

A commit is not considered production-validated merely because an earlier commit on the same PR was green. The exact PR head proposed for merge must have all required checks green.

## Branch model

`main` is the only permanent integration/source-of-truth branch required by the project.

Work branches are short-lived and concern-specific, for example:

- `feature/...`
- `fix/...`
- `test/...`
- `docs/...`

They exist only for the duration of a controlled change and may be removed after merge. There is no permanent `develop` branch requirement.

## Merge method and commit traceability

Retain meaningful concern-level commits so security, database, frontend, testing and documentation changes can be audited or reverted independently.

Do not combine unrelated changes into a catch-all commit. The protected ruleset currently permits only merge commits at PR merge time, preserving the individual branch commits in `main` history.

## Protection verification evidence

Verified after production-readiness consolidation:

- [x] ruleset `Protect main` is active;
- [x] target is the default branch (`main`);
- [x] pull requests are required;
- [x] `Backend quality gates` is required;
- [x] `Frontend quality gates` is required;
- [x] `PostgreSQL integration gates` is required;
- [x] branch must be up to date before merge;
- [x] only merge commits are allowed;
- [x] force push is blocked;
- [x] deletion is blocked;
- [x] bypass actor list is empty;
- [x] post-merge Integration CI run #197 passed all three gates on `main` commit `b7c7a60bd56616173209f19b08385aec9fc5b5e5`.

The administrative blocker previously tracked in Issue #18 is closed because these settings were verified directly through the GitHub ruleset API.

## Emergency changes

The current ruleset has no bypass actors. If an emergency recovery policy is introduced in the future, it must be explicit, narrowly scoped and followed by a normal PR plus green Integration CI evidence restoring an auditable state.
