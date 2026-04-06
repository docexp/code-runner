---
spec: "010"
chunk: "001"
title: "Shiki r/rw mode — read-only syntax highlighting"
status: "done"
---

# Chunk 001: Shiki r/rw mode — read-only syntax highlighting

## Scope of This Chunk

Full implementation of spec 010 in one chunk — all changes are confined to `packages/adapters/react`
and are interdependent (hook → component → CSS → stories).

## Pre-Implementation Checklist
- [x] Parent spec is `status: approved`
- [x] `bunx nx run-many -t build --output-style=stream` passes before starting
- [x] `bunx nx run-many -t test --output-style=stream` passes before starting

## Implementation Plan
1. Create branch `feat/010-shiki-readonly-mode`
2. Install `shiki` as runtime dep
3. Create `src/lib/useShikiHighlight.ts`
4. Update `RunnerShell.tsx` — add `mode` prop, branch on r/rw
5. Add Shiki CSS overrides to `src/styles.css`
6. Add `ReadOnly` story variant to `RunnerShell.stories.tsx` and `GoRunner.stories.tsx`
7. Export `RunnerShellMode` type from `src/index.ts`
8. Build + typecheck + test

## Files Changed
| File | Change |
|---|---|
| `packages/adapters/react/package.json` | Add `shiki` to dependencies |
| `packages/adapters/react/src/lib/useShikiHighlight.ts` | Created |
| `packages/adapters/react/src/lib/RunnerShell.tsx` | Add `mode` prop, Shiki branch |
| `packages/adapters/react/src/styles.css` | Add `.shiki-wrapper` overrides |
| `packages/adapters/react/src/lib/RunnerShell.stories.tsx` | Add ReadOnly stories |
| `packages/adapters/react/src/lib/GoRunner.stories.tsx` | Add ReadOnly story |
| `packages/adapters/react/src/index.ts` | Export `RunnerShellMode` type |

## Post-Implementation Checklist
- [x] `bunx nx run react:build --output-style=stream` passes and `dist/style.css` exists
- [x] No TypeScript errors
- [x] `bunx nx run react:test --output-style=stream` passes
- [x] `mode` defaults to `'rw'` — existing stories unaffected
- [x] Chunk status updated to `done`
