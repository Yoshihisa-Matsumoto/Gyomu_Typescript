export function elseIf(value: number) {
  if (value > 10) {
    foo()
  } else if (value > 0) {
    bar()
  } else {
    baz()
  }
}

const foo = () => console.log('foo')
const bar = () => console.log('bar')
const baz = () => console.log('baz')
