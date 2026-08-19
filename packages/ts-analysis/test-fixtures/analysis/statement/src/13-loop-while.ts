export function whileStatement(value: boolean) {
  while (value) {
    foo()
  }
}
const foo = () => console.log('hello')
