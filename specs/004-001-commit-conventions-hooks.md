---
spec: "004"
chunk: "001"
title: "Add commitlint + Husky git hooks"
status: "done"
---

# Chunk 001: Add commitlint + Husky git hooks

## Scope of This Chunk

Implements the entirety of spec 004-000 in a single chunk: installs commitlint with the Angular conventional preset, adds Husky v9 with a `commit-msg` hook and a `pre-push` hook.

## Pre-Implementation Checklist
- [x] Parent spec is `status: approved`
- [x] `bunx nx run-many -t build --output-style=stream` passes before starting
- [x] `bunx nx run-many -t test --output-style=stream` passes before starting

## Implementation Plan
1. Create branch `feat/004-commit-hooks`
2. Add `husky`, `@commitlint/cli`, `@commitlint/config-conventional` to root `devDependencies`
3. Add `"prepare": "husky"` to root `scripts`
4. Run `bun install` → creates `.husky/`
5. Create `commitlint.config.cjs` (root has no `"type": "module"`)
6. Create `.husky/commit-msg`
7. Create `.husky/pre-push`
8. Verify build passes
9. Smoke-test hooks
10. Commit + push

## Files Changed
| File | Change |
|---|---|
| `package.json` | Added 3 devDependencies + `prepare` script |
| `commitlint.config.cjs` | Created |
| `.husky/commit-msg` | Created |
| `.husky/pre-push` | Created |

## Post-Implementation Checklist
- [x] `bun install` completes without errors and `.husky/` directory exists
- [x] Bad commit message is rejected
- [x] Good commit message is accepted
- [x] `bunx nx run-many -t build --output-style=stream` passes
- [x] Chunk status updated to `done`
