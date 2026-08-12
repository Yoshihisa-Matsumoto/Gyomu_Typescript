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
    execute: foo,
  },
}

const methodObject = {
  execute(value: string): void {
    console.log(value)
  },
}

export function PropertyAccess(value: string) {
  // Object property access
  obj.foo()

  // Object property access with arguments
  obj.foo(value)

  // Nested property access
  obj.nested.execute(value)

  // Property access on another object
  methodObject.execute(value)
}
