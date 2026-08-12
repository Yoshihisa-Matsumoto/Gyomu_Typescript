export function tryCatch() {
  try {
    foo()
  } catch (error) {
    bar(error)
  }
}
const foo = () => console.log('foo')
const bar = (error: any) => console.log('bar')
