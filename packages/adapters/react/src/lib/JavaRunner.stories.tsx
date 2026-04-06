import type { Meta, StoryObj } from '@storybook/react';
import { JavaRunner } from './JavaRunner.js';

const meta = {
  title: 'Runners/Java',
  component: JavaRunner,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
} satisfies Meta<typeof JavaRunner>;

export default meta;
type Story = StoryObj<typeof meta>;

export const HelloWorld: Story = {
  args: {
    code: `public class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello from Java!");\n    }\n}`,
  },
};
