# Repository Governance — Castro's Service

## Purpose

`main` is the production-grade integration branch. Changes must enter through traceable pull requests and must never bypass the mandatory quality gates during normal development.

## Required `main` ruleset

The repository administrator must configure a branch ruleset targeting `main` with these controls:

1. Require a pull request before merging.
2. Require the following status checks before merging, using these exact Integration CI job names:
   - `Backend quality gates`
   - `Frontend quality gates`
   - `PostgreSQL integration gates`
3. Require the branch to be up to date with `main` before merge when GitHub exposes that option for the configured required checks.
4. Dismiss stale approvals when new commits are pushed.
5. Block direct pushes to `main` during normal development.
6. Block force pushes.
7. Block branch deletion.
8. Do not allow merge while a required check is pending, skipped unexpectedly, cancelled or failing.
9. Keep administrator/bypass access restricted to genuine recovery emergencies. Any emergency bypass must be followed by a normal PR and a green Integration CI run restoring an auditable state.

## Required workflow

```text
feature/fix branch
      -> pull request to main
      -> Backend quality gates
      -> Frontend quality gates
      -> PostgreSQL integration gates
      -> review/update branch if required
      -> merge
      -> Integration CI runs again on main
```

A commit is not considered production-validated merely because an earlier commit on the same PR was green. The exact PR head proposed for merge must have all required checks green.

## Merge method and commit traceability

For production-hardening work, prefer retaining meaningful individual commits so each concern can be audited or reverted independently. Do not combine unrelated security, database, frontend and documentation changes into a single catch-all commit.

Squashing is acceptable only when the PR is intentionally composed of fixup commits that have no independent audit value. PR #17 intentionally keeps concern-level commits.

## Branch protection verification

Before PR #17 is merged, verify in GitHub repository settings that:

- [ ] a ruleset/branch protection rule targets `main`;
- [ ] direct push is blocked;
- [ ] force push is blocked;
- [ ] deletion is blocked;
- [ ] pull requests are required;
- [ ] `Backend quality gates` is required;
- [ ] `Frontend quality gates` is required;
- [ ] `PostgreSQL integration gates` is required;
- [ ] stale approvals are dismissed after new commits where review requirements are enabled;
- [ ] the exact PR head is green before merge.

## Current connector limitation

Repository rulesets are GitHub administrative configuration, not repository source files. The project automation may verify rulesets when its GitHub authorization permits it, but source-code commits cannot themselves enable branch protection. If the connected GitHub integration lacks permission to mutate repository rulesets, an authorized repository administrator must perform the settings change in GitHub and record that verification before the production-readiness PR is merged.
