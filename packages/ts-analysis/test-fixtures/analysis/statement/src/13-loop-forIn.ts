export function forInStatement() {
  const myObject: { [key: string]: number } = { a: 1, b: 2, c: 3 }
  for (const key in myObject) {
    console.log(key, myObject[key])
  }
}
