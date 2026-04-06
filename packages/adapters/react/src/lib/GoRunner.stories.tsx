import type { Meta, StoryObj } from '@storybook/react';
import { GoRunner } from './GoRunner.js';

const meta = {
  title: 'Runners/Go',
  component: GoRunner,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
} satisfies Meta<typeof GoRunner>;

export default meta;
type Story = StoryObj<typeof meta>;

export const HelloWorld: Story = {
  args: {
    code: `package main

import "fmt"

func main() {
\tfmt.Println("Hello from Go!")
}`,
  },
};

export const FizzBuzz: Story = {
  args: {
    code: `package main

import "fmt"

func main() {
\tfor i := 1; i <= 15; i++ {
\t\tswitch {
\t\tcase i%15 == 0:
\t\t\tfmt.Println("FizzBuzz")
\t\tcase i%3 == 0:
\t\t\tfmt.Println("Fizz")
\t\tcase i%5 == 0:
\t\t\tfmt.Println("Buzz")
\t\tdefault:
\t\t\tfmt.Println(i)
\t\t}
\t}
}`,
  },
};
<<<<<<< feat/010-shiki-readonly-mode

export const ReadOnly: Story = {
  args: {
    mode: 'r',
    code: `package main

import "fmt"

func main() {
\tfmt.Println("Hello from Go!")
}`,
  },
};
=======
>>>>>>> next
