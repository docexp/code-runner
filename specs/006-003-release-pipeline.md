---
spec: "006"
chunk: "003"
title: "Release pipeline: remove write-back commits to preserve linear history"
status: "done"
---

# Chunk 003: Remove git write-back to preserve linear history

## Scope of This Chunk

Removes the two semantic-release plugins that push commits back to the branch after each release (`@semantic-release/changelog` and `@semantic-release/git`), and restores the `head_sha` checkout strategy now that there are no write-back commits to fall behind.

Delivered via PR #11 (`fix/release-checkout-branch-tip`), squash-merged into `next`.

---

## Problem

### Write-back commits break linear history on `main`

`@semantic-release/git` pushes a `chore(release): vX.Y.Z [skip ci]` commit back to the branch after every successful release. On `main` this creates a structural problem:

1. `main` receives a merge commit from `next` (promoting `next` → `main`)
2. semantic-release tags that merge commit and pushes a version-bump commit on top
3. `main` now has a commit (`chore(release):`) that does not exist on `next`
4. `next` and `main` have permanently diverged — future merges from `next` into `main` will always see a conflict or require explicit reconciliation

The architect's spec assumed `@semantic-release/git` was safe to use in a two-branch model, but it is not: any commit pushed back to `main` is a commit that `next` does not have.

### `head_sha` checkout became broken as a side-effect

Because `@semantic-release/git` kept pushing new commits ahead of the CI-validated SHA, checking out `head_sha` left the working copy behind `origin/<branch>`. semantic-release aborts in this state with:

```
The local branch next is behind the remote one, therefore a new version won't be published.
```

Chunk 002 worked around this by switching to `head_branch` checkout (branch tip), but that was treating the symptom, not the cause.

---

## Correct Solution

**Tags are weightless.** A git tag is a pointer to an existing commit; creating one does not produce a new commit and cannot cause any branch to diverge. This makes it exactly the right mechanism for marking release points without touching history.

The release pipeline is restructured as:

1. CI validates a commit on `next` (or `main`)
2. `workflow_run` triggers the release workflow, checking out that exact SHA
3. semantic-release determines the next version from commit history
4. `release-version.sh` writes the version into each `package.json` **in the CI workspace only** (never committed)
5. `release-publish.sh` runs `npm publish` against those in-workspace files
6. semantic-release creates a **git tag** on the current SHA (e.g. `v1.0.0-next.15`)
7. `@semantic-release/github` creates a GitHub Release with auto-generated notes
8. Workflow exits — **no commit is ever pushed back to any branch**

---

## Changes

### `.releaserc.json`

Removed `@semantic-release/changelog` and `@semantic-release/git` entirely:

```diff
-    ["@semantic-release/changelog", {
-      "changelogFile": "CHANGELOG.md"
-    }],
     ["@semantic-release/exec", {
       "prepareCmd": "scripts/release-version.sh ${nextRelease.version}",
       "publishCmd": "scripts/release-publish.sh"
     }],
-    ["@semantic-release/git", {
-      "assets": [
-        "CHANGELOG.md",
-        "packages/core/package.json",
-        ...7 paths...
-      ],
-      "message": "chore(release): v${nextRelease.version} [skip ci]"
-    }],
     ["@semantic-release/github", {
```

`@semantic-release/github` remains and generates the GitHub Release with the full changenotes body. Release notes are still visible — they just live in GitHub Releases rather than a committed `CHANGELOG.md`.

### `.github/workflows/release.yml`

Reverted the `head_branch` workaround from chunk 002 back to `head_sha`:

```diff
-          ref: ${{ github.event.workflow_run.head_sha || github.ref_name }}
+          ref: ${{ github.event.workflow_run.head_sha || github.sha }}
```

`head_sha` is correct again because nothing can push ahead of it — the branch remains exactly where CI left it. The `|| github.sha` fallback covers `workflow_dispatch` runs.

---

## Consequences

| Concern | Before | After |
|---|---|---|
| Commits pushed to branch per release | 1 (`chore(release):`) | 0 |
| `main` can diverge from `next` via release | Yes | No — tags never create commits |
| Linear history on `main` | Broken after first release | Preserved |
| `CHANGELOG.md` in repo | Committed on every release | Not present (use GitHub Releases) |
| Version visible in `package.json` on branch | Yes (bumped by git commit) | No — version only in git tags and npm |
| GitHub Releases created | Yes | Yes (unchanged) |
| Checkout strategy | `head_branch` (workaround) | `head_sha` (correct) |

### Trade-off: no `CHANGELOG.md`

The repo no longer has a committed `CHANGELOG.md`. The canonical changelog is the GitHub Releases page at `https://github.com/docexp/code-runner/releases`. This is the accepted trade-off for keeping perfect linear history on both `main` and `next`.

If a future requirement demands a `CHANGELOG.md` in the repo, the correct approach is to generate it in a separate, dedicated PR authored by a bot (not as part of the release commit) — keeping the release pipeline write-free.

---

## Files Changed

| File | Change |
|---|---|
| `.releaserc.json` | Removed `@semantic-release/changelog` and `@semantic-release/git` plugins |
| `.github/workflows/release.yml` | Reverted checkout ref from `head_branch` back to `head_sha` |

## Post-Implementation Checklist

- [x] `bunx nx run-many -t build --output-style=stream` passes
- [x] `bunx nx run-many -t typecheck --output-style=stream` passes
- [x] `bunx nx run-many -t test --output-style=stream` passes
- [x] PR #11 CI green (unit, typecheck, e2e all pass)
- [x] PR #11 squash-merged into `next` as `c6e25e0`
- [x] Chunk status updated to `done`
