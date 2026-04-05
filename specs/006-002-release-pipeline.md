---
spec: "006"
chunk: "002"
title: "Fix release pipeline: workspace dependency resolution, dist cleanup"
status: "done"
---

# Chunk 002: Fix Release Pipeline

## Scope of This Chunk

Fixes three issues that were causing the release pipeline to fail or produce broken packages:

1. **`workspace:*` not resolved in published packages** — npm does not replace `workspace:*` protocol
   specifiers when publishing via `@semantic-release/npm` with `pkgRoot` in a Bun-managed workspace.
   Fixed by adding a local semantic-release plugin (`scripts/sr-workspace-resolver.mjs`) that replaces
   all `workspace:*` deps with the actual release version during the `prepare` phase.

2. **Test spec files compiled into `dist/`** — `tsconfig.lib.json` for runner packages compiled
   `*.spec.ts` files into `dist/`, polluting published packages. Fixed by adding
   `"exclude": ["src/**/*.spec.ts"]` to all runner and core `tsconfig.lib.json` files.

3. **`tsconfig.lib.tsbuildinfo` inside `dist/`** — TypeScript build-info cache file was included in the
   published tarball. Fixed by moving `tsBuildInfoFile` from `"dist/tsconfig.lib.tsbuildinfo"` to
   `"tsconfig.lib.tsbuildinfo"` (package root, excluded from `files: ["dist"]`).

4. **Husky hooks failing in sandboxed CI** — `pre-push` and `commit-msg` hooks failed because `bunx` was
   not on `PATH`. Fixed by prepending `$HOME/.bun/bin` to `PATH` in both hook scripts.

## Pre-Implementation Checklist
- [x] Parent spec `006-000-release-pipeline.md` has `status: approved`
- [x] `bunx nx run-many -t build --output-style=stream` passes before starting

## Implementation Plan
1. Investigate release failures: `workspace:*` not resolved, test files in dist, tsbuildinfo in dist
2. Create `scripts/sr-workspace-resolver.mjs` local semantic-release plugin
3. Update `.releaserc.json` to use local plugin after all `@semantic-release/npm` entries
4. Update all `tsconfig.lib.json` files: add `exclude` for spec files, move `tsBuildInfoFile` to root
5. Fix husky hooks to prepend `$HOME/.bun/bin` to PATH
6. Rebuild and verify: no spec files in dist, no tsbuildinfo in dist, workspace:* resolver loads

## Files Changed
| File | Change |
|---|---|
| `scripts/sr-workspace-resolver.mjs` | Created — local semantic-release plugin |
| `.releaserc.json` | Added `./scripts/sr-workspace-resolver.mjs` plugin entry |
| `packages/core/tsconfig.lib.json` | Added `exclude` for spec files, moved `tsBuildInfoFile` to root |
| `packages/runners/go/tsconfig.lib.json` | Same |
| `packages/runners/java/tsconfig.lib.json` | Same |
| `packages/runners/js/tsconfig.lib.json` | Same |
| `packages/runners/python/tsconfig.lib.json` | Same |
| `packages/runners/rust/tsconfig.lib.json` | Same |
| `.husky/pre-push` | Prepend `$HOME/.bun/bin` to PATH |
| `.husky/commit-msg` | Prepend `$HOME/.bun/bin` to PATH |

## Post-Implementation Checklist
- [x] `bunx nx run-many -t build --output-style=stream` passes
- [x] No TypeScript errors (`bunx nx run-many -t typecheck --output-style=stream`)
- [x] All tests pass (`bunx nx run-many -t test --output-style=stream`)
- [x] `npm pack packages/runners/js --dry-run` shows no spec files or tsbuildinfo in tarball
- [x] `bunx semantic-release --dry-run` loads `./scripts/sr-workspace-resolver.mjs` plugin successfully
- [x] Chunk status updated to `done`
