export function variable(value: string) {
  const result = foo(value)
  return result
}

const foo = (value: string) => value
