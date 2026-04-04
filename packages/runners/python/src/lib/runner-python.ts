/**
 * Python runner — runs full CPython 3.12 code via Pyodide (CPython compiled
 * to WebAssembly). The Pyodide bundle (~12 MB) is fetched from jsDelivr CDN
 * on first use and cached by the browser.
 *
 * The `onStatus` callback is used to report loading progress to the UI.
 */
import type { RunResult } from '@cheetah-coder/core';

// Minimal Pyodide interface — we only use what we actually call
interface PyodideInterface {
  runPython(code: string): unknown;
}

// Extend Window with the Pyodide globals we inject
declare global {
  interface Window {
    loadPyodide?: (opts?: object) => Promise<PyodideInterface>;
    /** Cached singleton to share across all runners on the same page. */
    __codeRunnerPyodide?: PyodideInterface;
  }
}

function injectScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${CSS.escape(src)}"]`)) {
      resolve();
      return;
    }
    const s = document.createElement('script');
    s.src = src;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error(`Failed to load script: ${src}`));
    document.head.appendChild(s);
  });
}

async function getPyodide(
  onStatus?: (msg: string) => void,
): Promise<PyodideInterface> {
  if (window.__codeRunnerPyodide) return window.__codeRunnerPyodide;

  if (!window.loadPyodide) {
    onStatus?.('Downloading Python runtime (~12 MB, first use only)…');
    await injectScript(
      'https://cdn.jsdelivr.net/pyodide/v0.27.0/full/pyodide.js',
    );
  }

  onStatus?.('Initialising Python runtime…');
  const py = await window.loadPyodide!();
  window.__codeRunnerPyodide = py;
  return py;
}

export async function runPython(
  code: string,
  onStatus?: (msg: string) => void,
): Promise<RunResult> {
  try {
    const py = await getPyodide(onStatus);

    py.runPython(
      'import sys, io as _io\n' +
        '_buf = _io.StringIO()\n' +
        '_prev_out, _prev_err = sys.stdout, sys.stderr\n' +
        'sys.stdout = sys.stderr = _buf',
    );

    try {
      py.runPython(code);
      const captured = py.runPython('_buf.getvalue()') as string;
      return { stdout: captured || '(no output)', stderr: '', ok: true };
    } catch (err) {
      const captured = py.runPython('_buf.getvalue()') as string;
      const stderr = err instanceof Error ? err.message : String(err);
      return { stdout: captured, stderr, ok: false };
    } finally {
      py.runPython('sys.stdout, sys.stderr = _prev_out, _prev_err');
    }
  } catch (err) {
    const stderr = err instanceof Error ? err.message : String(err);
    return { stdout: '', stderr, ok: false };
  }
}

