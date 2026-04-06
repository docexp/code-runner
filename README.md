# code-runner

A collection of independently-publishable TypeScript packages that run code in the browser — JavaScript offline, Python via WebAssembly, and Go, Rust, and Java via their official playground APIs.

## Packages

| Package | Import path | Description |
|---|---|---|
| [`packages/core`](packages/core) | `@cheetah-coder/core` | Shared types: `RunResult`, `RunnerFn`, `Language`, `RUNNER_META` |
| [`packages/runners/js`](packages/runners/js) | `@cheetah-coder/js` | JavaScript runner — executes code offline via `Function()` |
| [`packages/runners/python`](packages/runners/python) | `@cheetah-coder/python` | Python runner — CPython 3 via Pyodide WebAssembly |
| [`packages/runners/go`](packages/runners/go) | `@cheetah-coder/go` | Go runner — go.dev playground API |
| [`packages/runners/rust`](packages/runners/rust) | `@cheetah-coder/rust` | Rust runner — play.rust-lang.org API |
| [`packages/runners/java`](packages/runners/java) | `@cheetah-coder/java` | Java runner — Piston (emkc.org) API |
| [`packages/adapters/react`](packages/adapters/react) | `@cheetah-coder/react` | React UI layer: `useRunner` hook, `RunnerShell`, language components, `CodeRunner` |

## Getting started

```sh
npm install @cheetah-coder/react
```

```tsx
import { CodeRunner } from '@cheetah-coder/react';

export function Demo() {
  return (
    <CodeRunner
      lang="javascript"
      code={`console.log('Hello, world!');`}
    />
  );
}
```

`CodeRunner` accepts any `Language` value (`javascript`, `python`, `go`, `rust`, `java`) and renders a self-contained editor + output panel.

## Development

Requires [Bun](https://bun.sh) and Node 22.

```sh
bun install                                           # install deps
bunx nx run-many -t build --output-style=stream      # build all packages
bunx nx run-many -t typecheck --output-style=stream  # type-check all
bunx nx run-many -t test --output-style=stream       # unit tests
bunx nx run react-e2e:e2e --output-style=stream      # Playwright e2e tests
```

### Storybook

The React adapter ships stories. A host app (`apps/storybooks`) composes them via Storybook composition.

```sh
# React child Storybook (port 6007)
bunx nx run react:storybook --output-style=stream

# Host composition Storybook (port 6006, depends on the child)
bunx nx run storybooks:storybook --output-style=stream

# Build static Storybooks
bunx nx run react:build-storybook --output-style=stream
bunx nx run storybooks:build-storybook --output-style=stream
```

## License

MIT

You can enforce that the TypeScript project references are always in the correct state when running in CI by adding a step to your CI job configuration that runs the following command:

```sh
npx nx sync:check
```

[Learn more about nx sync](https://nx.dev/reference/nx-commands#sync)

## Set up CI!

### Step 1

To connect to Nx Cloud, run the following command:

```sh
npx nx connect
```

Connecting to Nx Cloud ensures a [fast and scalable CI](https://nx.dev/ci/intro/why-nx-cloud?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects) pipeline. It includes features such as:

- [Remote caching](https://nx.dev/ci/features/remote-cache?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)
- [Task distribution across multiple machines](https://nx.dev/ci/features/distribute-task-execution?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)
- [Automated e2e test splitting](https://nx.dev/ci/features/split-e2e-tasks?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)
- [Task flakiness detection and rerunning](https://nx.dev/ci/features/flaky-tasks?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)

### Step 2

Use the following command to configure a CI workflow for your workspace:

```sh
npx nx g ci-workflow
```

[Learn more about Nx on CI](https://nx.dev/ci/intro/ci-with-nx#ready-get-started-with-your-provider?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)

## Install Nx Console

Nx Console is an editor extension that enriches your developer experience. It lets you run tasks, generate code, and improves code autocompletion in your IDE. It is available for VSCode and IntelliJ.

[Install Nx Console &raquo;](https://nx.dev/getting-started/editor-setup?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)

## Useful links

Learn more:

- [Learn more about this workspace setup](https://nx.dev/nx-api/js?utm_source=nx_project&amp;utm_medium=readme&amp;utm_campaign=nx_projects)
- [Learn about Nx on CI](https://nx.dev/ci/intro/ci-with-nx?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)
- [Releasing Packages with Nx release](https://nx.dev/features/manage-releases?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)
- [What are Nx plugins?](https://nx.dev/concepts/nx-plugins?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)

And join the Nx community:
- [Discord](https://go.nx.dev/community)
- [Follow us on X](https://twitter.com/nxdevtools) or [LinkedIn](https://www.linkedin.com/company/nrwl)
- [Our Youtube channel](https://www.youtube.com/@nxdevtools)
- [Our blog](https://nx.dev/blog?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)
