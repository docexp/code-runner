---
spec: "009"
chunk: "001"
title: "Tailwind CSS v4 Cheetah Dark styling"
status: "done"
---

# Chunk 001: Tailwind CSS v4 Cheetah Dark styling

## Scope of This Chunk

Implements the entire spec 009 in a single chunk — this is appropriate because all changes are
confined to one package (`packages/adapters/react`) and every change is a direct dependency of
every other (CSS → vite config → package exports → component classes → Storybook preview).
Splitting would leave the build in a broken/unstyled intermediate state between chunks.

## Pre-Implementation Checklist
- [x] Parent spec is `status: approved`
- [x] `bunx nx run-many -t build --output-style=stream` passes before starting
- [x] `bunx nx run-many -t test --output-style=stream` passes before starting

## Implementation Plan
1. Create git branch `feat/009-tailwind-styling`
2. Install `tailwindcss` + `@tailwindcss/vite` as devDependencies
3. Create `src/styles.css` with `@import "tailwindcss"`, `@theme` tokens, `@source`
4. Add `tailwindcss()` first in `vite.config.mts` plugins
5. Add `import './styles.css'` to `src/index.ts`
6. Rewrite `RunnerShell.tsx` with Cheetah Dark Tailwind classes
7. Rewrite `CodeRunner.tsx` error fallback with Tailwind classes
8. Update `.storybook/preview.ts` to import the CSS source
9. Add `"./style.css"` export to `package.json`
10. Build + typecheck + test — fix any failures

## Files Changed
| File | Change |
|---|---|
| `packages/adapters/react/package.json` | Add `tailwindcss` + `@tailwindcss/vite` devDeps; add `./style.css` export |
| `packages/adapters/react/vite.config.mts` | Add `tailwindcss()` plugin |
| `packages/adapters/react/src/styles.css` | Created — `@theme` tokens + `@source` |
| `packages/adapters/react/src/index.ts` | Add `import './styles.css'` |
| `packages/adapters/react/src/lib/RunnerShell.tsx` | Replace all className strings with Cheetah Dark Tailwind classes |
| `packages/adapters/react/src/lib/CodeRunner.tsx` | Replace inline error style with Tailwind classes |
| `packages/adapters/react/.storybook/preview.ts` | Import `../src/styles.css` |

## Post-Implementation Checklist
- [x] `bunx nx run react:build --output-style=stream` passes and `dist/style.css` exists
- [x] No TypeScript errors (`bunx nx run react:typecheck --output-style=stream`)
- [x] `bunx nx run react:test --output-style=stream` passes
- [x] No `className="runner-*"` strings remain in `.tsx` files
- [x] Chunk status updated to `done`
