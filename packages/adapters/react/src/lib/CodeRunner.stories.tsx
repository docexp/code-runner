import type { Meta, StoryObj } from '@storybook/react';
import { CodeRunner } from './CodeRunner.js';

const meta = {
  title: 'Runners/CodeRunner',
  component: CodeRunner,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
} satisfies Meta<typeof CodeRunner>;

export default meta;
type Story = StoryObj<typeof meta>;

export const JavaScript: Story = {
  args: {
    lang: 'javascript',
    code: `console.log('Hello from JavaScript!');`,
  },
};

export const Python: Story = {
  args: {
    lang: 'python',
    code: `print('Hello from Python!')`,
  },
};

export const Go: Story = {
  args: {
    lang: 'go',
    code: `package main\n\nimport "fmt"\n\nfunc main() {\n\tfmt.Println("Hello from Go!")\n}`,
  },
};

export const Rust: Story = {
  args: {
    lang: 'rust',
    code: `fn main() {\n    println!("Hello from Rust!");\n}`,
  },
};

export const Java: Story = {
  args: {
    lang: 'java',
    code: `public class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello from Java!");\n    }\n}`,
  },
};
