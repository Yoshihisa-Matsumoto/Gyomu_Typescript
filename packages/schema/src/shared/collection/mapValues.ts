// type MapValues<T> = {
//   [K in keyof T]: any;
// };

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
