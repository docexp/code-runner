---
spec: "007"
chunk: "001"
title: "Install Storybook deps, register @nx/storybook plugin, add apps/* workspace"
status: "done"
---

# Chunk 001: Install Storybook deps, register @nx/storybook plugin, add apps/* workspace

## Scope of This Chunk
Install Storybook 8 packages into root devDependencies, register the `@nx/storybook` plugin in `nx.json`, and add the `apps/*` workspace glob to root `package.json`. No story files or `.storybook/` configs yet.

## Pre-Implementation Checklist
- [x] Parent spec is `status: approved`
- [x] `bunx nx run-many -t build --output-style=stream` passes before starting

## Implementation Plan
1. `bun add -D @nx/storybook@22.6.4 storybook@^8 @storybook/react-vite@^8 @storybook/html-vite@^8 @storybook/addon-essentials@^8 @storybook/addon-interactions@^8 @storybook/blocks@^8`
2. Add `@nx/storybook/plugin` entry to `nx.json` plugins array
3. Add `"apps/*"` to root `package.json` workspaces

## Files Changed
| File | Change |
|---|---|
| `package.json` | Added `"apps/*"` to workspaces; added 7 Storybook devDeps |
| `nx.json` | Added `@nx/storybook/plugin` to plugins |
| `bun.lock` | Updated by `bun install` |

## Post-Implementation Checklist
- [x] `bunx nx run-many -t build --output-style=stream` passes
- [x] No TypeScript errors
- [x] Chunk status updated to `done`
