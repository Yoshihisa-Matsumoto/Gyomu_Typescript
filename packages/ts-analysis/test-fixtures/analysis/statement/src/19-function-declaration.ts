export function declarationFunc() {
  foo()
}

const foo = (): string | undefined => 'Foo'
