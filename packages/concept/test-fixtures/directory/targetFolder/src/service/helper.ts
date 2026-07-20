/**
 * Normalizes a user name by trimming whitespace and capitalizing
 * the first character.
 *
 * @param name Raw user name.
 * @returns Normalized user name.
 */
export const normalizeName = (name: string): string => {
  const trimmed = name.trim()

  if (trimmed.length === 0) {
    return trimmed
  }

  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1)
}
