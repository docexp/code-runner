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
    title: 'JavaScript',
    code: `console.log('Hello from JavaScript!');`,
  },
};

export const Python: Story = {
  args: {
    lang: 'python',
    title: 'Python',
    code: `print('Hello from Python!')`,
  },
};

export const Go: Story = {
  args: {
    lang: 'go',
    title: 'Go',
    code: `package main\n\nimport "fmt"\n\nfunc main() {\n\tfmt.Println("Hello from Go!")\n}`,
  },
};

export const Rust: Story = {
  args: {
    lang: 'rust',
    title: 'Rust',
    code: `fn main() {\n    println!("Hello from Rust!");\n}`,
  },
};

export const Java: Story = {
  args: {
    lang: 'java',
    title: 'Java',
    code: `public class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello from Java!");\n    }\n}`,
  },
};

export const ReadOnlyGo: Story = {
  args: {
    lang: 'go',
    title: 'Go',
    mode: 'r',
    code: `package main

import "fmt"

func main() {
\tfmt.Println("Hello from Go!")
}`,
  },
};

export const ReadOnlyRust: Story = {
  args: {
    lang: 'rust',
    title: 'Rust',
    mode: 'r',
    code: `fn main() {
    println!("Hello from Rust!");
}`,
  },
};
