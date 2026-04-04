# code-runner — Workspace Instructions

## Project Overview

`code-runner` is an **Nx monorepo** providing framework-agnostic, browser-executable code runners for JavaScript, Python, Go, Rust, and Java. It is structured as a set of independently publishable packages that compose into a full UI layer.

## Package Map

| Package | Import path | Purpose |
|---|---|---|
| `packages/core` | `@code-runner/core` | Shared types: `RunResult`, `RunnerFn`, `Language`, `RUNNER_META` |
| `packages/runner-js` | `@code-runner/runner-js` | JavaScript runner (native `Function()`, offline) |
| `packages/runner-python` | `@code-runner/runner-python` | Python runner (Pyodide/WASM, CDN lazy-load) |
| `packages/runner-go` | `@code-runner/runner-go` | Go runner (go.dev/play API) |
| `packages/runner-rust` | `@code-runner/runner-rust` | Rust runner (play.rust-lang.org API) |
| `packages/runner-java` | `@code-runner/runner-java` | Java runner (Piston/emkc.org API) |
| `packages/react` | `@code-runner/react` | React UI layer: `useRunner` hook, `RunnerShell`, language components, `CodeRunner` |

## Agent Roles

| Agent | File | Purpose |
|---|---|---|
| **Architect** | `.github/agents/architect.agent.md` | Design, specify, document — never implement |
| **Developer** | `.github/agents/developer.agent.md` | Implement approved specs in small chunks — never design |

Always use the correct agent. Do not mix roles.

## Spec System

All technical decisions live in `specs/`. Naming convention:

```
specs/NNN-III-short-description.md
```

- `NNN` = spec ID (Architect assigns, zero-padded to 3 digits)
- `III` = implementation chunk (Developer assigns; `000` = the spec itself)
- Use lowercase kebab-case for `short-description`

A spec must have `status: approved` before any implementation begins.

## Package Manager

This project uses **Bun** inside Nx. Always use `bun` commands.

```bash
bun install                                           # install deps
bunx nx run-many -t build --output-style=stream      # build all packages
bunx nx run <package>:build --output-style=stream    # build one package
bunx nx run-many -t typecheck --output-style=stream  # type-check all
bunx nx graph                                         # visualise dependency graph
```

> Always pass `--output-style=stream` to avoid the Nx TUI opening the alternate buffer.

## Build Must Always Pass

Every package must build cleanly before and after each change. If the build is broken, fix it before doing anything else.

## Node Version

Node 22 (set via `.prototools`). Do not change the Node version.

## Nx Conventions

- Package bundler for `core` + `runner-*`: **tsc** (`@nx/js:typescript` plugin, inferred from `tsconfig.lib.json`)
- Package bundler for `react`: **Vite** (`@nx/vite` plugin, inferred from `vite.config.mts`)
- Cross-package deps declared as `"workspace:*"` in `package.json` and as `references` in `tsconfig.lib.json`
- `nx.json` has `sync.applyChanges: true` — TypeScript project references are auto-synced
- Never manually edit `.nx/` cache files

## Code Standards

- TypeScript strict mode everywhere
- No `any` types — use `unknown` and narrow explicitly
- React JSX transform (`react-jsx`) — no `import React` needed in `.tsx` files
- All runner functions implement `RunnerFn` from `@code-runner/core`
- `lib` in `tsconfig.base.json` includes `es2022`, `dom`, `dom.iterable` (runners target the browser)

## Project Structure

```
.github/
  agents/
    architect.agent.md
    developer.agent.md
  instructions/          # per-file or per-glob Copilot instructions
specs/
  NNN-000-*.md           # Architect spec documents
  NNN-III-*.md           # Developer chunk tracking files
packages/
  core/                  # @code-runner/core
  runner-js/             # @code-runner/runner-js
  runner-python/         # @code-runner/runner-python
  runner-go/             # @code-runner/runner-go
  runner-rust/           # @code-runner/runner-rust
  runner-java/           # @code-runner/runner-java
  react/                 # @code-runner/react
```
