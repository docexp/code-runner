/**
 * RunnerShell — shared React UI component for all code runners.
 * Renders the header, editor textarea, status bar, and output panel.
 */
import type { RunResult } from '@cheetah-coder/core';
import { useRunner } from './useRunner.js';
import type { RunState } from './useRunner.js';

export interface RunnerShellProps {
  lang: string;
  code?: string;
  title: string;
  playgroundUrl?: string;
  height?: string;
  runner: (code: string, onStatus?: (msg: string) => void) => Promise<RunResult>;
}

const STATE_CLS: Record<RunState, string> = {
  idle:    'text-[--color-cheetah-muted]',
  loading: 'text-[--color-cheetah-muted] animate-pulse',
  ok:      'text-[--color-cheetah-ok]',
  error:   'text-[--color-cheetah-err]',
};

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

  const stateCls = STATE_CLS[runState];

  return (
    <div
      className="w-full rounded-lg overflow-hidden ring-1 ring-zinc-700 bg-[--color-cheetah-base] font-mono text-sm text-[--color-cheetah-text] [color-scheme:dark]"
      data-lang={lang}
    >
      {/* Header */}
      <div className="flex items-center gap-2 px-3 h-10 bg-[--color-cheetah-surface] border-b border-zinc-700">
        <span className="text-xs font-semibold tracking-widest uppercase text-[--color-cheetah-muted]">
          {title}
        </span>
        <span className="flex-1" />
        <button
          type="button"
          onClick={reset}
          title="Reset to original code"
          aria-label="Reset to original code"
          className="h-7 w-7 flex items-center justify-center rounded text-[--color-cheetah-muted] hover:text-[--color-cheetah-text] hover:bg-white/5 transition-colors"
        >
          ↺
        </button>
        <button
          type="button"
          onClick={run}
          disabled={runState === 'loading'}
          className="flex items-center gap-1.5 h-7 px-3 rounded text-xs font-semibold bg-[--color-cheetah-accent] text-zinc-950 hover:brightness-110 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
        >
          ▶&nbsp;Run
        </button>
      </div>

      {/* Editor */}
      <textarea
        style={{ height }}
        value={editorCode}
        onChange={e => setCode(e.target.value)}
        spellCheck={false}
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        className="w-full min-h-[160px] resize-y bg-[--color-cheetah-base] text-[--color-cheetah-text] text-sm font-mono leading-relaxed px-4 py-3 outline-none border-none focus:ring-0 caret-[--color-cheetah-accent]"
      />

      {/* Status bar */}
      <div className="flex items-center gap-3 px-3 h-8 bg-[--color-cheetah-surface] border-t border-b border-zinc-700 text-xs">
        <span className="font-semibold uppercase tracking-widest text-[--color-cheetah-muted]">
          stdout
        </span>
        <span className={`flex-1 ${stateCls}`} aria-live="polite">
          {statusMessage}
        </span>
        {playgroundUrl && (
          <a
            href={playgroundUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sky-400 hover:text-sky-300 underline underline-offset-2 transition-colors"
          >
            Open in Playground ↗
          </a>
        )}
      </div>

      {/* Output */}
      <pre
        role="log"
        aria-live="polite"
        className={`px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap break-words min-h-[2.5rem] ${stateCls}`}
      >
        {output}
      </pre>
    </div>
  );
}
