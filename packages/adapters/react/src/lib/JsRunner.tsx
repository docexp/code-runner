import { RUNNER_META } from '@cheetah-coder/core';
import { runJavaScript } from '@cheetah-coder/js';
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
