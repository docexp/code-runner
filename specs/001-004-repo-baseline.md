---
spec: "001"
chunk: "004"
title: "Playwright e2e scaffold and tests"
status: "done"
---

# Chunk 004: Playwright scaffold and e2e tests

## Scope of This Chunk
Create `packages/react-e2e/` as a Vite demo app + Playwright project. Add `@nx/playwright`
plugin to `nx.json`. Write the five e2e spec files that cover each language runner shell
using `page.route()` for API mocking and `page.addInitScript()` for WASM mocking.

## Pre-Implementation Checklist
- [x] Parent spec is `status: approved`
- [x] `bunx nx run-many -t build --output-style=stream` passes before starting
- [x] `bunx nx run-many -t test --output-style=stream` passes before starting

## Implementation Plan
1. Add `@nx/playwright` plugin to `nx.json`
2. Create `packages/react-e2e/` with package.json, playwright.config.ts, vite.config.ts,
   tsconfig.json, index.html, src/main.tsx, src/App.tsx
3. Write src/js.spec.ts, src/python.spec.ts, src/go.spec.ts, src/rust.spec.ts, src/java.spec.ts
4. Install Playwright browser: `bunx playwright install chromium`
5. Run `bunx nx run react-e2e:e2e --output-style=stream` and verify all tests pass

## Files Changed
| File | Change |
|---|---|
| `nx.json` | Added `@nx/playwright` plugin |
| `packages/react-e2e/package.json` | Created |
| `packages/react-e2e/playwright.config.ts` | Created |
| `packages/react-e2e/vite.config.ts` | Created |
| `packages/react-e2e/tsconfig.json` | Created |
| `packages/react-e2e/index.html` | Created |
| `packages/react-e2e/src/main.tsx` | Created |
| `packages/react-e2e/src/App.tsx` | Created |
| `packages/react-e2e/src/js.spec.ts` | Created |
| `packages/react-e2e/src/python.spec.ts` | Created |
| `packages/react-e2e/src/go.spec.ts` | Created |
| `packages/react-e2e/src/rust.spec.ts` | Created |
| `packages/react-e2e/src/java.spec.ts` | Created |

## Post-Implementation Checklist
- [x] `bunx nx run-many -t build --output-style=stream` passes
- [x] `bunx nx run-many -t test --output-style=stream` passes
- [x] `bunx nx run react-e2e:e2e --output-style=stream` passes
- [x] Chunk status updated to `done`
