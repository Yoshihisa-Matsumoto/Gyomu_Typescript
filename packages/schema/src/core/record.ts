/**
 * Returns the keys of the given object typed as an array of its own keys.
 *
 * @param obj The object from which to retrieve the keys.
 *
 * @returns An array containing the keys of the input object.
 */
export const typedKeys = <T extends object>(obj: T): Array<keyof T> =>
  Object.keys(obj) as Array<keyof T>

/**
 * Returns an array of key-value pairs for the given object, preserving type information for keys and values.
 *
 * @param obj The object from which to retrieve the entries.
 *
 * @returns An array of [key, value] pairs derived from the object.
 */
export const typedEntries = <T extends object>(
  obj: T,
): Array<{ [K in keyof T]: [K, T[K]] }[keyof T]> =>
  Object.entries(obj) as Array<{ [K in keyof T]: [K, T[K]] }[keyof T]>
