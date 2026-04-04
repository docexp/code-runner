---
spec: "003"
chunk: "001"
title: "Rename npm scope @code-runner → @cheetah-coder"
status: "done"
---

# Chunk 001: Rename npm scope @code-runner → @cheetah-coder

## Scope of This Chunk

Implements the entirety of spec 003-000 in a single atomic chunk. Because this is a pure identifier rename with no logic change, splitting it across multiple chunks would leave the repo in a broken state between chunks.

Deferred: nothing — the full spec is implemented here.

## Pre-Implementation Checklist
- [x] Parent spec is `status: approved`
- [x] `bunx nx run-many -t build --output-style=stream` passes before starting
- [x] `bunx nx run-many -t test --output-style=stream` passes before starting

## Implementation Plan
1. Create branch `refactor/003-npm-scope-rename`
2. Global find-and-replace `@cheetah-coder/` → `@cheetah-coder/` across all source, config, and doc files
3. Fix `tsconfig.base.json` `customConditions` (uses `@cheetah-coder/source` without trailing slash — caught separately)
4. Update the copilot-instructions and developer agent mode instructions (embedded in VS Code settings — out of repo scope; only repo files touched)
5. `git rm` stub file; `git mv` the two incorrectly-named spec files
6. `bunx nx reset && bun install`
7. Verify build, typecheck, test all pass
8. Commit

## Files Changed
| File | Change |
|---|---|
| `packages/core/package.json` | `name`, export condition key |
| `packages/runners/js/package.json` | `name`, export condition key, dep |
| `packages/runners/python/package.json` | `name`, export condition key, dep |
| `packages/runners/go/package.json` | `name`, export condition key, dep |
| `packages/runners/rust/package.json` | `name`, export condition key, dep |
| `packages/runners/java/package.json` | `name`, export condition key, dep |
| `packages/adapters/react/package.json` | `name`, export condition key, all deps |
| `packages/adapters/react-e2e/package.json` | `name`, dep |
| `tsconfig.base.json` | `customConditions` |
| All `*.ts` / `*.tsx` source files with `@cheetah-coder/` imports | imports updated |
| All `README.md` files | scope references |
| `.github/copilot-instructions.md` | scope references |
| `.github/instructions/packages.instructions.md` | scope references |
| `.github/agents/architect.agent.md` | scope references |
| `.github/agents/developer.agent.md` | scope references |
| `specs/*.md` | scope references |
| `specs/003-000-commit-conventions-hooks.md` | deleted (stub) |
| `specs/004-000-ci.md` | renamed to `specs/005-000-ci.md` |
| `specs/005-000-release-pipeline.md` | renamed to `specs/006-000-release-pipeline.md` |

## Post-Implementation Checklist
- [x] `bunx nx run-many -t build --output-style=stream` passes
- [x] `bunx nx run-many -t typecheck --output-style=stream` passes
- [x] `bunx nx run-many -t test --output-style=stream` passes
- [x] `grep -r "@code-runner/" packages/ --include="*.ts" --include="*.tsx"` → zero results
- [x] `grep -rn '"@code-runner/' packages/ --include="*.json"` → zero results
- [x] Chunk status updated to `done`
