export function Identifier(value: string) {
  // Identifier
  foo()

  // Identifier with arguments
  foo(value)

  // Multiple arguments
  foo2(value, 'test')

  // Function variable
  functionValue(value)
}

function foo(value?: string): void {
  console.log(value)
}

function foo2(value1: string, value2: string): void {
  console.log(value1, value2)
}
const functionValue = (value: string): void => {
  console.log(value)
}
