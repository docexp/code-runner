---
spec: "006"
chunk: "002"
title: "Release pipeline: post-implementation record of all deviations and fixes"
status: "done"
---

# Chunk 002: Release pipeline — deviations, fixes, and final state

## Scope of This Chunk

This is a **post-implementation record**, not a forward-looking implementation plan. It documents:

1. Every part of the architect's spec (006-000) that did **not** work as designed
2. Every fix applied during the stabilisation phase, in chronological order
3. The manual npmjs.com setup that was required before automated publishing could succeed
4. The final, verified state of all files that differ from the spec's design

No new source code was written in this chunk. All changes were already committed as part of the stabilisation run. This document exists so future developers understand *why* the implementation diverged from the spec and can reproduce the setup from scratch.

---

## What the Spec Got Right

- `workflow_run` trigger + `conclusion == 'success'` guard — works exactly as designed
- `ref: github.event.workflow_run.head_sha` checkout pinning — works exactly as designed
- `semantic-release` v24 with `@semantic-release/commit-analyzer`, release-notes-generator, changelog, git, github plugins — all work
- `tagFormat: "v${version}"` single lock-step tag — works exactly as designed
- `id-token: write` permission for provenance — required and correct
- `@cheetah-coder/react-e2e` correctly excluded from all publishing
- `publishConfig: { "access": "public" }` in all publishable packages — required and correct
- `commitlint.config.cjs` ignores rule for `chore(release):` commits — required and correct
- `.gitignore` entries for `.npmrc` and `.secrets` — correct

---

## Deviations from the Spec

### 1. `@semantic-release/npm` replaced by `@semantic-release/exec` + custom shell scripts

**Spec design:** Use multiple `@semantic-release/npm` entries, one per package, each pointing to a pre-built `dist/` directory.

**What broke:** `@semantic-release/npm` calls `npm version` internally to write the version into `package.json`. npm does not understand the `"workspace:*"` protocol used by bun workspaces. Every publish attempt failed with `EUNSUPPORTEDPROTOCOL`.

**Fix applied (commit `2629804`):** Replaced all seven `@semantic-release/npm` entries with a single `@semantic-release/exec` entry:

```json
["@semantic-release/exec", {
  "prepareCmd": "scripts/release-version.sh ${nextRelease.version}",
  "publishCmd": "scripts/release-publish.sh"
}]
```

Three shell scripts were created under `scripts/`:

