# @code-runner/core

Shared TypeScript types for the `code-runner` browser code execution library.

## Install

```sh
npm install @code-runner/core
```

## Quick start

```ts
import type { RunnerFn, RunResult, Language } from '@code-runner/core';
import { RUNNER_META } from '@code-runner/core';

console.log(RUNNER_META.javascript.label); // 'JavaScript'
console.log(RUNNER_META.go.playgroundUrl); // 'https://go.dev/play/'
```

## API

| Name | Kind | Description |
|---|---|---|
| `RunResult` | interface | `{ stdout: string; stderr: string; ok: boolean }` — returned by every runner |
| `RunnerFn` | type | `(code: string, onStatus?: (msg: string) => void) => Promise<RunResult>` — runner contract |
| `Language` | type | `'javascript' \| 'python' \| 'go' \| 'rust' \| 'java'` |
| `RunnerMeta` | interface | `{ label: string; playgroundUrl?: string }` |
| `RUNNER_META` | const | `Record<Language, RunnerMeta>` — display metadata for each language |

## License

MIT
