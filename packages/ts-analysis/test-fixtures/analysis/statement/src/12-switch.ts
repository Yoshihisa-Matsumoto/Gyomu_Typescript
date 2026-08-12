export function switchStatement(value: string) {
  switch (value) {
    case 'a':
      foo()
      break

    case 'b':
      bar()
      break

    default:
      baz()
      break
  }
}
const foo = () => console.log('foo')
const bar = () => console.log('bar')
const baz = () => console.log('baz')
