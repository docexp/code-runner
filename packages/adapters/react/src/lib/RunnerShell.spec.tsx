import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import type { RunResult } from '@code-runner/core';
import { RunnerShell } from './RunnerShell.js';

function makeRunner(result: RunResult) {
  return vi.fn().mockResolvedValue(result);
}

const DEFAULT_CODE = 'console.log("hi")';

describe('RunnerShell', () => {
  beforeEach(() => vi.clearAllMocks());

  it('renders the title in the header badge', () => {
    render(
      <RunnerShell
        lang="javascript"
        title="JavaScript"
        code={DEFAULT_CODE}
        runner={makeRunner({ ok: true, stdout: '', stderr: '' })}
      />,
    );
    expect(screen.getByText('JavaScript')).toBeInTheDocument();
  });

  it('renders the ▶ Run button', () => {
    render(
      <RunnerShell
        lang="javascript"
        title="JavaScript"
        code={DEFAULT_CODE}
        runner={makeRunner({ ok: true, stdout: '', stderr: '' })}
      />,
    );
    expect(screen.getByRole('button', { name: /run/i })).toBeInTheDocument();
  });

  it('renders the editor textarea with the initial code', () => {
    render(
      <RunnerShell
        lang="javascript"
        title="JavaScript"
        code={DEFAULT_CODE}
        runner={makeRunner({ ok: true, stdout: '', stderr: '' })}
      />,
    );
    const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
    expect(textarea.value).toBe(DEFAULT_CODE);
  });

  it('clicking ▶ Run calls the runner and shows stdout', async () => {
    const runner = makeRunner({ ok: true, stdout: 'hello world', stderr: '' });

    render(
      <RunnerShell
        lang="javascript"
        title="JavaScript"
        code={DEFAULT_CODE}
        runner={runner}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: /run/i }));
    await waitFor(() => expect(screen.getByRole('log')).toHaveTextContent('hello world'));
    expect(runner).toHaveBeenCalledOnce();
  });

  it('shows stderr output when runner returns ok:false', async () => {
    render(
      <RunnerShell
        lang="javascript"
        title="JavaScript"
        code={DEFAULT_CODE}
        runner={makeRunner({ ok: false, stdout: '', stderr: 'ReferenceError: x is not defined' })}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: /run/i }));
    await waitFor(() =>
      expect(screen.getByRole('log')).toHaveTextContent('ReferenceError'),
    );
  });

  it('Reset button restores original code', async () => {
    render(
      <RunnerShell
        lang="javascript"
        title="JavaScript"
        code={DEFAULT_CODE}
        runner={makeRunner({ ok: true, stdout: 'out', stderr: '' })}
      />,
    );

    const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
    fireEvent.change(textarea, { target: { value: 'modified code' } });
    expect(textarea.value).toBe('modified code');

    fireEvent.click(screen.getByRole('button', { name: /reset/i }));
    expect(textarea.value).toBe(DEFAULT_CODE);
  });

  it('renders a playground link when playgroundUrl is provided', () => {
    render(
      <RunnerShell
        lang="go"
        title="Go"
        code={DEFAULT_CODE}
        playgroundUrl="https://go.dev/play/"
        runner={makeRunner({ ok: true, stdout: '', stderr: '' })}
      />,
    );
    const link = screen.getByRole('link', { name: /playground/i });
    expect(link).toHaveAttribute('href', 'https://go.dev/play/');
  });

  it('does not render a playground link when playgroundUrl is absent', () => {
    render(
      <RunnerShell
        lang="javascript"
        title="JavaScript"
        code={DEFAULT_CODE}
        runner={makeRunner({ ok: true, stdout: '', stderr: '' })}
      />,
    );
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });
});
