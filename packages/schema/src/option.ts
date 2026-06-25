type WithoutUndefined<T> = {
  [K in keyof T as undefined extends T[K] ? never : K]: Exclude<T[K], undefined>
}

/**
 * Removes all properties with undefined values from the provided object.
 *
 * @param obj The input object.
 *
 * @returns An object containing only keys with defined values.
 */
export const withOptional = <T extends object>(obj: T) =>
  Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== undefined)) as WithoutUndefined<T>
