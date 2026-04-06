import type { Meta, StoryObj } from '@storybook/react';
import { PythonRunner } from './PythonRunner.js';

const meta = {
  title: 'Runners/Python',
  component: PythonRunner,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
} satisfies Meta<typeof PythonRunner>;

export default meta;
type Story = StoryObj<typeof meta>;

export const HelloWorld: Story = {
  args: {
    code: `print('Hello from Python!')`,
  },
};

export const ListComprehension: Story = {
  args: {
    code: `squares = [x**2 for x in range(1, 6)]\nprint(squares)`,
  },
};
