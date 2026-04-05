#!/usr/bin/env bash
# Publish all packages to the npm registry using `npm publish`.
#
# Why npm publish instead of bun publish?
#   bun publish ignores the .npmrc auth token in CI (falls back to interactive
#   web auth). npm respects NPM_CONFIG_USERCONFIG set by actions/setup-node,
#   and also reads a project-local .npmrc written by release-auth.sh.
#
# workspace:* protocol
#   npm does not understand bun's "workspace:*" protocol. Before publishing
#   each package this script temporarily rewrites every "workspace:*" dep to
#   the concrete version that was just bumped, then restores the original
#   package.json so the source tree stays clean.
#
# Provenance attestation is enabled via NPM_CONFIG_PROVENANCE=true set in
# the workflow environment.
#
# Usage (called by @semantic-release/exec publishCmd):
#   scripts/release-publish.sh
#
# Requires: NODE_AUTH_TOKEN or NPM_CONFIG_USERCONFIG env var
#           (set by actions/setup-node in the workflow)

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

# Write a repo-local .npmrc as a belt-and-suspenders auth fallback.
"${SCRIPT_DIR}/release-auth.sh"

# Derive publish order automatically from the workspace dependency graph.
# Packages are emitted in topological order (dependencies before dependents)
# so consumers on npm always see their deps already available.
while IFS= read -r pkg; do
  if [[ ! -f "$pkg/package.json" ]]; then
    continue
  fi

  echo "Publishing $pkg…"

  PKGJSON="$pkg/package.json"
  VERSION="$(jq -r '.version' "$PKGJSON")"
  ORIGINAL="$(cat "$PKGJSON")"

  # Temporarily rewrite workspace:* → concrete version so npm produces a
  # valid package.json for consumers (bun used to do this automatically).
  jq --arg v "$VERSION" '
    def rw($v): with_entries(if .value == "workspace:*" then .value = $v else . end);
    if .dependencies     then .dependencies     |= rw($v) else . end |
    if .peerDependencies then .peerDependencies |= rw($v) else . end |
    if .devDependencies  then .devDependencies  |= rw($v) else . end
  ' "$PKGJSON" > "$PKGJSON.tmp" && mv "$PKGJSON.tmp" "$PKGJSON"

  (cd "$pkg" && npm publish --access public --tag next)

  # Restore source package.json (workspace:* belongs in the monorepo source)
  printf '%s' "$ORIGINAL" > "$PKGJSON"

  echo "✓ Published $pkg"
done < <(node "${SCRIPT_DIR}/release-order.js")
