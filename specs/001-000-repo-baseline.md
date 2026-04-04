---
id: "001"
title: "Repository Baseline Stabilisation"
status: "draft"
created: "2026-04-04"
updated: "2026-04-04"
---

# Repository Baseline Stabilisation

## Context & Goals

The repo was bootstrapped with Nx generators and contains several structural deviations from the intended final state: runner packages carry a redundant `runner-` prefix in their npm scoped names and folder paths, placeholder/empty generated files remain in the React package, the root `package.json` name is incorrect, every package README is the generic Nx template, and all agent/instruction files still reflect the old naming scheme. This spec defines the desired final state and the changes the Developer must apply to reach it so that all subsequent specs build on a clean, consistent foundation.

## Scope

**In scope:**
- Rename runner packages: folders, `package.json` `name` fields, `nx.name` fields
- Update every import, dependency reference, and project reference throughout the repo that uses the old package names
- Fix the root `package.json` `name` field
- Writing unit tests (Vitest) for every runner package and the React layer
- Writing Playwright e2e tests for the React `RunnerShell` components
- Writing meaningful README content for every package and the root, following the canonical documentation template defined in the Architect agent
- Delete empty/unused generated files (`react.tsx`, `react.module.css`)
- Remove `"private": true` from all publishable packages; keep it only on the root workspace `package.json`
- Update all agent definition files and Copilot instruction files to reflect the new naming
- Update the workspace-level `packages.instructions.md` Nx name examples if they reference old names

**Out of scope:**
- Implementing any new functionality
- Configuring an npm publish pipeline (future spec)

## Package Impact

No new packages are created. Five existing packages are renamed. One package has a minor structural clean-up.

### Rename map

| Old folder | New folder | Old npm name | New npm name | Old `nx.name` | New `nx.name` |
|---|---|---|---|---|---|
| `packages/runner-js` | `packages/js` | `@code-runner/runner-js` | `@code-runner/js` | `runner-js` | `js` |
| `packages/runner-python` | `packages/python` | `@code-runner/runner-python` | `@code-runner/python` | `runner-python` | `python` |
| `packages/runner-go` | `packages/go` | `@code-runner/runner-go` | `@code-runner/go` | `runner-go` | `go` |
| `packages/runner-rust` | `packages/rust` | `@code-runner/runner-rust` | `@code-runner/rust` | `runner-rust` | `rust` |
| `packages/runner-java` | `packages/java` | `@code-runner/runner-java` | `@code-runner/java` | `runner-java` | `java` |

### React package clean-up (no rename)

- `packages/react/src/lib/react.tsx` — **delete** (intentional empty placeholder, no exports, no consumers)
- `packages/react/src/lib/react.module.css` — **delete** (empty generated artefact, no consumers)

### Root `package.json`

- `"name"` field: change from `"@code-runner/source"` to `"code-runner"`. The current name collides with the custom export condition `@code-runner/source` used in individual package `exports` maps, which is confusing and incorrect for a private monorepo root.

### `private` flag removal

This is a public, publishable project. Every runner package and `@code-runner/core` currently carry `"private": true`, which prevents npm publishing. That flag must be removed from all packages. `@code-runner/react` is already missing the flag and requires no change on this point.

## Requirements

### Functional Requirements

- FR-001: After this spec is implemented, `bunx nx run-many -t build --output-style=stream` must succeed for all packages.
- FR-002: Every source file import of `@code-runner/runner-{lang}` must become `@code-runner/{lang}`.
- FR-003: Every `package.json` dependency entry of `@code-runner/runner-{lang}` must become `@code-runner/{lang}`.
- FR-004: Every TypeScript project reference that points to a `runner-{lang}` folder path must be updated.
- FR-005: The root `tsconfig.json` `references` array must point to the new folder paths.
- FR-006: The root `package.json` `name` must be `"code-runner"`.
- FR-007: `react.tsx` and `react.module.css` must be deleted.
- FR-008: `"private": true` must be removed from `@code-runner/core` and all five runner package `package.json` files. The root `package.json` must retain (or gain) `"private": true` since workspace roots must never be published directly.
- FR-009: All agent files, Copilot instruction files, and the workspace packages instruction file must use updated package names and folder paths throughout.
- FR-010: Every package README and the root `README.md` must be replaced with meaningful content that follows the canonical documentation template from the Architect agent's Documentation Design Principles: badges line, h1, one-sentence lede, install, quick start, API table, notes (where non-obvious), license. All documentation must be minimalist, SEO-optimised, and LLM-readable per those principles.

