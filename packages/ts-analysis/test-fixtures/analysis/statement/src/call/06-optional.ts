const foo: undefined | ((value?: string | undefined) => void) = (value?: string): void => {
  console.log(value)
}

const obj: { foo: (value?: string) => void } | undefined = {
  foo,
}

export function OptionalCall(value: string) {
  // Optional call
  foo?.(value)

  // Optional property access
  obj?.foo(value)
}
