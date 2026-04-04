---
id: "004"
title: "Commit Conventions & Git Hooks"
status: "approved"
created: "2026-04-04"
updated: "2026-04-04" & Git Hooks

## Context & Goals

The repo has no enforced commit message convention. Downstream specs (006-000 release pipeline) depend on machine-readable commit messages to drive automatic versioning and changelog generation. This spec establishes the Angular conventional commit format, enforces it at commit time via `commitlint`, and adds a pre-push gate that runs unit tests so broken code is never pushed to a shared branch.

## Scope

**In scope:**
- Add `commitlint` with `@commitlint/config-conventional` (Angular rule set)
- Add `husky` v9 to manage git hooks
- `commit-msg` hook: reject commits that violate the convention
- `pre-push` hook: run all unit tests before a push is allowed to proceed
- Root `commitlint.config.js`
- Document the commit format for contributors

**Out of scope:**
- Linting of commit body line length or breaking-change footer (standard defaults are sufficient)
- Interactive commit tooling (e.g. `commitizen`) — can be added in a later spec
- Branch name enforcement

## Package Impact

No new packages. Root-level changes only:
- `package.json` — add `devDependencies`, add `prepare` script
- `commitlint.config.js` — new file at repo root
- `.husky/commit-msg` — new hook file
- `.husky/pre-push` — new hook file

## Requirements

### Functional Requirements

- FR-001: Every commit must have a message that passes `@commitlint/config-conventional` validation; non-conforming commits must be rejected locally.
- FR-002: A `git push` must fail and surface test output when any unit test fails.
- FR-003: The pre-push gate must run tests for **all** packages (not just affected) to ensure the shared next/main branches receive only fully-passing code.
- FR-004: The hooks must work with Bun as the runtime (no npm/npx invocations in hook bodies).
- FR-005: The `prepare` lifecycle script must install hooks automatically after `bun install`.

### Non-Functional Requirements

- NFR-001: Build must pass after every chunk.
- NFR-002: No `any` types introduced.
- NFR-003: Hook files must be executable (`chmod +x`-equivalent content via husky).
- NFR-004: The pre-push hook must complete within a reasonable CI-equivalent time; heavy e2e tests are excluded.

## Technical Design

### Commit Message Format (Angular Convention)

```
<type>(<scope>): <subject>

[optional body]

[optional footer(s)]
```

**Allowed types:**

| Type | Purpose | Version bump |
|---|---|---|
| `feat` | New user-facing feature | minor |
| `fix` | Bug fix | patch |
| `perf` | Performance improvement | patch |
| `refactor` | Code restructure, no behaviour change | — |
| `test` | Adding/fixing tests | — |
| `docs` | Documentation only | — |
| `style` | Formatting, no logic change | — |
| `build` | Build system or tooling | — |
| `ci` | CI/CD configuration | — |
| `chore` | Maintenance tasks | — |
| `revert` | Reverts a previous commit | patch |

**Breaking change:** append `!` after the type/scope (e.g. `feat!:`) OR include `BREAKING CHANGE:` in the footer. Either form triggers a major version bump in the release pipeline.

**Scope values** (optional, recommended):

- Package names without the `@cheetah-coder/` prefix: `core`, `js`, `python`, `go`, `rust`, `java`, `react`
- Cross-cutting scopes: `repo`, `ci`, `release`, `deps`

### Dependency Versions

| Package | Recommended version |
|---|---|
| `husky` | `^9.0.0` |
| `@commitlint/cli` | `^19.0.0` |
| `@commitlint/config-conventional` | `^19.0.0` |

All added to root `devDependencies`.

### `commitlint.config.js`

```js
export default {
  extends: ['@commitlint/config-conventional'],
};
```

The file must use ESM (`export default`) to match the root `package.json` `"type": "module"` already present in packages. If the root `package.json` does not have `"type": "module"`, name the file `commitlint.config.cjs` instead. Developer must check this.

### `package.json` additions

```jsonc
{
  "scripts": {
    "prepare": "husky"
  },
  "devDependencies": {
    "husky": "^9.0.0",
    "@commitlint/cli": "^19.0.0",
    "@commitlint/config-conventional": "^19.0.0"
  }
}
```

> `prepare` runs automatically on `bun install`, installing git hook files into `.husky/`.

### `.husky/commit-msg`

```sh
bunx --no -- commitlint --edit "$1"
```

- `--no` prevents Bun from installing missing packages at hook execution time.
- `--edit "$1"` reads the staged commit message file that git passes as the first argument.

### `.husky/pre-push`

```sh
bunx nx run-many -t test --output-style=stream
```

- Runs all `test` targets across every project.
- `--output-style=stream` prevents the Nx TUI from capturing the alternate buffer in the terminal.
- The hook exits non-zero if any test fails, blocking the push.
- E2e tests are intentionally excluded (those run in CI only).

## Nx Considerations

None. Husky and commitlint are pure local tooling. No Nx project configuration changes required.

## Security Considerations

- Git hooks are local-only and can be bypassed with `--no-verify`. This is acceptable — the CI pipeline (spec 005-000) is the authoritative gate; hooks are a developer convenience.
- No secrets are handled in hooks.

## Implementation Notes for Developer

1. Add the three `devDependencies` to the **root** `package.json` only.
2. Add `"prepare": "husky"` to the root `scripts` block.
3. Run `bun install` to install the new dependencies and let `prepare` create the `.husky/` directory.
4. Create `.husky/commit-msg` and `.husky/pre-push` with the exact content above.
5. Verify that the root `package.json` has or does not have `"type": "module"` and name the commitlint config file accordingly.
6. Verify with: `bunx nx run-many -t build --output-style=stream` (build must still pass).
7. Smoke-test: try committing with a bad message (e.g. `git commit --allow-empty -m "bad message"`) and confirm rejection.

## Acceptance Criteria

- [ ] `bun install` completes without errors and creates `.husky/` directory.
- [ ] Committing with a non-conforming message (e.g. `bad: wrong format`) is rejected with a clear error.
- [ ] Committing with a conforming message (e.g. `feat(core): add new export`) is accepted.
- [ ] `git push` is blocked when at least one unit test fails.
- [ ] `git push` succeeds when all unit tests pass.
- [ ] Running `bunx nx run-many -t build --output-style=stream` reports no errors.

## Open Questions

- None at this time.
