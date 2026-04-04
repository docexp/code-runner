---
id: "002"
title: "Package Directory Grouping"
status: "approved"
created: "2026-04-04"
updated: "2026-04-04"
---

# Package Directory Grouping

## Context & Goals

All packages currently live directly under `packages/`. As the number of runners and framework adapters grows this becomes a flat list that does not communicate the conceptual separation between language-level execution logic and UI-framework-level presentation concerns. This spec reorganises the directory tree into two named groups — `runners/` and `adapters/` — while keeping `core` at the top level as the shared foundation. npm package names remain unchanged so no downstream consumers are affected.

## Scope

**In scope:**
- Move all five runner packages into `packages/runners/`
- Move `@cheetah-coder/react` and the `react-e2e` project into `packages/adapters/`
- Update every path reference across the codebase: `package.json` workspaces, root `tsconfig.json` references, all `tsconfig.lib.json` cross-package references, `packages/react/tsconfig.lib.json`, `packages/react-e2e` config files, Nx `nx.json` if needed, agent files, Copilot instruction files, and spec tracking files
- Update `packages.instructions.md` and `copilot-instructions.md` to document the new structure
- Update all agent files to reflect the new layout
- Update READMEs where they contain path references

**Out of scope:**
- Renaming npm package names — `@cheetah-coder/js`, `@cheetah-coder/react`, etc. are unchanged
- Adding new packages or functionality
- Changing test content

## Package Impact

No new packages are created and no packages are renamed. Seven existing projects move to new paths.

### Directory map

| Current path | New path | Package name (unchanged) |
|---|---|---|
| `packages/core` | `packages/core` | `@cheetah-coder/core` |
| `packages/js` | `packages/runners/js` | `@cheetah-coder/js` |
| `packages/python` | `packages/runners/python` | `@cheetah-coder/python` |
| `packages/go` | `packages/runners/go` | `@cheetah-coder/go` |
| `packages/rust` | `packages/runners/rust` | `@cheetah-coder/rust` |
| `packages/java` | `packages/runners/java` | `@cheetah-coder/java` |
| `packages/react` | `packages/adapters/react` | `@cheetah-coder/react` |
| `packages/react-e2e` | `packages/adapters/react-e2e` | `@cheetah-coder/react-e2e` (private) |

## Requirements

### Functional Requirements

- FR-001: `bunx nx run-many -t build --output-style=stream` must exit 0 for all packages after every chunk.
- FR-002: `bunx nx run-many -t test --output-style=stream` must exit 0 after every chunk.
- FR-003: `bunx nx run react-e2e:e2e --output-style=stream` must exit 0 after the final chunk.
- FR-004: All five runner packages must resolve `@cheetah-coder/core` correctly from their new paths.
- FR-005: `@cheetah-coder/react` must resolve all five `@cheetah-coder/{lang}` packages correctly from its new path.
- FR-006: The `react-e2e` Playwright project must locate its `playwright.config.ts` and the Vite dev server correctly from its new path.
- FR-007: The root `package.json` `workspaces` array must include all three directory groups.
- FR-008: The root `tsconfig.json` `references` array must point to all new paths.
- FR-009: All agent files, Copilot instruction files, and the workspace packages instruction file must show the new directory layout.

### Non-Functional Requirements

- NFR-001: Build must pass after every chunk.
- NFR-002: Unit tests must pass after every chunk.
- NFR-003: No npm package names change — zero consumer-facing breakage.
- NFR-004: No `any` types introduced.
- NFR-005: `bun install` must be run after any `package.json` change.

## Technical Design

### Directory structure after this spec

```
packages/
  core/                       @cheetah-coder/core  (unchanged position)
  runners/
    js/                       @cheetah-coder/js
    python/                   @cheetah-coder/python
    go/                       @cheetah-coder/go
    rust/                     @cheetah-coder/rust
    java/                     @cheetah-coder/java
  adapters/
    react/                    @cheetah-coder/react
    react-e2e/                @cheetah-coder/react-e2e (private, e2e only)
```

### Why `core` stays at top level

`core` is a shared foundation consumed by both groups. Placing it inside `runners/` would misrepresent its scope; a third `shared/` group for a single package is unnecessary indirection. `packages/core` makes the dependency direction self-evident.

### Workspace glob changes

`package.json` currently declares `"workspaces": ["packages/*"]`. This must be expanded to:

```json
"workspaces": [
  "packages/core",
  "packages/runners/*",
  "packages/adapters/*"
]
```

Using explicit globs rather than a catch-all ensures only recognised directories are treated as packages and prevents phantom workspace entries if unrelated directories appear inside `packages/`.

### TypeScript project references

Every `tsconfig.lib.json` uses relative paths for `references`. After moving:

- Runner packages reference `core` as `../../core/tsconfig.lib.json` (was `../core/tsconfig.lib.json` — one level deeper now)
- `packages/adapters/react/tsconfig.lib.json` references runners as `../../runners/{lang}/tsconfig.lib.json` and core as `../../core/tsconfig.lib.json`
- Root `tsconfig.json` references: `./packages/runners/js`, `./packages/runners/python`, etc.

Nx `sync.applyChanges: true` will auto-reconcile references on the next build, but the Developer must still commit the manually-updated files to keep the repo self-consistent without requiring a sync step on every fresh checkout.

