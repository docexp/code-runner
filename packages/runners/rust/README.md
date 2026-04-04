# @cheetah-coder/rust

Browser Rust runner that compiles and executes Rust code via the official [Rust Playground](https://play.rust-lang.org/) API — no local Rust installation required.

## Install

```sh
npm install @cheetah-coder/rust
```

## Quick start

```ts
import { runRust } from '@cheetah-coder/rust';

const result = await runRust(`
fn main() {
    println!("Hello, Rust!");
}
`);
console.log(result.stdout); // 'Hello, Rust!\n'
console.log(result.ok);     // true
```

## API

| Name | Type | Description |
|---|---|---|
| `runRust` | `RunnerFn` | Submits Rust code to the play.rust-lang.org execute API. Uses stable channel, edition 2021. |

`RunnerFn` signature: `(code: string, onStatus?: (msg: string) => void) => Promise<RunResult>`

## Notes

- **Requires an internet connection.** Sends code to `https://play.rust-lang.org/execute`.
- Uses the **stable** channel and **edition 2021** by default.
- Compilation errors are returned in `stderr`.
- Network errors are caught and returned as `{ ok: false, stderr: 'Network error: …' }`.
- Playground link: [play.rust-lang.org](https://play.rust-lang.org/)

## License

MIT
