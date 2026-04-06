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

export const ReadOnly: Story = {
  args: {
    mode: 'r',
    code: `public class Main {
    static int fibonacci(int n) {
        if (n <= 1) return n;
        return fibonacci(n - 1) + fibonacci(n - 2);
    }

    public static void main(String[] args) {
        System.out.println(fibonacci(10));
    }
}`,
  },
};
