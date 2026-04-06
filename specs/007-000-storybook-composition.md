---
id: "007"
title: "Storybook Composition — multi-framework component preview"
status: "draft"
created: "2026-04-06"
updated: "2026-04-06"
---

# Storybook Composition — multi-framework component preview

## Context & Goals

The `@cheetah-coder/react` adapter exposes a set of UI components (`JsRunner`, `PythonRunner`, `GoRunner`, `RustRunner`, `JavaRunner`, `RunnerShell`, `CodeRunner`) that need a live preview environment during development. The same need will arise for every future framework adapter (Vue, Angular, Svelte, Astro, etc.).

A single Storybook process cannot render components from multiple frameworks simultaneously because its `framework:` field is a one-value declaration per Storybook instance. Storybook's **Composition** feature (`refs`) solves this: each adapter runs its own per-framework Storybook child process; a lightweight host Storybook aggregates all children's stories under a single browser URL.

This spec designs that composition topology as a first-class part of the Nx monorepo, starting with the React adapter and leaving clean extension points for future adapters.

## Scope

**In scope:**
- Adding a `.storybook/` configuration to `packages/adapters/react` (child Storybook, `@storybook/react-vite`)
- Creating a new private Nx app `apps/storybooks` (host Storybook, `@storybook/html-vite`, owns no component stories, only the composition `refs` block and a welcome MDX page)
- Introducing the `apps/` top-level directory as the home for all non-publishable applications in this monorepo (adding `"apps/*"` to root `package.json` `workspaces`)
- Nx target wiring: `storybook` (dev) and `build-storybook` (static) for both the child and the host
- `dependsOn` relationships ensuring child processes are already running when the host starts

**Out of scope:**
- Vue, Angular, Svelte, or any future adapter Storybook (extension point only, no code)
- Deployment or publishing the static Storybook build
- Visual regression testing (separate spec when needed)
- Adding stories to any existing package (Developer may add placeholder stories; full story coverage is follow-on work)

## Package Impact

| Package | Change |
|---|---|
| `packages/adapters/react` | Add `.storybook/main.ts`, `.storybook/preview.ts`; add Storybook devDeps; add `storybook` + `build-storybook` Nx targets |
| `apps/storybooks` *(new)* | New private app; host `.storybook/main.ts` with `refs`; welcome `Welcome.mdx`; `storybook` + `build-storybook` Nx targets |

### New app metadata for `apps/storybooks`

| Field | Value |
|---|---|
| `name` | `@cheetah-coder/storybooks` |
| `private` | `true` |
| `type` | `module` |
| Bundler | Vite (inferred by `@nx/storybook` + `@nx/vite` plugins) |
| Peer deps | none (no component code) |
| npm publish | never |

> **Convention established by this spec:** `apps/` is the top-level directory for all non-publishable applications in this monorepo. `packages/` is strictly for publishable libraries. The existing `packages/adapters/react-e2e` pre-dates this convention; migrating it to `apps/react-e2e` is out of scope here.

## Requirements

### Functional Requirements

- FR-001: Running `bunx nx run react:storybook` must start a Storybook dev server on port **6007** (`@storybook/react-vite`) displaying all `*.stories.tsx` files from `packages/adapters/react/src`.
- FR-002: Running `bunx nx run storybooks:storybook` must start the host Storybook dev server on port **6006** and surface the React child's stories under a `React` node in the sidebar.
- FR-003: The host Storybook must reference the React child via `refs` using `http://localhost:6007` in development and a relative static build URL in production.
- FR-004: Adding a future adapter Storybook requires only: (a) adding a `.storybook/` to the new adapter, (b) adding one entry to the host's `refs` block, and (c) updating Nx target `dependsOn`. No other monorepo changes are needed.
- FR-005: The host Storybook must contain a `Welcome.mdx` intro page as its only local content, describing the composition structure and how to add a new adapter.
- FR-006: `bunx nx run storybooks:build-storybook` must produce a static host build that embeds the composed refs URLs (pointing at separately built child static Storybooks) via relative paths.

### Non-Functional Requirements

