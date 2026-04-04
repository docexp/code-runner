# @code-runner/go

Browser Go runner that compiles and executes Go code via the official [go.dev playground](https://go.dev/play/) API — no local Go installation required.

## Install

```sh
npm install @code-runner/go
```

## Quick start

```ts
import { runGo } from '@code-runner/go';

const result = await runGo(`
package main
import "fmt"
func main() { fmt.Println("Hello, Go!") }
`);
console.log(result.stdout); // 'Hello, Go!\n'
console.log(result.ok);     // true
```

## API

| Name | Type | Description |
|---|---|---|
| `runGo` | `RunnerFn` | Submits Go code to the go.dev playground compile API and returns stdout/stderr. |

`RunnerFn` signature: `(code: string, onStatus?: (msg: string) => void) => Promise<RunResult>`

## Notes

- **Requires an internet connection.** Sends code to `https://go.dev/play/compile`.
- Network errors and HTTP failures are caught and returned as `{ ok: false, stderr: 'Network error: …' }` with a suggestion to use the playground link.
- Playground link: [go.dev/play](https://go.dev/play/)

## License

MIT