### Non-Functional Requirements

- NFR-001: Build must pass after every chunk.
- NFR-002: No `any` types introduced.
- NFR-003: No source behaviour changes — this is a pure structural refactor.
- NFR-004: `bun install` must be re-run after any `package.json` change.
- NFR-005: All unit tests must pass after every chunk (`bunx nx run-many -t test --output-style=stream`).
- NFR-006: Playwright e2e tests must pass after the React layer is touched.

## Technical Design

### Folder rename strategy

The Developer must `mv` (or rename) each `packages/runner-{lang}` directory to `packages/{lang}`. Because Nx uses `"nx": { "name": "..." }` in `package.json` rather than the folder name for project identity, the rename itself does not require Nx generators — it is a filesystem + JSON edit operation. The `.nx/` cache does not need manual intervention; `nx sync` (triggered automatically on next build via `sync.applyChanges: true`) will reconcile TypeScript project references.

### Files requiring edits after folder rename

Below is the exhaustive list of locations that contain old names:

#### Source files

| File | What changes |
|---|---|
| `packages/react/src/lib/JsRunner.tsx` | Import `from '@code-runner/runner-js'` → `'@code-runner/js'` |
| `packages/react/src/lib/PythonRunner.tsx` | Import `from '@code-runner/runner-python'` → `'@code-runner/python'` |
| `packages/react/src/lib/GoRunner.tsx` | Import `from '@code-runner/runner-go'` → `'@code-runner/go'` |
| `packages/react/src/lib/RustRunner.tsx` | Import `from '@code-runner/runner-rust'` → `'@code-runner/rust'` |
| `packages/react/src/lib/JavaRunner.tsx` | Import `from '@code-runner/runner-java'` → `'@code-runner/java'` |

#### `package.json` files

| File | What changes |
|---|---|
| `packages/js/package.json` | `"name"` → `@code-runner/js`; `"nx.name"` → `js`; remove `"private": true` |
| `packages/python/package.json` | `"name"` → `@code-runner/python`; `"nx.name"` → `python`; remove `"private": true` |
| `packages/go/package.json` | `"name"` → `@code-runner/go`; `"nx.name"` → `go`; remove `"private": true` |
| `packages/rust/package.json` | `"name"` → `@code-runner/rust`; `"nx.name"` → `rust`; remove `"private": true` |
| `packages/java/package.json` | `"name"` → `@code-runner/java`; `"nx.name"` → `java`; remove `"private": true` |
| `packages/react/package.json` | Dependencies renamed |
| `packages/core/package.json` | Remove `"private": true` |
| `package.json` (root) | `"name"` → `code-runner`; add `"private": true` (root workspace must stay private) |

#### TypeScript config files

| File | What changes |
|---|---|
| `tsconfig.json` (root) | `references` paths: `./packages/runner-{lang}` → `./packages/{lang}` |
| `packages/react/tsconfig.lib.json` | `references` paths: `../runner-{lang}/tsconfig.lib.json` → `../{lang}/tsconfig.lib.json` |
| `packages/js/tsconfig.lib.json` | (path already correct after folder move; no content changes needed) |
| `packages/python/tsconfig.lib.json` | same as above |
| `packages/go/tsconfig.lib.json` | same as above |
| `packages/rust/tsconfig.lib.json` | same as above |
| `packages/java/tsconfig.lib.json` | same as above |

#### Agent and instruction files

