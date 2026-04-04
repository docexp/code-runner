# @cheetah-coder/python

Browser Python runner that executes CPython 3 code via [Pyodide](https://pyodide.org) WebAssembly — full CPython in the browser, no server required.

## Install

```sh
npm install @cheetah-coder/python
```

## Quick start

```ts
import { runPython } from '@cheetah-coder/python';

const result = await runPython(
  `print('hello from Python')`,
  (status) => console.log(status), // e.g. 'Downloading Python runtime (~12 MB)…'
);
console.log(result.stdout); // 'hello from Python\n'
console.log(result.ok);     // true
```

## API

| Name | Type | Description |
|---|---|---|
| `runPython` | `RunnerFn` | Runs a Python string via Pyodide WebAssembly. Lazy-loads the runtime on first call. |

`RunnerFn` signature: `(code: string, onStatus?: (msg: string) => void) => Promise<RunResult>`

## Notes

- **First use downloads ~12 MB** (Pyodide WASM bundle from jsDelivr CDN). Subsequent calls use the browser cache.
- The `onStatus` callback receives human-readable progress messages (`'Downloading Python runtime…'`, `'Initialising Python runtime…'`) suitable for display in a loading indicator.
- The Pyodide instance is cached on `window.__codeRunnerPyodide` so it is shared across all `runPython` calls on the same page.
- Requires a browser environment (`document`, `window`).

## License

MIT
