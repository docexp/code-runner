import { RUNNER_META } from '@code-runner/core';
import { runJavaScript } from '@code-runner/runner-js';
import { RunnerShell } from './RunnerShell.js';
import type { RunnerShellProps } from './RunnerShell.js';

type Props = Omit<RunnerShellProps, 'runner' | 'lang' | 'title'> & { title?: string };

export function JsRunner({ title, ...rest }: Props) {
  return (
    <RunnerShell
      {...rest}
      lang="javascript"
      runner={runJavaScript}
      title={title ?? RUNNER_META.javascript.label}
    />
  );
}
