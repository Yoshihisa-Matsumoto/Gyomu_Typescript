export function FunctionHandler() {
  // Function returned from another function
  createHandler()('value')
}

function createHandler(): (value: string) => void {
  return (value: string) => {
    console.log(value)
  }
}
