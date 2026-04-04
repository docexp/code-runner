/**
 * Java runner — submits code to the Piston open-source code execution engine
 * hosted at emkc.org. No authentication required.
 *
 * The entry class MUST be named `Main` with `public static void main`.
 * Requires an internet connection.
 *
 * Piston project: https://github.com/engineer-man/piston
 */
import type { RunnerFn } from '@cheetah-coder/core';

interface PistonRunResult {
  code: number;
  stdout: string;
  stderr: string;
  signal: string | null;
}

interface PistonResponse {
  run?: PistonRunResult;
  message?: string;
}

export const runJava: RunnerFn = async (code) => {
  let resp: Response;
  try {
    resp = await fetch('https://emkc.org/api/v2/piston/execute', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        language: 'java',
        version: '*',
        files: [{ name: 'Main.java', content: code }],
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
      stderr: `Piston API returned HTTP ${resp.status}.`,
      ok: false,
    };
  }

  const data = (await resp.json()) as PistonResponse;

  if (data.message) {
    return { stdout: '', stderr: data.message, ok: false };
  }

  const run = data.run ?? { code: 1, stdout: '', stderr: 'No response from executor.', signal: null };

  if (run.code !== 0 || run.stderr) {
    return { stdout: run.stdout, stderr: run.stderr, ok: false };
  }

  return { stdout: run.stdout || '(no output)', stderr: '', ok: true };
};

