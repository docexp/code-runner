import { describe, it, expect } from 'vitest';
import { RUNNER_META } from './core.js';

describe('RUNNER_META', () => {
  const languages = ['javascript', 'python', 'go', 'rust', 'java'] as const;

  it('has an entry for every supported language', () => {
    for (const lang of languages) {
      expect(RUNNER_META).toHaveProperty(lang);
    }
  });

  it('every entry has a non-empty label string', () => {
    for (const lang of languages) {
      expect(typeof RUNNER_META[lang].label).toBe('string');
      expect(RUNNER_META[lang].label.length).toBeGreaterThan(0);
    }
  });

  it('playgroundUrl is a string when present', () => {
    for (const lang of languages) {
      const { playgroundUrl } = RUNNER_META[lang];
      if (playgroundUrl !== undefined) {
        expect(typeof playgroundUrl).toBe('string');
        expect(playgroundUrl.length).toBeGreaterThan(0);
      }
    }
  });

  it('javascript has no playgroundUrl', () => {
    expect(RUNNER_META.javascript.playgroundUrl).toBeUndefined();
  });

  it('python has no playgroundUrl', () => {
    expect(RUNNER_META.python.playgroundUrl).toBeUndefined();
  });

  it('go has a playgroundUrl pointing to go.dev', () => {
    expect(RUNNER_META.go.playgroundUrl).toContain('go.dev');
  });

  it('rust has a playgroundUrl pointing to play.rust-lang.org', () => {
    expect(RUNNER_META.rust.playgroundUrl).toContain('rust-lang.org');
  });

  it('java has a playgroundUrl', () => {
    expect(typeof RUNNER_META.java.playgroundUrl).toBe('string');
  });
});
