---
id: "006"
title: "Branch Strategy, Semantic Release & npm Publish"
status: "approved"
created: "2026-04-04"
updated: "2026-04-04"
---

> **File rename required:** this file must be moved to `specs/006-000-release-pipeline.md` as part of implementing spec 003-000.

# Branch Strategy, Semantic Release & npm Publish

## Context & Goals

The project currently has a single default branch (`main`) with no automated versioning or publishing. All PRs from feature branches land directly on `main`. This is fragile for a multi-package npm workspace because a single misconfigured merge can publish a broken package to thousands of consumers.

This spec introduces:
1. A two-branch promotion model: `next` (pre-release) → `main` (stable release)
2. Automated versioning and changelog generation using `semantic-release`
3. Per-package npm publishing triggered by that release
4. A GitHub Actions release workflow that runs on pushes to `next` and `main`

## Scope

**In scope:**
- Creating the `next` branch as the new default PR target
- `semantic-release` configuration at the repo root (multi-package support via `semantic-release` v24's multi-project option, or a custom config per package)
- GitHub Actions workflow: `.github/workflows/release.yml`
- Per-package `.releaserc.json` for packages that publish to npm
- `@cheetah-coder/react-e2e` is **private** and must never be published
- `NPM_TOKEN` and `GH_PAT` secret usage

**Out of scope:**
- Canary/nightly releases beyond the `next` pre-release channel
- GitHub releases with binary attachments
- Per-package independent versioning — all packages share a single lock-step version
- Enforcing branch protection rules via API (developer must configure via GitHub UI — see Acceptance Criteria)

## Package Impact

Changed files:
- `.github/workflows/release.yml` — new workflow
- Root `.releaserc.json` — single release configuration for the entire monorepo
- Root `package.json` — add `semantic-release` and release plugins as root `devDependencies`
- Each publishable `package.json` — add `publishConfig` and `files` fields

Not changed: `packages/adapters/react-e2e` (private, no release config).

## Requirements

### Functional Requirements

- FR-001: All feature/fix/chore branches must target `next` as the base branch. The existing auto-PR workflow already targets `next` after spec 005 implementation.
- FR-002: Merging a PR to `next` triggers a pre-release publish (e.g. `1.2.0-next.1`) of **all** publishable packages at the same version. This is a dist-tag `next` on npm.
- FR-003: Merging `next` → `main` (via a promotion PR) triggers a stable release (e.g. `1.2.0`) of **all** publishable packages at the same version. This is the `latest` dist-tag on npm.
- FR-004: All packages share a single lock-step version — one `semantic-release` run at the repo root determines the next version and publishes every publishable package at that version.
- FR-009: The release workflow must only start after the CI workflow (`ci.yml`) completes **successfully** on `next` or `main`. A push that causes any test to fail must not trigger a release under any circumstances.
- FR-005: `CHANGELOG.md` is generated per package, committed back to the repo by the release bot.
- FR-006: A GitHub Release is created for each stable release and for pre-releases (so version history is visible in the GitHub UI).
- FR-007: The `@cheetah-coder/react-e2e` package is never published.
- FR-008: `npm publish` must use `--access public` because all packages are scoped (`@cheetah-coder/`).

### Non-Functional Requirements

- NFR-001: Build must pass after every chunk.
- NFR-002: No `any` types introduced.
- NFR-003: Release must be idempotent — re-running for the same commits must not create a duplicate release.
- NFR-004: The release workflow must not require manual input or approval steps.
- NFR-005: The workflow must have the minimum required permissions (`contents: write`, `issues: write`, `pull-requests: write`, `id-token: write`) and no broader access.

## Technical Design

### Branch Model

```
feature/* ──► next ──► main
fix/*     ──►
docs/*    ──►
```

- `next` receives all PRs. CI runs here (spec 005-000).
- Periodic "promotion PR" merges `next` → `main`. The Developer creates this PR manually or via an automated schedule (out of scope for now).
- Both `next` and `main` are permanent branches and should both have branch protection rules set in the GitHub repository settings (see Acceptance Criteria).

### Release channel mapping

| Branch | npm dist-tag | Version format | `semantic-release` channel |
|---|---|---|---|
| `next` | `next` | `1.2.0-next.N` | `channel: "next"`, `prerelease: "next"` |
| `main` | `latest` | `1.2.0` | `channel: false` (default) |

### `semantic-release` strategy for lock-step monorepo versioning

All packages share a single version number. One `semantic-release` invocation runs at the **repo root** and determines the next version from the full commit history. It then publishes each of the seven packages at that same version via the `@semantic-release/exec` plugin (or multiple `@semantic-release/npm` plugin entries with explicit `pkgRoot` paths).

The recommended approach for this monorepo is to use **multiple `@semantic-release/npm` plugin entries**, one per publishable package, each pointing to its compiled `dist/` directory. Semantic-release executes them sequentially in a single run, publishing all packages atomically under the same computed version.

### Root `.releaserc.json`

Place at the repo root. This is the **only** release configuration file. No per-package config files are needed.

```jsonc
{
  "branches": [
    "main",
    { "name": "next", "prerelease": "next", "channel": "next" }
  ],
  "tagFormat": "v${version}",
  "plugins": [
    ["@semantic-release/commit-analyzer", {
      "preset": "angular",
      "releaseRules": [
        { "type": "refactor", "release": false },
        { "type": "style",    "release": false },
        { "type": "test",     "release": false },
        { "type": "docs",     "release": false },
        { "type": "build",    "release": false },
        { "type": "ci",       "release": false },
        { "type": "chore",    "release": false }
      ],
      "parserOpts": {
        "noteKeywords": ["BREAKING CHANGE", "BREAKING-CHANGE"]
      }
    }],
    ["@semantic-release/release-notes-generator", {
      "preset": "angular"
    }],
    ["@semantic-release/changelog", {
      "changelogFile": "CHANGELOG.md"
    }],
    ["@semantic-release/npm", { "pkgRoot": "packages/core/dist" }],
    ["@semantic-release/npm", { "pkgRoot": "packages/runners/js/dist" }],
    ["@semantic-release/npm", { "pkgRoot": "packages/runners/python/dist" }],
    ["@semantic-release/npm", { "pkgRoot": "packages/runners/go/dist" }],
    ["@semantic-release/npm", { "pkgRoot": "packages/runners/rust/dist" }],
    ["@semantic-release/npm", { "pkgRoot": "packages/runners/java/dist" }],
    ["@semantic-release/npm", { "pkgRoot": "packages/adapters/react/dist" }],
    ["@semantic-release/git", {
      "assets": ["CHANGELOG.md"],
      "message": "chore(release): v${nextRelease.version} [skip ci]\n\n${nextRelease.notes}"
    }],
    ["@semantic-release/github", {
      "assets": []
    }]
  ]
}
```

**Key decisions:**

- `tagFormat: "v${version}"` uses a single repo-wide tag (e.g. `v1.2.0`) — one tag covers all packages at that version, matching the lock-step model.
- Each `@semantic-release/npm` entry points to a pre-built `dist/` directory. Semantic-release reads the `package.json` inside that directory (copied there by the Nx build) to get the package name and publishes it.
- `@semantic-release/git` commits only `CHANGELOG.md` back to the branch. Per-package `package.json` version fields are **not** auto-committed — the version is expressed through git tags only. This avoids a cascade of version-bump commits across seven files per release.
- `[skip ci]` in the commit message prevents the release commit from re-triggering CI.
- The `@cheetah-coder/react-e2e` package is private and has no entry here.

### Nx `release` target (repo root only)

The release is triggered from the root, not from individual packages. Add a single `release` script to the **root** `package.json`:

```jsonc
"scripts": {
  "release": "semantic-release"
}
```

And add a root-level Nx target in `nx.json` (or via a `project.json` at the root) so it participates in the Nx graph:

```jsonc
"targets": {
  "release": {
    "executor": "nx:run-commands",
    "options": {
      "command": "semantic-release",
      "cwd": "{workspaceRoot}"
    }
  }
}
```

The release workflow calls `semantic-release` directly (not via Nx) to avoid workspace-root project resolution issues — see the workflow step below.

> **Important:** individual packages must **not** have a `release` Nx target. The entire release is orchestrated from the root in a single process.

### `.github/workflows/release.yml`

The release workflow uses a `workflow_run` trigger instead of a direct `push` trigger. This is the only GitHub Actions mechanism that expresses a hard cross-workflow dependency: the release workflow is enqueued **only** when the CI workflow (`CI`) finishes, and the job-level `if` condition gates execution on a `success` conclusion. A push that causes any CI job to fail will never reach the release step.

```yaml
name: Release

on:
  workflow_run:
    workflows: ["CI"]
    branches: [next, main]
    types: [completed]

permissions:
  contents: write
  issues: write
  pull-requests: write
  id-token: write

jobs:
  release:
    name: Semantic Release
    runs-on: ubuntu-latest
    # Only run when the triggering CI workflow succeeded
    if: github.event.workflow_run.conclusion == 'success'
    steps:
      - uses: actions/checkout@v4
        with:
          # Pin to the exact commit that CI validated — not the branch tip
          ref: ${{ github.event.workflow_run.head_sha }}
          fetch-depth: 0
          persist-credentials: false   # semantic-release manages git auth itself

      - uses: actions/setup-node@v4
        with:
          node-version: 22
          registry-url: https://registry.npmjs.org

      - uses: oven-sh/setup-bun@v2

      - uses: actions/cache@v4
        with:
          path: |
            node_modules
            .nx/cache
          key: ${{ runner.os }}-bun-${{ hashFiles('bun.lock') }}
          restore-keys: ${{ runner.os }}-bun-

      - run: bun install --frozen-lockfile

      - name: Build all packages
        run: bunx nx run-many -t build --output-style=stream

      - name: Release
        run: bunx semantic-release
        env:
          GITHUB_TOKEN: ${{ secrets.GH_PAT }}
          NPM_TOKEN: ${{ secrets.NPM_TOKEN }}
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
```

**Why `GH_PAT` and not `GITHUB_TOKEN`?**

`semantic-release` pushes a commit back to the branch (the `chore(release):` version bump commit). The built-in `GITHUB_TOKEN` cannot trigger subsequent workflow runs (it would cause an infinite loop guard). Using a PAT with `repo` scope bypasses this guard and allows the release commit to be pushed without re-triggering the release workflow (the `[skip ci]` message handles that at the application level).

**Why `workflow_run` instead of `push`?**

A `push` trigger fires unconditionally on every push, even when tests are failing. By listening to `workflow_run` on the CI workflow and checking `conclusion == 'success'`, the release step is structurally impossible to reach unless all CI jobs (typecheck, unit-test, e2e) have already passed for that exact commit.

**Why `ref: github.event.workflow_run.head_sha`?**

The `workflow_run` event does not automatically check out the commit that triggered the upstream workflow. Without an explicit `ref`, `actions/checkout` defaults to the current branch tip, which may have advanced since CI ran. Pinning to `head_sha` ensures semantic-release analyses and publishes the exact commit that passed CI.

**Why `persist-credentials: false`?**

This prevents the default `actions/checkout` credential from interfering with `semantic-release`'s own git configuration.

**Why `id-token: write`?**

Required for npm provenance publishing (npm's auditable build provenance feature). Not strictly mandatory but strongly recommended for public packages, and harmless if not used.

### npm provenance (optional but recommended)

Add the following to each package's `@semantic-release/npm` plugin configuration:

```jsonc
["@semantic-release/npm", {
  "pkgRoot": "dist",
  "npmPublish": true,
  "tarballDir": false
}]
```

And in the release workflow step, set:

```yaml
env:
  NPM_CONFIG_PROVENANCE: "true"
```

This requires the `id-token: write` permission already included.

### Scoped package publishing

Because all packages are under the `@cheetah-coder` npm scope, `npm publish` requires `--access public`. The `@semantic-release/npm` plugin respects the `publishConfig` field in `package.json`. Every publishable `package.json` must include:

```json
"publishConfig": {
  "access": "public"
}
```

The Developer must add this field to all seven publishable packages.

### Tag uniqueness and initial bootstrap

`semantic-release` determines what to release based on the single repo-wide git tag (e.g. `v0.1.0`). On first run with no existing tags, it will compute the initial version from all commits since the beginning of history. The first `feat` commit produces `0.1.0`; the first `fix` produces `0.0.1`. A pre-release on `next` produces `0.1.0-next.1`.

Because version is managed through tags only (not committed back to `package.json` files), the current `"version": "0.0.1"` fields in each package are irrelevant after the first release. Developer must ensure every publishable `package.json` has `"version": "0.0.0"` as a neutral placeholder so `npm publish` does not reject a stale version.

### Dependency install for release plugins

The following packages must be added to root `devDependencies`:

| Package | Version |
|---|---|
| `semantic-release` | `^24.0.0` |
| `@semantic-release/commit-analyzer` | `^13.0.0` |
| `@semantic-release/release-notes-generator` | `^14.0.0` |
| `@semantic-release/changelog` | `^6.0.0` |
| `@semantic-release/npm` | `^12.0.0` |
| `@semantic-release/git` | `^10.0.0` |
| `@semantic-release/github` | `^10.0.0` |

## Nx Considerations

- No per-package `release` Nx target is added. The release is a single `semantic-release` invocation from the workspace root.
- The build step (`bunx nx run-many -t build`) must complete before `semantic-release` runs to ensure all `dist/` directories exist.
- `@cheetah-coder/react-e2e` remains private and has no entry in the root `.releaserc.json`.

## npm Scope vs GitHub Organization

**The `@cheetah-coder` npm scope is completely independent of the GitHub organization name (`docexp`).** These are separate identity systems on separate platforms.

| Concern | Platform | Identity required |
|---|---|---|
| Source code hosting | github.com | `docexp` GitHub organization |
| npm package publishing | npmjs.com | `cheetah-coder` npm organization |

### How npm scopes work

An npm scope (e.g. `@cheetah-coder`) maps to an **npm organization** on [npmjs.com](https://www.npmjs.com/org/create), not a GitHub organization. The npm org name must exactly match the scope without the `@`. The GitHub org name is irrelevant.

This means:
- Publishing `@cheetah-coder/core` requires a `cheetah-coder` npm org to exist at npmjs.com.
- The `NPM_TOKEN` used in GitHub Actions must belong to an npm user who is a **member with publish rights** in the `cheetah-coder` npm org.
- The GitHub organization `docexp` plays no role in npm publishing.

### Why NOT GitHub Packages

If the packages were published to **GitHub Packages** (`npm.pkg.github.com`), the npm scope would be **required** to match the GitHub organization name — meaning the scope would have to be `@docexp`, not `@cheetah-coder`. This is the only scenario where the GitHub org name constrains the npm scope.

This spec targets the **public npmjs.com registry** exclusively. GitHub Packages is not used. There is no `@docexp` scope requirement.

### Action required before first publish

The `cheetah-coder` npm organization must exist at npmjs.com before the release workflow runs for the first time. The npm user who owns the `NPM_TOKEN` must be added to that org with publish rights.

### `repository` field

Best practice: add a `repository` field to each publishable `package.json` that links back to the GitHub repository. This does not affect publishing to npmjs.com but improves discoverability and is displayed on the npm package page:

```json
"repository": {
  "type": "git",
  "url": "https://github.com/docexp/code-runner.git",
  "directory": "packages/core"
}
```

The `directory` field indicates which subdirectory within the monorepo this package lives in. Replace `packages/core` with the correct path per package.

## Security Considerations

- `NPM_TOKEN` must be stored as a GitHub Actions repository secret. It must be a granular npm access token (from npmjs.com) belonging to a user who is a member of the **`cheetah-coder` npm organization** with publish rights. The GitHub organization `docexp` has no bearing on this token.
- `GH_PAT` must be a fine-grained personal access token with `contents: write` and `pull-requests: write` on this repository only. Broad PATs (`repo` scope covering all repos) should be avoided.
- `persist-credentials: false` in `actions/checkout` prevents token leakage if a compromised action reads the credential helper.
- Release commits use `[skip ci]` to break potential infinite loops, but the primary protection is the dedicated PAT (which is distinct from the workflow trigger token).
- Published packages must never include the `.husky/` directory, test files, or spec files. Ensure each package's `package.json` includes a `files` field that allowlists only `dist/`.

### `files` field (to add to every publishable `package.json`)

```json
"files": ["dist"]
```

## Implementation Notes for Developer

1. **Verify the `cheetah-coder` npm organization exists** at npmjs.com and the npm user who owns `NPM_TOKEN` is a member with publish rights. This is a prerequisite for all subsequent steps.
2. Create the `next` branch from `main` before implementing anything else.
3. Configure branch protection on both `next` and `main` in GitHub repository settings (see Acceptance Criteria for required rules).
4. Add `"publishConfig": { "access": "public" }`, `"files": ["dist"]`, `"version": "0.0.0"`, and the `repository` field (see npm Scope & Registry section) to each of the seven publishable `package.json` files.
5. Create the root `.releaserc.json` with the exact content from the design section above.
6. Add all seven semantic-release `devDependencies` to the root `package.json`.
7. Create `.github/workflows/release.yml` with the exact content above.
8. Create `NPM_TOKEN` and ensure `GH_PAT` secrets exist in the GitHub repository (Settings → Secrets → Actions).
9. Verify: `bunx nx run-many -t build --output-style=stream` must pass.
10. Do not manually run semantic-release locally; the first release run must happen via CI on the `next` branch.

## Acceptance Criteria

- [ ] `next` branch exists in the remote repository.
- [ ] Branch protection on `next`: require PR, require CI to pass (`typecheck`, `unit-test`, `e2e`), no direct pushes.
- [ ] Branch protection on `main`: require PR from `next` only, require CI to pass, no direct pushes, no force-push.
- [ ] `.github/workflows/release.yml` exists and is valid YAML.
- [ ] The release workflow trigger is `workflow_run` on `"CI"` (not a bare `push` trigger).
- [ ] The `release` job has `if: github.event.workflow_run.conclusion == 'success'`.
- [ ] Pushing a commit that breaks a unit test does **not** trigger a release (verified by inspecting the Actions tab — the release workflow run must not appear or must be skipped).
- [ ] Root `.releaserc.json` exists with seven `@semantic-release/npm` entries (one per publishable package) and no entry for `@cheetah-coder/react-e2e`.
- [ ] The `cheetah-coder` npm organization exists at npmjs.com and the `NPM_TOKEN` owner is a member with publish rights.
- [ ] All seven publishable packages have `publishConfig`, `files: ["dist"]`, `version: "0.0.0"`, and a `repository` field in their `package.json`.
- [ ] `@cheetah-coder/react-e2e` has no release configuration of any kind.
- [ ] No per-package `.releaserc.json` files exist.
- [ ] On push to `next` with at least one `feat` or `fix` commit, the release workflow publishes **all seven packages** at the same pre-release version (e.g. `0.1.0-next.1`) with the `next` dist-tag.
- [ ] On merge of `next` → `main`, the release workflow publishes **all seven packages** at the same stable version (e.g. `0.1.0`) with the `latest` dist-tag.
- [ ] A single root `CHANGELOG.md` is generated and committed by the release bot (no per-package changelogs).
- [ ] GitHub Releases are created for both pre-release and stable release events.
- [ ] Build passes: `bunx nx run-many -t build --output-style=stream` reports no errors.

## Open Questions

- **Version reset**: All `package.json` version fields set to `0.0.0`; git tags drive the actual published version. (Resolved)
- **Lock-step confirmed**: All packages release together at the same version. A commit touching only `@cheetah-coder/js` still causes `@cheetah-coder/react` to publish a new version. This is intentional — it guarantees consumers always receive a coherent set of packages. (Resolved)
- **npm scope vs GitHub org**: `@cheetah-coder` on npmjs.com is independent of `docexp` on GitHub. The `cheetah-coder` npm org must exist. GitHub Packages would have forced the scope to `@docexp`, which is why this spec targets npmjs.com. (Resolved)
