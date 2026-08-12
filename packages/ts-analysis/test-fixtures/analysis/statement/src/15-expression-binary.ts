export function getBinary(condition: boolean) {
  const result = condition ? foo() : bar()
  return result
}

const foo = () => 'Foo'
const bar = () => 'Bar'
