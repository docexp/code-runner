import { RUNNER_META } from '@cheetah-coder/core';
import { runRust } from '@cheetah-coder/rust';
import { RunnerShell } from './RunnerShell.js';
import type { RunnerShellProps } from './RunnerShell.js';

type Props = Omit<RunnerShellProps, 'runner' | 'lang' | 'title' | 'playgroundUrl'> & { title?: string };

export function RustRunner({ title, ...rest }: Props) {
  return (
    <RunnerShell
      {...rest}
      lang="rust"
      runner={runRust}
      title={title ?? RUNNER_META.rust.label}
      playgroundUrl={RUNNER_META.rust.playgroundUrl}
    />
  );
}
