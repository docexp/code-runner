---
spec: "006"
chunk: "005"
title: "Release pipeline: replace promote.yml with sequoia-pgp/fast-forward PR merge"
status: "done"
---

# Chunk 005: Replace promote.yml with fast-forward PR merge

## Scope of This Chunk

Removes `promote.yml` (SSH deploy-key fast-forward workflow) and replaces it with a
`fast-forward.yml` workflow that uses the `sequoia-pgp/fast-forward` action to
fast-forward `main` to `next` via a PR comment trigger (`/fast-forward`).

`release.yml` is updated to also trigger on pushes to `main` so that the stable
semantic-release run fires automatically after the fast-forward lands.

## Pre-Implementation Checklist
- [x] Parent spec is `status: approved`
- [x] `bunx nx run-many -t build --output-style=stream` passes before starting

## Problem With `promote.yml`

`promote.yml` used:
- A `workflow_dispatch` trigger requiring manual confirmation input
- An SSH deploy key (`PROMOTE_DEPLOY_KEY`) as the sole bypass actor on the `main`
  branch ruleset, which blocked the standard GitHub PR merge button entirely
- A standalone semantic-release run inside the promote job itself

This made the promotion opaque (no PR, no review trail) and required maintaining an
SSH deploy key secret in addition to `GH_PAT`.

## Solution

Use `sequoia-pgp/fast-forward@v1` triggered by a `/fast-forward` comment on a
`next → main` PR. This:

1. Keeps a visible PR in the GitHub UI (description, reviewers, discussion thread)
2. Verifies the branch can truly be fast-forwarded before pushing (errors loudly if
   `main` has diverged)
3. Performs a `git push` fast-forward — no SHA rewriting, no merge commits
4. The resulting push to `main` fires `release.yml` → stable semantic-release

`GH_PAT` (already present in the repo) is used to authenticate the push, bypassing
the `main` branch protection the same way `promote.yml`'s deploy key did. The
`PROMOTE_DEPLOY_KEY` secret is no longer needed.

> **Manual step required:** Update the `main` branch ruleset in GitHub repository
> settings — remove "Deploy keys" as bypass actor and add the account that owns
> `GH_PAT` (or "GitHub Actions") as the bypass actor instead.

## Implementation Plan

1. Create `specs/006-005-release-pipeline.md` (this file)
2. Delete `.github/workflows/promote.yml`
3. Create `.github/workflows/fast-forward.yml`
4. Update `.github/workflows/release.yml` — add `main` to push trigger, remove
   stale comment referencing promote.yml
5. Update `.github/agents/developer.agent.md` — replace "rebase merge" with
   "fast-forward via /fast-forward comment" throughout

## Files Changed
| File | Change |
|---|---|
| `.github/workflows/promote.yml` | Deleted |
| `.github/workflows/fast-forward.yml` | Created — sequoia-pgp/fast-forward@v1 on PR comment |
| `.github/workflows/release.yml` | Added `main` to `push` trigger; removed promote.yml comment |
| `.github/agents/developer.agent.md` | Updated `next → main` merge strategy description |

## Post-Implementation Checklist
- [x] `bunx nx run-many -t build --output-style=stream` passes
- [x] No TypeScript errors (`bunx nx run-many -t typecheck --output-style=stream`)
- [x] `promote.yml` no longer exists
- [x] `fast-forward.yml` exists and references `sequoia-pgp/fast-forward@v1`
- [x] `release.yml` triggers on both `next` and `main` push
- [x] `developer.agent.md` no longer references "rebase merge" for `next → main`
- [x] Chunk status updated to `done`
