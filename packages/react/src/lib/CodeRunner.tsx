import type { Language } from '@code-runner/core';
import type { RunnerShellProps } from './RunnerShell.js';
import { JsRunner } from './JsRunner.js';
import { PythonRunner } from './PythonRunner.js';
import { GoRunner } from './GoRunner.js';
import { RustRunner } from './RustRunner.js';
import { JavaRunner } from './JavaRunner.js';

type CodeRunnerProps = Omit<RunnerShellProps, 'runner' | 'lang'> & {
  lang: Language;
  title?: string;
};

const RUNNERS: Record<Language, React.ComponentType<Omit<CodeRunnerProps, 'lang'>>> = {
  javascript: JsRunner,
  python: PythonRunner,
  go: GoRunner,
  rust: RustRunner,
  java: JavaRunner,
};

export function CodeRunner({ lang, ...rest }: CodeRunnerProps) {
  const Runner = RUNNERS[lang];

  if (!Runner) {
    return (
      <pre style={{ color: 'red', padding: '0.5rem', background: '#1a0000' }}>
        {`No runner configured for language: "${lang}".\nSupported: javascript, python, go, rust, java`}
      </pre>
    );
  }

  return <Runner {...rest} />;
}
