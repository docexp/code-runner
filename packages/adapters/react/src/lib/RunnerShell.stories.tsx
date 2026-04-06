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
  exitCode: 0,
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
      exitCode: 1,
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
