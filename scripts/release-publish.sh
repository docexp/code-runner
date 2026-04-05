#!/usr/bin/env bash
# Publish all packages to the npm registry using `bun publish`.
#
# Why bun publish instead of @semantic-release/npm?
#   @semantic-release/npm delegates to `npm publish` which does not
#   understand the "workspace:*" protocol used in cross-package deps.
#   `bun publish` natively rewrites every "workspace:*" reference to the
#   concrete version of the referenced package before uploading the tarball,
#   so consumers see real semver ranges in the published package.json.
#
# Why --no-git-checks?
#   semantic-release has already verified the git state and bumped versions
#   in the prepare phase. The working tree is intentionally dirty at this
#   point; skipping bun's git cleanliness guard avoids a false-positive error.
#
# Provenance attestation is enabled via NPM_CONFIG_PROVENANCE=true set in
# the workflow environment, which bun forwards to the npm registry call.
#
# Usage (called by @semantic-release/exec publishCmd):
#   scripts/release-publish.sh
#
# Requires: bun (installed by oven-sh/setup-bun in the workflow)
#           NODE_AUTH_TOKEN env var (set by actions/setup-node via .npmrc)

set -euo pipefail

# Bun reads auth from a project-local .npmrc (or ~/.npmrc).
# actions/setup-node writes the token to a temp file pointed to by
# NPM_CONFIG_USERCONFIG, which npm respects but bun ignores.
# We therefore write a repo-root .npmrc so bun can authenticate.
# This file is gitignored and scoped to this run only.
REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
NPMRC="${REPO_ROOT}/.npmrc"

if [[ -n "${NODE_AUTH_TOKEN:-}" ]]; then
  echo "//registry.npmjs.org/:_authToken=${NODE_AUTH_TOKEN}" > "${NPMRC}"
  echo "Wrote auth token to .npmrc (repo-local)"
elif [[ -n "${NPM_CONFIG_USERCONFIG:-}" && -f "${NPM_CONFIG_USERCONFIG}" ]]; then
  cp "${NPM_CONFIG_USERCONFIG}" "${NPMRC}"
  echo "Copied ${NPM_CONFIG_USERCONFIG} to .npmrc (repo-local)"
else
  echo "WARNING: No npm auth token found (NODE_AUTH_TOKEN / NPM_CONFIG_USERCONFIG)" >&2
fi

# Ordered so that dependencies are published before dependents.
# core must come first because all runners depend on it;
# react must come last because it depends on all runners.
PACKAGES=(
  packages/core
  packages/runners/js
  packages/runners/python
  packages/runners/go
  packages/runners/rust
  packages/runners/java
  packages/adapters/react
)

for pkg in "${PACKAGES[@]}"; do
  if [[ -f "$pkg/package.json" ]]; then
    echo "Publishing $pkg…"
    # --no-git-checks: skip dirty-tree guard (versions were just bumped)
    (cd "$pkg" && bun publish --no-git-checks)
    echo "✓ Published $pkg"
  fi
done
