export function ifElse(value: boolean) {
  if (value) {
    foo()
  } else {
    bar()
  }
}

const foo = () => console.log('foo')
const bar = () => console.log('bar')
