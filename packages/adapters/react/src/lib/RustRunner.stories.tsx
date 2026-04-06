import type { Meta, StoryObj } from '@storybook/react';
import { RustRunner } from './RustRunner.js';

const meta = {
  title: 'Runners/Rust',
  component: RustRunner,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
} satisfies Meta<typeof RustRunner>;

export default meta;
type Story = StoryObj<typeof meta>;

export const HelloWorld: Story = {
  args: {
    code: `fn main() {\n    println!("Hello from Rust!");\n}`,
  },
};

export const Variables: Story = {
  args: {
    code: `fn main() {\n    let x: u32 = 42;\n    println!("The answer is {x}");\n}`,
  },
};

export const ReadOnly: Story = {
  args: {
    mode: 'r',
    code: `fn fibonacci(n: u64) -> u64 {
    match n {
        0 => 0,
        1 => 1,
        _ => fibonacci(n - 1) + fibonacci(n - 2),
    }
}

fn main() {
    println!("{}", fibonacci(10));
}`,
  },
};
