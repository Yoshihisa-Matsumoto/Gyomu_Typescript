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
