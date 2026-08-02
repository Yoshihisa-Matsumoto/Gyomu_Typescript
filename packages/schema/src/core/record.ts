export const typedKeys = <T extends object>(obj: T): Array<keyof T> =>
  Object.keys(obj) as Array<keyof T>

export const typedEntries = <T extends object>(
  obj: T,
): Array<{ [K in keyof T]: [K, T[K]] }[keyof T]> =>
  Object.entries(obj) as Array<{ [K in keyof T]: [K, T[K]] }[keyof T]>
