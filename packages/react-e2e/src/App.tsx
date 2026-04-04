import { JsRunner, PythonRunner, GoRunner, RustRunner, JavaRunner } from '@code-runner/react';

const JS_CODE = `console.log('Hello from JavaScript!');`;

const PYTHON_CODE = `print('Hello from Python!')`;

const GO_CODE = `package main

import "fmt"

func main() {
	fmt.Println("Hello from Go!")
}`;

const RUST_CODE = `fn main() {
    println!("Hello from Rust!");
}`;

const JAVA_CODE = `public class Main {
    public static void main(String[] args) {
        System.out.println("Hello from Java!");
    }
}`;

export function App() {
  return (
    <main>
      <JsRunner code={JS_CODE} />
      <PythonRunner code={PYTHON_CODE} />
      <GoRunner code={GO_CODE} />
      <RustRunner code={RUST_CODE} />
      <JavaRunner code={JAVA_CODE} />
    </main>
  );
}
