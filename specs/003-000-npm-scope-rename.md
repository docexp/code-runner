---
id: "003"
title: "npm Scope Rename: @code-runner → @cheetah-coder"
status: "approved"
created: "2026-04-04"
updated: "2026-04-04"
---

# npm Scope Rename: @code-runner → @cheetah-coder

## Context & Goals

The npm organization backing this project is `cheetah-coder` on npmjs.com, which means all published packages must live under the `@cheetah-coder` scope. The codebase currently uses `@code-runner` everywhere — in package names, imports, export conditions, documentation, instruction files, and spec cross-references. This spec defines a single, complete, atomic rename so that all subsequent specs (commit hooks, CI, release pipeline) build on the correct scope.

The GitHub repository name (`code-runner`) and GitHub organization (`docexp`) are **not changed**. Only the npm scope changes.

## Scope

**In scope:**
- `name` field in every `package.json` (seven publishable packages + `react-e2e` private package)
- `dependencies` entries using `@cheetah-coder/*` in every `package.json`
- The custom export condition `@cheetah-coder/source` in every package's `exports` map → `@cheetah-coder/source`
- `customConditions` in `tsconfig.base.json` → `@cheetah-coder/source`
- All TypeScript source file imports: `from '@cheetah-coder/...'` → `from '@cheetah-coder/...'`
- All README files
- `.github/copilot-instructions.md`
- `.github/instructions/packages.instructions.md`
- `.github/agents/architect.agent.md`
- `.github/agents/developer.agent.md`
- All spec files that contain `@code-runner` references (including renaming the spec files themselves to their new IDs — see Package Impact)

**Out of scope:**
- Changing the GitHub repo name (`code-runner` stays)
- Changing the GitHub organization (`docexp` stays)
- Changing the root `package.json` `name` field (`"code-runner"` — this is the private monorepo root, not a published package)
- Any source logic changes

## Package Impact

No new packages created. No packages deleted. Only names and references change.

### Package rename map

| Current `name` | New `name` |
|---|---|
| `@cheetah-coder/core` | `@cheetah-coder/core` |
| `@cheetah-coder/js` | `@cheetah-coder/js` |
| `@cheetah-coder/python` | `@cheetah-coder/python` |
| `@cheetah-coder/go` | `@cheetah-coder/go` |
| `@cheetah-coder/rust` | `@cheetah-coder/rust` |
| `@cheetah-coder/java` | `@cheetah-coder/java` |
| `@cheetah-coder/react` | `@cheetah-coder/react` |
| `@cheetah-coder/react-e2e` | `@cheetah-coder/react-e2e` |

### Export condition rename

Every `package.json` `exports` map contains:

```jsonc
// Before
"@cheetah-coder/source": "./src/index.ts"

// After
"@cheetah-coder/source": "./src/index.ts"
```

`tsconfig.base.json` `customConditions`:

```jsonc
// Before
"customConditions": ["@cheetah-coder/source"]

// After
"customConditions": ["@cheetah-coder/source"]
```

### Spec file renames

The following spec files must be renamed / removed on disk as part of implementing this spec:

| Action | File |
|---|---|
| `git rm` | `specs/003-000-commit-conventions-hooks.md` (stub — content already in `004-000-*`) |
| already correct | `specs/004-000-commit-conventions-hooks.md` |
| `git mv` | `specs/004-000-ci.md` → `specs/005-000-ci.md` |
| `git mv` | `specs/005-000-release-pipeline.md` → `specs/006-000-release-pipeline.md` |

## Requirements

### Functional Requirements

- FR-001: After this spec is implemented, `bunx nx run-many -t build --output-style=stream` must succeed with zero errors.
- FR-002: Every TypeScript source file import of `@cheetah-coder/` must be updated to `@cheetah-coder/`.
- FR-003: Every `package.json` `name` field under `@cheetah-coder/` must become `@cheetah-coder/`.
- FR-004: Every `package.json` dependency reference to `@cheetah-coder/*` must become `@cheetah-coder/*`.
- FR-005: The custom export condition `@cheetah-coder/source` must be renamed to `@cheetah-coder/source` in all eight `package.json` exports maps and in `tsconfig.base.json`.
- FR-006: All README files, instruction files, agent files, and spec files must reflect the new scope name.
- FR-007: Spec files `003-000`, `004-000`, and `005-000` must be renamed to `004-000`, `005-000`, and `006-000` respectively using `git mv` to preserve git history.
- FR-008: The root `package.json` `name` field (`"code-runner"`) must **not** be changed.
- FR-009: No source logic or test assertions may be changed — this is a pure naming refactor.

### Non-Functional Requirements

- NFR-001: All changes must be made in a single commit with message `refactor(repo): rename npm scope @code-runner → @cheetah-coder`.
- NFR-002: Build must pass after the change.
- NFR-003: No `any` types introduced.
- NFR-004: `bun install` must be re-run after all `package.json` changes to update the lockfile.

## Technical Design

### Files to change and what to change in each

#### Root `tsconfig.base.json`

```jsonc
// Before
"customConditions": ["@cheetah-coder/source"]

// After
"customConditions": ["@cheetah-coder/source"]
```

#### `packages/core/package.json`

- `"name"`: `"@cheetah-coder/core"` → `"@cheetah-coder/core"`
- `exports["."]["@cheetah-coder/source"]` key → `"@cheetah-coder/source"`

#### `packages/runners/js/package.json`

