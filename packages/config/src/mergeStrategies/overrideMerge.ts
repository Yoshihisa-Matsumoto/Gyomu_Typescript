export function overrideMerge<T extends object>(current: T, next: Partial<T>): T {
  const result = { ...current }

  for (const [key, value] of Object.entries(next)) {
    if (value !== undefined) {
      result[key as keyof T] = value as T[keyof T]
    }
  }

  return result
}