| File | What changes |
|---|---|
| `.github/copilot-instructions.md` | Package Map table: folder column `packages/runner-{lang}` → `packages/{lang}`; import path column `@code-runner/runner-{lang}` → `@code-runner/{lang}`. All prose references updated. |
| `.github/agents/architect.agent.md` | Project Context block: `@code-runner/runner-{lang}` → `@code-runner/{lang}` |
| `.github/agents/developer.agent.md` | Project Context block + Build Commands block: `@code-runner/runner-{lang}` → `@code-runner/{lang}`; folder path examples updated |

### Custom export condition

The custom export condition key `"@code-runner/source"` in each package's `exports` map is intentional — it allows TypeScript to resolve source `.ts` files during monorepo development (via `customConditions` in `tsconfig.base.json`). This must be preserved on all packages unchanged.

### Testing

This is a baseline spec, so test files are being created from scratch rather than migrated.

**Unit tests (Vitest)** — one `*.spec.ts` per runner package:

| Package | Test file | What to cover |
|---|---|---|
| `packages/core` | `src/lib/core.spec.ts` | `RUNNER_META` shape: all five languages present, `label` is a non-empty string, `playgroundUrl` is a string when present |
| `packages/js` | `src/lib/runner-js.spec.ts` | `runJavaScript` returns `ok:true` with captured stdout; returns `ok:false` with `stderr` on syntax error |
| `packages/python` | `src/lib/runner-python.spec.ts` | Mock `window.loadPyodide`; assert `runPython` resolves with captured stdout; assert `ok:false` on Python error |
| `packages/go` | `src/lib/runner-go.spec.ts` | Mock `fetch`; assert `runGo` uses correct API URL and maps `Events` to stdout; assert network error path |
| `packages/rust` | `src/lib/runner-rust.spec.ts` | Mock `fetch`; assert `runRust` maps `stdout`/`stderr`; assert `ok:false` when `success: false` |
| `packages/java` | `src/lib/runner-java.spec.ts` | Mock `fetch`; assert `runJava` maps Piston `run.stdout`; assert `ok:false` on non-zero exit code |
| `packages/react` | `src/lib/useRunner.spec.ts` | `useRunner` transitions: idle → loading → ok; idle → loading → error; reset returns to idle |
| `packages/react` | `src/lib/RunnerShell.spec.tsx` | Renders header title; ▶ Run button triggers runner; output panel shows stdout; Reset restores original code |

**Playwright e2e tests** — live in a new `packages/react-e2e/` Nx project:

| Test file | What to cover |
|---|---|
| `src/js.spec.ts` | JsRunner: click Run, assert output panel, assert reset |
| `src/python.spec.ts` | PythonRunner: mock CDN script load, click Run, assert output |
| `src/go.spec.ts` | GoRunner: intercept `go.dev/play/compile`, click Run, assert stdout |
| `src/rust.spec.ts` | RustRunner: intercept `play.rust-lang.org/execute`, click Run, assert stdout |
| `src/java.spec.ts` | JavaRunner: intercept `emkc.org/api/v2/piston/execute`, click Run, assert stdout |

All Playwright tests must use `page.route()` to mock external APIs — no real network calls in CI.

## Nx Considerations

- No new Nx generators are needed for the rename itself.
- A new `react-e2e` Playwright project must be scaffolded. Use `bunx nx generate @nx/playwright:configuration --project=react-e2e --no-interactive` if the plugin is available; otherwise scaffold manually: `packages/react-e2e/package.json`, `playwright.config.ts`, and test files.
- Runner packages (`@code-runner/js` etc.) were generated with `--unitTestRunner=none`. Vitest must be added manually: add `vitest` config to each `tsconfig.lib.json` or add a `vite.config.ts` with Vitest settings, and register a `test` target in each package's `package.json` or let Nx infer it.
- `sync.applyChanges: true` in `nx.json` means TypeScript project references will be auto-synced on the next build invocation, but the Developer must still manually update `tsconfig.json` root references and `packages/react/tsconfig.lib.json` references because those changes need to be committed.
- After moving folders, run `bun install` once to re-link Bun workspace symlinks.
- `nx.json` itself does not reference package names or folder paths — no changes needed there.
- The `.nx/` cache directory (gitignored) requires no manual attention.