- NFR-001: Build must pass after every implementation chunk (`bunx nx run-many -t build --output-style=stream`).
- NFR-002: No `any` types introduced.
- NFR-003: No npm-published packages are modified in a breaking way.
- NFR-004: The host app is fully `private: true` and never enters the release pipeline.
- NFR-005: Storybook version must be **8.x** (current stable) across all packages; version must be pinned consistently in the root `package.json` devDependencies.

## Technical Design

### Topology

```
dev (local, 3 processes):
  bunx nx run react:storybook          → http://localhost:6007  (child, React stories)
  bunx nx run storybooks:storybook     → http://localhost:6006  (host, unified sidebar)

future extension (no code yet):
  bunx nx run vue:storybook            → http://localhost:6008  (child, Vue stories)
  bunx nx run angular:storybook        → http://localhost:6009  (child, Angular stories)
```

### File layout

```
apps/
  storybooks/
    .storybook/
      main.ts            ← framework: @storybook/html-vite, stories: ['../src/**/*.mdx'], refs block
      preview.ts         ← empty
    src/
      Welcome.mdx        ← intro page only
    package.json         ← private, @cheetah-coder/storybooks
    tsconfig.json
packages/
  adapters/
    react/
      .storybook/
        main.ts          ← framework: @storybook/react-vite, stories glob, port 6007
        preview.ts       ← global decorators / parameters (empty initially)
      src/
        lib/
          *.stories.tsx  ← co-located stories (Developer adds initial set)
```

### Host framework choice

The host Storybook has no React/Vue/Angular components of its own. It must run a Storybook process to serve the UI shell and the `refs` sidebar.
`@storybook/html-vite` is the correct choice: it has the smallest footprint, no framework-specific peer requirements, and is fully supported by the `@nx/storybook` Nx plugin. This avoids importing `react` for a package that renders no React components.

> **Important:** the `framework:` choice of the host is irrelevant to how composed children render — each child renders in its own iframe using its own framework.

### `packages/adapters/react/.storybook/main.ts` (canonical shape)

```ts
import type { StorybookConfig } from '@storybook/react-vite';

const config: StorybookConfig = {
  stories: ['../src/**/*.mdx', '../src/**/*.stories.@(ts|tsx)'],
  addons: [
    '@storybook/addon-essentials',
    '@storybook/addon-interactions',
  ],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  docs: { autodocs: 'tag' },
  viteFinal: async (config) => config,
};

export default config;
```

Port is set via the Nx target `options.port: 6007` (not in `main.ts`).

### `packages/storybooks/.storybook/main.ts` (canonical shape)

```ts
import type { StorybookConfig } from '@storybook/html-vite';

const config: StorybookConfig = {
  stories: ['../src/**/*.mdx'],
  addons: ['@storybook/addon-essentials'],
  framework: {
    name: '@storybook/html-vite',
    options: {},
  },
  refs: (_, { configType }) => {
    if (configType === 'DEVELOPMENT') {
      return {
        react: {
          title: 'React',
          url: 'http://localhost:6007',
        },
        // future adapters added here:
        // vue: { title: 'Vue', url: 'http://localhost:6008' },
      };
    }
    // Static build: relative paths to co-deployed child builds
    return {
      react: {
        title: 'React',
        url: '../react-storybook',
      },
    };
  },
};

export default config;
```

### Nx target wiring

The `@nx/storybook` plugin infers `storybook` and `build-storybook` targets from the presence of `.storybook/main.ts`. No manual `project.json` entries are required unless port overrides or `dependsOn` need to be expressed.

Explicit `dependsOn` for the host:

```json
// apps/storybooks/project.json  (only the override that cannot be inferred)
{
  "targets": {
    "storybook": {
      "options": { "port": 6006 },
      "dependsOn": ["react:storybook"]
    }
  }
}
```

The React child target:

```json
// packages/adapters/react/project.json  (port override only)
{
  "targets": {
    "storybook": {
      "options": { "port": 6007 }
    }
  }
}
```

> `dependsOn: ["react:storybook"]` on the host target means Nx will start the React Storybook before the host when `nx run storybooks:storybook` is called. Because `storybook` is a long-running non-terminating target, Nx will run it in parallel.

### Dependency graph impact

```
storybooks (apps/)  →  react  →  @cheetah-coder/core
                      →  @cheetah-coder/js
                      →  @cheetah-coder/python
                      → … (other runners)
```

