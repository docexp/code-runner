import { RUNNER_META } from '@code-runner/core';
import { runGo } from '@code-runner/go';
import { RunnerShell } from './RunnerShell.js';
import type { RunnerShellProps } from './RunnerShell.js';

type Props = Omit<RunnerShellProps, 'runner' | 'lang' | 'title' | 'playgroundUrl'> & { title?: string };

export function GoRunner({ title, ...rest }: Props) {
  return (
    <RunnerShell
      {...rest}
      lang="go"
      runner={runGo}
      title={title ?? RUNNER_META.go.label}
      playgroundUrl={RUNNER_META.go.playgroundUrl}
    />
  );
}
