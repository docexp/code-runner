/**
 * RunnerShell — shared React UI component for all code runners.
 * Renders the header, editor textarea, status bar, and output panel.
 */
import type { RunResult } from '@code-runner/core';
import { useRunner } from './useRunner.js';

export interface RunnerShellProps {
  lang: string;
  code?: string;
  title: string;
  playgroundUrl?: string;
  height?: string;
  runner: (code: string, onStatus?: (msg: string) => void) => Promise<RunResult>;
}

export function RunnerShell({
  lang,
  code = '',
  title,
  playgroundUrl,
  height = '160px',
  runner,
}: RunnerShellProps) {
  const normalizedCode = code.trim();

  const { code: editorCode, setCode, output, runState, statusMessage, run, reset } =
    useRunner({ originalCode: normalizedCode, runner });

  const outputCls =
    runState === 'ok'
      ? 'runner-output ok'
      : runState === 'error'
        ? 'runner-output err'
        : 'runner-output';

  return (
    <div className="code-runner" data-lang={lang}>
      <div className="runner-header">
        <span className="runner-badge">{title}</span>
        <span style={{ flex: 1 }} />
        <button
          className="runner-btn-reset"
          type="button"
          onClick={reset}
          title="Reset to original code"
          aria-label="Reset to original code"
        >
          ↺
        </button>
        <button
          className="runner-btn-run"
          type="button"
          onClick={run}
          disabled={runState === 'loading'}
        >
          ▶&nbsp;Run
        </button>
      </div>

      <textarea
        className="runner-editor"
        style={{ height }}
        value={editorCode}
        onChange={e => setCode(e.target.value)}
        spellCheck={false}
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
      />

      <div className="runner-output-bar">
        <span className="runner-output-label">stdout</span>
        <span className="runner-status" aria-live="polite">
          {statusMessage}
        </span>
        {playgroundUrl && (
          <a
            className="runner-playground-link"
            href={playgroundUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            Open in Playground ↗
          </a>
        )}
      </div>

      <pre className={outputCls} role="log" aria-live="polite">
        {output}
      </pre>
    </div>
  );
}
