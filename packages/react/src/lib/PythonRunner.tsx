import { RUNNER_META } from '@code-runner/core';
import { runPython } from '@code-runner/python';
import { RunnerShell } from './RunnerShell.js';
import type { RunnerShellProps } from './RunnerShell.js';

type Props = Omit<RunnerShellProps, 'runner' | 'lang' | 'title'> & { title?: string };

export function PythonRunner({ title, ...rest }: Props) {
  return (
    <RunnerShell
      {...rest}
      lang="python"
      runner={runPython}
      title={title ?? RUNNER_META.python.label}
    />
  );
}
