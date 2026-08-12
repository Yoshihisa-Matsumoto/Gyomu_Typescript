function foo(value?: string): void {
  console.log(value)
}

function bar(value: string): string {
  return value
}

const obj = {
  foo,
  bar,
  nested: {
    execute: bar,
  },
}

export function NestedCall(value: string) {
  // Nested call
  foo(bar(value))

  // Call result used as an argument
  foo(bar(value))

  // Method call result used as an argument
  foo(obj.nested.execute(value))

  // Multiple nested calls
  foo(bar(obj.bar(value)))
}
