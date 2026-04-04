---
spec: "001"
chunk: "003"
title: "Vitest scaffold and unit tests for all packages"
status: "done"
---

# Chunk 003: Vitest scaffold and unit tests for all packages

## Scope of This Chunk
Add `vitest.config.ts` to every tsc-based package (`core`, `js`, `python`, `go`, `rust`, `java`),
add a `test` block to `packages/react/vite.config.mts`, and write all unit test files per
the Testing table in the parent spec.

## Pre-Implementation Checklist
- [x] Parent spec is `status: approved`
- [x] `bunx nx run-many -t build --output-style=stream` passes before starting
- [x] `bunx nx run-many -t test --output-style=stream` passes before starting (no tests yet)

## Implementation Plan
1. Add `vitest.config.ts` to `core`, `js`, `python`, `go`, `rust`, `java`
2. Add `test` block to `packages/react/vite.config.mts`
3. Add `tsconfig.spec.json` to each tsc package so spec files are type-checked
4. Write `core.spec.ts`
5. Write `runner-js.spec.ts`
6. Write `runner-python.spec.ts`
7. Write `runner-go.spec.ts`
8. Write `runner-rust.spec.ts`
9. Write `runner-java.spec.ts`
10. Write `useRunner.spec.ts` and `RunnerShell.spec.tsx` for react

## Files Changed
| File | Change |
|---|---|
| `packages/core/vitest.config.ts` | Created |
| `packages/js/vitest.config.ts` | Created |
| `packages/python/vitest.config.ts` | Created |
| `packages/go/vitest.config.ts` | Created |
| `packages/rust/vitest.config.ts` | Created |
| `packages/java/vitest.config.ts` | Created |
| `packages/react/vite.config.mts` | Added `test` block |
| `packages/core/src/lib/core.spec.ts` | Created |
| `packages/js/src/lib/runner-js.spec.ts` | Created |
| `packages/python/src/lib/runner-python.spec.ts` | Created |
| `packages/go/src/lib/runner-go.spec.ts` | Created |
| `packages/rust/src/lib/runner-rust.spec.ts` | Created |
| `packages/java/src/lib/runner-java.spec.ts` | Created |
| `packages/react/src/lib/useRunner.spec.ts` | Created |
| `packages/react/src/lib/RunnerShell.spec.tsx` | Created |

## Post-Implementation Checklist
- [x] `bunx nx run-many -t build --output-style=stream` passes
- [x] `bunx nx run-many -t typecheck --output-style=stream` passes
- [x] `bunx nx run-many -t test --output-style=stream` passes
- [x] Chunk status updated to `done`
