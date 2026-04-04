/**
 * Go runner — submits code to the official go.dev/play/compile sandbox API.
 * Requires an internet connection.
 */
import type { RunnerFn } from '@code-runner/core';

interface GoCompileResponse {
  Errors?: string;
  Events?: Array<{ Message: string; Kind: string; Delay: number }>;
}

export const runGo: RunnerFn = async (code) => {
  let resp: Response;
  try {
    resp = await fetch('https://go.dev/play/compile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ body: code, withVet: 'false' }),
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
      stderr: `Go playground returned HTTP ${resp.status}.`,
      ok: false,
    };
  }

  const data = (await resp.json()) as GoCompileResponse;

  if (data.Errors) {
    return { stdout: '', stderr: data.Errors, ok: false };
  }

  const stdout = (data.Events ?? []).map(e => e.Message).join('');
  return { stdout: stdout || '(no output)', stderr: '', ok: true };
};

