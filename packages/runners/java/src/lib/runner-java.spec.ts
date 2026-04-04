import { describe, it, expect, vi, beforeEach } from 'vitest';
import { runJava } from './runner-java.js';

const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

function makeResponse(body: unknown, ok = true, status = 200): Response {
  return {
    ok,
    status,
    json: () => Promise.resolve(body),
  } as unknown as Response;
}

describe('runJava', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns ok:true with stdout on successful execution', async () => {
    mockFetch.mockResolvedValue(
      makeResponse({ run: { code: 0, stdout: 'Hello\n', stderr: '', signal: null } }),
    );

    const result = await runJava('public class Main { public static void main(String[] a) {} }');
    expect(result.ok).toBe(true);
    expect(result.stdout).toBe('Hello\n');
    expect(result.stderr).toBe('');
  });

  it('returns "(no output)" when stdout is empty and code is 0', async () => {
    mockFetch.mockResolvedValue(
      makeResponse({ run: { code: 0, stdout: '', stderr: '', signal: null } }),
    );

    const result = await runJava('public class Main { public static void main(String[] a) {} }');
    expect(result.ok).toBe(true);
    expect(result.stdout).toBe('(no output)');
  });

  it('returns ok:false when exit code is non-zero', async () => {
    mockFetch.mockResolvedValue(
      makeResponse({ run: { code: 1, stdout: '', stderr: 'Exception in thread "main"', signal: null } }),
    );

    const result = await runJava('public class Main {}');
    expect(result.ok).toBe(false);
    expect(result.stderr).toContain('Exception');
  });

  it('returns ok:false when stderr is non-empty even with code 0', async () => {
    mockFetch.mockResolvedValue(
      makeResponse({ run: { code: 0, stdout: 'out', stderr: 'warning', signal: null } }),
    );

    const result = await runJava('public class Main {}');
    expect(result.ok).toBe(false);
    expect(result.stderr).toBe('warning');
  });

  it('returns ok:false when response contains a message field', async () => {
    mockFetch.mockResolvedValue(makeResponse({ message: 'rate limited' }));

    const result = await runJava('public class Main {}');
    expect(result.ok).toBe(false);
    expect(result.stderr).toBe('rate limited');
  });

  it('returns ok:false on HTTP error', async () => {
    mockFetch.mockResolvedValue(makeResponse({}, false, 429));

    const result = await runJava('public class Main {}');
    expect(result.ok).toBe(false);
    expect(result.stderr).toContain('429');
  });

  it('returns ok:false with network error on fetch failure', async () => {
    mockFetch.mockRejectedValue(new Error('timeout'));

    const result = await runJava('public class Main {}');
    expect(result.ok).toBe(false);
    expect(result.stderr).toContain('Network error');
  });

  it('posts to the Piston API endpoint', async () => {
    mockFetch.mockResolvedValue(
      makeResponse({ run: { code: 0, stdout: '', stderr: '', signal: null } }),
    );

    await runJava('public class Main {}');
    expect(mockFetch).toHaveBeenCalledWith(
      'https://emkc.org/api/v2/piston/execute',
      expect.objectContaining({ method: 'POST' }),
    );
  });

  it('sends language=java in request body', async () => {
    mockFetch.mockResolvedValue(
      makeResponse({ run: { code: 0, stdout: '', stderr: '', signal: null } }),
    );

    await runJava('public class Main {}');
    const body = JSON.parse((mockFetch.mock.calls[0][1] as RequestInit).body as string);
    expect(body.language).toBe('java');
  });
});
