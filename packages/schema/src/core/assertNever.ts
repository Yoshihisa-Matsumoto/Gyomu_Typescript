/**
 * Asserts that a value is of type never, typically used for exhaustive checking in switch statements.
 *
 * @param value The value to assert as never.
 *
 * @returns Never returns, as it always throws an Error.
 */
export const assertNever = (value: never): never => {
  throw new Error(`Unexpected : ${value}`)
}
