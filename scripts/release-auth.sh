#!/usr/bin/env bash
# Write a repo-local .npmrc with the npm auth token so that `bun publish`
# can authenticate with the registry.
#
# Why not rely on NPM_CONFIG_USERCONFIG?
#   actions/setup-node writes the token to a temp file and exports
#   NPM_CONFIG_USERCONFIG pointing to it. npm respects that variable but
#   bun does not — bun only reads ~/.npmrc and project-local .npmrc files.
#   Writing the token to a repo-root .npmrc is the minimal, safe fix:
#   the file is gitignored and only exists for the duration of the CI run.
#
# Usage (sourced or called before bun publish):
#   scripts/release-auth.sh
#
# Requires: NODE_AUTH_TOKEN or NPM_CONFIG_USERCONFIG env var
#           (both set by actions/setup-node in the workflow)

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
NPMRC="${REPO_ROOT}/.npmrc"

if [[ -n "${NODE_AUTH_TOKEN:-}" ]]; then
  echo "//registry.npmjs.org/:_authToken=${NODE_AUTH_TOKEN}" > "${NPMRC}"
  echo "✓ Wrote auth token to .npmrc (repo-local)"
elif [[ -n "${NPM_CONFIG_USERCONFIG:-}" && -f "${NPM_CONFIG_USERCONFIG}" ]]; then
  cp "${NPM_CONFIG_USERCONFIG}" "${NPMRC}"
  echo "✓ Copied ${NPM_CONFIG_USERCONFIG} to .npmrc (repo-local)"
else
  echo "ERROR: No npm auth token found. Set NODE_AUTH_TOKEN or NPM_CONFIG_USERCONFIG." >&2
  exit 1
fi
