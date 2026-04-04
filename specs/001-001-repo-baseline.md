---
spec: "001"
chunk: "001"
title: "Rename runner packages and update all references"
status: "done"
---

# Chunk 001: Rename runner packages and update all references

## Scope of This Chunk
Move the five runner package folders from `packages/runner-{lang}` to `packages/{lang}`, update all `package.json` files (names, nx.name, private flags, root name), update all TypeScript project references, update all source imports in the React layer, and delete the two dead generated files.

Deferred: agent/instruction file updates, Vitest, Playwright, READMEs.

## Pre-Implementation Checklist
- [x] Parent spec is `status: approved`
- [x] `bunx nx run-many -t build --output-style=stream` passes before starting

## Implementation Plan
1. `mv` each `packages/runner-{lang}` to `packages/{lang}`
2. Update `package.json` in each moved package (name, nx.name, remove private)
3. Update `packages/core/package.json` (remove private)
4. Update `packages/react/package.json` (dependency names)
5. Update root `package.json` (name → code-runner, ensure private: true)
6. Update root `tsconfig.json` references
7. Update `packages/react/tsconfig.lib.json` references
8. Update the five `*Runner.tsx` source imports
9. Delete `react.tsx` and `react.module.css`
10. Run `bun install`
11. Verify build passes

## Files Changed
| File | Change |
|---|---|
| `packages/js/` | Moved from `packages/runner-js/` |
| `packages/python/` | Moved from `packages/runner-python/` |
| `packages/go/` | Moved from `packages/runner-go/` |
| `packages/rust/` | Moved from `packages/runner-rust/` |
| `packages/java/` | Moved from `packages/runner-java/` |
| `packages/js/package.json` | name → `@cheetah-coder/js`; nx.name → `js`; removed `private` |
| `packages/python/package.json` | name → `@cheetah-coder/python`; nx.name → `python`; removed `private` |
| `packages/go/package.json` | name → `@cheetah-coder/go`; nx.name → `go`; removed `private` |
| `packages/rust/package.json` | name → `@cheetah-coder/rust`; nx.name → `rust`; removed `private` |
| `packages/java/package.json` | name → `@cheetah-coder/java`; nx.name → `java`; removed `private` |
| `packages/core/package.json` | removed `private` |
| `packages/react/package.json` | dependencies renamed to `@cheetah-coder/{lang}` |
| `package.json` | name → `code-runner` |
| `tsconfig.json` | references updated to new folder paths |
| `packages/react/tsconfig.lib.json` | references updated to new folder paths |
| `packages/react/src/lib/JsRunner.tsx` | import `@cheetah-coder/js` |
| `packages/react/src/lib/PythonRunner.tsx` | import `@cheetah-coder/python` |
| `packages/react/src/lib/GoRunner.tsx` | import `@cheetah-coder/go` |
| `packages/react/src/lib/RustRunner.tsx` | import `@cheetah-coder/rust` |
| `packages/react/src/lib/JavaRunner.tsx` | import `@cheetah-coder/java` |
| `packages/react/src/lib/react.tsx` | Deleted |
| `packages/react/src/lib/react.module.css` | Deleted |

## Post-Implementation Checklist
- [ ] `bunx nx run-many -t build --output-style=stream` passes
- [ ] `bunx nx run-many -t typecheck --output-style=stream` passes
- [ ] Acceptance criteria from parent spec satisfied for this chunk
- [ ] Chunk status updated to `done`
