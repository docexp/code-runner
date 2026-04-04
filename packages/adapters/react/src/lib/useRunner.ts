/**
 * useRunner — React hook for managing runner execution state.
 */
import { useState, useCallback } from 'react';
import type { RunResult } from '@cheetah-coder/core';

export type RunState = 'idle' | 'loading' | 'ok' | 'error';

export interface UseRunnerOptions {
  originalCode: string;
  runner: (code: string, onStatus?: (msg: string) => void) => Promise<RunResult>;
}

export interface UseRunnerReturn {
  code: string;
  setCode: (code: string) => void;
  output: string;
  runState: RunState;
  statusMessage: string;
  run: () => Promise<void>;
  reset: () => void;
}

export function useRunner({
  originalCode,
  runner,
}: UseRunnerOptions): UseRunnerReturn {
  const [code, setCode] = useState(originalCode);
  const [output, setOutput] = useState('(click ▶ Run)');
  const [runState, setRunState] = useState<RunState>('idle');
  const [statusMessage, setStatusMessage] = useState('');

  const run = useCallback(async () => {
    setRunState('loading');
    setOutput('');
    setStatusMessage('Running…');

    const result = await runner(code, (msg) => setStatusMessage(msg));

    setStatusMessage('');
    if (result.ok) {
      setRunState('ok');
      setOutput(result.stdout);
    } else {
      setRunState('error');
      setOutput(result.stderr || result.stdout || 'An error occurred.');
    }
  }, [code, runner]);

  const reset = useCallback(() => {
    setCode(originalCode);
    setOutput('(click ▶ Run)');
    setRunState('idle');
    setStatusMessage('');
  }, [originalCode]);

  return { code, setCode, output, runState, statusMessage, run, reset };
}
