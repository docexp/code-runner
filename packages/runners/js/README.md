# @cheetah-coder/js

Browser JavaScript runner that executes code offline using the native `Function()` constructor — no network required.

## Install

```sh
npm install @cheetah-coder/js
```

## Quick start

```ts
import { runJavaScript } from '@cheetah-coder/js';

const result = await runJavaScript(`console.log('hello world')`);
console.log(result.stdout); // 'hello world'
console.log(result.ok);     // true
```

## API

| Name | Type | Description |
|---|---|---|
| `runJavaScript` | `RunnerFn` | Runs a JavaScript string in the browser. Captures `console.log`, `console.warn`, `console.error`. Supports top-level `await`. |

`RunnerFn` signature: `(code: string, onStatus?: (msg: string) => void) => Promise<RunResult>`

## Notes

- Executes entirely offline — no network calls.
- Code is wrapped in an async IIFE so top-level `await` works.
- `console.log` / `console.warn` / `console.error` output is captured in `stdout`.
- Runtime errors are caught and returned as `{ ok: false, stderr: '...' }`.

## License

MIT
