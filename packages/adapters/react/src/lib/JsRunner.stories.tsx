import type { Meta, StoryObj } from '@storybook/react';
import { JsRunner } from './JsRunner.js';

const meta = {
  title: 'Runners/JavaScript',
  component: JsRunner,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
} satisfies Meta<typeof JsRunner>;

export default meta;
type Story = StoryObj<typeof meta>;

export const HelloWorld: Story = {
  args: {
    code: `console.log('Hello from JavaScript!');`,
  },
};

export const Arithmetic: Story = {
  args: {
    code: `const result = [1, 2, 3, 4, 5].reduce((a, b) => a + b, 0);\nconsole.log('Sum:', result);`,
  },
};
