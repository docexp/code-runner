import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import type { RunResult } from '@cheetah-coder/core';
import { useRunner } from './useRunner.js';

function makeRunner(result: RunResult) {
  return vi.fn().mockResolvedValue(result);
}

const OK_CODE = 'console.log("hi")';

describe('useRunner', () => {
  beforeEach(() => vi.clearAllMocks());

  it('starts in idle state with placeholder output', () => {
    const { result } = renderHook(() =>
      useRunner({ originalCode: OK_CODE, runner: makeRunner({ ok: true, stdout: 'hi', stderr: '' }) }),
    );
    expect(result.current.runState).toBe('idle');
    expect(result.current.output).toBe('(click ▶ Run)');
    expect(result.current.code).toBe(OK_CODE);
  });

  it('transitions idle → loading → ok on successful run', async () => {
    const runner = makeRunner({ ok: true, stdout: 'hello', stderr: '' });
    const { result } = renderHook(() =>
      useRunner({ originalCode: OK_CODE, runner }),
    );

    await act(async () => { await result.current.run(); });

    expect(result.current.runState).toBe('ok');
    expect(result.current.output).toBe('hello');
    expect(result.current.stderr).toBeUndefined(); // not on the return type
    expect(runner).toHaveBeenCalledWith(OK_CODE, expect.any(Function));
  });

  it('transitions idle → loading → error on failed run', async () => {
    const runner = makeRunner({ ok: false, stdout: '', stderr: 'SyntaxError: bad' });
    const { result } = renderHook(() =>
      useRunner({ originalCode: OK_CODE, runner }),
    );

    await act(async () => { await result.current.run(); });

    expect(result.current.runState).toBe('error');
    expect(result.current.output).toBe('SyntaxError: bad');
  });

  it('uses stdout as fallback when stderr is empty and ok is false', async () => {
    const runner = makeRunner({ ok: false, stdout: 'something', stderr: '' });
    const { result } = renderHook(() =>
      useRunner({ originalCode: OK_CODE, runner }),
    );

    await act(async () => { await result.current.run(); });

    expect(result.current.output).toBe('something');
  });

  it('reset returns to idle with original code and placeholder', async () => {
    const runner = makeRunner({ ok: true, stdout: 'out', stderr: '' });
    const { result } = renderHook(() =>
      useRunner({ originalCode: OK_CODE, runner }),
    );

    await act(async () => { await result.current.run(); });
    act(() => { result.current.reset(); });

    expect(result.current.runState).toBe('idle');
    expect(result.current.code).toBe(OK_CODE);
    expect(result.current.output).toBe('(click ▶ Run)');
    expect(result.current.statusMessage).toBe('');
  });

  it('setCode updates the code value', () => {
    const { result } = renderHook(() =>
      useRunner({ originalCode: OK_CODE, runner: makeRunner({ ok: true, stdout: '', stderr: '' }) }),
    );

    act(() => { result.current.setCode('new code'); });
    expect(result.current.code).toBe('new code');
  });

  it('statusMessage is cleared after run completes', async () => {
    const runner = makeRunner({ ok: true, stdout: '', stderr: '' });
    const { result } = renderHook(() =>
      useRunner({ originalCode: OK_CODE, runner }),
    );

    await act(async () => { await result.current.run(); });
    expect(result.current.statusMessage).toBe('');
  });
});
