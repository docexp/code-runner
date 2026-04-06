import type { Meta, StoryObj } from '@storybook/react';
import { RunnerShell } from './RunnerShell.js';
import type { RunResult } from '@cheetah-coder/core';

const meta = {
  title: 'Runners/RunnerShell',
  component: RunnerShell,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
} satisfies Meta<typeof RunnerShell>;

export default meta;
type Story = StoryObj<typeof meta>;

const echoRunner = async (code: string): Promise<RunResult> => ({
  stdout: `Echo: ${code.split('\n')[0]}`,
  stderr: '',
  ok: true,
});

export const Default: Story = {
  args: {
    lang: 'text',
    title: 'Demo Runner',
    code: 'Hello, Storybook!',
    runner: echoRunner,
  },
};

export const WithError: Story = {
  args: {
    lang: 'text',
    title: 'Error State',
    code: 'trigger error',
    runner: async (): Promise<RunResult> => ({
      stdout: '',
      stderr: 'Something went wrong',
      ok: false,
    }),
  },
};

export const WithPlaygroundUrl: Story = {
  args: {
    lang: 'text',
    title: 'With Playground Link',
    code: 'console.log("hello")',
    playgroundUrl: 'https://example.com/playground',
    runner: echoRunner,
  },
};

export const ReadOnly: Story = {
  args: {
    lang: 'javascript',
    title: 'JavaScript',
    mode: 'r',
    code: `function greet(name) {
  return 'Hello, ' + name + '!';
}

console.log(greet('Storybook'));`,
    runner: echoRunner,
  },
};

export const ReadOnlyPython: Story = {
  args: {
    lang: 'python',
    title: 'Python',
    mode: 'r',
    code: `def greet(name):
    return f'Hello, {name}!'

print(greet('Storybook'))`,
    runner: echoRunner,
  },
};
