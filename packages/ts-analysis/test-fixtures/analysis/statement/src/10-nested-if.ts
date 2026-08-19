export function nestedIf(value: boolean, other: boolean) {
  if (value) {
    if (other) {
      foo()
    }
  }
}
const foo = () => console.log('foo')
