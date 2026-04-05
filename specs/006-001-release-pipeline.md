---
spec: "006"
chunk: "001"
title: "Semantic Release pipeline: devDeps, package metadata, .releaserc.json, workflow"
status: "done"
---

# Chunk 001: Semantic Release pipeline

## Scope of This Chunk

Implements the complete spec 006 in one atomic chunk:
- Add `semantic-release` and all plugins to root `devDependencies`
- Add `publishConfig`, `files`, `version: "0.0.0"`, and `repository` to all 7 publishable `package.json` files
- Create root `.releaserc.json`
- Create `.github/workflows/release.yml`

Not in scope: branch protection rules (GitHub UI), npm org creation, first live publish.

## Pre-Implementation Checklist
- [x] Parent spec `006-000-release-pipeline.md` has `status: approved`
- [x] `bunx nx run-many -t build --output-style=stream` passes before starting

## Implementation Plan
1. Create `feat/006-release-pipeline` branch
2. Add semantic-release devDependencies to root `package.json`
3. Update 7 publishable `package.json` files with `publishConfig`, `files`, `version`, `repository`
4. Create `.releaserc.json` at repo root
5. Create `.github/workflows/release.yml`
6. Run `bun install` then verify `bunx nx run-many -t build --output-style=stream` passes

## Files Changed
| File | Change |
|---|---|
| `package.json` | Added 7 semantic-release devDependencies |
| `packages/core/package.json` | Added publishConfig, files, version, repository |
| `packages/runners/js/package.json` | Added publishConfig, files, version, repository |
| `packages/runners/python/package.json` | Added publishConfig, files, version, repository |
| `packages/runners/go/package.json` | Added publishConfig, files, version, repository |
| `packages/runners/rust/package.json` | Added publishConfig, files, version, repository |
| `packages/runners/java/package.json` | Added publishConfig, files, version, repository |
| `packages/adapters/react/package.json` | Added publishConfig, files, version, repository |
| `.releaserc.json` | Created |
| `.github/workflows/release.yml` | Created |

## Post-Implementation Checklist
- [x] `bunx nx run-many -t build --output-style=stream` passes
- [x] No TypeScript errors (`bunx nx run-many -t typecheck --output-style=stream`)
- [x] Chunk status updated to `done`
