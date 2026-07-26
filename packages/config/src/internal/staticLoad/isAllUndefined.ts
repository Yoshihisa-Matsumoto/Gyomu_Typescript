/**
 * Recursively determines if a value or all properties within an object structure are undefined.
 *
 * @param value The value to inspect.
 *
 * @returns Returns true if the value is undefined or if all enumerable properties of an object are recursively undefined; otherwise, returns false.
 */
export const isAllUndefined = (value: unknown): boolean => {
  if (value === undefined) {
    return true
  }

  if (value === null) {
    return false
  }

  if (typeof value !== 'object') {
    return false
  }

  const values = Object.values(value)

  if (values.length === 0) {
    return true
  }

  return values.every(isAllUndefined)
}
