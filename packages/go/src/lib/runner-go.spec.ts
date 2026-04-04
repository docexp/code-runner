import { describe, it, expect, vi, beforeEach } from 'vitest';
import { runGo } from './runner-go.js';

const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

function makeResponse(body: unknown, ok = true, status = 200): Response {
  return {
    ok,
    status,
    json: () => Promise.resolve(body),
  } as unknown as Response;
}

describe('runGo', () => {
  beforeEach(() => vi.clearAllMocks());

  it('maps Events array to stdout on success', async () => {
    mockFetch.mockResolvedValue(
      makeResponse({ Events: [{ Message: 'hello\n', Kind: 'stdout', Delay: 0 }] }),
    );

    const result = await runGo('package main\nfunc main() {}');
    expect(result.ok).toBe(true);
    expect(result.stdout).toBe('hello\n');
    expect(result.stderr).toBe('');
  });

  it('returns "(no output)" when Events is empty', async () => {
    mockFetch.mockResolvedValue(makeResponse({ Events: [] }));

    const result = await runGo('package main\nfunc main() {}');
    expect(result.ok).toBe(true);
    expect(result.stdout).toBe('(no output)');
  });

  it('returns ok:false when Errors is present', async () => {
    mockFetch.mockResolvedValue(makeResponse({ Errors: 'undefined: x' }));

    const result = await runGo('package main\nfunc main() { x }');
    expect(result.ok).toBe(false);
    expect(result.stderr).toContain('undefined: x');
  });

  it('returns ok:false on HTTP error status', async () => {
    mockFetch.mockResolvedValue(makeResponse({}, false, 500));

    const result = await runGo('package main');
    expect(result.ok).toBe(false);
    expect(result.stderr).toContain('500');
  });

  it('returns ok:false with network error message on fetch failure', async () => {
    mockFetch.mockRejectedValue(new Error('Failed to fetch'));

    const result = await runGo('package main');
    expect(result.ok).toBe(false);
    expect(result.stderr).toContain('Network error');
    expect(result.stderr).toContain('Failed to fetch');
  });

  it('posts to the correct go.dev endpoint', async () => {
    mockFetch.mockResolvedValue(makeResponse({ Events: [] }));

    await runGo('package main');
    expect(mockFetch).toHaveBeenCalledWith(
      'https://go.dev/play/compile',
      expect.objectContaining({ method: 'POST' }),
    );
  });
});
