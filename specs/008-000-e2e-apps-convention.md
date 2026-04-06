---
id: "008"
title: "E2E apps convention — migrate react-e2e to apps/"
status: "draft"
created: "2026-04-06"
updated: "2026-04-06"
---

# E2E apps convention — migrate react-e2e to apps/

## Context & Goals

Spec 007 established the `apps/` top-level directory as the canonical home for all non-publishable applications in this monorepo, reserving `packages/` strictly for publishable libraries. The existing `packages/adapters/react-e2e` pre-dates that convention and sits in the wrong place: it is a private Playwright application, not a library, and it has no adapter-specific code — only tests that exercise the published `@cheetah-coder/react` API.

This spec migrates `packages/adapters/react-e2e` → `apps/react-e2e` and encodes the naming and placement convention for all future e2e applications so that Developer agents have an unambiguous rule to follow.

## Scope

**In scope:**
- Moving all files from `packages/adapters/react-e2e/` to `apps/react-e2e/`
- Updating every path reference that pointed at the old location (root `package.json` workspaces, `playwright.config.ts` internal paths, `bun.lock`, CI workflow, developer agent instructions, architect agent instructions, `tsconfig.json` project references)
- Establishing the `apps/{framework}-e2e` placement and naming convention in the Developer agent and in this spec
- Removing `packages/adapters/react-e2e` from the monorepo workspace after the move

**Out of scope:**
- Adding new e2e tests
- Changes to any publishable package code
- Creating e2e apps for frameworks not yet implemented
- Migrating `apps/storybooks` (covered by spec 007)

## Package Impact

