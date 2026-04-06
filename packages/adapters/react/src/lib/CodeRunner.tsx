import type { Language } from '@cheetah-coder/core';
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
      <pre className="w-full rounded-lg ring-1 ring-white/10 bg-[--color-cheetah-base] text-[--color-cheetah-err] font-mono text-sm px-4 py-3">
        {`No runner configured for language: "${lang}".\nSupported: javascript, python, go, rust, java`}
      </pre>
    );
  }

  return <Runner {...rest} />;
}
