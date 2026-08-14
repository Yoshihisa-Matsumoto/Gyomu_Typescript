export function tryCatchFunction() {
  try {
    foo()
  } catch (error) {
    bar(error)
  }
}
const foo = () => console.log('foo')
const bar = (error: any) => console.log('bar')
