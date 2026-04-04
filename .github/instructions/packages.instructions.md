---
applyTo: "packages/**"
---

## Nx Package Conventions

You are editing a package inside an **Nx 22 monorepo** managed with **Bun** workspaces.

### Cross-package imports

- Always import from the package name, never by relative path across packages:
  ```ts
  // ✅ correct
  import type { RunnerFn } from '@code-runner/core';

  // ❌ wrong — breaks when packages are published
  import type { RunnerFn } from '../../core/src/index.ts';
  ```
- Within the same package, use relative imports with `.js` extension (TypeScript `nodenext` module resolution):
  ```ts
  import { useRunner } from './useRunner.js';
  ```

### Runner contract

Every runner function must satisfy `RunnerFn` from `@code-runner/core`:

```ts
export type RunnerFn = (
  code: string,
  onStatus?: (message: string) => void,
) => Promise<RunResult>;
```

- `onStatus` is optional — call it for long-running operations (e.g. downloading WASM runtimes)
- Never throw — always return `{ stdout, stderr, ok }` and catch all errors internally
- Return `ok: false` when execution failed, `ok: true` when it succeeded

### TypeScript rules

- No `import React from 'react'` in `.tsx` files — the JSX transform handles it
- No `any` types — use `unknown` and narrow with type guards
- Target environment is **browser** — DOM and `window` are available

### Build verification

After any change to a package, verify with:
```bash
bunx nx run <package-name>:build --output-style=stream
```
