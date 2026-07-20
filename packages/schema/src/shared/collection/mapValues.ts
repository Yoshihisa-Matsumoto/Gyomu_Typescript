// type MapValues<T> = {
//   [K in keyof T]: any;
// };

/**
 * Creates an object with the same keys as the source object, where each value is the result of invoking the provided mapper function on the original value.
 *
 * @param obj The source object to map values from.
 *
 * @param fn The mapper function invoked per property, receiving the value and the key.
 *
 * @returns A new object with the mapped values.
 */
export const mapValues = <T extends Record<PropertyKey, any>, R extends { [K in keyof T]: any }>(
  obj: T,
  fn: <K extends keyof T>(value: T[K], key: K) => R[K],
): R => {
  const result = {} as R
  for (const key in obj) {
    const k = key as keyof T
    result[k] = fn(obj[k], k)
  }
  return result
}