| Location | Change |
|---|---|
| `packages/adapters/react-e2e/` | Deleted (moved) |
| `apps/react-e2e/` *(new path)* | Same content, updated internal paths |
| Root `package.json` | `workspaces` gains `"apps/*"` (if not already added by spec 007); removes the implicit `packages/adapters/react-e2e` membership |
| `.github/workflows/ci.yml` | Update `nx run` project name if it changes (it won't — Nx name stays `react-e2e`) |
| `.github/agents/developer.agent.md` | Update path references |
| `.github/agents/architect.agent.md` | Update path references |

### Convention established by this spec

> **All end-to-end test applications live under `apps/{scope}-e2e/`.**
>
> Naming rule: `{scope}` matches the adapter package name without the `@cheetah-coder/` prefix.
> Examples: `apps/react-e2e/`, `apps/vue-e2e/`, `apps/angular-e2e/`.
>
> An e2e app is always `private: true`, never published to npm, and must not appear in the release pipeline.
> It depends on the adapter package it tests via `"workspace:*"` in its own `package.json`.

## Requirements

### Functional Requirements

- FR-001: `bunx nx run react-e2e:e2e --output-style=stream` must pass after the move, with identical test results to before.
- FR-002: The Nx project name of the moved app remains `react-e2e` (set via `"nx": { "name": "react-e2e" }` in `package.json`) so all existing Nx commands, CI steps, and `dependsOn` references continue to work without changes.
- FR-003: `playwright.config.ts` must reflect the new `apps/react-e2e/` directory structure; the `--config` flag path in the Nx `e2e` target must be updated to `apps/react-e2e/playwright.config.ts`.
- FR-004: TypeScript project reference from `apps/react-e2e` → `packages/adapters/react` must be preserved (path changes from `../react` to `../../packages/adapters/react`).
- FR-005: `bun install` must succeed after the move with a clean lockfile update (`bun install` without `--frozen-lockfile` for the migration step, then re-lock).
- FR-006: The Developer agent instructions (`.github/agents/developer.agent.md`) must be updated to reference `apps/react-e2e/` at every occurrence of `packages/adapters/react-e2e/`.
- FR-007: The Architect agent instructions (`.github/agents/architect.agent.md`) must be updated identically.

### Non-Functional Requirements

- NFR-001: All packages must build cleanly after the move (`bunx nx run-many -t build --output-style=stream`).
- NFR-002: No `any` types introduced.
- NFR-003: The old directory `packages/adapters/react-e2e/` must not exist after the migration is complete.
- NFR-004: The `apps/*` workspace glob added in spec 007 covers `apps/react-e2e/` automatically; no additional workspace registration is required if spec 007 has already been implemented. If spec 007 has not yet been implemented, this spec must add `"apps/*"` to `workspaces`.

## Technical Design

### Directory structure after migration

```
apps/
  react-e2e/
    src/
      App.tsx
      main.tsx
      go.spec.ts
      java.spec.ts
      js.spec.ts
      python.spec.ts
      rust.spec.ts
    index.html
    package.json
    playwright.config.ts
    tsconfig.json
    vite.config.ts
packages/
  adapters/
    react/             ← unchanged
    (react-e2e removed)
```

### `apps/react-e2e/package.json` — path-sensitive fields

The only field that encodes a path is the `e2e` Nx target command:

```json
{
  "name": "@cheetah-coder/react-e2e",
  "private": true,
  "type": "module",
  "nx": {
    "name": "react-e2e",
    "targets": {
      "typecheck": {
        "command": "tsc --noEmit",
        "options": { "cwd": "{projectRoot}" }
      },
      "e2e": {
        "executor": "nx:run-commands",
        "options": {
          "command": "bunx playwright test --config apps/react-e2e/playwright.config.ts"
        },
        "dependsOn": ["build-deps"]
      }
    }
  },
  "dependencies": {
    "@cheetah-coder/react": "workspace:*",
    "react": "^19.0.0",
    "react-dom": "^19.0.0"
  }
}
```

### `apps/react-e2e/tsconfig.json` — project reference path update

```json
{
  "references": [
    { "path": "../../packages/adapters/react" }
  ]
}
```

All other `tsconfig.json` fields remain identical to the current file.

### `apps/react-e2e/vite.config.ts` — no changes required

`import.meta.dirname` is resolved at runtime; no hardcoded paths exist in the current `vite.config.ts`.

### Workspace registration

If spec 007 has already been applied, `"apps/*"` is already in root `package.json` `workspaces` and nothing more is needed. If not, add it:

```json
"workspaces": [
  "packages/core",
  "packages/runners/*",
  "packages/adapters/*",
  "apps/*"
]
```

### CI workflow (`ci.yml`) — no changes required

The Nx project name remains `react-e2e`. The CI step `bunx nx run react-e2e:e2e --output-style=stream` requires no change. Nx discovers projects by scanning workspace packages, not by hardcoded paths.

### Agent instruction updates

Every occurrence of `packages/adapters/react-e2e` in `.github/agents/developer.agent.md` and `.github/agents/architect.agent.md` is replaced with `apps/react-e2e`.

The Developer agent must also gain the following rule in its conventions section:

> **E2E apps** live in `apps/{framework}-e2e/`. They are private, never published, and depend on their adapter via `workspace:*`. Use `bunx nx run {framework}-e2e:e2e --output-style=stream` to run them.

## Nx Considerations

- No Nx generator is needed. This is a file move + path update.
- Nx discovers the project via the `"nx": { "name": "react-e2e" }` field in `package.json` and the workspace glob — both work correctly after the move.
- `nx sync` must be run after the move to verify TypeScript project references are coherent.
- The `@nx/playwright` plugin infers the `e2e` target from `playwright.config.ts`; however, this project defines its own `e2e` target manually in `package.json`. The plugin's inferred target would conflict — verify after the move that only one `e2e` target exists and it is the manually defined one.

## Security Considerations

No security impact. This is a directory relocation with no logic changes.

## Implementation Notes for Developer

1. Use `mv packages/adapters/react-e2e apps/react-e2e` (or equivalent) — do not copy-and-delete to preserve git history.
2. Update `playwright.config.ts` `--config` path in `package.json`.
3. Update `tsconfig.json` project reference path.
4. If `"apps/*"` is not yet in root `package.json` workspaces, add it.
5. Run `bun install` (no `--frozen-lockfile`) to regenerate the lockfile with the new workspace path.
6. Run `bunx nx sync` to verify TypeScript project references.
7. Run `bunx nx run react-e2e:e2e --output-style=stream` — all tests must pass.
8. Run `bunx nx run-many -t build --output-style=stream` — all packages must still build.
9. Delete `packages/adapters/react-e2e/` if `mv` did not remove it.
10. Update all path strings in `.github/agents/developer.agent.md` and `.github/agents/architect.agent.md`.

## Acceptance Criteria

- [ ] `apps/react-e2e/` exists with all files from the former `packages/adapters/react-e2e/`
- [ ] `packages/adapters/react-e2e/` no longer exists
- [ ] `bunx nx run react-e2e:e2e --output-style=stream` passes with all tests green
- [ ] `bunx nx run-many -t build --output-style=stream` exits 0
- [ ] `bun install --frozen-lockfile` succeeds after lockfile regeneration
- [ ] `.github/agents/developer.agent.md` contains no references to `packages/adapters/react-e2e`
- [ ] `.github/agents/architect.agent.md` contains no references to `packages/adapters/react-e2e`
- [ ] The Developer agent instructions contain the e2e placement convention rule

## Open Questions

- **Implement before or after spec 007?** Either order works — both add `"apps/*"` to workspaces but the addition is idempotent. The Developer should implement this spec first (simpler) and spec 007 second. *(resolved: order-independent, idempotent)*
- **Git history preservation?** Use `git mv` rather than a plain filesystem move to keep blame and log intact. *(resolved: use `git mv`)*
