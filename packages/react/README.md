# @code-runner/react

React UI layer for `code-runner` — provides a `useRunner` hook, a `RunnerShell` component, per-language wrapper components, and a unified `CodeRunner` component for running JavaScript, Python, Go, Rust, and Java in the browser.

## Install

```sh
npm install @code-runner/react
```

React 18 or 19 is required as a peer dependency.

## Quick start

```tsx
import { CodeRunner } from '@code-runner/react';

export function Demo() {
  return (
    <CodeRunner
      lang="python"
      code={`print('Hello from Python!')`}
    />
  );
}
```

Language-specific components are also exported for direct use:

```tsx
import { JsRunner, PythonRunner, GoRunner, RustRunner, JavaRunner } from '@code-runner/react';
```

## API

| Name | Kind | Description |
|---|---|---|
| `CodeRunner` | component | Unified runner. Props: `lang: Language`, `code?: string`, `title?: string`, `height?: string` |
| `JsRunner` | component | JavaScript runner shell |
| `PythonRunner` | component | Python runner shell |
| `GoRunner` | component | Go runner shell (includes Open in Playground link) |
| `RustRunner` | component | Rust runner shell (includes Open in Playground link) |
| `JavaRunner` | component | Java runner shell |
| `RunnerShell` | component | Low-level shell. Props: `lang`, `code`, `title`, `runner: RunnerFn`, `playgroundUrl?`, `height?` |
| `useRunner` | hook | `({ originalCode, runner }) => { code, setCode, output, runState, statusMessage, run, reset }` |
| `RunState` | type | `'idle' \| 'loading' \| 'ok' \| 'error'` |

## Notes

- No CSS is bundled. Add your own styles targeting the class names on `RunnerShell` elements (`.code-runner`, `.runner-header`, `.runner-editor`, `.runner-output`, etc.).
- The Python runner downloads Pyodide (~12 MB) from CDN on first use. Use the `onStatus` callback via `useRunner` to show progress.
- Go, Rust, and Java runners require an internet connection.

## License

MIT
