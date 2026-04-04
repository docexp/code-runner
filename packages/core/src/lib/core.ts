/**
 * Core runner types — framework-agnostic, no DOM dependencies.
 * This is the single shared contract between all layers.
 */

/** Result returned by every runner function. */
export interface RunResult {
  /** Captured standard output. Always a string (never undefined). */
  stdout: string;
  /** Compiler/runtime error message. Empty string when ok. */
  stderr: string;
  /** True when the code ran without errors. */
  ok: boolean;
}

/**
 * A runner function that executes a code string and returns a RunResult.
 * The optional `onStatus` callback lets runners report progress messages
 * back to the UI without coupling to any UI framework.
 */
export type RunnerFn = (
  code: string,
  onStatus?: (message: string) => void,
) => Promise<RunResult>;

/** All supported language identifiers. */
export type Language = 'javascript' | 'python' | 'go' | 'rust' | 'java';

/** Display metadata for a language runner. */
export interface RunnerMeta {
  /** Human-readable label shown in the runner header. */
  label: string;
  /** Optional link to the language's official web playground. */
  playgroundUrl?: string;
}

/** Metadata registry — one entry per supported language. */
export const RUNNER_META: Record<Language, RunnerMeta> = {
  javascript: { label: 'JavaScript' },
  python: { label: 'Python' },
  go: { label: 'Go', playgroundUrl: 'https://go.dev/play/' },
  rust: { label: 'Rust', playgroundUrl: 'https://play.rust-lang.org/' },
  java: { label: 'Java', playgroundUrl: 'https://teavm.org/playground.html' },
};
