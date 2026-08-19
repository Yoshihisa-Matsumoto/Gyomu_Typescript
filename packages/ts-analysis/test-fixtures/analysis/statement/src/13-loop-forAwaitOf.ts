export async function forAwaitOfStatement() {
  for await (const value of foo()) {
    console.log(value)
  }
}
async function* foo() {
  yield 1
  yield 2
}
