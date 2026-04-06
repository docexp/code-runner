---
spec: "007"
chunk: "003"
title: "apps/storybooks host app + .nxignore for storybook-static"
status: "done"
---

# Chunk 003: apps/storybooks host app + .nxignore for storybook-static

## Scope of This Chunk
Create the `apps/storybooks` host Storybook application with `@storybook/html-vite`, composition `refs` (React child + extension comments), a `Welcome.mdx` intro page, and the Nx port/dependsOn wiring. Also add `.nxignore` to exclude `storybook-static` build outputs from project graph detection.

## Pre-Implementation Checklist
- [x] Parent spec is `status: approved`
- [x] `bunx nx run-many -t build --output-style=stream` passes before starting

## Implementation Plan
1. Create `apps/storybooks/.storybook/main.ts` (host, `@storybook/html-vite`, `refs` block)
2. Create `apps/storybooks/.storybook/preview.ts`
3. Create `apps/storybooks/src/Welcome.mdx`
4. Create `apps/storybooks/package.json` (private)
5. Create `apps/storybooks/tsconfig.json`
6. Create `apps/storybooks/project.json` (port 6006, `dependsOn: ["react:storybook"]`)
7. Run `bun install` to register workspace package
8. Create `.nxignore` to exclude `**/storybook-static` from project detection
9. Remove redundant `outputDir` overrides from both `project.json` files

## Files Changed
| File | Change |
|---|---|
| `apps/storybooks/.storybook/main.ts` | Created |
| `apps/storybooks/.storybook/preview.ts` | Created |
| `apps/storybooks/src/Welcome.mdx` | Created |
| `apps/storybooks/package.json` | Created |
| `apps/storybooks/tsconfig.json` | Created |
| `apps/storybooks/project.json` | Created |
| `packages/adapters/react/project.json` | Removed outputDir override (unnecessary) |
| `.nxignore` | Created — excludes `**/storybook-static` |
| `bun.lock` | Updated by `bun install` |

## Post-Implementation Checklist
- [x] `bunx nx run storybooks:build-storybook --output-style=stream` exits 0
- [x] `bunx nx run react:build-storybook --output-style=stream` exits 0
- [x] `bunx nx run-many -t build --output-style=stream` passes (8 projects)
- [x] `bunx nx run-many -t test --output-style=stream` passes (7 projects)
- [x] No TypeScript errors
- [x] `apps/storybooks` is `private: true`
- [x] Host `main.ts` contains commented-out extension points for Vue/Angular
- [x] Chunk status updated to `done`
