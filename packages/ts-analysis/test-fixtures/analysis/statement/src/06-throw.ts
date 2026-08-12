export function throwError(value: string) {
  if (!value) {
    throw new Error('invalid')
  }
}
