export function tryCatchFinally() {
  try {
    foo()
  } catch (error) {
    bar(error)
  } finally {
    baz()
  }
}
const foo = () => console.log('foo')
const bar = (error: any) => console.log('bar')
const baz = () => console.log('baz')
