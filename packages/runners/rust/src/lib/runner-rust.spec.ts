import { describe, it, expect, vi, beforeEach } from 'vitest';
import { runRust } from './runner-rust.js';

const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

function makeResponse(body: unknown, ok = true, status = 200): Response {
  return {
    ok,
    status,
    json: () => Promise.resolve(body),
  } as unknown as Response;
}

describe('runRust', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns ok:true with stdout on success', async () => {
    mockFetch.mockResolvedValue(
      makeResponse({ success: true, stdout: 'hello\n', stderr: '' }),
    );

    const result = await runRust('fn main() { println!("hello"); }');
    expect(result.ok).toBe(true);
    expect(result.stdout).toBe('hello\n');
    expect(result.stderr).toBe('');
  });

  it('returns "(no output)" when stdout is empty', async () => {
    mockFetch.mockResolvedValue(
      makeResponse({ success: true, stdout: '', stderr: '' }),
    );

    const result = await runRust('fn main() {}');
    expect(result.ok).toBe(true);
    expect(result.stdout).toBe('(no output)');
  });

  it('returns ok:false with stderr when success is false', async () => {
    mockFetch.mockResolvedValue(
      makeResponse({ success: false, stdout: '', stderr: 'error[E0308]: mismatched types' }),
    );

    const result = await runRust('fn main() { let _x: i32 = "bad"; }');
    expect(result.ok).toBe(false);
    expect(result.stderr).toContain('mismatched types');
  });

  it('returns ok:false with fallback message when stderr is empty and success is false', async () => {
    mockFetch.mockResolvedValue(
      makeResponse({ success: false, stdout: '', stderr: '' }),
    );

    const result = await runRust('fn main() {}');
    expect(result.ok).toBe(false);
    expect(result.stderr).toBeTruthy();
  });

  it('returns ok:false on HTTP error', async () => {
    mockFetch.mockResolvedValue(makeResponse({}, false, 503));

    const result = await runRust('fn main() {}');
    expect(result.ok).toBe(false);
    expect(result.stderr).toContain('503');
  });

  it('returns ok:false with network error on fetch failure', async () => {
    mockFetch.mockRejectedValue(new Error('net::ERR_CONNECTION_REFUSED'));

    const result = await runRust('fn main() {}');
    expect(result.ok).toBe(false);
    expect(result.stderr).toContain('Network error');
  });

  it('posts to the correct Rust playground endpoint', async () => {
    mockFetch.mockResolvedValue(
      makeResponse({ success: true, stdout: '', stderr: '' }),
    );

    await runRust('fn main() {}');
    expect(mockFetch).toHaveBeenCalledWith(
      'https://play.rust-lang.org/execute',
      expect.objectContaining({ method: 'POST' }),
    );
  });

  it('sends stable channel and edition 2021 in request body', async () => {
    mockFetch.mockResolvedValue(
      makeResponse({ success: true, stdout: '', stderr: '' }),
    );

    await runRust('fn main() {}');
    const body = JSON.parse((mockFetch.mock.calls[0][1] as RequestInit).body as string);
    expect(body.channel).toBe('stable');
    expect(body.edition).toBe('2021');
  });
});
