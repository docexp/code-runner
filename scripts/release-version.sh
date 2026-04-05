#!/usr/bin/env bash
# Bump the "version" field in every publishable package.json to the new
# release version determined by semantic-release.
#
# Why this script instead of @semantic-release/npm?
#   @semantic-release/npm uses `npm version` internally. npm does not
#   understand the bun/pnpm "workspace:*" protocol and fails with
#   EUNSUPPORTEDPROTOCOL. We therefore bypass npm entirely and use
#   `bun publish` (see release-publish.sh) which natively rewrites
#   "workspace:*" to the resolved peer version at publish time.
#   This script only needs to set the version field; cross-package refs
#   are left as "workspace:*" and bun handles them during publish.
#
# Usage (called by @semantic-release/exec prepareCmd):
#   scripts/release-version.sh <new-version>
#
# Requires: jq (available on GitHub-hosted ubuntu runners and act containers)

set -euo pipefail

VERSION="${1:?version argument required}"

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
  file="$pkg/package.json"
  if [[ -f "$file" ]]; then
    # jq writes to a temp file then replaces atomically to avoid truncation
    jq --arg v "$VERSION" '.version = $v' "$file" > "$file.tmp"
    mv "$file.tmp" "$file"
    echo "✓ $file  version → $VERSION"
  fi
done