`storybooks` only depends on `react` transitively via the Nx `dependsOn` in targets — not via a workspace `package.json` dependency (which would pollute the publishable package graph).

## Nx Considerations

- Run `bunx nx g @nx/storybook:configuration react --uiFramework=@storybook/react-vite` to scaffold the React child config (review output, do not auto-apply blindly — the generator may add unnecessary deps or overwrite `vite.config.mts`).
- Create `apps/storybooks` manually (the `@nx/storybook` generator for a standalone app is not available for `@storybook/html-vite`; scaffold by hand following the layout above).
- Add `"apps/*"` to the root `package.json` `workspaces` array. The array should read: `["packages/core", "packages/runners/*", "packages/adapters/*", "apps/*"]`.
- `nx.json` does not need changes — the `@nx/vite/plugin` already discovers Vite-based projects; the `@nx/storybook` plugin infers targets from `.storybook/main.ts` once it is added as a plugin.
  - Add `@nx/storybook` to root devDependencies and to `nx.json` plugins if not already present.
- Run `bunx nx sync` after scaffold to verify TypeScript project references are coherent.

## Security Considerations

- The host Storybook serves only static files + iframe references; no back-end code is introduced.
- Stories render runner components that call external APIs (Piston, go.dev, play.rust-lang.org) — this is expected behaviour already present in the e2e app; no new surface is introduced.
- `@storybook/addon-interactions` is a dev-only package and must not appear in any publishable package's `dependencies`.
- All Storybook devDeps must be in root or in the private app's `package.json` — never in `packages/adapters/react/package.json`'s `dependencies` field.

## Implementation Notes for Developer

- Storybook version: install `storybook@^8`, `@storybook/react-vite@^8`, `@storybook/html-vite@^8`, `@storybook/addon-essentials@^8`, `@storybook/addon-interactions@^8` as root devDependencies.
- The `@nx/storybook` Nx plugin (if not already present) must be added to root devDeps and registered in `nx.json` plugins with `storybookConfigDir: '.storybook'` options if defaults don't pick it up automatically.
- Do **not** modify `packages/adapters/react/vite.config.mts` — Storybook's Vite builder resolves its own Vite config via `viteFinal`; the library `vite.config.mts` is only used for the library build target.
- Initial stories: create one `.stories.tsx` per exported component in `packages/adapters/react/src/lib/` (e.g., `CodeRunner.stories.tsx`). Each story must provide a minimal working `code` prop so the component renders visibly in the canvas.
- Do **not** add `@cheetah-coder/storybooks` to any other package's `package.json`.
- Do **not** add `apps/storybooks` to the release scripts (`scripts/release-*.js/sh`) — it is a private app and must never enter the publish pipeline.
- Verify with: `bunx nx run-many -t build --output-style=stream` (all packages must still build cleanly post-scaffold).

## Acceptance Criteria

- [ ] `bunx nx run react:storybook` starts on port 6007 and shows all `@cheetah-coder/react` components with at least one story each
- [ ] `bunx nx run storybooks:storybook` starts on port 6006 and shows a sidebar with a `React` node containing the composed stories from port 6007
- [ ] `bunx nx run storybooks:build-storybook` exits 0 and produces a static `storybook-static/` directory
- [ ] `bunx nx run-many -t build --output-style=stream` still exits 0 after all changes
- [ ] No `any` types in any new TypeScript file
- [ ] `apps/storybooks` is `private: true` and absent from the release scripts
- [ ] The host `main.ts` contains a commented-out extension point showing where Vue/Angular `refs` entries would be added

## Open Questions

- **Storybook 9?** Storybook 9 entered release candidate at the time of writing. Pin to `^8` for stability; the upgrade path is minor. *(resolved: use `^8`)*
- **`@nx/storybook` vs manual `.storybook/` scaffold?** The Nx generator sometimes overwrites Vite config or adds unwanted deps. Developer should run the generator in a dry-run (`--dry-run`) first and apply only the `.storybook/` files. *(resolved: dry-run, selective apply)*
- **Port conflicts with `react-e2e`?** The `react-e2e` Vite dev server uses port 4200 (Vite default). Ports 6006–6009 are reserved for Storybook instances. No conflict. *(resolved: no conflict)*
