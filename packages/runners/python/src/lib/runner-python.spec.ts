import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Mock } from 'vitest';

// Mock window and document before importing the runner
const mockRunPython = vi.fn();
const mockLoadPyodide = vi.fn().mockResolvedValue({
  runPython: mockRunPython,
});

vi.stubGlobal('window', {
  loadPyodide: mockLoadPyodide,
  __codeRunnerPyodide: undefined,
});

vi.stubGlobal('document', {
  querySelector: vi.fn().mockReturnValue(null),
  createElement: vi.fn().mockReturnValue({
    set src(_v: string) {},
    set onload(_v: unknown) {},
    set onerror(_v: unknown) {},
  }),
  head: { appendChild: vi.fn() },
});

// Import after stubs are in place
const { runPython } = await import('./runner-python.js');

describe('runPython', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset cached singleton so each test gets a fresh load
    (window as unknown as Record<string, unknown>)['__codeRunnerPyodide'] =
      undefined;
    mockLoadPyodide.mockResolvedValue({ runPython: mockRunPython });
  });

  it('returns ok:true with captured stdout on success', async () => {
    // First call: redirect stdout/stderr; second call: user code; third call: get buffer; fourth: restore
    mockRunPython
      .mockReturnValueOnce(undefined) // redirect
      .mockReturnValueOnce(undefined) // user code
      .mockReturnValueOnce('hello\n') // getvalue
      .mockReturnValueOnce(undefined); // restore

    const result = await runPython('print("hello")', vi.fn());
    expect(result.ok).toBe(true);
    expect(result.stdout).toBe('hello\n');
    expect(result.stderr).toBe('');
  });

  it('returns "(no output)" when buffer is empty', async () => {
    mockRunPython
      .mockReturnValueOnce(undefined)
      .mockReturnValueOnce(undefined)
      .mockReturnValueOnce('')
      .mockReturnValueOnce(undefined);

    const result = await runPython('x = 1', vi.fn());
    expect(result.ok).toBe(true);
    expect(result.stdout).toBe('(no output)');
  });

  it('returns ok:false with stderr on Python error', async () => {
    mockRunPython
      .mockReturnValueOnce(undefined) // redirect
      .mockImplementationOnce(() => { throw new Error('NameError: name x is not defined'); }) // user code throws
      .mockReturnValueOnce('') // getvalue
      .mockReturnValueOnce(undefined); // restore

    const result = await runPython('x', vi.fn());
    expect(result.ok).toBe(false);
    expect(result.stderr).toContain('NameError');
  });

  it('calls onStatus during initialisation', async () => {
    mockRunPython.mockReturnValue(undefined);
    (mockRunPython as Mock).mockReturnValueOnce(undefined)
      .mockReturnValueOnce(undefined)
      .mockReturnValueOnce('out')
      .mockReturnValueOnce(undefined);

    const onStatus = vi.fn();
    await runPython('pass', onStatus);
    expect(onStatus).toHaveBeenCalled();
  });
});