- `"name"`: `"@cheetah-coder/js"` → `"@cheetah-coder/js"`
- `exports["."]["@cheetah-coder/source"]` key → `"@cheetah-coder/source"`
- `dependencies["@cheetah-coder/core"]` key → `"@cheetah-coder/core"`

Apply the same pattern to `python`, `go`, `rust`, `java` runner packages.

#### `packages/adapters/react/package.json`

- `"name"`: `"@cheetah-coder/react"` → `"@cheetah-coder/react"`
- `exports["."]["@cheetah-coder/source"]` key → `"@cheetah-coder/source"`
- All six `@cheetah-coder/*` entries in `dependencies` → `@cheetah-coder/*`

#### `packages/adapters/react-e2e/package.json`

- `"name"`: `"@cheetah-coder/react-e2e"` → `"@cheetah-coder/react-e2e"`
- `dependencies["@cheetah-coder/react"]` → `"@cheetah-coder/react"`

#### TypeScript source files

The only cross-package import in the codebase uses `@cheetah-coder/core` (in runner packages) and `@cheetah-coder/*` (in the React adapter). Use a case-sensitive find-and-replace across all `.ts` and `.tsx` files under `packages/`:

```
@cheetah-coder/ → @cheetah-coder/
```

The `packages.instructions.md` example `import type { RunnerFn } from '@cheetah-coder/core'` will also be caught by a repo-wide search.

#### Documentation and instruction files

All occurrences of `@cheetah-coder/` in the following files must be updated:

- `README.md` (root)
- `packages/core/README.md`
- `packages/runners/*/README.md`
- `packages/adapters/react/README.md`
- `.github/copilot-instructions.md`
- `.github/instructions/packages.instructions.md`
- `.github/agents/architect.agent.md`
- `.github/agents/developer.agent.md`
- All `specs/*.md` files

### Search pattern for verification

After applying all changes, the following command must return zero results (no residual `@cheetah-coder/` references excluding the GitHub repo URL and root package name):

```sh
grep -r "@cheetah-coder/" . \
  --include="*.ts" \
  --include="*.tsx" \
  --include="*.json" \
  --include="*.md" \
  --exclude-dir=".git" \
  --exclude-dir="node_modules" \
  --exclude-dir=".nx"
```

> Exception: the string `@cheetah-coder/source` will appear zero times because both the export key and the tsconfig condition have been renamed. The GitHub repo URL `github.com/docexp/code-runner` and the root `"name": "code-runner"` do **not** contain `@cheetah-coder/` and are not matched by this pattern.

## Nx Considerations

- Nx uses the `nx.name` field (short name: `core`, `js`, etc.) internally — these short names are unchanged. No `nx.json` changes are needed.
- TypeScript project references use folder paths, not npm names — no `tsconfig.lib.json` reference section changes needed beyond what is caught by the package name `name` field updates.
- After renaming, run `bunx nx reset` to clear any cached project graph that may have stale `@cheetah-coder/` entries.

## Security Considerations

None. This is a structural rename with no behaviour change and no new external dependencies.

## Implementation Notes for Developer

1. Run a global find-and-replace of `@cheetah-coder/` → `@cheetah-coder/` across the entire repository, excluding `.git/`, `node_modules/`, and `.nx/`.
2. Manually verify `tsconfig.base.json` `customConditions` was updated (it uses `@cheetah-coder/source` not `@cheetah-coder/`).
3. Verify the root `package.json` `"name": "code-runner"` was **not** changed.
4. Run `bunx nx reset` to flush the project graph cache.
5. Run `bun install` to regenerate the lockfile with new package names.
6. Clean up the stub and rename spec files:
   ```sh
   git rm specs/003-000-commit-conventions-hooks.md
   git mv specs/004-000-commit-conventions-hooks.md specs/004-000-commit-conventions-hooks.md  # already correct
   git mv specs/004-000-ci.md specs/005-000-ci.md
   git mv specs/005-000-release-pipeline.md specs/006-000-release-pipeline.md
   ```
   Note: `specs/004-000-commit-conventions-hooks.md` is already at the correct path — only the stub `003-000-commit-conventions-hooks.md` needs to be removed.
7. Verify: `bunx nx run-many -t build --output-style=stream` must pass.
8. Verify: `bunx nx run-many -t typecheck --output-style=stream` must pass.
9. Commit everything in a single commit: `refactor(repo): rename npm scope @code-runner → @cheetah-coder`.

## Acceptance Criteria

- [ ] `grep -r "@cheetah-coder/" packages/ --include="*.ts" --include="*.tsx"` returns zero results.
- [ ] `grep -r '"@cheetah-coder/' packages/ --include="*.json"` returns zero results.
- [ ] `grep -r "@cheetah-coder/source" . --include="*.json" --include="*.jsonc"` returns zero results.
- [ ] `tsconfig.base.json` `customConditions` contains `"@cheetah-coder/source"`.
- [ ] Root `package.json` `"name"` is still `"code-runner"` (unchanged).
- [ ] All eight `package.json` `name` fields use the `@cheetah-coder/` scope.
- [ ] `bun install` completes without errors.
- [ ] `bunx nx reset && bunx nx run-many -t build --output-style=stream` reports no errors.
- [ ] `bunx nx run-many -t typecheck --output-style=stream` reports no errors.
- [ ] Spec files `004-000-commit-conventions-hooks.md`, `005-000-ci.md`, `006-000-release-pipeline.md` exist and the old filenames do not.

## Open Questions

- None. The npm org name `cheetah-coder` is confirmed; the rename is straightforward.
