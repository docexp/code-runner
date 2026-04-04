import { RUNNER_META } from '@cheetah-coder/core';
import { runJava } from '@cheetah-coder/java';
import { RunnerShell } from './RunnerShell.js';
import type { RunnerShellProps } from './RunnerShell.js';

type Props = Omit<RunnerShellProps, 'runner' | 'lang' | 'title' | 'playgroundUrl'> & { title?: string };

export function JavaRunner({ title, ...rest }: Props) {
  return (
    <RunnerShell
      {...rest}
      lang="java"
      runner={runJava}
      title={title ?? RUNNER_META.java.label}
      playgroundUrl={RUNNER_META.java.playgroundUrl}
    />
  );
}
