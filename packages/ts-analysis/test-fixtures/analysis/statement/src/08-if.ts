export function ifStatement(value: boolean) {
  if (value) {
    foo()
  }
}

const foo = () => console.log('test')