| Script | Purpose |
|---|---|
| `scripts/release-version.sh` | Bumps the `"version"` field in every publishable `package.json` via `jq`. |
| `scripts/release-publish.sh` | Publishes each package in topological order; calls `release-auth.sh` first. |
| `scripts/release-auth.sh` | Writes a repo-local `.npmrc` if `NODE_AUTH_TOKEN` is present; otherwise removes it (OIDC mode). |
| `scripts/release-order.js` | Reads workspace `package.json` files, builds a dependency graph from `"workspace:*"` entries, and emits paths in topological order (Kahn's algorithm). Added in `9070c0f` to replace hardcoded package arrays. |

The `@semantic-release/git` `assets` list was also extended to include all seven `package.json` files so that the version-bump changes are committed back to the branch alongside `CHANGELOG.md`.

**Important:** Because `@semantic-release/npm` is no longer used, `NPM_TOKEN` / `NODE_AUTH_TOKEN` is **never** read by a semantic-release plugin. Auth is handled entirely inside `release-auth.sh` via a repo-local `.npmrc`.

---

### 2. `bun publish` replaced by `npm publish` with `workspace:*` rewrite

**Spec design:** Publishing would be done by `@semantic-release/npm` using `npm`. The replacement scripts initially used `bun publish`.

**What broke:** `bun publish` in CI falls back to interactive web-browser authentication when it cannot find credentials. The `.npmrc` written by `release-auth.sh` was not found because bun only looks in `~/.npmrc` and project-level `.npmrc`, and there was a path precedence issue.

**Fix applied (commit `340439f`):** `release-publish.sh` was rewritten to use `npm publish` instead of `bun publish`. Because `npm` does not understand `"workspace:*"` either (only bun does), the script performs a **temporary rewrite** of every `workspace:*` dependency reference to the concrete version before calling `npm publish`, then restores the original `package.json` afterwards:

```bash
jq --arg v "$VERSION" '
  def rw($v): with_entries(if .value == "workspace:*" then .value = $v else . end);
  if .dependencies     then .dependencies     |= rw($v) else . end |
  if .peerDependencies then .peerDependencies |= rw($v) else . end |
  if .devDependencies  then .devDependencies  |= rw($v) else . end
' "$PKGJSON" > "$PKGJSON.tmp" && mv "$PKGJSON.tmp" "$PKGJSON"

(cd "$pkg" && "$NPM_BIN" publish --access public --tag next)

printf '%s' "$ORIGINAL" > "$PKGJSON"
```

---

### 3. `actions/setup-node` `registry-url` removed

**Spec design:** Include `registry-url: https://registry.npmjs.org` in the `actions/setup-node@v4` step.

**What broke:** When `registry-url` is set, `actions/setup-node` writes a global `.npmrc` with `_authToken=""` (an empty placeholder). This placeholder overwrites the empty OIDC auth path and causes `E404` or `ENEEDAUTH` errors. Any tool that reads `.npmrc` before OIDC authentication completes is then rejected by the registry.

**Fix applied (commit `4f7e754`):**

```yaml
# Before (spec design):
- uses: actions/setup-node@v4
  with:
    node-version: 22
    registry-url: https://registry.npmjs.org

# After (final state):
- uses: actions/setup-node@v4
  with:
    node-version: 22
```

**Consequence:** `NODE_AUTH_TOKEN` is never set by the workflow. `NPM_TOKEN` / `NODE_AUTH_TOKEN` GitHub Secrets are not needed. `release-auth.sh` detects their absence and removes any `.npmrc`, falling through to OIDC.

---

### 4. npm OIDC Trusted Publishing requires npm ≥ 11.5.1 — toolcache npm is broken

**Spec design:** The spec mentioned `id-token: write` for provenance but did not address the npm version requirement for OIDC Trusted Publishing.

**What broke:** The GitHub Actions `ubuntu-latest` runner ships Node 22 but provides npm 10.9.x in its toolcache. npm OIDC Trusted Publishing (tokenless publishing via GitHub's OIDC identity) requires **npm ≥ 11.5.1**. Additionally, the toolcache npm 10 installation is broken — it is missing the `promise-retry` module, so `npm install -g npm@latest` fails with `MODULE_NOT_FOUND`.

**npm upgrade attempts that failed:**

| Attempt | Commit | Method | Why it failed |
|---|---|---|---|
| 1 | `97256e0` | `npm install -g npm@latest` | Toolcache npm 10 is missing `promise-retry`; self-upgrade crashes |
| 2 | `015bfaf` | npm `install.sh` script | Installs to `~/npm/bin` but toolcache PATH wins; `npm` still resolves to v10 |
| 3 | `3d51a9c` | Extract tarball to `/tmp`, prepend to `$GITHUB_PATH` | `$GITHUB_PATH` entries are appended to the END of PATH; toolcache still wins |
| 4 | `9a73cf8` | Install to toolcache bin path | Node toolcache bin symlinks still pointed to old `lib/node_modules/npm` |
| 5 | `ed25245` | `NPM` env var pointing to `/tmp/npm11/bin/npm` | Binary failed with wrong module path resolution |
| 6 | `dcf57b2` | Replace toolcache `lib/node_modules/npm` via tarball extraction | Correct approach BUT partial overwrite left stale npm 10 files → `Class extends value undefined` error |

**Fix that worked (commits `dcf57b2` + `75990a6`):**

```yaml
- name: Upgrade npm for OIDC Trusted Publishing support
  run: |
    NPM_DIR=$(dirname $(dirname $(which node)))/lib/node_modules/npm
    # Delete all npm 10 files first — partial overwrites leave stale files
    # that cause "Class extends value undefined" errors when npm 11 loads.
    rm -rf "${NPM_DIR:?}"
    mkdir -p "$NPM_DIR"
    curl -sL https://registry.npmjs.org/npm/-/npm-11.12.1.tgz | tar xz -C "$NPM_DIR" --strip-components=1
    npm --version
```

This replaces the npm 10 directory in-place. The existing `npm` symlink at `.../bin/npm` continues to resolve correctly because it points into `lib/node_modules/npm/bin/npm-cli.js` — the same relative path used by npm 11.

**Key insight:** The upgrade step must run **before** `oven-sh/setup-bun@v2`. Once bun is set up, it prepends `~/.bun/bin` to PATH. Bun ships its own `npm` shim binary at `~/.bun/bin/npm` (bun-compatible npm shim that reports npm 10.9.8). Any `npm` invocations after bun setup resolve to this shim via PATH precedence — bypassing the upgraded toolcache npm entirely.

---

### 5. `release-publish.sh` must reference npm via `$(which node)` — not bare `npm`

**What broke:** Even after the toolcache upgrade worked, `release-publish.sh` still called the bare `npm` command. After `oven-sh/setup-bun@v2` ran, `PATH` had `~/.bun/bin` prepended, so `npm` resolved to bun's shim (npm 10.9.8). The OIDC Trusted Publishing call inside `npm publish` then failed with `ENEEDAUTH` because bun's npm shim does not have npm 11's OIDC implementation.

**Fix applied (commit `3553a21`):** In `release-publish.sh`, resolve the npm binary via the node binary's directory:

```bash
# bun does not ship a 'node' shim, so $(which node) always resolves
# to the Node toolcache whose bin/ holds the upgraded npm 11.
NPM_BIN="$(dirname "$(which node)")/npm"
```

Then use `"$NPM_BIN"` explicitly instead of bare `npm` everywhere in the script.

---

### 6. npmjs.com Trusted Publisher must be configured for every package before the first OIDC publish

**Spec design:** The spec mentioned `NPM_TOKEN` as the auth mechanism. The OIDC Trusted Publishing approach (which eliminates the need for stored long-lived tokens) was not part of the original spec.

**What this required (manual one-time setup):**

1. **Bootstrap publish**: Before OIDC can be configured, each package must already exist on npm. All 7 packages were bootstrapped manually at `1.0.0-next.2` using a local npm publish with a granular bypass-2FA token (stored in `.npmrc` locally, never committed).

2. **npm Trusted Publisher configuration**: For each package on npmjs.com, navigate to:
   `https://www.npmjs.com/package/@cheetah-coder/<pkg>` → **Settings** → **Automated Publishing (Trusted Publisher)** → **Add Publisher**

   Provider: **GitHub Actions**
   Repository owner: `docexp`
   Repository name: `code-runner`
   Workflow filename: `release.yml`

   This must be done for all seven packages:
   - `@cheetah-coder/core`
   - `@cheetah-coder/go`
   - `@cheetah-coder/java`
   - `@cheetah-coder/js`
   - `@cheetah-coder/python`
   - `@cheetah-coder/rust`
   - `@cheetah-coder/react`

3. **No npm Granularity Token in CI**: Once Trusted Publisher is configured, `NPM_TOKEN` / `NODE_AUTH_TOKEN` are **not** set in GitHub Actions secrets. The workflow has no `NODE_AUTH_TOKEN` env var. npm 11 exchanges the GitHub OIDC JWT (`id-token: write`) for a short-lived npm publish token automatically at publish time.

**Authentication flow (OIDC):**
```
GitHub runner (id-token: write)
  → OIDC provider issues JWT for docexp/code-runner/release.yml
  → npm 11 exchanges JWT at registry.npmjs.org/oidc/token
  → receives a short-lived bearer token valid for the publish
  → npm publish proceeds without any stored secret
```

---

### 7. Uncommitted version-bump loop

**What broke:** Each failed `semantic-release` run successfully executes the `prepare` phase (writing `chore(release): vX.Y.Z [skip ci]` tags and bumping `package.json` versions) before crashing at `publish`. This means every failed run increments the tag counter (`v1.0.0-next.3`, `next.4`, …, `next.12`) while nothing gets published.

There is no clean way to undo semantic-release tags without manual git history rewriting. The published version on npm stayed at `1.0.0-next.2` while the git tags advanced to `v1.0.0-next.12` before the pipeline stabilised.

**Impact:** No consumer-visible impact, but the version counter jumped from `next.2` directly to `next.13` for the first fully successful automated publish. Future releases will continue normally from there.

---

### 8. commitlint blocked the `chore(release):` commit body

**Spec design:** The `@semantic-release/git` `message` field in the spec included `${nextRelease.notes}` in the commit body (which embeds the full changelog). This exceeded commitlint's 100-character line limit for commit bodies.

**Fix applied (commit `b8a76a0`):**

- Stripped `${nextRelease.notes}` from the git plugin `message`. Changelog content now lives only in `CHANGELOG.md` and the GitHub Release page.
- Added a commitlint `ignores` function to skip all `chore(release): …[skip ci]` commits:

```javascript
// commitlint.config.cjs
ignores: [(commit) => /^chore\(release\):.*\[skip ci\]/.test(commit)],
```

---

### 9. `workflow_dispatch` trigger added for manual release testing

**Spec design:** Trigger only on `workflow_run`. No manual dispatch.

**What was added (commit `2629804`):** A `workflow_dispatch` trigger was added to `.github/workflows/release.yml` for local testing with `act` and for one-off manual re-runs:

```yaml
on:
  workflow_run:
    workflows: ["CI"]
    branches: [next, main]
    types: [completed]
  workflow_dispatch:   # ← added
```

The job `if` condition was updated accordingly:

```yaml
if: github.event.workflow_run.conclusion == 'success' || github.event_name == 'workflow_dispatch'
```

---

## Final File State

### `.github/workflows/release.yml`

Key differences from spec design:

| Field | Spec | Final |
|---|---|---|
| `actions/setup-node` `registry-url` | `https://registry.npmjs.org` | **Removed** |
| npm upgrade step | Not present | **Added** — replaces toolcache npm 10 with npm 11.12.1 |
| `setup-bun` step ordering | After `setup-node` | After npm upgrade step (order matters for PATH) |
| `NPM_TOKEN` / `NODE_AUTH_TOKEN` env | Present | **Removed** — OIDC only |
| `workflow_dispatch` trigger | Not present | **Added** |

### `.releaserc.json`

Key differences from spec design:

| Field | Spec | Final |
|---|---|---|
| Publish plugins | 7× `@semantic-release/npm` entries | Single `@semantic-release/exec` entry |
| `@semantic-release/git` assets | `["CHANGELOG.md"]` | `["CHANGELOG.md", …7 package.json paths]` |
| `@semantic-release/git` message | Included `${nextRelease.notes}` in body | Body stripped; subject only |

### New files (not in spec)

| File | Purpose |
|---|---|
| `scripts/release-version.sh` | Bumps `"version"` in all `package.json` files via `jq` |
| `scripts/release-publish.sh` | Publishes all packages via toolcache npm 11; rewrites `workspace:*` deps temporarily |
| `scripts/release-auth.sh` | Writes repo-local `.npmrc` if `NODE_AUTH_TOKEN` present; otherwise removes it (OIDC mode) |
| `scripts/release-order.js` | Emits publishable package paths in topological order via Kahn's algorithm |
| `.actrc` | `act` flags: `--container-architecture linux/amd64`, `--secret-file .secrets` |

---

## Acceptance Criteria Status

| Criterion | Status | Notes |
|---|---|---|
| `.github/workflows/release.yml` exists and valid | ✅ | |
| `workflow_run` on `"CI"` trigger | ✅ | Also has `workflow_dispatch` |
| `conclusion == 'success'` guard | ✅ | |
| Failing tests do not trigger release | ✅ | Structural via `workflow_run` |
| Root `.releaserc.json` exists | ✅ | Uses `@semantic-release/exec` not `@semantic-release/npm` |
| 7 publishable packages covered | ✅ | Via `release-order.js` topological sort |
| `react-e2e` never published | ✅ | |
| All packages have `publishConfig`, `files`, `repository` | ✅ | |
| OIDC Trusted Publisher configured on npmjs.com | ✅ | All 7 packages — `docexp/code-runner/release.yml` |
| No stored `NPM_TOKEN` in CI secrets needed | ✅ | |
| Pre-release publish (`next` dist-tag) working | ✅ | First successful run: `v1.0.0-next.13` at `2026-04-05T20:44` |
| Provenance attestation | ✅ | `npm notice publish Signed provenance statement` confirmed in CI logs |
| CHANGELOG generated and committed | ✅ | |
| GitHub Releases created | ✅ | |
| Single version for all 7 packages | ✅ | |
| Build passes | ✅ | `bunx nx run-many -t build` green |
| All tests pass | ✅ | `bunx nx run-many -t test` green |

---

## Post-Implementation Checklist

- [x] `bunx nx run-many -t build --output-style=stream` passes
- [x] `bunx nx run-many -t typecheck --output-style=stream` passes
- [x] `bunx nx run-many -t test --output-style=stream` passes
- [x] Release workflow run `24010078225` completed successfully with all 7 packages published
- [x] All packages carry a signed provenance statement
- [x] Chunk status updated to `done`
