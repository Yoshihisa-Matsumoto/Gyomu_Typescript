/**
 * Creates a new object by merging the current object with the defined properties of the next object, where defined values in next override those in current.
 *
 * @param current The base object.
 *
 * @param next The partial object containing updates to apply.
 *
 * @returns A new object representing the merged result.
 */
export function overrideMerge<T extends object>(current: T, next: Partial<T>): T {
  const result = { ...current }

  for (const [key, value] of Object.entries(next)) {
    if (value !== undefined) {
      result[key as keyof T] = value as T[keyof T]
    }
  }

  return result
}
