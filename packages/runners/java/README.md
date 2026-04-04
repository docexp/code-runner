# @cheetah-coder/java

Browser Java runner that compiles and executes Java code via the [Piston](https://github.com/engineer-man/piston) open-source code execution engine hosted at emkc.org — no authentication required.

## Install

```sh
npm install @cheetah-coder/java
```

## Quick start

```ts
import { runJava } from '@cheetah-coder/java';

const result = await runJava(`
public class Main {
    public static void main(String[] args) {
        System.out.println("Hello, Java!");
    }
}
`);
console.log(result.stdout); // 'Hello, Java!\n'
console.log(result.ok);     // true
```

## API

| Name | Type | Description |
|---|---|---|
| `runJava` | `RunnerFn` | Submits Java code to the Piston API at emkc.org and returns stdout/stderr. |

`RunnerFn` signature: `(code: string, onStatus?: (msg: string) => void) => Promise<RunResult>`

## Notes

- **Requires an internet connection.** Sends code to `https://emkc.org/api/v2/piston/execute`.
- The entry class **must be named `Main`** with a `public static void main(String[] args)` method.
- Non-zero JVM exit codes or non-empty stderr are treated as `ok: false`.
- Network errors are caught and returned as `{ ok: false, stderr: 'Network error: …' }`.

## License

MIT
