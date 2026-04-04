import { describe, it, expect } from 'vitest';
import { runJavaScript } from './runner-js.js';

describe('runJavaScript', () => {
  it('returns ok:true and captures console.log output', async () => {
    const result = await runJavaScript('console.log("hello world")');
    expect(result.ok).toBe(true);
    expect(result.stdout).toBe('hello world');
    expect(result.stderr).toBe('');
  });

  it('captures multiple console.log calls joined by newline', async () => {
    const result = await runJavaScript('console.log("a"); console.log("b")');
    expect(result.ok).toBe(true);
    expect(result.stdout).toBe('a\nb');
  });

  it('captures console.warn with warn: prefix', async () => {
    const result = await runJavaScript('console.warn("oops")');
    expect(result.ok).toBe(true);
    expect(result.stdout).toContain('warn: oops');
  });

  it('captures console.error with error: prefix', async () => {
    const result = await runJavaScript('console.error("boom")');
    expect(result.ok).toBe(true);
    expect(result.stdout).toContain('error: boom');
  });

  it('returns "(no output)" when code produces no log output and no return value', async () => {
    const result = await runJavaScript('1 + 2');
    // The runner wraps code in an async IIFE — bare expressions are not returned.
    // Bare expressions without console output produce "(no output)".
    expect(result.ok).toBe(true);
    expect(result.stdout).toBe('(no output)');
  });

  it('returns "(no output)" when there is nothing to display', async () => {
    const result = await runJavaScript('let x = 5;');
    expect(result.ok).toBe(true);
    expect(result.stdout).toBe('(no output)');
  });

  it('returns ok:false and a stderr message on syntax error', async () => {
    const result = await runJavaScript('if (');
    expect(result.ok).toBe(false);
    expect(result.stderr).toBeTruthy();
  });

  it('returns ok:false on runtime error', async () => {
    const result = await runJavaScript('throw new Error("deliberate")');
    expect(result.ok).toBe(false);
    expect(result.stderr).toContain('deliberate');
  });

  it('supports top-level await', async () => {
    const result = await runJavaScript(
      'const v = await Promise.resolve(42); console.log(v);',
    );
    expect(result.ok).toBe(true);
    expect(result.stdout).toBe('42');
  });

  it('serialises objects with JSON.stringify', async () => {
    const result = await runJavaScript('console.log({ a: 1 })');
    expect(result.ok).toBe(true);
    expect(result.stdout).toContain('"a"');
  });
});