### `react-e2e` path adjustments

After moving to `packages/adapters/react-e2e/`:
- `playwright.config.ts` `webServer.command` uses `bunx vite --port 5174` — no path reference, unchanged.
- The Nx target in `packages/adapters/react-e2e/package.json` references `"config": "packages/adapters/react-e2e/playwright.config.ts"` (workspace-root-relative).
- `vite.config.ts` uses `import.meta.dirname` for root — unchanged.

### Files requiring edits

#### `package.json` files

| File | What changes |
|---|---|
| `package.json` (root) | `workspaces` array updated to three-glob form |
| `packages/runners/js/package.json` | No content changes needed (package name unchanged) |
| `packages/runners/python/package.json` | No content changes needed |
| `packages/runners/go/package.json` | No content changes needed |
| `packages/runners/rust/package.json` | No content changes needed |
| `packages/runners/java/package.json` | No content changes needed |
| `packages/adapters/react/package.json` | No content changes needed |
| `packages/adapters/react-e2e/package.json` | Nx target `config` path updated |

#### TypeScript config files

| File | What changes |
|---|---|
| `tsconfig.json` (root) | All `references` paths updated |
| `packages/runners/js/tsconfig.lib.json` | `references` core path: `../../core/tsconfig.lib.json` |
| `packages/runners/python/tsconfig.lib.json` | Same |
| `packages/runners/go/tsconfig.lib.json` | Same |
| `packages/runners/rust/tsconfig.lib.json` | Same |
| `packages/runners/java/tsconfig.lib.json` | Same |
| `packages/adapters/react/tsconfig.lib.json` | All references updated to new paths |
| `packages/adapters/react/tsconfig.json` | Parent: no path changes needed (only contains `./tsconfig.lib.json`) |

#### Agent and instruction files

| File | What changes |
|---|---|
| `.github/copilot-instructions.md` | Package Map table, Project Structure block |
| `.github/agents/architect.agent.md` | Project Context block |
| `.github/agents/developer.agent.md` | Project Context block, Adding a New Runner Package section |
| `.github/instructions/packages.instructions.md` | Import path examples if they reference folder paths |

## Nx Considerations

- No new Nx generators needed.
- `nx.json` does not reference folder paths — no changes needed.
- The `@nx/playwright` plugin entry in `nx.json` does not reference paths — no changes needed.
- `sync.applyChanges: true` will auto-sync TypeScript project references on next build, but committed references must be correct for CI (`nx sync:check`).
- After moving folders, run `bun install` to re-link Bun workspace symlinks.
- The `react-e2e` Nx target `e2e` uses a workspace-root-relative config path — this must be updated to `packages/adapters/react-e2e/playwright.config.ts`.

## Security Considerations

Pure filesystem reorganisation. No new network calls, user inputs, or third-party integrations. No security impact.

## Implementation Notes for Developer

Work in the following order to keep the build green at each checkpoint:

1. **Create directory structure** — `mkdir -p packages/runners packages/adapters`
2. **Move runner packages** — `mv packages/js packages/runners/js` (× 5)
3. **Move adapter packages** — `mv packages/react packages/adapters/react && mv packages/react-e2e packages/adapters/react-e2e`
4. **Update root `package.json`** — change `workspaces` to three-glob form; run `bun install`
5. **Update root `tsconfig.json`** — update all `references` paths
6. **Update runner `tsconfig.lib.json` files** — fix `core` reference depth (× 5)
7. **Update `packages/adapters/react/tsconfig.lib.json`** — fix all references
8. **Update `packages/adapters/react-e2e/package.json`** — fix Nx target config path
9. **Update agent and instruction files** — `.github/copilot-instructions.md`, both agent files, `packages.instructions.md`
10. **Verify** — `bunx nx run-many -t build,test --output-style=stream` and `bunx nx run react-e2e:e2e --output-style=stream`

Build commands to verify after each chunk:
```bash
bunx nx run-many -t build --output-style=stream
bunx nx run-many -t test --output-style=stream
```

## Acceptance Criteria

- [ ] `packages/js`, `packages/python`, `packages/go`, `packages/rust`, `packages/java` no longer exist at top-level
- [ ] `packages/react` and `packages/react-e2e` no longer exist at top-level
- [ ] `packages/runners/` contains `js`, `python`, `go`, `rust`, `java`
- [ ] `packages/adapters/` contains `react` and `react-e2e`
- [ ] `packages/core` remains at `packages/core`
- [ ] `bunx nx run-many -t build --output-style=stream` exits 0 for all packages
- [ ] `bunx nx run-many -t typecheck --output-style=stream` exits 0 for all packages
- [ ] `bunx nx run-many -t test --output-style=stream` exits 0 for all packages
- [ ] `bunx nx run react-e2e:e2e --output-style=stream` exits 0
- [ ] All npm package names are unchanged — `@cheetah-coder/js` etc.
- [ ] All agent files and instruction files reflect the new directory layout

## Open Questions

- Should runner packages be nested further (e.g. `packages/runners/js/src/`) or is the existing `src/lib/` internal structure kept as-is? Resolved: **keep existing internal structure unchanged** — only the parent directory changes.
- Should a future Vue adapter live at `packages/adapters/vue`? Resolved: **yes** — the `adapters/` group is explicitly designed to hold any present and future framework adapters.
