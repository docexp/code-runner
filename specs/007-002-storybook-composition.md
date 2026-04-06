---
spec: "007"
chunk: "002"
title: "React child .storybook config + initial component stories"
status: "done"
---

# Chunk 002: React child .storybook config + initial component stories

## Scope of This Chunk
Add `.storybook/main.ts` + `preview.ts` to `packages/adapters/react`, create a `project.json` port override (6007), and add initial stories for all exported visual components.

## Pre-Implementation Checklist
- [x] Parent spec is `status: approved`
- [x] `bunx nx run-many -t build --output-style=stream` passes before starting

## Implementation Plan
1. Create `packages/adapters/react/.storybook/main.ts`
2. Create `packages/adapters/react/.storybook/preview.ts`
3. Create `packages/adapters/react/project.json` (port 6007)
4. Create stories: `RunnerShell`, `JsRunner`, `PythonRunner`, `GoRunner`, `RustRunner`, `JavaRunner`, `CodeRunner`

## Files Changed
| File | Change |
|---|---|
| `packages/adapters/react/.storybook/main.ts` | Created |
| `packages/adapters/react/.storybook/preview.ts` | Created |
| `packages/adapters/react/project.json` | Created (port 6007 override) |
| `packages/adapters/react/src/lib/RunnerShell.stories.tsx` | Created |
| `packages/adapters/react/src/lib/JsRunner.stories.tsx` | Created |
| `packages/adapters/react/src/lib/PythonRunner.stories.tsx` | Created |
| `packages/adapters/react/src/lib/GoRunner.stories.tsx` | Created |
| `packages/adapters/react/src/lib/RustRunner.stories.tsx` | Created |
| `packages/adapters/react/src/lib/JavaRunner.stories.tsx` | Created |
| `packages/adapters/react/src/lib/CodeRunner.stories.tsx` | Created |

## Post-Implementation Checklist
- [x] `bunx nx run-many -t build --output-style=stream` passes
- [x] `bunx nx show project react` lists `storybook` and `build-storybook` targets
- [x] No TypeScript errors
- [x] Chunk status updated to `done`
