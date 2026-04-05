---
spec: "006"
chunk: "004"
title: "Release pipeline: push trigger, CI on PR only, enforced release ordering"
status: "done"
---

# Chunk 004: Push trigger, CI on PR only, enforced release ordering

## Scope of This Chunk

Fixes the double-release problem and rationalises the CI/Release pipeline split. No
source code was changed — only workflow files, a branch ruleset, and the Developer
agent.

Delivered on branch `fix/release-push-trigger-drop-ci-on-push`.

---

## Problems Solved

### 1. Double-release on every push to `next`

**What was happening:** `release.yml` triggered on `workflow_run` (CI completion).
`ci.yml` had `push` triggers on both `next` and `main`. When a squash merge landed on
`next`, two independent CI push runs started nearly simultaneously. Each one completed
successfully, each one fired a `workflow_run` → Release. Both Release jobs started
within seconds, found the same tag window, and both tried to create the same next
version tag:

- Run A succeeds → creates `v1.0.0-next.X`, publishes packages
- Run B starts a few seconds later → finds `v1.0.0-next.X` already exists → crashes

This was visible in the Actions UI as one green and one red Release run side-by-side.

**Root cause:** using `workflow_run` as an indirection through CI created a fan-out:
one push → potentially multiple CI runs → multiple Release runs.

### 2. Redundant CI on `next` and `main` post-merge

**What was happening:** CI ran on `push` to `next` (post squash-merge) and on `push`
to `main` (post rebase). But the `next` ruleset already has
`strict_required_status_checks_policy: true` — PRs can only squash-merge after CI has
passed on the PR branch at the current `next` tip. The quality gate already existed
before the code reached `next`.

Running CI again after the merge adds ~90 seconds of wall-clock time and actor cost
with zero new signal: the exact same tests just ran against the exact same code on the
PR branch a few seconds earlier.

### 3. No ordering guarantee between `next` release and `next → main` promotion

**What was happening:** nothing prevented a developer from immediately opening (or
merging) a `next → main` PR before the Release workflow on `next` had finished. If
that happened:

- semantic-release on `main` would walk the tag history and find no
  `v1.0.0-next.X` tags (they hadn't been created yet)
- It would compute the wrong stable version or exit with "no new version"
- The pre-release and stable releases would be out of sequence

---

## Solution

### `release.yml` — replace `workflow_run` with `push`

```diff
-on:
-  workflow_run:
-    workflows: ["CI"]
-    branches: [next, main]
-    types: [completed]
+on:
+  push:
+    branches:
+      - next
+      - main
```

One push → one Release run. No fan-out. No `workflow_run` intermediary.

The `if: conclusion == 'success'` guard is also removed (no longer relevant).

The `ref:` override on `actions/checkout` is also removed. A `push` event checks out
the pushed branch as HEAD by default, and `GITHUB_REF_NAME` is set to the branch name.
semantic-release reads `GITHUB_REF_NAME` to determine `next` vs `main` context, so it
works correctly without any manual `ref:` manipulation.

**Quality guarantee preserved:** the `next` ruleset still requires CI to pass on the
PR branch (with strict up-to-date enforcement) before squash merge. The commit reaching
`next` has already been tested. The Release workflow is not a test runner — it does not
need CI to have passed *after* the push.

### `ci.yml` — remove `push` trigger

```diff
 on:
-  push:
-    branches: [next, main]
   pull_request:
     branches: [next, main]
```

CI now runs only on `pull_request` events. The `typecheck`, `unit-test`, and `e2e`
jobs still run on every PR (affected-only for unit/typecheck, full for e2e).

The `push` → CI matrix that triggered double-releases is gone entirely.

### `main` branch ruleset — add `Semantic Release` required status check

The `main` ruleset (ID `14715602`) was updated via the GitHub API to require the
`Semantic Release` job as a passing status check before a `next → main` rebase PR
can merge:

```
Required status checks on main:
  - E2e tests          (existing)
  - Type-check         (existing)
  - Unit tests         (existing)
  - Semantic Release   ← added
```

This creates a hard ordering constraint:

```
next commit → Release on next passes → v1.0.0-next.X tag exists
           → next → main PR can now merge
           → Release on main promotes to v1.0.0 stable
```

Without this constraint, a `next → main` rebase immediately after a push to `next`
could race ahead of the Release job and cause semantic-release on `main` to see no
pre-release tags.

### Developer agent updated

`.github/agents/developer.agent.md` updated with:
- The new diagram showing CI on PR only, Release on push
- The requirement to wait for `Semantic Release` to pass on `next` before opening a
  `next → main` PR (the ruleset enforces this mechanically, but the agent should
  understand why)

---

## Final Pipeline Flow

```
Developer pushes fix/feat branch
  └─► PR opened → CI runs (typecheck + unit + e2e, affected)
        └─► CI passes + branch up-to-date with next
              └─► Squash merge to next
                    └─► push to next → Release fires
                          ├─► pre-release v1.0.0-next.X tagged + published ✓
                          └─► Semantic Release status = green on next

Developer opens next → main PR
  └─► Requires: E2e tests ✓  Type-check ✓  Unit tests ✓  Semantic Release ✓
        └─► Rebase merge to main
              └─► push to main → Release fires
                    └─► stable v1.0.0 tagged + published ✓
```

---

## Files Changed

| File | Change |
|---|---|
| `.github/workflows/release.yml` | Trigger changed from `workflow_run` to `push`; `if` guard and `ref:` override removed |
| `.github/workflows/ci.yml` | `push` trigger on `next`/`main` removed; PR-only |
| `.github/agents/developer.agent.md` | Diagram and constraints updated |
| `main` branch ruleset `14715602` | `Semantic Release` added as required status check |

## Post-Implementation Checklist

- [x] `bunx nx run-many -t build --output-style=stream` passes
- [x] `bunx nx run-many -t test --output-style=stream` passes
- [x] Branch `fix/release-push-trigger-drop-ci-on-push` pushed, auto-PR created
- [x] Chunk status updated to `done`
