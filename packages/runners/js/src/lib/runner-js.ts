/**
 * JavaScript runner — executes code using the browser's native Function()
 * constructor. Works entirely offline, no network required.
 *
 * Features:
 * - Captures console.log / console.warn / console.error output
 * - Supports top-level await (wraps code in async IIFE)
 * - Returns the final expression value if nothing was logged
 */
import type { RunnerFn } from '@cheetah-coder/core';

function formatArgs(...args: unknown[]): string {
  return args
    .map(x =>
      x !== null && typeof x === 'object'
        ? JSON.stringify(x, null, 2)
        : String(x),
    )
    .join(' ');
}

export const runJavaScript: RunnerFn = async (code) => {
  const logs: string[] = [];

  const orig = {
    log: console.log.bind(console),
    warn: console.warn.bind(console),
    error: console.error.bind(console),
  };

  console.log = (...a: unknown[]) => { logs.push(formatArgs(...a));              orig.log(...a); };
  console.warn = (...a: unknown[]) => { logs.push('warn: '  + formatArgs(...a)); orig.warn(...a); };
  console.error = (...a: unknown[]) => { logs.push('error: ' + formatArgs(...a)); orig.error(...a); };

  try {
    const fn = new Function(`return (async () => { ${code} })();`);
    const result = await (fn() as Promise<unknown>);

    let stdout = logs.join('\n');
    if (!stdout && result !== undefined) stdout = String(result);
    if (!stdout) stdout = '(no output)';

    return { stdout, stderr: '', ok: true };
  } catch (err) {
    const stderr =
      err instanceof Error ? `${err.name}: ${err.message}` : String(err);
    return { stdout: logs.join('\n'), stderr, ok: false };
  } finally {
    Object.assign(console, orig);
  }
};

