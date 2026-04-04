/**
 * Rust runner — submits code to the official Rust Playground API at
 * play.rust-lang.org. Uses stable channel, edition 2021.
 * Requires an internet connection.
 */
import type { RunnerFn } from '@cheetah-coder/core';

interface RustExecuteResponse {
  success: boolean;
  stdout: string;
  stderr: string;
}

export const runRust: RunnerFn = async (code) => {
  let resp: Response;
  try {
    resp = await fetch('https://play.rust-lang.org/execute', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        channel: 'stable',
        mode: 'debug',
        edition: '2021',
        crateType: 'bin',
        tests: false,
        code,
        backtrace: false,
      }),
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return {
      stdout: '',
      stderr: `Network error: ${msg}\nUse the "Open in Playground" link to run this code online.`,
      ok: false,
    };
  }

  if (!resp.ok) {
    return {
      stdout: '',
      stderr: `Rust playground returned HTTP ${resp.status}.`,
      ok: false,
    };
  }

  const data = (await resp.json()) as RustExecuteResponse;

  if (!data.success) {
    return { stdout: '', stderr: data.stderr || 'Compilation failed.', ok: false };
  }

  return { stdout: data.stdout || '(no output)', stderr: '', ok: true };
};