## Security Considerations

This spec is a pure rename refactor. No new network calls, user inputs, or third-party integrations are introduced. No security impact.

## Implementation Notes for Developer

Work in the following order to keep the build green at each checkpoint:

1. **Move folders** — rename each `packages/runner-{lang}` to `packages/{lang}` using `mv`.
2. **Update `package.json` files** — update `name` and `nx.name` in each moved runner package; remove `"private": true` from all publishable packages; update react dependencies; set root `package.json` name to `code-runner` and ensure it has `"private": true`.
3. **Run `bun install`** — re-link workspace symlinks.
4. **Update tsconfig files** — update root `tsconfig.json` references; update `packages/react/tsconfig.lib.json` references.
5. **Update source imports** — update the five `*Runner.tsx` files in `packages/react/src/lib/`.
6. **Delete dead files** — `packages/react/src/lib/react.tsx` and `packages/react/src/lib/react.module.css`.
7. **Update agent/instruction files** — update `.github/copilot-instructions.md`, `.github/agents/architect.agent.md`, `.github/agents/developer.agent.md`.
8. **Scaffold Vitest for runner packages** — add Vitest configuration and `test` targets to `packages/core`, `packages/js`, `packages/python`, `packages/go`, `packages/rust`, `packages/java`.
9. **Write unit tests** — write all `.spec.ts` / `.spec.tsx` files per the Testing table above.
10. **Scaffold Playwright project** — create `packages/react-e2e/` with `playwright.config.ts` and the five spec files per the Testing table above.
11. **Write READMEs** — write all package READMEs and the root README following the canonical template (badges, h1, lede, install, quick start, API table, notes, license). Apply the minimalist / SEO / LLM-readable standards defined in the Architect agent's Documentation Design Principles.
12. **Verify everything** — build, typecheck, unit tests, and Playwright must all pass.

Build commands to verify after each chunk:
```bash
bunx nx run-many -t build --output-style=stream
bunx nx run-many -t test --output-style=stream
```

## Acceptance Criteria

- [ ] `packages/runner-js`, `packages/runner-python`, `packages/runner-go`, `packages/runner-rust`, `packages/runner-java` no longer exist
- [ ] `packages/js`, `packages/python`, `packages/go`, `packages/rust`, `packages/java` exist with correct `package.json` names and `nx.name` values
- [ ] `bunx nx run-many -t build --output-style=stream` exits 0 for all packages
- [ ] `bunx nx run-many -t typecheck --output-style=stream` exits 0 for all packages
- [ ] `grep -r "runner-js\|runner-python\|runner-go\|runner-rust\|runner-java" packages/ .github/` returns no matches
- [ ] Root `package.json` `name` is `"code-runner"`
- [ ] `packages/core/package.json`, all five runner `package.json` files, and `packages/react/package.json` do **not** contain `"private": true`
- [ ] Root `package.json` contains `"private": true`
- [ ] `packages/react/src/lib/react.tsx` does not exist
- [ ] `packages/react/src/lib/react.module.css` does not exist
- [ ] `bunx nx run-many -t test --output-style=stream` exits 0 for all packages
- [ ] `bunx nx run react-e2e:e2e --output-style=stream` exits 0
- [ ] All agent files and instruction files use the updated package names
- [ ] Every package has a README that follows the canonical template; no Nx boilerplate text remains anywhere in the repository

## Open Questions

- Should individual package READMEs be replaced with meaningful content as part of this spec? Resolved: **Yes** — the project is public and all packages must have proper documentation before any work is shipped. The canonical template and documentation design principles are defined in the Architect agent.
- Should the `private: true` flag be removed to prepare for npm publishing? Resolved: **Yes** — the project is public and intended to be published. The flag is removed from all publishable packages in this baseline spec. A dedicated publish pipeline spec will handle the actual release workflow.
