export function forStatement(values: Array<string>) {
  for (const value of values) {
    foo(value)
  }
}
const foo = (value: string) => console.log(value)
