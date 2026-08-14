export function variableDeclaration(value: string) {
  const result = foo(value)
  const a = foo(value),
    b = bar()
  let c: string
  return result
}

const foo = (value: string) => value
const bar = () => 'Bar'
