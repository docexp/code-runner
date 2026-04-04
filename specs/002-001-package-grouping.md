---
spec: "002"
chunk: "001"
title: "Move packages to runners/ and adapters/ groups; update all configs and agent files"
status: "done"
---

# Chunk 001: Move packages to runners/ and adapters/ groups

## Scope of This Chunk
Implements the full spec 002: moves all five runner packages under `packages/runners/`, moves `react` and `react-e2e` under `packages/adapters/`, and updates every config, agent, and instruction file to reflect the new paths. Also updates the Developer agent with Angular-convention git branching workflow.

## Pre-Implementation Checklist
- [x] Parent spec is `status: approved` (implementing at user request)
- [x] `bunx nx run-many -t build --output-style=stream` passes before starting

## Implementation Plan
1. Create `packages/runners/` and `packages/adapters/` directories
2. Move runner packages: `js`, `python`, `go`, `rust`, `java` → `packages/runners/`
3. Move adapter packages: `react`, `react-e2e` → `packages/adapters/`
4. Update root `package.json` workspaces
5. Update root `tsconfig.json` references
6. Update each runner's `tsconfig.json` and `tsconfig.lib.json` (extends depth + core reference)
7. Update `packages/adapters/react/tsconfig.json` and `tsconfig.lib.json`
8. Update `packages/adapters/react/vite.config.mts` cacheDir
9. Update `packages/adapters/react-e2e/package.json` nx target config path
10. Run `bun install`
11. Update `.github/copilot-instructions.md`, both agent files, `packages.instructions.md`
12. Add Angular-convention git branching workflow to `developer.agent.md`
13. Verify build, tests, e2e

## Files Changed
| File | Change |
|---|---|
| `packages/runners/js/` | Moved from `packages/js/` |
| `packages/runners/python/` | Moved from `packages/python/` |
| `packages/runners/go/` | Moved from `packages/go/` |
| `packages/runners/rust/` | Moved from `packages/rust/` |
| `packages/runners/java/` | Moved from `packages/java/` |
| `packages/adapters/react/` | Moved from `packages/react/` |
| `packages/adapters/react-e2e/` | Moved from `packages/react-e2e/` |
| `package.json` | workspaces updated |
| `tsconfig.json` | references updated |
| `packages/runners/*/tsconfig.json` | extends depth fixed (3 levels) |
| `packages/runners/*/tsconfig.lib.json` | extends depth + core reference fixed |
| `packages/adapters/react/tsconfig.json` | extends depth fixed |
| `packages/adapters/react/tsconfig.lib.json` | extends depth + all references fixed |
| `packages/adapters/react/vite.config.mts` | cacheDir path fixed |
| `packages/adapters/react-e2e/package.json` | nx target config path fixed |
| `.github/copilot-instructions.md` | paths updated |
| `.github/agents/architect.agent.md` | Project Context updated |
| `.github/agents/developer.agent.md` | paths + git workflow added |
| `.github/instructions/packages.instructions.md` | paths updated |

## Post-Implementation Checklist
- [x] `bunx nx run-many -t build --output-style=stream` passes
- [x] No TypeScript errors (`bunx nx run-many -t typecheck --output-style=stream`)
- [x] `bunx nx run-many -t test --output-style=stream` passes
- [x] `bunx nx run react-e2e:e2e --output-style=stream` passes
- [x] Acceptance criteria from parent spec satisfied
- [x] Chunk status updated to `done`
