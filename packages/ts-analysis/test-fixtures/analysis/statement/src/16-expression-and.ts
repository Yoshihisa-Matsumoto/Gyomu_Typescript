export function getAnd(value: string | undefined) {
  const result = value && foo()
  return result
}

const foo = (): string | undefined => 'Foo'
