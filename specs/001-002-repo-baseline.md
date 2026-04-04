---
spec: "001"
chunk: "002"
title: "Update agent and instruction files to new package names"
status: "done"
---

# Chunk 002: Update agent and instruction files to new package names

## Scope of This Chunk
Update `.github/copilot-instructions.md` and `.github/instructions/packages.instructions.md` to reflect the new package names and folder paths. The agent files were already updated in a prior session when the spec was being drafted.

## Pre-Implementation Checklist
- [x] Parent spec is `status: approved`
- [x] `bunx nx run-many -t build --output-style=stream` passes before starting

## Implementation Plan
1. Update `.github/copilot-instructions.md` — Package Map table, all prose
2. Update `.github/instructions/packages.instructions.md` — any references to old names

## Files Changed
| File | Change |
|---|---|
| `.github/copilot-instructions.md` | Package Map and all prose updated |
| `.github/instructions/packages.instructions.md` | Verified / updated |

## Post-Implementation Checklist
- [x] `bunx nx run-many -t build --output-style=stream` passes
- [x] No old `runner-{lang}` names remain in `.github/`
- [x] Chunk status updated to `done`
